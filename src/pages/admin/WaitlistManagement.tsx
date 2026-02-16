import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Search, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import config from '@/config';
import axios from 'axios';

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
  status: 'waiting' | 'notified' | 'verified' | 'expired';
  createdAt: string;
  updatedAt: string;
}

interface Cause {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const WaitlistManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCause, setSelectedCause] = useState<string>('all');
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch causes
        const causesResponse = await axios.get(`${config.apiUrl}/causes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setCauses(causesResponse.data);

        // Fetch waitlist entries for all causes
        const waitlistResponse = await axios.get(`${config.apiUrl}/waitlist/all`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setWaitlistEntries(waitlistResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load waitlist data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      notified: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.waiting;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCauseTitle = (causeId: string) => {
    const cause = causes.find(c => c._id === causeId);
    return cause?.title || 'Unknown Cause';
  };

  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesSearch = 
      entry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCauseTitle(entry.causeId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCause = selectedCause === 'all' || entry.causeId === selectedCause;
    
    return matchesSearch && matchesCause;
  });

  const getStats = () => {
    const total = waitlistEntries.length;
    const waiting = waitlistEntries.filter(e => e.status === 'waiting').length;
    const notified = waitlistEntries.filter(e => e.status === 'notified').length;
    const verified = waitlistEntries.filter(e => e.status === 'verified').length;

    return { total, waiting, notified, verified };
  };

  const stats = getStats();

  return (
    <AdminLayout title="Waitlist Management" subtitle="Manage waitlist entries for all causes">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Waiting</p>
                  <p className="text-2xl font-bold">{stats.waiting}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Notified</p>
                  <p className="text-2xl font-bold">{stats.notified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">verified</p>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search waitlist entries..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCause}
              onChange={(e) => setSelectedCause(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Causes</option>
              {causes.map(cause => (
                <option key={cause._id} value={cause._id}>
                  {cause.title}
                </option>
              ))}
            </select>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading waitlist entries...</p>
          </div>
        ) : filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => (
            <Card key={entry._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{entry.fullName}</h3>
                      {getStatusBadge(entry.status)}
                    </div>
                    <p className="text-gray-600 mb-4">Cause: {getCauseTitle(entry.causeId)}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{entry.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{entry.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Position</p>
                        <p className="font-medium">#{entry.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">{new Date(entry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Notifications</p>
                        <div className="flex gap-2">
                          {entry.notifyEmail && <Badge variant="outline">Email</Badge>}
                          {entry.notifySms && <Badge variant="outline">SMS</Badge>}
                        </div>
                      </div>
                    </div>
                    {entry.message && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">Message</p>
                        <p className="font-medium">{entry.message}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    {entry.status === 'notified' && (
                      <Button variant="outline" className="flex-1">
                        Resend Notification
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No waitlist entries found</h3>
            <p className="text-gray-500">Try changing your search criteria or cause filter</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default WaitlistManagement; 