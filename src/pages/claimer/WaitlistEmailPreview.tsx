
import React from 'react';
import Layout from '@/components/Layout';
import WaitlistNotification from '@/components/email/WaitlistNotification';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { magicLinkService } from '@/services/magicLinkService';

const WaitlistEmailPreviewPage = () => {
  const navigate = useNavigate();
  
  // Create a sample magic link for demonstration
  const magicLinkPayload = magicLinkService.createMagicLink(
    'user123', 
    'waitlist123', 
    '1',
    'jane.doe@example.com'
  );
  
  const magicLinkUrl = magicLinkService.getMagicLinkUrl(magicLinkPayload);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          &larr; Back
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Notification Preview</h1>
          <p className="text-gray-600">
            This is what waitlisted users receive when totes become available
          </p>
        </div>
        
        <WaitlistNotification
          recipientName="Jane Doe"
          causeName="Clean Water Initiative"
          magicLink={magicLinkUrl}
          expiryHours={48}
        />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">
            In a real implementation, this email would be sent automatically when a cause transitions from waitlist to active.
          </p>
          <Button onClick={() => window.open(magicLinkUrl, '_blank')}>
            Test Magic Link
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default WaitlistEmailPreviewPage;
