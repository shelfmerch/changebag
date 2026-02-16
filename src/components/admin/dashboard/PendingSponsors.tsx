
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface PendingSponsor {
  id: string;
  sponsor: string;
  cause: string;
  amount: number;
  date: string;
}

interface PendingSponsorsProps {
  pendingSponsors: PendingSponsor[];
}

const PendingSponsors: React.FC<PendingSponsorsProps> = ({ pendingSponsors }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleApprove = (sponsorId: string) => {
    toast({
      title: "Sponsor Approved",
      description: "The sponsor has been successfully approved."
    });
  };
  
  const handleReject = (sponsorId: string) => {
    toast({
      title: "Sponsor Rejected",
      description: "The sponsor has been rejected."
    });
  };

  return (
    <div className="space-y-4">
      {pendingSponsors.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">
                    {item.sponsor} &rarr; {item.cause}
                  </h3>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                    Pending Review
                  </Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Sponsor</p>
                    <p className="font-medium">{item.sponsor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-medium">${item.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted</p>
                    <p className="font-medium">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 md:flex-col w-full md:w-auto md:min-w-[120px] mt-4 md:mt-0">
                <Button 
                  onClick={() => handleApprove(item.id)} 
                  className="flex-1 md:flex-grow-0"
                >
                  Approve
                </Button>
                <Button 
                  onClick={() => handleReject(item.id)}
                  variant="outline" 
                  className="flex-1 md:flex-grow-0"
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => navigate(`/admin/sponsor/${item.id}`)}
                  variant="ghost" 
                  className="flex-1 md:flex-grow-0"
                >
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {pendingSponsors.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No pending sponsorships</h3>
          <p className="text-gray-500">All sponsorships have been reviewed.</p>
        </div>
      )}
    </div>
  );
};

export default PendingSponsors;
