import React, { useState, useEffect } from 'react';
import { getApiUrl, getFullUrl } from '@/utils/apiUtils';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, PlusCircle, Search, ArrowUpDown, Download, Image as ImageIcon, PenTool as PenIcon } from 'lucide-react';

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
  isOnline: boolean;
  imageUrl?: string;
  adminImageUrl?: string;
  story?: string;
  location?: string;
  creator?: {
    _id: string;
    name: string;
    email: string;
  };
  sponsorships?: Array<{
    _id: string;
    status: string;
    amount: number;
    toteQuantity: number;
    createdAt: string;
  }>;
  totalTotes?: number;
}

const CausesManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status' | 'currentAmount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [causes, setCauses] = useState<Cause[]>([]);
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
        setCauses(data);
      } catch (err) {
        console.error('Error fetching causes:', err);
        setError('Failed to load causes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCauses();
  }, []);

  const handleSetAdminImage = (causeId: string) => {
    navigate(`/admin/causes/${causeId}/upload-image`);
  };

  const handleEdit = (causeId: string) => {
    navigate(`/admin/causes/${causeId}/edit`);
  };

  const handleContentEditor = (causeId: string) => {
    navigate(`/admin/causes/${causeId}/content`);
  };

  const handleToggleStatus = async (causeId: string) => {
    try {
      const cause = causes.find(c => c._id === causeId);
      if (!cause) return;
      
      const newIsOnline = !cause.isOnline;
      
      // Send update to the server
      const response = await fetch(getApiUrl(`/causes/${causeId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isOnline: newIsOnline })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cause visibility');
      }
      
      // Update local state
      setCauses(prev => prev.map(c => {
        if (c._id === causeId) {
          return { 
            ...c, 
            isOnline: newIsOnline
          };
        }
        return c;
      }));
      
      toast({
        title: 'Visibility Updated',
        description: `Cause is now ${newIsOnline ? 'online' : 'offline'}`,
        duration: 3000
      });
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive'
      });
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
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Causes Management</h1>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search causes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant="outline"
              onClick={() => handleSort('date')}
              className="w-full text-sm"
            >
              <span className="hidden sm:inline">Date</span>
              <span className="sm:hidden">Date</span>
              {sortBy === 'date' && <ArrowUpDown className="ml-2 h-3 w-3" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSort('title')}
              className="w-full text-sm"
            >
              <span className="hidden sm:inline">Title</span>
              <span className="sm:hidden">Title</span>
              {sortBy === 'title' && <ArrowUpDown className="ml-2 h-3 w-3" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSort('status')}
              className="w-full text-sm"
            >
              <span className="hidden sm:inline">Status</span>
              <span className="sm:hidden">Status</span>
              {sortBy === 'status' && <ArrowUpDown className="ml-2 h-3 w-3" />}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSort('currentAmount')}
              className="w-full text-sm"
            >
              <span className="hidden sm:inline">Amount</span>
              <span className="sm:hidden">$</span>
              {sortBy === 'currentAmount' && <ArrowUpDown className="ml-2 h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Causes Grid */}
        <div className="grid lg:grid-cols-2 gap-3 max-w-9xl mx-auto sm:grid-cols-1">
          {filteredAndSortedCauses.map((cause) => (
            <Card key={cause._id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 lg:w-1/2 relative">
                  <div className="relative aspect-video md:aspect-square">
                    <img
                      src={cause.imageUrl || '/placeholder-image.jpg'}
                      alt={cause.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex flex-col sm:flex-row gap-2">
                      <Badge variant={cause.isOnline ? 'default' : 'secondary'} className="text-xs">
                        {cause.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {cause.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-2/3 lg:w-1/2 p-4 md:p-6">
                  <h3 className="text-lg md:text-xl font-semibold mb-2">{cause.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{cause.description}</p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Target: ${cause.targetAmount.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Current: ${cause.currentAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{new Date(cause.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(cause._id)}
                      className="flex-1 sm:flex-none"
                    >
                      {cause.isOnline ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span className="ml-2 text-xs sm:text-sm">{cause.isOnline ? 'Take Offline' : 'Put Online'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cause._id)}
                      className="flex-1 sm:flex-none"
                    >
                      <PenIcon className="w-4 h-4" />
                      <span className="ml-2 text-xs sm:text-sm">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContentEditor(cause._id)}
                      className="flex-1 sm:flex-none"
                    >
                      <PenIcon className="w-4 h-4" />
                      <span className="ml-2 text-xs sm:text-sm">Content</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetAdminImage(cause._id)}
                      className="flex-1 sm:flex-none"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="ml-2 text-xs sm:text-sm">Set Image</span>
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
