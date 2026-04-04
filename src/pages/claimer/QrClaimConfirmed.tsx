import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, QrCode, Home, Package } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const QrClaimConfirmedPage = () => {
  const navigate = useNavigate();
  const [claimData, setClaimData] = useState<any>(null);
  const [causeTitle, setCauseTitle] = useState<string>('');

  useEffect(() => {
    // Get claim data from session storage
    const storedData = sessionStorage.getItem('claimFormData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setClaimData(data);
        setCauseTitle(data.causeTitle || 'this cause');
      } catch (error) {
        console.error('Error parsing claim data:', error);
        toast({
          title: "Error",
          description: "Unable to load claim details.",
          variant: "destructive",
        });
      }
    } else {
      // If no data, redirect to home
      navigate('/');
    }
  }, [navigate]);

  const handleGoHome = () => {
    // Clear session storage
    sessionStorage.removeItem('claimFormData');
    navigate('/');
  };

  const handleViewOtherCauses = () => {
    // Clear session storage
    sessionStorage.removeItem('claimFormData');
    navigate('/causes');
  };

  if (!claimData) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading confirmation...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#f8faf9] to-[#ffffff] relative overflow-hidden">
        {/* Decorative background elements from home theme */}
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
                    <CheckCircle className="h-14 w-14 text-[#0d3d22]" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-green-600/80 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    Claim Verified
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a14] tracking-tight">
                  You have successfully <br />
                  <em className="font-serif italic font-normal text-[#0d3d22]">claimed a tote.</em>
                </h1>
                <p className="text-lg text-[#6b6b58] max-w-lg mx-auto">
                  Thank you for supporting <span className="font-semibold text-[#0d3d22]">{causeTitle}</span>. You are now a proud citizen driving real change.
                </p>
              </div>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-0 bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardContent className="p-10 md:p-12">
                <div className="text-center space-y-10">
                  {/* Visual Confirmation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="p-6 bg-[#f0f7f4] rounded-2xl border border-green-50 relative overflow-hidden group">
                      {/* <div className="absolute top-0 right-0 p-4 opacity-5">
                        <QrCode className="h-24 w-24" />
                      </div> */}
                      <h3 className="text-sm font-bold uppercase tracking-widest text-green-800 mb-4 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                         Automatic Verification
                      </h3>
                      <p className="text-gray-700 leading-relaxed font-medium">
                        Your claim has been verified and is ready for collection at this distribution point.
                      </p>
                    </div>

                    <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#6b6b58] mb-4 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                         Next Steps
                      </h3>
                      <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Show this screen to the distribution partner</span>
                        </li>
                        <li className="flex gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          <span>Check your inbox for a confirmation mail</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Call to Action Section */}
                  <div className="pt-6 border-t border-gray-100">
                    <div className="space-y-6">
                      <Button 
                        onClick={() => navigate('/')}
                        className="w-full bg-[#0d3d22] hover:bg-[#1a1a14] text-white py-8 rounded-2xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                      >
                        Know more about ChangeBag
                      </Button>
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          onClick={() => navigate('/causes')}
                          variant="outline"
                          className="flex-1 py-6 rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                        >
                          Browse more Causes
                        </Button>
                        
                        <Button 
                          onClick={() => navigate('/causes')}
                          variant="outline"
                          className="flex-1 py-6 rounded-2xl border-gray-200 hover:bg-gray-50 text-gray-700 font-medium"
                        >
                          Become a Sponsor
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Footer */}
            <div className="mt-12 text-center">
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

export default QrClaimConfirmedPage; 