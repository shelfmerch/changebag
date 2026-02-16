import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SponsorshipConfirmation = () => {
  const location = useLocation();
  const sponsorshipId = location.state?.sponsorshipId;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold mb-4">
              Thank You for Your Sponsorship Request!
            </h1>
            
            <p className="text-gray-600 mb-6">
              Your sponsorship request has been submitted successfully. Our team will review your application and get back to you soon.
            </p>

            {sponsorshipId && (
              <p className="text-sm text-gray-500 mb-8">
                Reference ID: {sponsorshipId}
              </p>
            )}

            <div className="flex gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/">Return Home</Link>
              </Button>
              <Button asChild>
                <Link to="/causes">Browse More Causes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SponsorshipConfirmation; 