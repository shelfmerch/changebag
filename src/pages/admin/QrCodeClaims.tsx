import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Search, QrCode, Eye, CheckCircle, XCircle, ArrowUpDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import config from '@/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Define the ClaimStatus enum to match backend
enum ClaimStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Define the ClaimSource enum to match backend
enum ClaimSource {
  DIRECT = 'direct',
  QR_CODE = 'qr',
  WAITLIST = 'waitlist',
  MAGIC_LINK = 'magic-link',
  SPONSOR_LINK = 'sponsor-link'
}

// Define the Claim interface to match backend model
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
  status: ClaimStatus;
  emailVerified: boolean;
  source: ClaimSource;
  referrerUrl?: string;
  qrCodeScanned: boolean;
  createdAt: string;
  updatedAt: string;
  shippingDate?: string;
  deliveryDate?: string;
}

const QrCodeClaims = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'name'>('date');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchQrCodeClaims();
  }, []);

  const fetchQrCodeClaims = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.apiUrl}/claims/qr-code`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(response.data.claims);
    } catch (error: any) {
      console.error('Error fetching QR code claims:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch QR code claims',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };



  const handleApprove = async (claimId: string) => {
    try {
      const response = await axios.patch(`${config.apiUrl}/claims/${claimId}/status`, 
        { status: ClaimStatus.VERIFIED },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setClaims(prev => prev.map(claim => 
        claim._id === claimId ? { ...claim, status: ClaimStatus.VERIFIED } : claim
      ));
      
      toast({
        title: 'Claim Approved',
        description: 'The QR code claim has been verified and approved for shipping.'
      });
    } catch (err: any) {
      console.error('Error approving claim:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to approve claim',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (claimId: string) => {
    try {
      const response = await axios.patch(`${config.apiUrl}/claims/${claimId}/status`, 
        { status: ClaimStatus.CANCELLED },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setClaims(prev => prev.map(claim => 
        claim._id === claimId ? { ...claim, status: ClaimStatus.CANCELLED } : claim
      ));
      
      toast({
        title: 'Claim Rejected',
        description: 'The QR code claim has been rejected.',
        variant: 'destructive'
      });
    } catch (err: any) {
      console.error('Error rejecting claim:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to reject claim',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: ClaimStatus) => {
    const statusColors = {
      [ClaimStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ClaimStatus.VERIFIED]: 'bg-green-100 text-green-800',
      [ClaimStatus.SHIPPED]: 'bg-blue-100 text-blue-800',
      [ClaimStatus.DELIVERED]: 'bg-emerald-100 text-emerald-800',
      [ClaimStatus.CANCELLED]: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getSourceBadge = (source: ClaimSource) => {
    const sourceColors = {
      [ClaimSource.QR_CODE]: 'bg-purple-100 text-purple-800',
      [ClaimSource.DIRECT]: 'bg-gray-100 text-gray-800',
      [ClaimSource.WAITLIST]: 'bg-orange-100 text-orange-800',
      [ClaimSource.MAGIC_LINK]: 'bg-indigo-100 text-indigo-800',
      [ClaimSource.SPONSOR_LINK]: 'bg-teal-100 text-teal-800'
    };
    return sourceColors[source] || 'bg-gray-100 text-gray-800';
  };

  const filteredClaims = claims.filter(claim =>
    claim.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.causeTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedClaims = [...filteredClaims].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'status') {
      return a.status.localeCompare(b.status);
    } else { // name
      return a.fullName.localeCompare(b.fullName);
    }
  });

  const handleSort = (newSortBy: 'date' | 'status' | 'name') => {
    setSortBy(newSortBy);
  };
  
  const handleViewDetails = (claim: Claim) => {
    setSelectedClaim(claim);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout title="QR Code Claims" subtitle="Track claims made through QR codes">
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading QR code claims...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="QR Code Claims" subtitle="Track claims made through QR codes">


      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSort('date')}
            className={sortBy === 'date' ? 'bg-gray-100' : ''}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Date
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSort('status')}
            className={sortBy === 'status' ? 'bg-gray-100' : ''}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Status
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSort('name')}
            className={sortBy === 'name' ? 'bg-gray-100' : ''}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Name
          </Button>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {sortedClaims.map((claim) => (
          <Card key={claim._id}>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{claim.fullName}</h3>
                    <Badge className={getStatusBadge(claim.status)}>
                      {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                    </Badge>
                    <Badge className={getSourceBadge(claim.source)}>
                      {claim.source === ClaimSource.QR_CODE ? 'QR Code' : claim.source}
                    </Badge>
                    {claim.qrCodeScanned && (
                      <Badge className="bg-purple-100 text-purple-800">
                        QR Scanned
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">Campaign: {claim.causeTitle}</p>
                  <p className="text-gray-600 mb-2">{claim.email} • {claim.phone}</p>
                  {/* <p className="text-gray-600 mb-2">
                    {claim.address}, {claim.city}, {claim.state} {claim.zipCode}
                  </p> */}
                  {claim.referrerUrl && (
                    <p className="text-sm text-gray-500">
                      Referrer: {claim.referrerUrl}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(claim)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  
                  {claim.status === ClaimStatus.PENDING && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(claim._id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(claim._id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedClaims.length === 0 && (
        <Card className="text-center py-16">
          <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No QR code claims found</h3>
          <p className="text-gray-500">Claims made through QR codes will appear here.</p>
        </Card>
      )}

      {/* Claim Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Detailed information about this QR code claim
            </DialogDescription>
          </DialogHeader>
          
          {selectedClaim && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="font-medium">{selectedClaim.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="font-medium">{selectedClaim.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="font-medium">{selectedClaim.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusBadge(selectedClaim.status)}>
                    {selectedClaim.status.charAt(0).toUpperCase() + selectedClaim.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Source</p>
                  <Badge className={getSourceBadge(selectedClaim.source)}>
                    {selectedClaim.source === ClaimSource.QR_CODE ? 'QR Code' : selectedClaim.source}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">QR Scanned</p>
                  <Badge className={selectedClaim.qrCodeScanned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {selectedClaim.qrCodeScanned ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Campaign</p>
                <p className="font-medium">{selectedClaim.causeTitle}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Purpose</p>
                <p className="text-gray-700">{selectedClaim.purpose}</p>
              </div>
              
              {/* <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-700">
                  {selectedClaim.address}, {selectedClaim.city}, {selectedClaim.state} {selectedClaim.zipCode}
                </p>
              </div> */}
              
              {selectedClaim.referrerUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Referrer URL</p>
                  <p className="text-gray-700 break-all">{selectedClaim.referrerUrl}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-500">Claimed On</p>
                <p className="text-gray-700">{new Date(selectedClaim.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default QrCodeClaims; 