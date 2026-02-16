import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import config from '@/config';
import axios from 'axios';

const ClaimerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCauses, setUserCauses] = useState<Cause[]>([]);
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [userWaitlist, setUserWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user's causes, claims, and waitlist entries on component mount
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

        // Fetch claimer dashboard data from the new endpoint
        const response = await axios.get(`${config.apiUrl}/claims/dashboard/claimer`, { headers });

        console.log('Fetched claimer dashboard data:', response.data);
        
        setUserCauses(response.data.myCauses || []);
        setUserClaims(response.data.claimedTotes || []);

        // Fetch user's waitlist entries
        if (user?.email) {
          const waitlistResponse = await axios.get(`${config.apiUrl}/waitlist/user/${encodeURIComponent(user.email)}`);
          setUserWaitlist(waitlistResponse.data || []);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email]);

  // Handle leaving waitlist
  const handleLeaveWaitlist = async (waitlistId: string) => {
    try {
      if (!user?.email) {
        toast({
          title: "Error",
          description: "User email not found",
          variant: "destructive"
        });
        return;
      }

      await axios.delete(`${config.apiUrl}/waitlist/${waitlistId}/leave`, {
        data: { email: user.email }
      });

      // Remove the entry from local state
      setUserWaitlist(prev => prev.filter(entry => entry._id !== waitlistId));

      toast({
        title: "Success",
        description: "Successfully left the waitlist",
      });
    } catch (err: any) {
      console.error('Error leaving waitlist:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to leave waitlist",
        variant: "destructive"
      });
    }
  };

  // Calculate dashboard metrics from real data
  const activeCauses = userCauses.filter(cause => cause.status === 'approved' && cause.isOnline).length;
  const totalRaised = userCauses.reduce((sum, cause) => sum + (cause.currentAmount || 0), 0);
  const totalClaims = userClaims.length;

  // Loading state
  if (loading) {
    return (
      <DashboardLayout 
        title="Claimer Dashboard" 
        subtitle={`Welcome back, ${user?.name}`}
      >
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your dashboard...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout 
        title="Claimer Dashboard" 
        subtitle={`Welcome back, ${user?.name}`}
      >
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Claimer Dashboard" 
      subtitle={`Welcome back, ${user?.name}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Causes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCauses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Raised
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalRaised.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Totes Claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalClaims}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="causes">
        <TabsList className="mb-6">
          <TabsTrigger value="causes">My Causes</TabsTrigger>
          <TabsTrigger value="totes">Claimed Totes</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
        </TabsList>
        
        <TabsContent value="causes">
          <div className="space-y-6">
            {userCauses.length > 0 ? (
              userCauses.map((cause) => (
                <Card key={cause._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/4">
                        <img 
                          src={getImageUrl(cause.imageUrl)} 
                          alt={cause.title} 
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => handleImageError(e)}
                        />
                      </div>
                      <div className="md:w-3/4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{cause.title}</h3>
                          <Badge variant="outline" className={
                            cause.status === 'approved' && cause.isOnline ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                            cause.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                            'bg-red-100 text-red-800 hover:bg-red-100'
                          }>
                            {cause.status === 'approved' && cause.isOnline ? 'Active' : 
                             cause.status === 'pending' ? 'Pending Approval' :
                             cause.status === 'rejected' ? 'Rejected' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{cause.description}</p>
                        
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary-600 h-2.5 rounded-full" 
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
                        
                        <div className="flex flex-wrap gap-6 items-center">
                          <div>
                            <p className="text-sm text-gray-500">Sponsors</p>
                            <p className="font-semibold">{cause.sponsorships?.length || 0}</p>
                          </div>
                          <div className="flex-grow"></div>
                          <Button 
                            onClick={() => navigate(`/cause/${cause._id}`)}
                          >
                            Manage Cause
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No causes created yet</h3>
                <p className="text-gray-500 mb-6">Start making an impact by creating your first cause.</p>
                <Button onClick={() => navigate('/create-cause')}>
                  Create New Cause
                </Button>
              </div>
            )}
            
            {userCauses.length > 0 && (
              <div className="text-center pt-6">
                <Button onClick={() => navigate('/create-cause')}>
                  Create New Cause
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="totes">
          {userClaims.length > 0 ? (
            <div className="space-y-6">
              {userClaims.map((claim) => (
                <Card key={claim._id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{claim.causeTitle} Tote</CardTitle>
                      <Badge className={
                        claim.status === 'shipped' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                        claim.status === 'delivered' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                        claim.status === 'verified' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                        'bg-gray-100 text-gray-800 hover:bg-gray-100'
                      }>
                        {claim.status === 'shipped' ? 'Shipped' : 
                         claim.status === 'delivered' ? 'Delivered' : 
                         claim.status === 'verified' ? 'Verified' : 
                         claim.status === 'pending' ? 'Pending' : 'Cancelled'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Purpose</p>
                        <p className="font-medium">{claim.purpose}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{claim.address}, {claim.city}, {claim.state} {claim.zipCode}</p>
                      </div>
                      {claim.shippingDate && (
                        <div>
                          <p className="text-sm text-gray-500">Shipping Date</p>
                          <p className="font-medium">{new Date(claim.shippingDate).toLocaleDateString()}</p>
                        </div>
                      )}
                      {claim.deliveryDate && (
                        <div>
                          <p className="text-sm text-gray-500">Delivery Date</p>
                          <p className="font-medium">{new Date(claim.deliveryDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate(`/cause/${claim.causeId}`)}
                    >
                      View Cause
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No totes claimed yet</h3>
              <p className="text-gray-500 mb-6">Totes can be claimed once you find a sponsored cause you want to support.</p>
              <Button onClick={() => navigate('/causes')}>
                Browse Causes
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="waitlist">
          {userWaitlist.length > 0 ? (
            <div className="space-y-6">
              {userWaitlist.map((entry) => (
                <Card key={entry._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {entry.cause?.imageUrl && (
                        <div className="md:w-1/4">
                          <img 
                            src={getImageUrl(entry.cause.imageUrl)} 
                            alt={entry.cause.title} 
                            className="w-full h-32 object-cover rounded-md"
                            onError={(e) => handleImageError(e)}
                          />
                        </div>
                      )}
                      <div className="md:w-3/4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold">{entry.cause?.title || 'Unknown Cause'}</h3>
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                            Position #{entry.position}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{entry.cause?.description || 'No description available'}</p>
                        
                        {entry.cause && (
                          <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-primary-600 h-2.5 rounded-full" 
                                style={{ width: `${Math.min(((entry.cause.currentAmount || 0) / entry.cause.targetAmount) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="text-sm text-gray-500">
                                ${(entry.cause.currentAmount || 0).toLocaleString()} raised
                              </span>
                              <span className="text-sm text-gray-500">
                                ${entry.cause.targetAmount.toLocaleString()} goal
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4 items-center">
                          <div>
                            <p className="text-sm text-gray-500">Joined</p>
                            <p className="font-semibold">{new Date(entry.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <p className="font-semibold capitalize">{entry.status}</p>
                          </div>
                          <div className="flex-grow"></div>
                          <Button 
                            variant="outline" 
                            onClick={() => handleLeaveWaitlist(entry._id)}
                          >
                            Leave Waitlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No waitlist entries yet</h3>
              <p className="text-gray-500 mb-6">You haven't joined any waitlists yet.</p>
              <Button onClick={() => navigate('/causes')}>
                Browse Causes
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

// TypeScript interfaces
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
  isOnline: boolean;
  sponsorships?: Array<{
    _id: string;
    status: string;
  }>;
}

interface Claim {
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
  status: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  shippingDate?: string;
  deliveryDate?: string;
}

interface WaitlistEntry {
  _id: string;
  causeId: string;
  fullName: string;
  email: string;
  phone: string;
  message?: string;
  notifyEmail: boolean;
  notifySms: boolean;
  position: number;
  status: 'waiting' | 'notified' | 'claimed' | 'expired';
  createdAt: string;
  updatedAt: string;
  cause?: Cause;
}

export default ClaimerDashboard;
