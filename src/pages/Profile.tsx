import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Phone, Package, Clock, ExternalLink, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getImageUrl, handleImageError } from '@/utils/imageUtils';
import config from '@/config';
import axios from 'axios';

interface Claim {
  _id: string;
  causeId: any;
  causeTitle: string;
  status: string;
  createdAt: string;
}

interface WaitlistEntry {
  _id: string;
  causeId: any;
  cause?: {
    title: string;
    imageUrl: string;
    description: string;
  };
  createdAt: string;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { toast } = useToast();
  
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [userWaitlist, setUserWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Fetch claims
        const claimsResponse = await axios.get(`${config.apiUrl}/claims/dashboard/claimer`, { headers });
        setUserClaims(claimsResponse.data.claimedTotes || []);

        // Fetch waitlist
        if (user?.email) {
          const waitlistResponse = await axios.get(`${config.apiUrl}/waitlist/user/${encodeURIComponent(user.email)}`);
          setUserWaitlist(waitlistResponse.data || []);
        }
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, isAuthLoading, navigate]);

  const handleLeaveWaitlist = async (waitlistId: string) => {
    try {
      if (!user?.email) return;
      await axios.delete(`${config.apiUrl}/waitlist/${waitlistId}/leave`, {
        data: { email: user.email }
      });
      setUserWaitlist(prev => prev.filter(entry => entry._id !== waitlistId));
      toast({ title: "Success", description: "Left the waitlist" });
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to leave waitlist", variant: "destructive" });
    }
  };

  if (isAuthLoading || (loading && !error)) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50/50 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* User Info Header */}
          <Card className="mb-8 border-none shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>
            <CardContent className="relative pt-16 pb-8 px-8">
              <div className="absolute -top-12 left-8 w-24 h-24 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                <div className="bg-primary-100 w-full h-full flex items-center justify-center">
                  <User size={48} className="text-primary-600" />
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Mail size={16} className="mr-1" /> {user?.email}
                    </div>
                    {user?.phone && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Phone size={16} className="mr-1" /> {user?.phone}
                      </div>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={logout} className="md:w-auto w-full">
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Claimed Totes Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Package className="text-primary-600" size={24} />
                <h2 className="text-2xl font-bold">Claimed Totes</h2>
              </div>
              <div className="space-y-4">
                {userClaims.length > 0 ? (
                  userClaims.map((claim) => (
                    <Card key={claim._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{claim.causeTitle}</h3>
                          <Badge variant={claim.status === 'delivered' ? 'default' : 'secondary'}>
                            {claim.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                          Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full text-primary-600 hover:text-primary-700 hover:bg-primary-50 p-0 h-auto"
                          onClick={() => navigate(`/claim/status/${claim._id}`)}
                        >
                          View Status <ExternalLink size={14} className="ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-gray-50 border-dashed">
                    <CardContent className="py-12 text-center text-gray-500">
                      <p>You haven't claimed any totes yet.</p>
                      <Button variant="link" onClick={() => navigate('/causes')}>
                        Browse Causes
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>

            {/* Waitlisted Causes Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-primary-600" size={24} />
                <h2 className="text-2xl font-bold">Waitlist Activity</h2>
              </div>
              <div className="space-y-4">
                {userWaitlist.length > 0 ? (
                  userWaitlist.map((entry) => (
                    <Card key={entry._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {entry.cause?.imageUrl && (
                            <img 
                              src={getImageUrl(entry.cause.imageUrl)} 
                              alt={entry.cause.title} 
                              className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                              onError={handleImageError}
                            />
                          )}
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {entry.cause?.title || 'Unknown Cause'}
                              </h3>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 text-gray-400 hover:text-red-500"
                                onClick={() => handleLeaveWaitlist(entry._id)}
                              >
                                <XCircle size={16} />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 italic mb-2">
                              Joined {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-primary-600 hover:text-primary-700 hover:bg-primary-50 p-0 h-auto justify-start"
                              onClick={() => navigate(`/cause/${entry.causeId?._id || entry.causeId}`)}
                            >
                              View Cause Page
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="bg-gray-50 border-dashed">
                    <CardContent className="py-12 text-center text-gray-500">
                      <p>No waitlisted causes.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
