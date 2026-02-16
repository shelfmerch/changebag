import React, { useState, useEffect } from 'react';
import { getApiUrl, getFullUrl } from '@/utils/apiUtils';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Eye, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import config from '@/config';

interface PendingCause {
  _id: string;
  title: string;
  description: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  category: string;
  imageUrl: string;
  targetAmount: number;
  currentAmount: number;
  location: string;
  status: string;
}

interface PendingCausesProps {
  pendingCauses: PendingCause[];
  loading?: boolean;
  error?: string;
}

const PendingCauses: React.FC<PendingCausesProps> = ({ pendingCauses, loading = false, error = '' }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processingCauses, setProcessingCauses] = useState<Record<string, boolean>>({});

  const handleApprove = async (causeId: string) => {
    try {
      setProcessingCauses(prev => ({ ...prev, [causeId]: true }));
      
      // Get authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to approve causes.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Approving cause with URL:', `${config.apiUrl}/causes/${causeId}/status`);
      
      // Call API to update cause status to approved
      await axios.patch(`${config.apiUrl}/causes/${causeId}/status`, {
        status: 'approved'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      toast({
        title: "Cause Approved",
        description: "The cause has been successfully approved and is now visible to users."
      });
      
      // Refresh the page to update the list
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error approving cause:', error);
      toast({
        title: "Error",
        description: "Failed to approve the cause. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingCauses(prev => ({ ...prev, [causeId]: false }));
    }
  };
  
  const handleReject = async (causeId: string) => {
    try {
      setProcessingCauses(prev => ({ ...prev, [causeId]: true }));
      
      // Get authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to reject causes.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Rejecting cause with URL:', `${config.apiUrl}/causes/${causeId}/status`);
      
      // Call API to update cause status to rejected
      await axios.patch(`${config.apiUrl}/causes/${causeId}/status`, {
        status: 'rejected'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      toast({
        title: "Cause Rejected",
        description: "The cause has been rejected."
      });
      
      // Refresh the page to update the list
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error rejecting cause:', error);
      toast({
        title: "Error",
        description: "Failed to reject the cause. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingCauses(prev => ({ ...prev, [causeId]: false }));
    }
  };
  
  // const handleViewDetails = (causeId: string) => {
  //   navigate(`/admin/cause/${causeId}`);
  // };

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading pending causes...</span>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      ) : pendingCauses.length > 0 ? (
        pendingCauses.map((cause) => (
          <Card key={cause._id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{cause.title}</h3>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      Pending Review
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {cause.description.length > 150 
                      ? `${cause.description.substring(0, 150)}...` 
                      : cause.description}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Creator</p>
                      <p className="font-medium">{cause.creator?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium">{cause.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="font-medium">{new Date(cause.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Target Amount</p>
                    <p className="font-medium">${cause.targetAmount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 md:flex-col w-full md:w-auto md:min-w-[120px] mt-4 md:mt-0">
                  <Button 
                    onClick={() => handleApprove(cause._id)} 
                    className="flex-1 md:flex-grow-0"
                    disabled={processingCauses[cause._id]}
                  >
                    {processingCauses[cause._id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : 'Approve'}
                  </Button>
                  <Button 
                    onClick={() => handleReject(cause._id)}
                    variant="outline" 
                    className="flex-1 md:flex-grow-0"
                    disabled={processingCauses[cause._id]}
                  >
                    {processingCauses[cause._id] ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : 'Reject'}
                  </Button>
                  {/* <Button 
                    onClick={() => handleViewDetails(cause._id)}
                    variant="ghost" 
                    className="flex-1 md:flex-grow-0"
                  >
                    View Details
                  </Button> */}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No pending causes</h3>
          <p className="text-gray-500">All causes have been reviewed.</p>
        </div>
      )}
    </div>
  );
};

export default PendingCauses;
