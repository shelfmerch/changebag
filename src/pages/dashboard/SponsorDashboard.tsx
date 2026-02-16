import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Award, QrCode, Loader2, TrendingUp, DollarSign, Package, Users, Target, Building2, CheckCircle, XCircle, AlertCircle, Calendar, MapPin, BarChart3, FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import config from '@/config';
import axios from 'axios';

const SponsorDashboard = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [sponsorCauses, setSponsorCauses] = useState<SponsorCause[]>([]);
  const [verifiedClaims, setVerifiedClaims] = useState<VerifiedClaimsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user sponsorships and sponsor causes on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication required');
          return;
        }

        const headers = {
          'Authorization': `Bearer ${token}`
        };

        // Fetch sponsorships, sponsor causes, and verified claims in parallel
        const [sponsorshipsResponse, sponsorCausesResponse, verifiedClaimsResponse] = await Promise.all([
          axios.get(`${config.apiUrl}/sponsorships/user`, { headers }),
          axios.get(`${config.apiUrl}/causes/sponsor-causes-with-claims`, { headers }),
          axios.get(`${config.apiUrl}/claims/sponsored-causes/verified-claims`, { headers })
        ]);

        console.log('Fetched sponsorships:', sponsorshipsResponse.data);
        console.log('Fetched sponsor causes:', sponsorCausesResponse.data);
        console.log('Fetched verified claims:', verifiedClaimsResponse.data);
        
        setSponsorships(sponsorshipsResponse.data);
        setSponsorCauses(sponsorCausesResponse.data);
        setVerifiedClaims(verifiedClaimsResponse.data);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate dashboard metrics from real data
  const totalContributed = sponsorships.reduce((sum, sponsorship) => sum + (sponsorship.totalAmount || 0), 0);
  const approvedSponsorships = sponsorships.filter(s => s.status === 'approved').length;
  const totalTotes = sponsorships.reduce((sum, sponsorship) => sum + (sponsorship.toteQuantity || 0), 0);
  
  // Analytics data - you can enhance this with real claim data later
  // const claimAnalytics = [
  //   { date: '2025-03-20', claims: 12 },
  //   { date: '2025-03-21', claims: 8 },
  //   { date: '2025-03-22', claims: 15 },
  //   { date: '2025-03-23', claims: 7 },
  //   { date: '2025-03-24', claims: 10 },
  //   { date: '2025-03-25', claims: 14 },
  //   { date: '2025-03-26', claims: 12 },
  // ];

  // Mock data for impact reports
  // const impactReports = [
  //   {
  //     id: '1',
  //     title: 'Q1 2025 Impact Report - Clean Water Initiative',
  //     causeTitle: 'Clean Water Initiative',
  //     date: 'March 31, 2025',
  //     highlights: [
  //       '3 water filtration systems installed',
  //       '1,200 people now have access to clean water',
  //       '2 training sessions conducted with local technicians'
  //     ]
  //   }
  // ];

// Real data fetch from cause database
  interface Cause {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  status: string;
  location: string;
  creator: any;
  createdAt: string;
  updatedAt: string;
  sponsorships?: Sponsorship[];
}

interface SponsorCause {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  status: string;
  location: string;
  isOnline: boolean;
  createdAt: string;
  updatedAt: string;
  distributionStartDate?: string;
  distributionEndDate?: string;
  totalTotes: number;
  claimedTotes: number;
  shippedClaims: number;
  claimDetails: Array<{
    _id: string;
    status: string;
    fullName: string;
    city: string;
    state: string;
    createdAt: string;
    shippingDate?: string;
    deliveryDate?: string;
  }>;
}

interface VerifiedClaim {
  _id: string;
  causeId: string;
  causeTitle: string;
  fullName: string;
  email: string;
  phone: string;
  purpose: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'verified';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  shippingDate?: string;
  deliveryDate?: string;
}

interface VerifiedClaimsData {
  causeId: string;
  causeTitle: string;
  causeImageUrl: string;
  causeCategory: string;
  totalClaims: number;
  claims: VerifiedClaim[];
}

