
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
      <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#ffffff] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/30 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-green-100/20 rounded-full blur-[120px] -ml-48 -mb-48" />

        <div className="container mx-auto px-4 pt-28 pb-16 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-200 animate-pulse rounded-full blur-xl opacity-50" />
                  <div className="relative bg-white p-5 rounded-full shadow-xl border border-green-50">
                    <Check className="h-14 w-14 text-[#0d3d22]" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-green-600/80 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    Claim Successful
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a14] tracking-tight">
                  You have successfully <br />
                  <em className="font-serif italic font-normal text-[#0d3d22]">claimed a tote.</em>
                </h1>
                <p className="text-lg text-[#6b6b58] max-w-lg mx-auto">
                  Thank you for supporting <span className="font-semibold text-[#0d3d22]">{formData?.causeTitle || 'this cause'}</span>. Your tote will soon be on its way.
                </p>
              </div>
            </div>

            <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-0 bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden mb-12">
              <CardContent className="p-8 md:p-10">
                <h2 className="text-xl font-bold text-[#1a1a14] mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                  </div>
                  Claim Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#6b6b58]">Claim ID</p>
                    <p className="text-lg font-semibold text-[#1a1a14]">{claimId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#6b6b58]">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <p className="text-lg font-semibold text-[#1a1a14]">Processing</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#6b6b58]">Recipient</p>
                    <p className="text-lg font-semibold text-[#1a1a14]">{formData?.fullName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#6b6b58]">Estimated Delivery</p>
                    <p className="text-lg font-semibold text-[#1a1a14]">7-10 business days</p>
                  </div>
                </div>

                <div className="bg-[#f8faf9] p-6 rounded-2xl border border-gray-100 mb-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6b6b58] mb-2">Shipping Address</p>
                  <p className="text-[#1a1a14] font-medium leading-relaxed">
                    {formData ? (
                      <>
                        {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>

                <div className="space-y-6">
                  <Button
                    className="w-full bg-[#0d3d22] hover:bg-[#1a1a14] text-white py-8 rounded-2xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    onClick={() => navigate('/')}
                  >
                    Know more about ChangeBag
                  </Button>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="outline"
                      className="flex-1 py-6 rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                      onClick={() => navigate('/causes')}
                    >
                      Browse more causes
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1 py-6 rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                      onClick={() => navigate('/causes')}
                    >
                      Become a sponsor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-[#6b6b58]">
                Questions about your claim? <br />
                Email us at <a href="mailto:support@changebag.org" className="text-[#0d3d22] font-semibold underline underline-offset-4">support@changebag.org</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClaimConfirmedPage;
