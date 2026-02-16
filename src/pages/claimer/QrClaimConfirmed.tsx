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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4">
                <QrCode className="h-6 w-6 text-green-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  QR Code Claim Confirmed!
                </h1>
              </div>
              
              <p className="text-xl text-gray-600">
                Thank you for claiming your tote via QR code
              </p>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {/* Thank You Message */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Thank You! 🎉
                    </h2>
                    
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Your tote claim for <span className="font-semibold text-green-600">{causeTitle}</span> has been 
                      <span className="font-bold text-green-600"> automatically verified</span> and is ready for collection.
                    </p>
                    
                    <p className="text-gray-600">
                      You can collect your tote immediately from the distribution point where you scanned the QR code.
                    </p>
                  </div>

                  {/* Collection Info */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Package className="h-6 w-6 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-800">
                        Ready for Collection
                      </h3>
                    </div>
                    
                    <div className="space-y-2 text-sm text-green-700">
                      <p>• Your claim has been automatically verified</p>
                      <p>• No shipping or delivery required</p>
                      <p>• Collect your tote at the QR code location</p>
                      <p>• Show your confirmation email if requested</p>
                    </div>
                  </div>

                  {/* Claimer Details */}
                  {/* <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-gray-900 mb-3">Claim Details:</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Name:</span> {claimData.fullName}</p>
                      <p><span className="font-medium">Email:</span> {claimData.email}</p>
                      <p><span className="font-medium">Phone:</span> {claimData.phone}</p>
                      <p><span className="font-medium">Purpose:</span> {claimData.purpose}</p>
                    </div>
                  </div> */}

                  {/* Next Steps */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      What's Next?
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-2">📱 Check Your Email</h4>
                        <p className="text-blue-700">
                          You'll receive a confirmation email with your claim details.
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-800 mb-2">🎒 Collect Your Tote</h4>
                        <p className="text-purple-700">
                          Visit the QR code location to collect your tote bag.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button 
                      onClick={handleGoHome}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                    >
                      <Home className="h-5 w-5 mr-2" />
                      Go to Homepage
                    </Button>
                    
                    <Button 
                      onClick={handleViewOtherCauses}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <Package className="h-5 w-5 mr-2" />
                      View Other Causes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Questions about your claim? Contact us at{' '}
                <a href="mailto:support@shelfmerch.com" className="text-green-600 hover:text-green-700">
                  support@changebag.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QrClaimConfirmedPage; 