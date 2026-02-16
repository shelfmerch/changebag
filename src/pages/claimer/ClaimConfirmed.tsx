
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

const ClaimConfirmedPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  const [verificationComplete, setVerificationComplete] = useState<boolean>(false);
  const [claimId, setClaimId] = useState<string>('CL-12345');
  
  useEffect(() => {
    // Check if user completed verification
    const isVerified = sessionStorage.getItem('verificationComplete') === 'true';
    setVerificationComplete(isVerified);
    
    // Retrieve form data
    const storedData = sessionStorage.getItem('claimFormData');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
    
    if (!isVerified && !storedData) {
      // If user navigated here directly without completing the process
      navigate('/causes');
    }
    
    // In a real app, we would get the claim ID from the API response
    // Mock generating a claim ID
    const randomId = Math.floor(10000 + Math.random() * 90000);
    setClaimId(`CL-${randomId}`);
    
  }, [navigate]);
  
  return (
    <Layout>
      <div className="bg-primary-50 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Claim Confirmed!</h1>
          <p className="text-lg text-gray-700">
            Your tote claim for {formData?.causeTitle || 'this cause'} has been successfully processed
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Claim Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Claim ID</p>
                  <p className="font-medium">{claimId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium">Processing</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Recipient</p>
                  <p className="font-medium">{formData?.fullName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Organization</p>
                  <p className="font-medium">{formData?.organization || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">Shipping Address</p>
                <p className="font-medium">
                  {formData ? (
                    <>
                      {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                    </>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">Estimated Delivery</p>
                <p className="font-medium">7-10 business days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <Button 
            variant="outline"
            onClick={() => navigate(`/claim/status/${claimId}`)}
          >
            Track Your Claim
          </Button>
          
          <Button 
            onClick={() => navigate('/causes')}
          >
            Browse More Causes
          </Button>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            Questions about your claim?
          </p>
          <p className="text-gray-800">
            Contact us at <span className="font-medium">support@toteclaimers.org</span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ClaimConfirmedPage;
