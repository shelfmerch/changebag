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
        if (err.response?.status === 401) {
          const currentPath = window.location.pathname + window.location.search;
          navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
          return;
        }
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
  // purpose: string;
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
  /** Claim-a-tote URL (ref=sponsor-form), set on admin approval. */
  qrCodeUrl?: string;
  /** Brand site URL for second QR, set on admin approval when provided. */
  brandQrCodeUrl?: string;
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

  const handleDownloadCSV = (sponsorshipId: string) => {
    // In a real app, this would generate and download a CSV file
    toast({
      title: "CSV Downloaded",
      description: "Your claim data has been downloaded successfully."
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
      subtitle={`Welcome back, ${user?.name}. Here's the impact you're creating today.`}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-serif">Your Sponsorships</h2>
          <Button onClick={() => navigate('/causes')} className="bg-green-600 hover:bg-green-700 font-bold">
            Browse More Causes
          </Button>
        </div>

        {sponsorships.length > 0 ? (
          sponsorships.map((sponsorship) => (
            <Card key={sponsorship._id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 relative overflow-hidden h-48 md:h-auto min-h-[220px]">
                    <img 
                      src={getImageUrl(sponsorship.cause?.imageUrl)} 
                      alt={sponsorship.cause?.title || 'Cause image'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => handleImageError(e)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className={
                        sponsorship.status === 'approved' ? 'bg-green-500 text-white border-0 hover:bg-green-600' : 
                        sponsorship.status === 'pending' ? 'bg-yellow-500 text-white border-0 hover:bg-yellow-600' :
                        'bg-red-500 text-white border-0 hover:bg-red-600'
                      }>
                        {sponsorship.status === 'approved' ? 'Approved' : 
                         sponsorship.status === 'pending' ? 'Pending Approval' :
                         'Rejected'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-7">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-green-700 transition-colors font-serif">
                        {sponsorship.cause?.title || 'Unknown Cause'}
                      </h3>
                    </div>
                    <p className="text-gray-600 mb-6 line-clamp-2 text-sm leading-relaxed">
                      {sponsorship.cause?.description || 'No description available'}
                    </p>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Contribution</p>
                          <p className="font-bold text-gray-800">₹{sponsorship.totalAmount?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <Package className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Totes</p>
                          <p className="font-bold text-gray-800">{sponsorship.toteQuantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Organization</p>
                          <p className="font-bold text-gray-800 truncate max-w-[80px]">{sponsorship.organizationName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Date</p>
                          <p className="font-bold text-gray-800">{new Date(sponsorship.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/dashboard/report/${sponsorship._id}`)}
                        className="rounded-full px-5 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-green-700 hover:border-green-200 transition-all font-semibold"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                      
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="rounded-full px-5 gap-1.5 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-700 hover:border-blue-200 transition-all font-semibold"
                          >
                            <QrCode className="h-4 w-4" />
                            <span>QR Code</span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-lg overflow-y-auto">
                          <SheetHeader className="text-left">
                            <SheetTitle className="text-2xl font-serif">Your QR codes</SheetTitle>
                            <SheetDescription>
                              After campaign approval: claim tote (same link as at signup) and optional brand site, for printing on bags.
                            </SheetDescription>
                          </SheetHeader>
                          <div className="flex flex-col gap-10 py-8">
                            <div className="flex flex-col items-center">
                              <p className="text-sm font-semibold text-gray-800 mb-3">Claim a tote</p>
                              <div className="relative group cursor-pointer">
                                <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                <div className="relative bg-white p-6 rounded-xl shadow-xl">
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                                      (sponsorship.qrCodeUrl && sponsorship.qrCodeUrl.trim()) ||
                                        `${window.location.origin}/claim/${sponsorship.cause?._id || 'unknown'}?source=qr&ref=sponsor-form&sponsor=${encodeURIComponent(sponsorship.organizationName)}`
                                    )}`}
                                    alt="Claim tote QR"
                                    className="w-56 h-56"
                                  />
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 max-w-xs mx-auto text-center mt-4 italic">
                                Scan to open the claim page for this cause.
                              </p>
                            </div>
                            {sponsorship.brandQrCodeUrl?.trim() ? (
                              <div className="flex flex-col items-center border-t pt-8">
                                <p className="text-sm font-semibold text-gray-800 mb-3">Brand website</p>
                                <div className="relative group cursor-pointer">
                                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                  <div className="relative bg-white p-6 rounded-xl shadow-xl">
                                    <img
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(sponsorship.brandQrCodeUrl.trim())}`}
                                      alt="Brand website QR"
                                      className="w-56 h-56"
                                    />
                                  </div>
                                </div>
                                <p className="text-xs text-gray-500 max-w-xs mx-auto text-center mt-3 break-all">
                                  {sponsorship.brandQrCodeUrl.trim()}
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </SheetContent>
                      </Sheet>
                      
                      {/* <Button 
                        variant="ghost" 
                        size="sm"
                        className="rounded-full px-5 gap-1.5 text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-all"
                        onClick={() => handleDownloadCSV(sponsorship._id)}
                      >
                        <Download className="h-4 w-4" />
                        <span>Claims CSV</span>
                      </Button> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-24 border-dashed border-2 border-gray-200 bg-gray-50 rounded-2xl">
            <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3 font-serif">Your Journey Awaits</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Step into the world of meaningful impact. Start by sponsoring a cause that resonates with your values.
            </p>
            <Button onClick={() => navigate('/causes')} className="bg-green-600 hover:bg-green-700 px-8 py-6 h-auto text-lg rounded-full font-bold shadow-lg shadow-green-100 transition-all hover:-translate-y-1">
              Explore Causes
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SponsorDashboard;
