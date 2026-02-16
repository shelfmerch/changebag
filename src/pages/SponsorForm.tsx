
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import SponsorFormContainer from '@/components/sponsor/SponsorFormContainer';

const SponsorFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const causeId = searchParams.get('causeId');
  
  return (
    <Layout>
      <div className="bg-primary-50 py-10">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4"
          >
            &larr; Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Become a Sponsor</h1>
          <p className="text-lg text-gray-700 mb-6">
            Complete our simple wizard to start your sponsorship journey
          </p>
        </div>
      </div>
      
      <SponsorFormContainer causeId={causeId} />
    </Layout>
  );
};

export default SponsorFormPage;