interface Sponsorship {
  _id: string;
  status: string;
  logoStatus?: string;
  cause: Cause;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  toteQuantity: number;
  unitPrice: number;
  totalAmount: number;
  logoUrl: string;
  toteDetails?: {
    totalAmount?: number;
  };
  selectedCities?: string[];
  distributionType: 'physical' | 'online';
  distributionLocations?: Array<{
    name: {
      name: string;
      address: string;
      contactPerson: string;
      phone: string;
      location: string;
      totesCount: number;
    };
    type: string;
    totesCount: number;
  }>;
  distributionStartDate?: string;
  distributionEndDate?: string;
  documents: Array<{
    name: string;
    type: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

  // Earned badges data
  // const earnedBadges = [
  //   { id: '1', title: 'First Sponsorship', description: 'Completed your first cause sponsorship', icon: '🏆' },
  //   { id: '2', title: '50+ Totes Distributed', description: 'Your totes are making an impact', icon: '🌱' },
  //   { id: '3', title: 'Clean Water Champion', description: 'Sponsored a water-related cause', icon: '💧' },
  // ];
  
  const handleDownloadCSV = (sponsorshipId: string) => {
    // In a real app, this would generate and download a CSV file
    toast({
      title: "CSV Downloaded",
      description: "Your claim data has been downloaded successfully."
    });
  };
  
  const handleViewQRCode = (sponsorshipId: string) => {
    // This would normally show a QR code modal
    toast({
      title: "QR Code Ready",
      description: "You can now view or download your custom QR code."
    });
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout 
        title="Sponsor Dashboard" 
        subtitle={`Welcome back, ${user?.name}`}
      >
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-green-600" />
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-pulse"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading your sponsorships...</h3>
            <p className="text-gray-500">Gathering your impact data</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout 
        title="Sponsor Dashboard" 
        subtitle={`Welcome back, ${user?.name}`}
      >
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Sponsor Dashboard" 
      subtitle={`Welcome back, ${user?.name}`}
    >
      {/* Enhanced Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
              Total Contributed
            </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-700">${totalContributed.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">Across all sponsorships</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
              Approved Sponsorships
            </CardTitle>
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-700">{approvedSponsorships}</div>
            <p className="text-sm text-gray-500 mt-1">Successfully approved</p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
          <CardHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
              Total Totes
            </CardTitle>
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold text-green-700">{totalTotes}</div>
            <p className="text-sm text-gray-500 mt-1">Distributed to causes</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Tabs */}
      <Tabs defaultValue="sponsorships" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl mb-8">
          <TabsTrigger value="sponsorships" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 rounded-lg transition-all duration-200">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              My Sponsorships
            </div>
          </TabsTrigger>
          <TabsTrigger value="my-causes" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 rounded-lg transition-all duration-200">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              My Causes
            </div>
          </TabsTrigger>
          <TabsTrigger value="totes-claimed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700 rounded-lg transition-all duration-200">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Totes Claimed
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sponsorships">
          <div className="space-y-6">
            {sponsorships.length > 0 ? (
              sponsorships.map((sponsorship) => (
                <Card key={sponsorship._id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 relative overflow-hidden">
                        <img 
                          src={getImageUrl(sponsorship.cause?.imageUrl)} 
                          alt={sponsorship.cause?.title || 'Cause image'} 
                          className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => handleImageError(e)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-4 left-4">
                          <Badge variant="outline" className={
                            sponsorship.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100' : 
                            sponsorship.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100' :
                            'bg-red-100 text-red-800 border-red-300 hover:bg-red-100'
                          }>
                            {sponsorship.status === 'approved' ? 'Approved' : 
                             sponsorship.status === 'pending' ? 'Pending Approval' :
                             'Rejected'}
                          </Badge>
                        </div>
                      </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                            {sponsorship.cause?.title || 'Unknown Cause'}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-6 line-clamp-2">{sponsorship.cause?.description || 'No description available'}</p>
                        
                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                          <div>
                              <p className="text-xs text-gray-500">Contribution</p>
                              <p className="font-semibold text-gray-800">${sponsorship.totalAmount?.toLocaleString()}</p>
                            </div>

                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Package className="h-4 w-4 text-gray-500" />
                          <div>
                              <p className="text-xs text-gray-500">Totes</p>
                              <p className="font-semibold text-gray-800">{sponsorship.toteQuantity}</p>
                            </div>

                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Building2 className="h-4 w-4 text-gray-500" />
                          <div>
                              <p className="text-xs text-gray-500">Organization</p>
                              <p className="font-semibold text-gray-800">{sponsorship.organizationName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                              <p className="text-xs text-gray-500">Date</p>
                              <p className="font-semibold text-gray-800">{new Date(sponsorship.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sponsorship.cause?._id ? navigate(`/cause/${sponsorship.cause._id}`) : null}
                            disabled={!sponsorship.cause?._id}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Cause
                          </Button>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <QrCode className="h-4 w-4" />
                                <span>QR Code</span>
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Your QR Code</SheetTitle>
                                <SheetDescription>
                                  This QR code is printed on your totes and links to your cause.
                                </SheetDescription>
                              </SheetHeader>
                              <div className="flex flex-col items-center justify-center py-8">
                                <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/claim/${sponsorship.cause?._id || 'unknown'}?source=qr&ref=sponsor-dashboard`)}`}
                                    alt="QR Code"
                                    className="w-48 h-48"
                                  />
                                </div>
                                <p className="text-center text-sm text-gray-600 mb-4">
                                  When scanned, this QR code will direct users to your sponsored cause page.
                                </p>
                                <Button variant="outline" size="sm" className="gap-1">
                                  <Download className="h-4 w-4" />
                                  <span>Download QR Code</span>
                                </Button>
                              </div>
                            </SheetContent>
                          </Sheet>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                            onClick={() => handleDownloadCSV(sponsorship._id)}
                          >
                            <Download className="h-4 w-4" />
                            <span>Download Claims CSV</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-16 border-dashed border-2 border-gray-200 bg-gray-50">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No sponsorships yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Start making an impact by sponsoring your first cause and supporting meaningful initiatives.</p>
                <Button onClick={() => navigate('/causes')} className="bg-green-600 hover:bg-green-700">
                  Browse Causes
                </Button>
              </Card>
            )}
            
            {sponsorships.length > 0 && (
              <div className="text-center pt-6">
                <Button onClick={() => navigate('/causes')} className="bg-green-600 hover:bg-green-700">
                  Browse More Causes
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="my-causes">
          <div className="space-y-6">
            {sponsorCauses.length > 0 ? (
              sponsorCauses.map((cause) => (
                <Card key={cause._id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 relative overflow-hidden">
                        <img 
                          src={getImageUrl(cause.imageUrl)} 
                          alt={cause.title} 
                          className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => handleImageError(e)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-4 left-4 flex gap-2">
                            <Badge variant="outline" className={
                            cause.status === 'approved' && cause.isOnline ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-100' :
                            cause.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100' :
                            'bg-red-100 text-red-800 border-red-300 hover:bg-red-100'
                            }>
                              {cause.status === 'approved' && cause.isOnline ? 'Active' : 
                               cause.status === 'pending' ? 'Pending Approval' :
                               cause.status === 'rejected' ? 'Rejected' : 'Inactive'}
                            </Badge>
                            {cause.claimedTotes === cause.totalTotes && cause.totalTotes > 0 && (
                            <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
                                All Totes Claimed
                              </Badge>
                            )}
                          </div>
                        </div>
                      <div className="md:w-2/3 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{cause.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-6 line-clamp-2">{cause.description}</p>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm text-gray-500">
                              {Math.round(((cause.currentAmount || 0) / cause.targetAmount) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 ease-out" 
                              style={{ width: `${Math.min(((cause.currentAmount || 0) / cause.targetAmount) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-sm text-gray-500">
                              ${(cause.currentAmount || 0).toLocaleString()} raised
                            </span>
                            <span className="text-sm text-gray-500">
                              ${cause.targetAmount.toLocaleString()} goal
                            </span>
                          </div>
                        </div>
                        
                        {/* Enhanced Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Package className="h-4 w-4 text-gray-500" />
                          <div>
                              <p className="text-xs text-gray-500">Total Totes</p>
                              <p className="font-semibold text-gray-800">{cause.totalTotes}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Users className="h-4 w-4 text-gray-500" />
                          <div>
                              <p className="text-xs text-gray-500">Claimed Totes</p>
                              <p className="font-semibold text-gray-800">{cause.claimedTotes}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-gray-500" />
                          <div>
                              <p className="text-xs text-gray-500">Shipped/Delivered</p>
                              <p className="font-semibold text-gray-800">{cause.shippedClaims}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <Target className="h-4 w-4 text-gray-500" />
                          <div>
                              <p className="text-xs text-gray-500">Category</p>
                              <p className="font-semibold text-gray-800">{cause.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/cause/${cause._id}`)}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Cause
                          </Button>
                          {cause.distributionStartDate && cause.distributionEndDate && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/admin/distribution/${cause._id}`)}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Manage Distribution
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="text-center py-16 border-dashed border-2 border-gray-200 bg-gray-50">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No causes created yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Start making an impact by creating your first cause and connecting with sponsors.</p>
                <Button onClick={() => navigate('/create-cause')} className="bg-green-600 hover:bg-green-700">
                  Create New Cause
                </Button>
              </Card>
            )}
            
            {sponsorCauses.length > 0 && (
              <div className="text-center pt-6">
                <Button onClick={() => navigate('/create-cause')} className="bg-green-600 hover:bg-green-700">
                  Create New Cause
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="totes-claimed">
          <div className="space-y-6">
            {verifiedClaims.length > 0 ? (
              verifiedClaims.map((causeData) => (
                <Card key={causeData.causeId} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                        <img 
                          src={getImageUrl(causeData.causeImageUrl)} 
                          alt={causeData.causeTitle} 
                            className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => handleImageError(e)}
                        />
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{causeData.causeTitle}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{causeData.causeCategory}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100">
                          {causeData.totalClaims} Verified Claims
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Claim Progress</span>
                        <span className="text-sm text-gray-500">
                          {Math.round((causeData.totalClaims / 100) * 100)}% of capacity
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${Math.min((causeData.totalClaims / 100) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{causeData.totalClaims}</p>
                        <p className="text-sm text-gray-500">Total Verified</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {causeData.claims.filter(claim => claim.status === 'verified').length}
                        </p>
                        <p className="text-sm text-gray-500">Verified</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {causeData.claims.filter(claim => claim.status === 'verified').length}
                        </p>
                        <p className="text-sm text-gray-500">Ready for Processing</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                      <p className="text-green-800 font-medium flex items-center gap-2">
                        { causeData.totalClaims > 0 ? (
                          <>
                            <span role="img" aria-label="celebration">🎉</span>
                            {causeData.totalClaims} people have claimed your totes!
                          </>
                        ):(
                          <>
                            <AlertCircle className="h-4 w-4" />
                            No totes claimed yet. Share your cause to get more claims!
                          </>
                        )
                      }
                      </p>
                      {causeData.claims.filter(claim => claim.status === 'verified').length > 0 && (
                        <p className="text-green-700 text-sm mt-2">
                          {causeData.claims.filter(claim => claim.status === 'verified').length} totes have been verified and are ready for processing.
                        </p>
                      )}
                    </div>
                    
                    {causeData.claims.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium mb-4 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Recent Verified Claims:
                        </h4>
                        <div className="space-y-3">
                          {causeData.claims.slice(0, 5).map((claim) => (
                            <div key={claim._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-800">{claim.fullName}</span>
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                                    Verified
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {claim.city}, {claim.state}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    {claim.purpose}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-400">
                                  {new Date(claim.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {causeData.claims.length > 5 && (
                          <p className="text-sm text-gray-500 mt-3 text-center">
                            Showing 5 of {causeData.claims.length} verified claims
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => navigate(`/cause/${causeData.causeId}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Cause Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="text-center py-16 border-dashed border-2 border-gray-200 bg-gray-50">
                <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No verified claims yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Once people start claiming totes from your sponsored causes and their claims get verified, you'll see the impact here.</p>
                <Button onClick={() => navigate('/causes')} className="bg-green-600 hover:bg-green-700">
                  Browse Causes to Sponsor
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default SponsorDashboard;


