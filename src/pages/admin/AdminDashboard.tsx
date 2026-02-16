import React, { useState, useEffect } from 'react';
import { getApiUrl, getFullUrl } from '@/utils/apiUtils';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, PlusCircle, Search, ArrowUpDown, Download, Image as ImageIcon } from 'lucide-react';

// Interface for Cause data
interface Cause {
  _id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  isOnline?: boolean;
  imageUrl?: string;
  adminImageUrl?: string;
  story?: string;
  location?: string;
  creator?: any;
  sponsors?: any[];
}

const CausesManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status' | 'currentAmount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [causes, setCauses] = useState<Cause[]>([]);
  const [pendingCauses, setPendingCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch causes from the database
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl('/causes'), {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch causes');
        }

        const data = await response.json();
        // Set isOnline property based on status for each cause
        const causesWithOnlineStatus = data.map((cause: Cause) => ({
          ...cause,
          isOnline: cause.status === 'approved' || cause.status === 'completed'
        }));
        setCauses(causesWithOnlineStatus);
      } catch (err) {
        console.error('Error fetching causes:', err);
        setError('Failed to load causes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCauses();
  }, []);

  // Fetch pending causes for the admin dashboard
  useEffect(() => {
    const fetchPendingCauses = async () => {
      try {
        const response = await fetch(getApiUrl('/causes/pending'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch pending causes');
        
        const data = await response.json();
        setPendingCauses(data);
      } catch (error) {
        console.error('Error fetching pending causes:', error);
      }
    };

    fetchPendingCauses();
  }, []);

  const handleSetAdminImage = (causeId: string) => {
    navigate(`/admin/causes/${causeId}/upload-image`);
  };

  const handleToggleStatus = async (causeId: string) => {
    try {
      const cause = causes.find(c => c._id === causeId);
      if (!cause) return;
      
      const newOnlineStatus = !cause.isOnline;
      
      // Update in the UI optimistically
      setCauses(prev => prev.map(c => {
        if (c._id === causeId) {
          return { 
            ...c, 
            isOnline: newOnlineStatus,
            // If going online, also update status to approved if it's in draft
            status: newOnlineStatus && c.status === 'draft' ? 'approved' : c.status
          };
        }
        return c;
      }));
      
      // Send update to the server using the new toggle-online endpoint
      const response = await fetch(getApiUrl(`/causes/${causeId}/toggle-online`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add authentication token
        },
        body: JSON.stringify({
          status: newOnlineStatus ? 'approved' : 'pending'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cause status');
      }
      
      // Get the updated cause from the server response
      const data = await response.json();
      console.log('Server response:', data);
      
      // Update the causes list with the server response to ensure sync
      setCauses(prev => prev.map(c => {
        if (c._id === causeId) {
          // Make sure isOnline property is correctly set based on the status
          return { 
            ...c, 
            ...data.cause,
            isOnline: data.cause.status === 'approved' || data.cause.status === 'completed'
          };
        }
        return c;
      }));
      
      toast({
        title: 'Campaign Status Updated',
        description: `${cause.title} is now ${newOnlineStatus ? 'online' : 'offline'}.`,
        duration: 3000
      });
    } catch (err) {
      console.error('Error updating cause status:', err);
      toast({
        title: 'Update Failed',
        description: 'Failed to update cause status. Please try again.',
        variant: 'destructive'
      });
      
      // Revert the optimistic update
      const response = await fetch(getApiUrl('/causes'));
      if (response.ok) {
        const data = await response.json();
        setCauses(data.map((cause: Cause) => ({
          ...cause,
          isOnline: cause.status !== 'draft' && cause.status !== 'rejected'
        })));
      }
    }
  };
  
  const handleForceCloseClaims = (causeId: string) => {
    toast({
      title: 'Claims Closed',
      description: `All claims for this cause have been closed as it reached the tote limit.`
    });
  };
  
  const handleSort = (column: 'date' | 'title' | 'status' | 'currentAmount') => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  const filteredAndSortedCauses = causes
    .filter(cause => 
      cause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cause.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cause.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'title') {
        return sortDirection === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'status') {
        return sortDirection === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      } else if (sortBy === 'currentAmount') {
        return sortDirection === 'asc'
          ? a.currentAmount - b.currentAmount
          : b.currentAmount - a.currentAmount;
      }
      return 0;
    });

  // Display loading state
  if (loading) {
    return (
      <AdminLayout title="Causes Management" subtitle="Loading causes...">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Causes Management</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Display error state
  if (error) {
    return (
      <AdminLayout title="Causes Management" subtitle="Error loading causes">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Causes Management</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500 text-center">
              <p className="text-xl font-semibold mb-2">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Causes Management" subtitle="Manage and monitor all causes">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Causes Management</h1>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search causes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSort('date')}
              className="whitespace-nowrap"
            >
              Date {sortBy === 'date' && <ArrowUpDown className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSort('title')}
              className="whitespace-nowrap"
            >
              Title {sortBy === 'title' && <ArrowUpDown className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSort('status')}
              className="whitespace-nowrap"
            >
              Status {sortBy === 'status' && <ArrowUpDown className="ml-2 h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSort('currentAmount')}
              className="whitespace-nowrap"
            >
              Amount {sortBy === 'currentAmount' && <ArrowUpDown className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 gap-6 max-w-9xl mx-auto">
          {filteredAndSortedCauses.map((cause) => (
            <Card key={cause._id} className="overflow-hidden h-[300px]">
              <div className="flex flex-row">
                <div className="w-1/4 h-1/4 relative">
                  <div className="relative h-full">
                    <img
                      src={cause.imageUrl || '/placeholder-image.jpg'}
                      alt={cause.title}
                      className="w-full h-full object-cover min-h-[100px]"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge variant={cause.isOnline ? 'default' : 'secondary'}>
                        {cause.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                      <Badge variant="outline">{cause.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="w-2/3 p-6">
                  <h3 className="text-xl font-semibold mb-3">{cause.title}</h3>
                  <p className="text-gray-500 mb-4">{cause.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-base font-medium">Target: ${cause.targetAmount}</p>
                      <p className="text-gray-500">Current: ${cause.currentAmount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">{new Date(cause.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => handleToggleStatus(cause._id)}
                    >
                      {cause.isOnline ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="ml-2">{cause.isOnline ? 'Take Offline' : 'Put Online'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => handleSetAdminImage(cause._id)}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="ml-2">Set Image</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CausesManagement;