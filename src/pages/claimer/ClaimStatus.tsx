
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Clock } from 'lucide-react';

interface ClaimStatus {
  id: string;
  label: string;
  date: string;
  description: string;
  completed: boolean;
  current: boolean;
}

const ClaimStatusPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  
  // Mock claim details - in production, would be fetched from API
  const claimInfo = {
    id: id || 'CL-12345',
    cause: 'Clean Water Initiative',
    organization: 'EcoSolutions Inc.',
    totes: 250,
    estimatedDelivery: 'June 25, 2025',
    trackingNumber: 'TRK927451937',
    currentStatus: 'Processing',
  };
  
  // Mock status timeline
  const statusTimeline: ClaimStatus[] = [
    {
      id: '1',
      label: 'Claim Submitted',
      date: 'June 10, 2025',
      description: 'Your claim has been received and is being processed.',
      completed: true,
      current: false,
    },
    {
      id: '2',
      label: 'Processing',
      date: 'June 12, 2025',
      description: 'Your claim is being prepared for shipment.',
      completed: true,
      current: true,
    },
    {
      id: '3',
      label: 'Shipped',
      date: 'Estimated June 18, 2025',
      description: 'Your totes will be shipped to the provided address.',
      completed: false,
      current: false,
    },
    {
      id: '4',
      label: 'Delivered',
      date: 'Estimated June 25, 2025',
      description: 'Your totes will be delivered to your doorstep.',
      completed: false,
      current: false,
    },
  ];
  
  useEffect(() => {
    // Retrieve form data if available
    const storedData = sessionStorage.getItem('claimFormData');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, []);
  
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
          
          <h1 className="text-3xl font-bold mb-2">Track Your Claim</h1>
          <p className="text-lg text-gray-700 mb-6">
            Monitor the status of your tote claim
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-6">Claim Status</h2>
                
                <div className="relative">
                  {statusTimeline.map((status, index) => (
                    <div key={status.id} className="relative pb-8">
                      {/* Connecting line */}
                      {index < statusTimeline.length - 1 && (
                        <div className={`absolute left-4 top-8 h-full w-0.5 ${
                          status.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                      
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          status.completed ? 'bg-green-500' : status.current ? 'bg-blue-500' : 'bg-gray-200'
                        }`}>
                          {status.completed ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className={`font-medium ${status.current ? 'text-blue-600' : ''}`}>
                              {status.label}
                            </h3>
                            {status.current && (
                              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            {status.date}
                          </p>
                          <p className="text-sm mt-1">
                            {status.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Claim Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Claim ID</p>
                    <p className="font-medium">{claimInfo.id}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Cause</p>
                    <p className="font-medium">{formData?.causeTitle || claimInfo.cause}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Sponsor</p>
                    <p className="font-medium">{claimInfo.organization}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Totes Available</p>
                    <p className="font-medium">{claimInfo.totes}</p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">Shipping Address</p>
                    <p className="font-medium">
                      {formData ? (
                        <>
                          {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                        </>
                      ) : (
                        'Contact support for address details'
                      )}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-medium">{claimInfo.estimatedDelivery}</p>
                  </div>
                  
                  {claimInfo.trackingNumber && statusTimeline[2].completed && (
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-medium">{claimInfo.trackingNumber}</p>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/dashboard/claimer')}
                    >
                      View All Claims
                    </Button>
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

export default ClaimStatusPage;
