import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Smartphone, Loader2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import config from '@/config';

// MSG91 API Configuration (for backend use only)
const MSG91_AUTH_KEY = "383885AfgFYzqZxpF634ff2e2P1";
const MSG91_SENDER_ID = "SHELF"; // Your sender ID
const MSG91_OTP_TEMPLATE_ID = "670e1516d6fc055ee21c5e42"; // Your template ID

// Standardize phone number format (same as backend)
const standardizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  }
  
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  if (cleaned.length === 13 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  
  return `+91${cleaned}`;
};

const OtpVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromWaitlist = searchParams.get('source') === 'waitlist';
  
  const [formData, setFormData] = useState<any>(null);
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  
  useEffect(() => {
    // Retrieve form data from session storage
    const storedData = sessionStorage.getItem('claimFormData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setFormData(parsedData);
      
      // Auto-fill phone number from claim form data
      if (parsedData.phone) {
        setPhone(parsedData.phone);
      }
    } else {
      navigate('/causes');
    }
    
    if (fromWaitlist) {
      toast({
        title: "Waitlist Member Detected",
        description: "Please verify your phone number to continue.",
      });
    }
  }, [navigate, fromWaitlist]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOTP = async () => {
    if (!phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedPhone = standardizePhoneNumber(phone);
      console.log('=== SENDING OTP ===');
      console.log('Original phone:', phone);
      console.log('Standardized phone:', formattedPhone);
      
      const response = await axios.post(`${config.apiUrl}/otp/send`, {
        phone: formattedPhone,
        method: 'sms'
      });
      
      console.log('OTP sent successfully:', response.data);
      
      setIsOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      
      toast({
        title: "OTP Sent!",
        description: "Verification code sent to your phone. Please check your SMS.",
      });
      
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = "Failed to send verification code. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const formattedPhone = standardizePhoneNumber(phone);
      console.log('=== VERIFYING OTP ===');
      console.log('Original phone:', phone);
      console.log('Standardized phone:', formattedPhone);
      console.log('OTP entered:', otp);
      
      const response = await axios.post(`${config.apiUrl}/otp/verify`, {
        phone: formattedPhone,
        otp: otp,
        method: 'sms'
      });
      
      console.log('OTP verification successful:', response.data);
      
      // Store verification status
      sessionStorage.setItem('verificationComplete', 'true');
      
      // Add fromWaitlist flag if applicable
      if (fromWaitlist) {
        const claimData = JSON.parse(sessionStorage.getItem('claimFormData') || '{}');
        sessionStorage.setItem('claimFormData', JSON.stringify({
          ...claimData,
          fromWaitlist: true
        }));
      }
      
      toast({
        title: "Phone Verified!",
        description: "Your phone number has been successfully verified.",
      });
      
      // Navigate to confirmation page
      navigate('/claim/confirmed');
      
    } catch (error: any) {
      console.error('OTP verification error:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = "Invalid or expired verification code.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) {
      toast({
        title: "Please Wait",
        description: `You can resend OTP in ${countdown} seconds.`,
        variant: "destructive",
      });
      return;
    }
    
    await sendOTP();
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendOTP();
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTP();
  };

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
          
          <h1 className="text-3xl font-bold mb-2">Verify Your Phone Number</h1>
          <p className="text-lg text-gray-700 mb-6">
            Enter your phone number to receive a verification code
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Phone Input Form */}
              {!isOtpSent ? (
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number (e.g., 9876543210)"
                      disabled={isLoading}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      Include country code if needed (e.g., +91 for India)
                    </p>
                  </div>

                  <Button 
                    type="submit"
                    disabled={!phone.trim() || isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4 mr-2" />
                        Send Verification Code
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                /* OTP Input Form */
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Verification code sent to:
                    </p>
                    <p className="font-medium">{phone}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      disabled={isLoading}
                      required
                      className="text-center text-lg tracking-widest"
                    />
                    <p className="text-sm text-gray-500">
                      Enter the 6-digit code sent to your phone
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      type="submit"
                      disabled={!otp || otp.length !== 6 || isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>

                    <div className="flex items-center justify-between">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsOtpSent(false);
                          setOtp('');
                          setCountdown(0);
                        }}
                        disabled={isLoading}
                      >
                        Change Phone
                      </Button>

                      <Button 
                        type="button"
                        variant="outline"
                        onClick={resendOTP}
                        disabled={countdown > 0 || isLoading}
                        className="flex items-center gap-2"
                      >
                        {countdown > 0 ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            {countdown}s
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Resend
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Enter your phone number above</li>
                  <li>2. Click "Send Verification Code"</li>
                  <li>3. Check your phone for the SMS</li>
                  <li>4. Enter the 6-digit code to verify</li>
                  <li>5. You'll be automatically redirected upon success</li>
                </ol>
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Note:</strong> This system uses MSG91 APIs directly through our backend for reliable verification.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OtpVerificationPage;
