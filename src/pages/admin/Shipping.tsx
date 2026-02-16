
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Search, Package, Truck, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import config from '@/config';

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
  createdAt: string;
  updatedAt: string;
  shippingDate?: string;
  deliveryDate?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

const Shipping = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [shipments, setShipments] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch verified direct claims for shipping
  useEffect(() => {
    const fetchVerifiedClaims = async () => {
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log(`Fetching verified direct claims from ${config.apiUrl}/claims/verified-direct`);
        const response = await axios.get(`${config.apiUrl}/claims/verified-direct`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Verified direct claims data:', response.data);
        
        // Handle different response formats
        if (response.data.claims) {
          setShipments(response.data.claims);
        } else if (Array.isArray(response.data)) {
          setShipments(response.data);
        } else {
          console.error('Unexpected claims data format:', response.data);
          setError('Invalid data format received from server');
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching verified direct claims:', err);
        setError(err.response?.data?.message || 'Failed to load verified direct claims');
        setLoading(false);
      }
    };
    
    fetchVerifiedClaims();
  }, [token]);

  const handleMarkShipped = async (claimId: string) => {
    try {
      const response = await axios.patch(`${config.apiUrl}/claims/${claimId}/status`, 
        { status: ClaimStatus.SHIPPED },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      setShipments(prev => prev.map(claim => 
        claim._id === claimId 
          ? { ...claim, status: ClaimStatus.SHIPPED, shippingDate: new Date().toISOString() }
          : claim
      ));
      
      toast({
        title: 'Marked as Shipped',
        description: 'The shipment has been marked as shipped and tracking information is now available.'
      });
    } catch (err: any) {
      console.error('Error marking as shipped:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to mark as shipped',
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

  const getStatusIcon = (status: ClaimStatus) => {
    switch (status) {
      case ClaimStatus.PENDING:
        return <Package className="w-4 h-4" />;
      case ClaimStatus.VERIFIED:
        return <Package className="w-4 h-4" />;
      case ClaimStatus.SHIPPED:
        return <Truck className="w-4 h-4" />;
      case ClaimStatus.DELIVERED:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const filteredShipments = shipments.filter(claim =>
    claim.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.causeTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Shipping Management" subtitle="Track and manage all tote bag shipments">
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search shipments..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">Bulk Ship</Button>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading verified claims...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Claims</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((claim) => (
            <Card key={claim._id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{claim.fullName}</h3>
                      <Badge 
                        variant="outline" 
                        className={getStatusBadge(claim.status)}
                      >
                        {getStatusIcon(claim.status)}
                        <span className="ml-1">{claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}</span>
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4">Campaign: {claim.causeTitle}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Tracking Number</p>
                        <p className="font-medium font-mono">{claim.trackingNumber || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Carrier</p>
                        <p className="font-medium">{claim.carrier || 'Not assigned'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estimated Delivery</p>
                        <p className="font-medium">{claim.estimatedDelivery ? new Date(claim.estimatedDelivery).toLocaleDateString() : 'Not set'}</p>
                      </div>
                      {claim.shippingDate && (
                        <div>
                          <p className="text-sm text-gray-500">Shipped Date</p>
                          <p className="font-medium">{new Date(claim.shippingDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="font-medium">{claim.address}, {claim.city}, {claim.state} {claim.zipCode}</p>
                    </div>
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2">
                    <Button variant="outline" className="flex-1">
                      Track Package
                    </Button>
                    {claim.status === ClaimStatus.VERIFIED && (
                      <Button 
                        onClick={() => handleMarkShipped(claim._id)}
                        className="flex-1 flex items-center gap-1"
                      >
                        <Truck className="h-4 w-4" />
                        Mark Shipped
                      </Button>
                    )}
                    <Button variant="outline" className="flex-1">
                      Print Label
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {filteredShipments.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No verified claims found</h3>
              <p className="text-gray-500">Verified direct claims will appear here for shipping management</p>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default Shipping;
