
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock, Mail, Bell } from 'lucide-react';

const WaitlistConfirmationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  const [waitlistPosition, setWaitlistPosition] = useState<number>(0);
  
  useEffect(() => {
    // Retrieve form data
    const storedData = sessionStorage.getItem('waitlistFormData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setFormData(data);
      setWaitlistPosition(data.position || 0);
    } else {
      // If user navigated here directly without completing the process
      navigate('/causes');
    }
  }, [navigate]);
  
  return (
    <Layout>
      <div className="bg-primary-50 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <Check className="h-8 w-8 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">You're on the Waitlist!</h1>
          <p className="text-lg text-gray-700">
            We'll notify you when totes become available for {formData?.causeTitle || 'this cause'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Waitlist Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Cause</p>
                <p className="font-medium">{formData?.causeTitle || 'Selected Cause'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Position</p>
                <p className="font-medium">#{waitlistPosition} in line</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{formData?.fullName || 'N/A'}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">Notification Preferences</p>
              <div className="flex space-x-4 mt-1">
                {formData?.notifyEmail && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>Email</span>
                  </div>
                )}
                {formData?.notifySms && (
                  <div className="flex items-center text-sm">
                    <Bell className="h-4 w-4 mr-1" />
                    <span>SMS</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <Clock className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-sm">
                <span className="font-medium">Estimated Wait Time:</span> 2-4 weeks
              </p>
            </div>
          </CardContent>
        </Card>

<div className="grid grid-cols-1 gap-4">
  <Card>
    <CardContent className="p-6">
      <h3 className="font-medium text-lg mb-2">What's Next?</h3>
      <p className="text-sm text-gray-600 mb-4">
        When totes become available for this cause, you'll receive a special link via email that will allow you to quickly claim your totes with your information pre-filled.
      </p>
      <div className="flex items-start space-x-3 mb-4 p-3 bg-blue-50 rounded-md">
        <Bell className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          <span className="font-medium">Important:</span> Be sure to check your inbox (and spam folder) for an email from <span className="font-medium">notifications@changebag.org</span> when the cause becomes sponsored.
        </p>
      </div>
      <Button 
        variant="outline"
        className="w-full"
        onClick={() => navigate('/dashboard/claimer')}
      >
        Manage Your Waitlists
      </Button>
    </CardContent>
  </Card>
  
  <Card>
    <CardContent className="p-6">
      <h3 className="font-medium text-lg mb-2">Similar Causes</h3>
      <p className="text-sm text-gray-600 mb-4">
        While you wait, consider checking out these similar causes that have totes available now.
      </p>
      <Button 
        className="w-full"
        onClick={() => navigate('/causes')}
      >
        Explore More Causes
      </Button>
    </CardContent>
  </Card>
</div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            Questions about the waitlist?
          </p>
          <p className="text-gray-800">
            Contact us at <span className="font-medium">waitlist@changebag.org</span>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default WaitlistConfirmationPage;
