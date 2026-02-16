import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import api from '@/utils/apiClient';

interface EndCampaignButtonProps {
  sponsorshipId: string;
  onSuccess?: () => void;
}

const EndCampaignButton: React.FC<EndCampaignButtonProps> = ({ 
  sponsorshipId,
  onSuccess 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleEndCampaign = async () => {
    try {
      setIsLoading(true);
      
      // Use PATCH method as defined in the backend route
      const response = await api.client.patch(`/api/sponsorships/${sponsorshipId}/end-campaign`);
      
      toast({
        title: 'Campaign Ended',
        description: 'The campaign has been successfully marked as completed.',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error ending campaign:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to end the campaign. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
      >
        End Campaign
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this campaign? This will mark the sponsorship as completed
              and send a completion email to the sponsor. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleEndCampaign();
              }}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? 'Processing...' : 'End Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EndCampaignButton;