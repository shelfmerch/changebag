import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
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
import { Loader2, QrCode, Phone, Mail, CheckCircle } from 'lucide-react';

enum ClaimStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Regular claim form schema (with shipping address)
const regularClaimFormSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name is required')
    .regex(/^[a-zA-Z\s']+$/, 'Full name can only contain letters, spaces, and apostrophes'),
  email: z.string().email('Valid email is required'),
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  // purpose: z.string().min(2, 'Please describe how you plan to use the tote'),
  address: z.string().min(1, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{6}$/, 'PIN Code must be exactly 6 digits'),
});

// Simplified QR code claim form schema (without shipping address)
const qrClaimFormSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name is required')
    .regex(/^[a-zA-Z\s']+$/, 'Full name can only contain letters, spaces, and apostrophes'),
  email: z.string().email('Valid email is required'),
  phone: z.string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
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
  const { user } = useAuth();
  const isFromWaitlist = searchParams.get('source') === 'waitlist';
  const source = searchParams.get('source') || 'direct';
  const referrerUrl = searchParams.get('ref') || document.referrer;
  
  // Auth check
  useEffect(() => {
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, navigate]);
  
  // Detect if this is a QR code claim
  const isQrCodeClaim = source === 'qr' || document.referrer.includes('qr') || window.location.search.includes('qr');

  // Inline verification states
  const [emailStatus, setEmailStatus] = useState<'unverified' | 'sending' | 'pending' | 'verifying' | 'verified'>('unverified');
  const [phoneStatus, setPhoneStatus] = useState<'unverified' | 'sending' | 'pending' | 'verifying' | 'verified'>('unverified');
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');

  // Sync with user auth status
  useEffect(() => {
    if (user) {
      if (user.emailVerified) setEmailStatus('verified');
      if (user.phoneVerified) setPhoneStatus('verified');
    }
  }, [user]);

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
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      // purpose: '',
      address: '',
      zipCode: '',
      state: '',
      city: '',
      
    },
  });

  const qrForm = useForm<QrClaimFormValues>({
    resolver: zodResolver(qrClaimFormSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
    },
  });

  // Use the appropriate form based on claim type
  const form = (isQrCodeClaim ? qrForm : regularForm) as any;
  
  // Auto-fill user data when user is available
  useEffect(() => {
    if (user) {
      (form as any).setValue('fullName', user.name || '');
      (form as any).setValue('email', user.email || '');
      if (user.phone) {
        (form as any).setValue('phone', user.phone);
      }
    }
  }, [user, form]);
  
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
            // qrForm.setValue('purpose', data.purpose || '');
          } else {
            regularForm.setValue('fullName', data.fullName || '');
            regularForm.setValue('email', data.email || '');
            regularForm.setValue('phone', data.phone || '');
            // regularForm.setValue('purpose', data.purpose || '');
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

  // Auto-fill address based on PIN code
  const watchedZipCode = form.watch('zipCode');
  useEffect(() => {
    const fetchPinCodeData = async (pin: string) => {
      if (pin.length === 6 && /^\d+$/.test(pin)) {
        try {
          const response = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
          if (response.data && response.data[0].Status === 'Success') {
            const postOffice = response.data[0].PostOffice[0];
            form.setValue('city', postOffice.District);
            form.setValue('state', postOffice.State);
          }
        } catch (error) {
          console.error('Error fetching PIN code details:', error);
        }
      }
    };

    if (watchedZipCode && !isQrCodeClaim) {
      fetchPinCodeData(watchedZipCode);
    }
  }, [watchedZipCode, form, isQrCodeClaim]);

  // Send OTP inline
  const handleSendOtp = async (type: 'email' | 'sms') => {
    const identifier = type === 'email' ? form.getValues('email') : form.getValues('phone');
    if (!identifier) {
      toast({ title: "Error", description: `Please enter a valid ${type}.`, variant: "destructive" });
      return;
    }

    try {
      if (type === 'email') setEmailStatus('sending');
      else setPhoneStatus('sending');

      const response = await axios.post(`${config.apiUrl}/auth/request-otp`, { identifier });
      
      if (response.data.success) {
        if (type === 'email') setEmailStatus('pending');
        else setPhoneStatus('pending');
        
        toast({
          title: "OTP Sent",
          description: `Code sent to ${identifier}`,
        });
      }
    } catch (error: any) {
      if (type === 'email') setEmailStatus('unverified');
      else setPhoneStatus('unverified');
      toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" });
    }
  };

  // Verify OTP inline
  const handleVerifyOtp = async (type: 'email' | 'sms') => {
    const identifier = type === 'email' ? form.getValues('email') : form.getValues('phone');
    const otpValue = type === 'email' ? emailOtp : phoneOtp;

    if (!otpValue || otpValue.length < 4) return;

    try {
      if (type === 'email') setEmailStatus('verifying');
      else setPhoneStatus('verifying');

      // Test OTP logic for phone
      if (type === 'sms' && otpValue === '123456') {
        setPhoneStatus('verified');
        toast({ title: "Verified", description: "Phone verified successfully using test OTP!" });
        return;
      }

      const response = await axios.post(`${config.apiUrl}/auth/verify-otp`, {
        identifier,
        otp: otpValue
      });

      if (response.data.success) {
        if (type === 'email') setEmailStatus('verified');
        else setPhoneStatus('verified');
        toast({ title: "Verified", description: `${type === 'email' ? 'Email' : 'Phone'} verified successfully!` });
      }
    } catch (error: any) {
      if (type === 'email') setEmailStatus('pending');
      else setPhoneStatus('pending');
      toast({ title: "Error", description: "Invalid OTP", variant: "destructive" });
    }
  };

  // Submit claim final
  const submitClaim = async (data: any) => {
    try {
      const qrCodeScanned = source === 'qr' || document.referrer.includes('qr') || window.location.search.includes('qr');
      const claimDataToSubmit = {
        causeId: id,
        causeTitle: cause?.title,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        // purpose: data.purpose || (isQrCodeClaim ? 'QR Claim' : 'Direct Claim'),
        address: isQrCodeClaim ? 'QR Code Claim - No Shipping Required' : data.address,
        zipCode: isQrCodeClaim ? '00000' : data.zipCode,
        state: isQrCodeClaim ? 'QR' : data.state,
        city: isQrCodeClaim ? 'QR Code Claim' : data.city,
        emailVerified: true,
        phoneVerified: true,
        source: source,
        referrerUrl: referrerUrl,
        qrCodeScanned: qrCodeScanned
      };

      const response = await axios.post(`${config.apiUrl}/claims`, claimDataToSubmit);
      
      if (response.status === 201) {
        if (isQrCodeClaim) {
          const claimId = response.data._id;
          await axios.put(`${config.apiUrl}/claims/qr-verify/${claimId}`);
          navigate('/claim/qr-confirmed');
        } else {
          navigate('/claim/confirmed');
        }
      }
    } catch (error: any) {
      toast({ 
        title: "Submission Failed", 
        description: error.response?.data?.message || "Something went wrong while submitting your claim. Please try again.", 
        variant: "destructive" 
      });
    }
  };
  
  const onSubmit = async (data: any) => {
    if (!cause || !user) return;

    if (emailStatus !== 'verified' || phoneStatus !== 'verified') {
      toast({
        title: "Verification Required",
        description: "Please verify both your email and phone number before submitting.",
        variant: "destructive",
      });
      return;
    }

    await submitClaim(data);
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
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control as any}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input 
                                    placeholder="john@example.com" 
                                    {...field} 
                                    disabled={emailStatus === 'verified' || emailStatus === 'sending' || emailStatus === 'verifying'} 
                                  />
                                </FormControl>
                                {emailStatus === 'verified' ? (
                                  <div className="flex items-center text-green-600 text-sm font-medium px-2 shrink-0">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verified
                                  </div>
                                ) : (
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleSendOtp('email')}
                                    disabled={emailStatus === 'sending' || emailStatus === 'verifying' || !field.value}
                                    className="shrink-0"
                                  >
                                    {emailStatus === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : emailStatus === 'pending' ? "Resend" : "Verify"}
                                  </Button>
                                )}
                              </div>
                              {(emailStatus === 'pending' || emailStatus === 'verifying') && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-2">Enter Email Code</p>
                                  <div className="flex gap-2">
                                    <Input 
                                      placeholder="Code"
                                      value={emailOtp}
                                      onChange={(e) => setEmailOtp(e.target.value)}
                                      maxLength={6}
                                      className="h-8 text-center tracking-widest font-mono"
                                    />
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      className="h-8"
                                      onClick={() => handleVerifyOtp('email')}
                                      disabled={emailStatus === 'verifying' || emailOtp.length < 4}
                                    >
                                      {emailStatus === 'verifying' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                                    </Button>
                                  </div>
                                </div>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control as any}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <div className="flex gap-2">
                                  <div className="flex items-center bg-gray-100 px-3 border border-r-0 rounded-l-md text-gray-500 font-medium">+91</div>
                                  <FormControl>
                                    <Input 
                                      placeholder="9876543210" 
                                      {...field} 
                                      className="rounded-l-none"
                                      disabled={phoneStatus === 'verified'}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        field.onChange(value);
                                        setPhoneStatus('unverified');
                                      }}
                                    />
                                  </FormControl>
                                  {phoneStatus === 'verified' ? (
                                    <div className="flex items-center text-green-600 text-sm font-medium px-2 shrink-0">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Verified
                                    </div>
                                  ) : (
                                    <Button 
                                      type="button" 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleSendOtp('sms')}
                                      disabled={phoneStatus === 'sending' || phoneStatus === 'verifying' || field.value.length < 10}
                                      className="shrink-0"
                                    >
                                      {phoneStatus === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : phoneStatus === 'pending' ? "Resend" : "Verify"}
                                    </Button>
                                  )}
                                </div>
                                {(phoneStatus === 'pending' || phoneStatus === 'verifying') && (
                                  <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-100">
                                    <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mb-2">Enter Phone Code (Test: 123456)</p>
                                    <div className="flex gap-2">
                                      <Input 
                                        placeholder="Code"
                                        value={phoneOtp}
                                        onChange={(e) => setPhoneOtp(e.target.value)}
                                        maxLength={6}
                                        className="h-8 text-center tracking-widest font-mono"
                                      />
                                      <Button 
                                        type="button" 
                                        size="sm" 
                                        className="h-8"
                                        onClick={() => handleVerifyOtp('sms')}
                                        disabled={phoneStatus === 'verifying' || phoneOtp.length < 4}
                                      >
                                        {phoneStatus === 'verifying' ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

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
                            name="zipCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PIN Code</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="400001" 
                                    {...field} 
                                    maxLength={6}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                      field.onChange(value);
                                    }}
                                  />
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
                                  <Input placeholder="Maharashtra" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mumbai" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      )}

                      <div className="flex justify-end pt-6 border-t mt-8">
                        <Button 
                          type="submit" 
                          size="lg"
                          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
                          disabled={form.formState.isSubmitting || emailStatus !== 'verified' || phoneStatus !== 'verified'}
                        >
                          {form.formState.isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting Claim...
                            </>
                          ) : (
                            'Finalize Claim'
                          )}
                        </Button>
                      </div>
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
                  {/* <div className="bg-yellow-50 border border-yellow-100 rounded p-4 text-sm text-yellow-800">
                    <p>
                      <span className="font-semibold">Note:</span> After submission, you'll need to verify your email and phone to complete your claim.
                    </p>
                  </div> */}
                  
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
