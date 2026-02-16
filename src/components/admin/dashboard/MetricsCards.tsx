import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  TrendingUp, 
  Clock,
  AlertCircle,
  TrendingDown,
  Loader2,
  Users,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { fetchDashboardMetrics } from '@/services/apiServices';
import { formatCurrency } from '@/utils/formatters';

interface DashboardMetrics {
  totalCauses: number;
  totalSponsors: number;
  totalRaised: number;
  pendingItems: number;
  // Claims data
  totalClaims: number;
  verifiedClaims: number;
  pendingClaims: number;
  rejectedClaims: number;
  // Distribution data
  totalTotes: number;
  activeCampaigns: number;
  completedCampaigns: number;
  // Revenue data
  monthlyRevenue: number;
  avgSponsorshipAmount: number;
  weeklyStats: {
    causesChange: number;
    sponsorsChange: number;
    raisedChange: number;
    claimsChange: number;
    urgentPendingItems: number;
  };
}

const MetricsCards = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardMetrics();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="min-h-[120px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </Card>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="min-h-[120px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Error Loading Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-red-500">
                {error || 'Could not load metrics'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Causes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.totalCauses}</div>
              <BarChart className="h-5 w-5 text-blue-500" />
            </div>
            {metrics.weeklyStats.causesChange > 0 ? (
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+{metrics.weeklyStats.causesChange} this week</span>
              </div>
            ) : metrics.weeklyStats.causesChange < 0 ? (
              <div className="text-xs text-red-600 mt-1 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                <span>{metrics.weeklyStats.causesChange} this week</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">
                No change this week
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.totalSponsors}</div>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            {metrics.weeklyStats.sponsorsChange > 0 ? (
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+{metrics.weeklyStats.sponsorsChange} this week</span>
              </div>
            ) : metrics.weeklyStats.sponsorsChange < 0 ? (
              <div className="text-xs text-red-600 mt-1 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                <span>{metrics.weeklyStats.sponsorsChange} this week</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">
                No change this week
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Raised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{formatCurrency(metrics.totalRaised)}</div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            {metrics.weeklyStats.raisedChange > 0 ? (
              <div className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>+{formatCurrency(metrics.weeklyStats.raisedChange)} this week</span>
              </div>
            ) : metrics.weeklyStats.raisedChange < 0 ? (
              <div className="text-xs text-red-600 mt-1 flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                <span>{formatCurrency(metrics.weeklyStats.raisedChange)} this week</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 mt-1">
                No change this week
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.pendingItems}</div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            {metrics.weeklyStats.urgentPendingItems > 0 && (
              <div className="text-xs text-amber-600 mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>{metrics.weeklyStats.urgentPendingItems} require immediate review</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Claims and Distribution Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.totalClaims}</div>
              <Activity className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.weeklyStats.claimsChange > 0 && (
                <span className="text-green-600">+{metrics.weeklyStats.claimsChange} this week</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Verified Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{metrics.verifiedClaims}</div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.totalClaims > 0 && (
                <span>{Math.round((metrics.verifiedClaims / metrics.totalClaims) * 100)}% success rate</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Totes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{metrics.totalTotes.toLocaleString()}</div>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Sponsored and distributed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{metrics.activeCampaigns}</div>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.completedCampaigns} completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Performance Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{formatCurrency(metrics.monthlyRevenue)}</div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              This month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Avg Sponsorship
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{formatCurrency(metrics.avgSponsorshipAmount)}</div>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Per campaign
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-amber-600">{metrics.pendingClaims}</div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Awaiting verification
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Rejected Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-red-600">{metrics.rejectedClaims}</div>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Not approved
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MetricsCards;
