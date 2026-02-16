
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

interface WaitlistNotificationProps {
  recipientName: string;
  causeName: string;
  magicLink: string;
  expiryHours: number;
}

const WaitlistNotification: React.FC<WaitlistNotificationProps> = ({
  recipientName,
  causeName,
  magicLink,
  expiryHours = 48
}) => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="bg-primary text-white text-center py-6">
        <CardTitle className="text-xl">Good News! Totes Are Now Available</CardTitle>
        <CardDescription className="text-white/90">
          Your waitlisted cause is now ready for claiming
        </CardDescription>
      </CardHeader>
      
      <CardContent className="py-6 space-y-4">
        <p>Hello {recipientName},</p>
        
        <p>
          Great news! The cause you joined the waitlist for, <strong>{causeName}</strong>, 
          has received funding and totes are now available for claim.
        </p>
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-md my-6">
          <p className="font-medium text-blue-800">
            As a waitlist member, you have priority access to claim your totes.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            This special link will expire in {expiryHours} hours, so please claim your totes soon.
          </p>
        </div>
        
        <div className="text-center my-6">
          <Button size="lg" className="px-8" asChild>
            <a href={magicLink}>Claim Your Totes Now</a>
          </Button>
        </div>
        
        <p className="text-sm">
          If the button above doesn't work, copy and paste this link into your browser:
        </p>
        <div className="bg-gray-50 p-2 rounded text-xs break-all border border-gray-200">
          {magicLink}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 text-xs text-gray-600 p-4">
        <div className="w-full text-center">
          <p>© 2025 Tote Claimers. All rights reserved.</p>
          <p className="mt-1">
            This email was sent to you because you joined the waitlist for a cause.
            If you did not request this, please ignore this email.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default WaitlistNotification;
