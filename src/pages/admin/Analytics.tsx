import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Package, Download, Calendar, Clock, AlertCircle } from 'lucide-react';
import { fetchDashboardMetrics, fetchStats } from '@/services/apiServices';
import authAxios from '@/utils/authAxios';
import config from '@/config';

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1', '#F472B6', '#34D399'];

interface TopCause {
  _id: string;
  title: string;
  currentAmount: number;
  status: string;
  sponsorships: Array<{
    _id: string;
    status: string;
    toteQuantity: number;
    totalAmount: number;
  }>;
  totalTotes?: number;
  claimedTotes?: number;
  availableTotes?: number;
  totalSponsors: number;
  totalAmount: number;
  totalClaims: number;
}

interface WaitlistCause {
  _id: string;
  title: string;
  status: string;
  waitlistCount: number;
  waitingCount: number;
  notifiedCount: number;
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('3months');
  const [metrics, setMetrics] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [uniqueSponsorEmails, setUniqueSponsorEmails] = useState<number>(0);
  const [topCauses, setTopCauses] = useState<TopCause[]>([]);
  const [topWaitlistCauses, setTopWaitlistCauses] = useState<WaitlistCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [metricsData, statsData] = await Promise.all([
          fetchDashboardMetrics(),
          fetchStats()
        ]);
        setMetrics(metricsData);
        setStats(statsData);

        // Fetch unique sponsor emails
        const sponsorshipsResponse = await authAxios.get('/api/sponsorships/approved');
        const uniqueEmails = [...new Set(sponsorshipsResponse.data.map((s: any) => s.email))];
        setUniqueSponsorEmails(uniqueEmails.length);

        // Fetch top performing causes
        const causesResponse = await authAxios.get('/api/causes', {
          params: { 
            status: 'approved', 
            include: 'sponsorships'
          }
        });
        
        // Process causes to calculate sponsor and claim counts
        const processedCauses = causesResponse.data.map((cause: any) => {
          const approvedSponsorships = cause.sponsorships?.filter((s: any) => s.status === 'approved') || [];
          const totalSponsors = approvedSponsorships.length;
          const totalAmount = approvedSponsorships.reduce((sum: number, s: any) => sum + (s.totalAmount || 0), 0);
          
          return {
            ...cause,
            totalSponsors,
            totalAmount,
            // Use claimedTotes if available, otherwise estimate from totalTotes
            totalClaims: cause.claimedTotes || Math.floor((cause.totalTotes || 0) * 0.7) // Estimate 70% claim rate
          };
        });

        // Sort by total sponsors and claims, then take top 4
        const sortedCauses = processedCauses
          .sort((a: any, b: any) => {
            // Primary sort by number of sponsors
            if (b.totalSponsors !== a.totalSponsors) {
              return b.totalSponsors - a.totalSponsors;
            }
            // Secondary sort by total claims
            return (b.totalClaims || 0) - (a.totalClaims || 0);
          })
          .slice(0, 4);

        setTopCauses(sortedCauses);
        
        // Fetch waitlist data
        const waitlistResponse = await authAxios.get(`${config.apiUrl}/waitlist/all`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Process waitlist data by cause
        const waitlistByCause = waitlistResponse.data.reduce((acc: any, entry: any) => {
          if (!acc[entry.causeId]) {
            acc[entry.causeId] = {
              _id: entry.causeId,
              waitlistCount: 0,
              waitingCount: 0,
              notifiedCount: 0
            };
          }
          
          acc[entry.causeId].waitlistCount++;
          
          if (entry.status === 'waiting') {
            acc[entry.causeId].waitingCount++;
          } else if (entry.status === 'notified') {
            acc[entry.causeId].notifiedCount++;
          }
          
          return acc;
        }, {});
        
        // Get cause titles for each waitlist entry
        const causesMap = causesResponse.data.reduce((acc: any, cause: any) => {
          acc[cause._id] = {
            title: cause.title,
            status: cause.status
          };
          return acc;
        }, {});
        
        // Create final waitlist causes array with titles
        const waitlistCauses = Object.keys(waitlistByCause).map(causeId => ({
          ...waitlistByCause[causeId],
          title: causesMap[causeId]?.title || 'Unknown Cause',
          status: causesMap[causeId]?.status || 'unknown'
        }));
        
        // Sort by total waitlist count and take top 5
        const sortedWaitlistCauses = waitlistCauses
          .sort((a, b) => b.waitlistCount - a.waitlistCount)
          .slice(0, 5);
          
        setTopWaitlistCauses(sortedWaitlistCauses);
      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare data for charts
  const monthlyData = stats?.growthData?.map((item: any) => ({
    month: item.month,
    campaigns: item.sponsors, // or use another metric if available
    donations: item.impact, // or use totalAmount if available
    claims: item.impact // fallback to impact if claims not available
  })) || [];

  const categoryData = stats?.impactData?.map((item: any, idx: number) => ({
    name: item.cause,
    value: item.bags,
    color: COLORS[idx % COLORS.length]
  })) || [];

  return (
    <AdminLayout title="Analytics Dashboard" subtitle="View comprehensive analytics and insights">
      {loading ? (
        <div className="text-center py-20">Loading analytics...</div>
      ) : error ? (
        <div className="text-center text-red-600 py-20">{error}</div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Custom Range
              </Button>
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Campaigns</p>
                    <p className="text-3xl font-bold">{metrics?.totalCauses ?? '-'}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {/* Placeholder for trend */}
                      +12% from last month
                    </p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="text-3xl font-bold">${metrics?.totalRaised?.toLocaleString() ?? '-'}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +18% from last month
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Claims</p>
                    <p className="text-3xl font-bold">{metrics?.totalClaims ?? '-'}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +25% from last month
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-3xl font-bold">{uniqueSponsorEmails}</p>
                    <p className="text-sm text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +8% from last month
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="donations" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="claims" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Campaigns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCauses.map((cause, index) => (
                    <div key={cause._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{cause.title}</h3>
                          <Badge 
                            variant="outline" 
                            className={cause.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                          >
                            {cause.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-8 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">Raised</p>
                          <p className="font-semibold">${cause.totalAmount?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Sponsors</p>
                          <p className="font-semibold">{cause.totalSponsors}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Claims</p>
                          <p className="font-semibold">{cause.totalClaims || 0}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Top Waitlist Causes */}
            <Card>
              <CardHeader>
                <CardTitle>Top Waitlist Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topWaitlistCauses.length > 0 ? (
                    topWaitlistCauses.map((cause, index) => (
                      <div key={cause._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{cause.title}</h3>
                            <Badge 
                              variant="outline" 
                              className={cause.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                            >
                              {cause.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500">Total Entries</p>
                            <p className="font-semibold">{cause.waitlistCount}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Waiting</p>
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="h-3 w-3 text-yellow-600" />
                              <p className="font-semibold">{cause.waitingCount}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Notified</p>
                            <div className="flex items-center justify-center gap-1">
                              <AlertCircle className="h-3 w-3 text-blue-600" />
                              <p className="font-semibold">{cause.notifiedCount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No waitlist data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Analytics;
