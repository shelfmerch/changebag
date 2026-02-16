import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import config from '@/config';
import { Loader2, QrCode, Phone, CheckCircle } from 'lucide-react';

enum ClaimStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Regular claim form schema (with shipping address)
const regularClaimFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  purpose: z.string().min(2, 'Please describe how you plan to use the tote'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(5, 'ZIP code is required'),
});

// Simplified QR code claim form schema (without shipping address)
const qrClaimFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  purpose: z.string().min(2, 'Please describe how you plan to use the tote'),
});

type RegularClaimFormValues = z.infer<typeof regularClaimFormSchema>;
type QrClaimFormValues = z.infer<typeof qrClaimFormSchema>;

interface Sponsor {
  name: string;
  organization: string;
}

interface Cause {
  _id: string;
  title: string;
  imageUrl: string;
  sponsor?: Sponsor;
  // Add these fields to match the API response format
  sponsors?: Sponsor[];
  sponsorships?: Array<{
    _id: string;
    status: string;
    amount?: number;
  }>;
  totalTotes: number;
  claimedTotes: number;
  availableTotes: number;
  status: string;
  description?: string;
  currentAmount: number;
}

const ClaimFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromWaitlist = searchParams.get('source') === 'waitlist';
  const source = searchParams.get('source') || 'direct';
  const referrerUrl = searchParams.get('ref') || document.referrer;
  
  // Detect if this is a QR code claim
  const isQrCodeClaim = source === 'qr' || document.referrer.includes('qr') || window.location.search.includes('qr');

  // OTP verification states
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [claimData, setClaimData] = useState<any>(null);

  // Fetch cause data
  const { data: cause, isLoading, error } = useQuery<Cause>({
    queryKey: ['cause', id],
    queryFn: async () => {
      try {
        console.log(`Fetching cause data from ${config.apiUrl}/causes/${id}`);
        const response = await axios.get(`${config.apiUrl}/causes/${id}`);
        console.log('Cause data response:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching cause data:', err);
        throw err;
      }
    },
  });
  
  // Use different form schemas based on claim type
  const regularForm = useForm<RegularClaimFormValues>({
    resolver: zodResolver(regularClaimFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      purpose: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const qrForm = useForm<QrClaimFormValues>({
    resolver: zodResolver(qrClaimFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      purpose: '',
    },
  });

  // Use the appropriate form based on claim type
  const form = isQrCodeClaim ? qrForm : regularForm;
  
  // Check if user has already claimed a tote for this cause when they enter their email
  const checkExistingClaim = async (email: string) => {
    if (!email || !id) return;
    
    try {
      const response = await fetch(`${config.apiUrl}/claims/check?email=${encodeURIComponent(email)}&causeId=${id}`);
      const data = await response.json();
      
      if (data.exists) {
        toast({
          title: "Already Claimed",
          description: "You have already claimed a tote for this cause. Each user can claim only one tote per cause.",
          variant: "default",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking existing claim:', error);
      return false;
    }
  };
  
  
  // Check for waitlist data on mount
  useEffect(() => {
    if (isFromWaitlist) {
      const waitlistData = sessionStorage.getItem('waitlistClaimData');
      if (waitlistData) {
        try {
          const data = JSON.parse(waitlistData);
          if (isQrCodeClaim) {
            qrForm.setValue('fullName', data.fullName || '');
            qrForm.setValue('email', data.email || '');
            qrForm.setValue('phone', data.phone || '');
            qrForm.setValue('purpose', data.purpose || '');
          } else {
            regularForm.setValue('fullName', data.fullName || '');
            regularForm.setValue('email', data.email || '');
            regularForm.setValue('phone', data.phone || '');
            regularForm.setValue('purpose', data.purpose || '');
          }
          
          toast({
            title: "Welcome back!",
            description: "Your information has been pre-filled from your waitlist registration.",
          });
        } catch (error) {
          console.error('Error parsing waitlist data:', error);
        }
      }
    }
  }, [isFromWaitlist, isQrCodeClaim, qrForm, regularForm]);

  // Send OTP to phone number
  const sendOtp = async (phone: string) => {
    try {
      setIsSendingOtp(true);
      const response = await axios.post(`${config.apiUrl}/otp/send-phone`, { phone });
      
      if (response.status === 200) {
        setIsOtpSent(true);
        toast({
          title: "OTP Sent",
          description: "A verification code has been sent to your phone number.",
        });
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    if (!otp || !claimData) return;

    try {
      setIsVerifyingOtp(true);
      const response = await axios.post(`${config.apiUrl}/otp/verify-phone`, {
        phone: claimData.phone,
        otp: otp
      });

      if (response.status === 200) {
        // OTP verified successfully, submit the claim
        await submitClaim();
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Submit claim after OTP verification
  const submitClaim = async () => {
    if (!claimData) return;

    try {
      // First, submit the claim
      const response = await axios.post(`${config.apiUrl}/claims`, claimData);
      
      console.log('Claim submission response:', response.data);
      
      if (response.status === 201) {
        const claimId = response.data._id;
        
        // Then verify the QR code claim
        const verifyResponse = await axios.put(`${config.apiUrl}/claims/qr-verify/${claimId}`);
        
        if (verifyResponse.status === 200) {
          toast({
            title: "Claim Verified Successfully!",
            description: "Your QR code claim has been verified and is ready for collection.",
          });
          
          // Navigate to QR confirmation page
          navigate('/claim/qr-confirmed');
        } else {
          throw new Error('Failed to verify claim');
        }
      }
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "There was a problem submitting your claim. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const onSubmit = async (data: any) => {
    if (!cause) return;

    try {
      // Check for existing claim first
      const existingClaim = await checkExistingClaim(data.email);
      if (existingClaim) {
        return; // Stop here if user has already claimed
      }

      // Validate required fields for QR code claims
      if (isQrCodeClaim) {
        if (!data.fullName || !data.email || !data.phone || !data.purpose) {
          toast({
            title: "Validation Error",
            description: "Please fill in all required fields before proceeding.",
            variant: "destructive",
          });
          return;
        }
      }

      // Determine if this is a QR code claim
      const qrCodeScanned = source === 'qr' || document.referrer.includes('qr') || window.location.search.includes('qr');
      
      // Prepare the claim data to match server model
      const claimDataToSubmit = {
        causeId: id,
        causeTitle: cause.title,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        purpose: data.purpose,
        // For QR code claims, use placeholder shipping address
        address: isQrCodeClaim ? 'QR Code Claim - No Shipping Required' : data.address,
        city: isQrCodeClaim ? 'QR Code Claim' : data.city,
        state: isQrCodeClaim ? 'QR' : data.state,
        zipCode: isQrCodeClaim ? '00000' : data.zipCode,
        emailVerified: false,
        source: source,
        referrerUrl: referrerUrl,
        qrCodeScanned: qrCodeScanned
      };
      
      // Store data in session storage for verification steps
      sessionStorage.setItem('claimFormData', JSON.stringify(claimDataToSubmit));
      
      if (isQrCodeClaim) {
        // For QR code claims, show OTP verification
        setClaimData(claimDataToSubmit);
        setShowOtpVerification(true);
        // Send OTP automatically
        await sendOtp(data.phone);
      } else {
        // For regular claims, send data to server and navigate to verification
        console.log('Submitting claim data:', claimDataToSubmit);
        const response = await axios.post(`${config.apiUrl}/claims`, claimDataToSubmit);
      
      console.log('Claim submission response:', response.data);
      
      if (response.status !== 201) {
        throw new Error(response.data.message || 'Failed to submit claim');
      }
      
        // Navigate to verification page for regular claims
      navigate('/claim/verify');
      }
    } catch (error: any) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "There was a problem submitting your claim. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to safely get sponsor info
  const getSponsorInfo = (cause: Cause) => {
    if (!cause.sponsor) return 'Anonymous Sponsor';
    return cause.sponsor.organization || cause.sponsor.name || 'Anonymous Sponsor';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !cause) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Cause</h1>
          <p className="text-gray-600 mb-4">Unable to load the cause information. Please try again later.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  // Debug cause data
  console.log('Cause data in ClaimForm:', cause);
  
  // Check if cause is available for claims
  const hasSponsorship = cause.sponsor || 
                       (cause.sponsors && cause.sponsors.length > 0) || 
                       (cause.sponsorships && cause.sponsorships.length > 0);
  
  const isAvailable = (cause.status === 'approved' || cause.status === 'open') && hasSponsorship;
  
  if (!isAvailable) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Cause Not Available</h1>
          <p className="text-gray-600 mb-4">This cause is not currently available for claims.</p>
          <p className="text-sm text-gray-500 mb-4">Status: {cause.status}, Has sponsorship: {hasSponsorship ? 'Yes' : 'No'}</p>
          <Button variant="outline" onClick={() => navigate('/causes')}>View Other Causes</Button>
        </div>
      </Layout>
    );
  }

  // Get available totes from the cause data
  const availableTotes = cause.availableTotes || 0;
  if (availableTotes <= 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">No Totes Available</h1>
          <p className="text-gray-600 mb-4">All totes for this cause have been claimed.</p>
          <Button variant="outline" onClick={() => navigate(`/waitlist/${id}`)}>Join Waitlist</Button>
        </div>
      </Layout>
    );
  }

  // Show OTP verification for QR code claims
  if (showOtpVerification && isQrCodeClaim) {
    return (
      <Layout>
        <div className="bg-primary-50 py-10">
          <div className="container mx-auto px-4">
            <Button 
              variant="ghost" 
              onClick={() => setShowOtpVerification(false)} 
              className="mb-4"
            >
              &larr; Back to Form
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Phone Verification</h1>
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <QrCode className="h-4 w-4" />
                QR Code Claim
              </div>
            </div>
            
            <p className="text-lg text-gray-700 mb-6">
              Please verify your phone number to complete your QR code claim
            </p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="bg-blue-100 p-4 rounded-full">
                      <Phone className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Verify Your Phone Number</h2>
                    <p className="text-gray-600">
                      We've sent a verification code to <span className="font-medium">{claimData?.phone}</span>
                    </p>
                  </div>

                  {isOtpSent ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                          Enter Verification Code
                        </label>
                        <Input
                          id="otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button
                          onClick={verifyOtp}
                          disabled={!otp || otp.length !== 6 || isVerifyingOtp}
                          className="flex-1"
                          size="lg"
                        >
                          {isVerifyingOtp ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verify & Submit Claim
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="text-center">
                        <Button
                          variant="ghost"
                          onClick={() => sendOtp(claimData?.phone)}
                          disabled={isSendingOtp}
                          className="text-sm"
                        >
                          {isSendingOtp ? 'Sending...' : 'Resend Code'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Click the button below to send a verification code to your phone.
                      </p>
                      
                      <Button
                        onClick={() => sendOtp(claimData?.phone)}
                        disabled={isSendingOtp}
                        size="lg"
                        className="w-full"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            <Phone className="h-4 w-4 mr-2" />
                            Send Verification Code
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }
  
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
          
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              {isQrCodeClaim ? 'Quick Claim via QR Code' : 'Claim Your Totes'}
            </h1>
            {isQrCodeClaim && (
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <QrCode className="h-4 w-4" />
                QR Code Claim
              </div>
            )}
              </div>
          
          <p className="text-lg text-gray-700 mb-6">
            {isQrCodeClaim 
              ? `Complete this quick form to claim your tote for ${cause.title}`
              : `Complete the form below to claim totes for ${cause.title}`
            }
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {isQrCodeClaim ? 'Quick Claim Information' : 'Personal & Shipping Information'}
                </h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="jane.doe@example.com" 
                                {...field} 
                                onBlur={async (e) => {
                                  field.onBlur();
                                  if (e.target.value) {
                                    await checkExistingClaim(e.target.value);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              You can only claim one tote per cause with the same email address.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="purpose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Purpose</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="How will you use this tote?" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Briefly describe how you plan to use the tote
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Only show shipping address for regular claims */}
                    {!isQrCodeClaim && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Shipping Address</h3>
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Anytown" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input placeholder="CA" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ZIP Code</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    )}
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        size="lg"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          isQrCodeClaim ? 'Continue to Phone Verification' : 'Continue to Verification'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Cause Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden">
                      <img 
                        src={cause.imageUrl.startsWith('http') ? cause.imageUrl : `${config.uploadsUrl}${cause.imageUrl.replace('/uploads', '')}`} 
                        alt={cause.title} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{cause.title}</h3>
                      <p className="text-sm text-gray-600">
                        Sponsored by {getSponsorInfo(cause)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-600">Total Totes:</span>
                          <span className="font-medium">{cause.totalTotes}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700 font-medium">Available Totes:</span>
                          <span className="font-bold text-green-600">{availableTotes}</span>
                        </div>
                      </div>
                      
                      {/* Tote availability progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${Math.max(0, Math.min(100, (availableTotes / cause.totalTotes) * 100))}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {availableTotes === 0 
                          ? "All totes have been claimed. Join the waitlist!"
                          : availableTotes === 1
                          ? "Only 1 tote left! Claim it now."
                          : availableTotes < 10
                          ? `Only ${availableTotes} totes left! Claim yours soon.`
                          : `${availableTotes} totes available for this cause.`
                        }
                      </p>
                    </div>
                    
                    {!isQrCodeClaim && (
                    <div className="flex justify-between font-medium mt-4">
                      <span>Shipping:</span>
                      <span>₹ 100</span>
                    </div>
                    )}
                  </div>
                  
                  {isQrCodeClaim ? (
                    <div className="bg-green-50 border border-green-100 rounded p-4 text-sm text-green-800">
                      <p>
                        <span className="font-semibold">QR Code Claim:</span> After phone verification, your claim will be automatically verified and you can collect your tote immediately.
                      </p>
                    </div>
                  ) : (
                    <>
                  <div className="bg-yellow-50 border border-yellow-100 rounded p-4 text-sm text-yellow-800">
                    <p>
                      <span className="font-semibold">Note:</span> After submission, you'll need to verify your email and phone to complete your claim.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded p-4 mt-4 text-sm text-blue-800">
                    <p>
                      <span className="font-semibold">Claim Process:</span> Your claim will be reviewed by an admin. The available totes count will only update after your claim is approved.
                    </p>
                  </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClaimFormPage;
