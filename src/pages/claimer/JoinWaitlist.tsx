
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import config from '@/config';
import axios from 'axios';

const waitlistFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  message: z.string().optional(),
  notifyEmail: z.boolean().default(true),
  notifySms: z.boolean().default(false),
});

type WaitlistFormValues = z.infer<typeof waitlistFormSchema>;

interface Cause {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  status: string;
  sponsorships?: Array<{
    _id: string;
    status: string;
  }>;
}

const JoinWaitlistPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cause, setCause] = useState<Cause | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      message: '',
      notifyEmail: true,
      notifySms: false,
    },
  });

  // Fetch cause data
  useEffect(() => {
    const fetchCause = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.apiUrl}/causes/${id}`);
        setCause(response.data);
      } catch (err: any) {
        console.error('Error fetching cause:', err);
        setError(err.response?.data?.message || 'Failed to load cause details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCause();
    }
  }, [id]);

  const onSubmit = async (data: WaitlistFormValues) => {
    try {
      setSubmitting(true);
      
      const response = await axios.post(`${config.apiUrl}/waitlist/join`, {
        causeId: id,
        ...data
      });

      // Store data in session storage for next steps
      sessionStorage.setItem('waitlistFormData', JSON.stringify({
        ...data,
        causeId: id,
        causeTitle: cause?.title,
        position: response.data.position
      }));
      
      toast({
        title: "Successfully joined waitlist!",
        description: "You'll be notified when totes become available.",
      });

      navigate('/waitlist/confirmed');
    } catch (err: any) {
      console.error('Error joining waitlist:', err);
      toast({
        title: "Error joining waitlist",
        description: err.response?.data?.message || 'Please try again.',
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading cause details...</span>
        </div>
      </Layout>
    );
  }

  if (error || !cause) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Error</h3>
          <p className="text-gray-500 mb-6">{error || 'Cause not found'}</p>
          <Button onClick={() => navigate('/causes')}>Back to Causes</Button>
        </div>
      </Layout>
    );
  }

  // Check if cause already has approved sponsorship
  const hasApprovedSponsorship = cause.sponsorships?.some(s => s.status === 'approved') || false;
  
  if (hasApprovedSponsorship) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Cause Already Sponsored</h3>
          <p className="text-gray-500 mb-6">This cause has already been sponsored and totes are available for claiming.</p>
          <Button onClick={() => navigate(`/claim/${cause._id}?source=direct&ref=waitlist-page`)}>Claim a Tote</Button>
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
          
          <h1 className="text-3xl font-bold mb-2">Join the Waitlist</h1>
          <p className="text-lg text-gray-700 mb-6">
            Be notified when totes become available for this cause
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Waitlist Registration</h2>
                
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
                              <Input type="email" placeholder="jane.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us why you're interested in this cause..." 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

<h3 className="text-md font-medium">Notification Preferences</h3>
<div className="space-y-3">
  <FormField
    control={form.control}
    name="notifyEmail"
    render={({ field }) => (
      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
        <FormControl>
          <Checkbox 
            checked={field.value} 
            onCheckedChange={field.onChange}
          />
        </FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel>
            Email notifications
          </FormLabel>
          <FormDescription>
            Receive updates about this cause via email
          </FormDescription>
        </div>
      </FormItem>
    )}
  />
  {/* <FormField ...notifySms... /> */}
</div>

<div className="pt-6">
  <Button
    type="submit"
    size="lg"
    disabled={submitting}
    className="w-full"
  >
    {submitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Joining Waitlist...
      </>
    ) : (
      'Join Waitlist'
    )}
  </Button>
</div>

                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About This Cause</h2>
                
                <div className="space-y-4">
                  <div className="w-full h-40 rounded-md overflow-hidden mb-4">
                    <img 
                      src={cause.imageUrl} 
                      alt={cause.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg">{cause.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      {cause.description}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Target Amount:</span>
                      <span className="font-medium">₹{cause.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Amount:</span>
                      <span className="font-medium">₹{(cause.currentAmount || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded p-4 text-sm text-blue-800">
                    <p>
                      <span className="font-semibold">How the waitlist works:</span> When totes become available, we'll notify you based on your preferences. Waitlist position is determined by registration time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JoinWaitlistPage;
