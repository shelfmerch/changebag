
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SponsorBenefits: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Sponsorship Benefits</h2>
        <ul className="space-y-3">
          <li className="flex">
            <div className="mr-2 text-primary-600">✓</div>
            <span>Logo placement on cause page</span>
          </li>
          <li className="flex">
            <div className="mr-2 text-primary-600">✓</div>
            <span>Branded impact reporting</span>
          </li>
          <li className="flex">
            <div className="mr-2 text-primary-600">✓</div>
            <span>Social media recognition</span>
          </li>
          <li className="flex">
            <div className="mr-2 text-primary-600">✓</div>
            <span>Impact certificates</span>
          </li>
          <li className="flex">
            <div className="mr-2 text-primary-600">✓</div>
            <span>Employee engagement opportunities</span>
          </li>
          <li className="flex">
            <div className="mr-2 text-primary-600">✓</div>
            <span>Custom QR code for your totes</span>
          </li>
          <li className="flex">
            <div className="mr-2 text-primary-600">✓</div>
            <span>Real-time analytics dashboard</span>
          </li>
        </ul>
        
        <div className="border-t mt-6 pt-6">
          <h3 className="font-semibold mb-2">Have questions?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Our team is here to help you find the perfect cause for your organization.
          </p>
          <Button variant="outline" className="w-full" onClick={() => window.location.href = 'mailto:support@shelfmerch.com'}>
            Contact Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SponsorBenefits;
