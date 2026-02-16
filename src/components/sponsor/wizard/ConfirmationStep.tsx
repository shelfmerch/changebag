import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import config from '@/config';
import axios from 'axios';

interface ConfirmationStepProps {
  formData: {
    organizationName: string;
    contactName: string;
    email: string;
    phone: string;
    selectedCause: string;
    toteQuantity: number;
    unitPrice: number;
    totalAmount: number;
    logoUrl: string;
    message: string;
    distributionType?: 'online' | 'physical';
    distributionPoints?: string[];
    distributionDate?: Date;
    distributionStartDate?: Date;
    distributionEndDate?: Date;
    demographics?: {
      ageGroups: string[];
      income: string;
      education: string;
      other: string;
    };
    availableTotes?: number;
    claimedTotes?: number;
    causeTitle?: string;
  };
  causeData?: any;
  onComplete?: (paymentId?: string) => void;
}

const ConfirmationStep = ({ formData, causeData, onComplete }: ConfirmationStepProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  // Use the actual cause title from form data or fallback to a default
  const selectedCause = formData.causeTitle || causeData?.title || causeData?.name || 'Selected Cause';
  
  // Use the pricing information from the form data
  const unitPrice = formData.unitPrice || 85; // Default to ₹10 per tote if not provided
  const totalCost = formData.totalAmount || (formData.toteQuantity * unitPrice);
  
  // Shipping cost for online distribution
  const isOnlineDistribution = formData.distributionType === 'online';
  const shippingCostPerTote = 50;
  const shippingCost = isOnlineDistribution ? formData.toteQuantity * shippingCostPerTote : 0;
  const grandTotal = totalCost + shippingCost;
  
  console.log(`ConfirmationStep: UnitPrice=₹${unitPrice}, BaseTotal=₹${totalCost}, Shipping=₹${shippingCost}, GrandTotal=₹${grandTotal}, ToteQuantity=${formData.toteQuantity}`);
  
  // Generate QR code with source tracking parameters
  const qrValue = `${window.location.origin}/claim/${formData.selectedCause}?source=qr&ref=sponsor-form&sponsor=${encodeURIComponent(formData.organizationName)}`;

  // Format demographic information
  const formatDemographics = () => {
    const demo = formData.demographics;
    if (!demo) return 'Not specified';
    
    const parts = [];
    if (demo.ageGroups && demo.ageGroups.length > 0) parts.push(`Ages: ${demo.ageGroups.join(', ')}`);
    if (demo.income) parts.push(`Income: ${demo.income.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}`);
    if (demo.education) parts.push(`Education: ${demo.education.replace('-', ' ').replace(/^\w/, c => c.toUpperCase())}`);
    
    return parts.length > 0 ? parts.join(' • ') : 'Not specified';
  };

  // Initialize Razorpay
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      // Create Razorpay order
      const token = localStorage.getItem('token');
      const orderResponse = await axios.post(
        `${config.apiUrl}/payments/create-order`,
        {
          amount: Math.round(grandTotal * 100), // Convert to paise (smallest currency unit)
          currency: 'INR',
          email: formData.email,
          organizationName: formData.organizationName,
          contactName: formData.contactName,
          phone: formData.phone,
          causeTitle: selectedCause,
          causeId: formData.selectedCause || causeData?._id, // <-- ADDED BY MYSELF
          toteQuantity: formData.toteQuantity,
          unitPrice: formData.unitPrice,
          totalAmount: grandTotal,
          shippingCost,
          shippingCostPerTote,
          qrCodeUrl: qrValue // Add QR code URL to the order data
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : 'Bearer mock_token_test',
          },
        }
      );

      const { order } = orderResponse.data;
      const { id: orderId, amount, currency, key } = order;

      // Initialize Razorpay payment
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'CauseConnect',
        description: `Sponsorship for ${selectedCause} - ${formData.toteQuantity} totes`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await axios.post(
              `${config.apiUrl}/payments/confirm-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              {
                headers: {
                  'Authorization': token ? `Bearer ${token}` : 'Bearer mock_token_test',
                },
              }
            );

            setPaymentStatus('completed');
            toast({
              title: "Payment Successful!",
              description: "Your sponsorship has been confirmed.",
              variant: "default",
            });

            // Call onComplete with payment ID
            if (onComplete) {
              onComplete(response.razorpay_payment_id);
            }
          } catch (error: any) {
            console.error('Payment verification failed:', error);
            setPaymentStatus('failed');
            toast({
              title: "Payment Verification Failed",
              description: error.response?.data?.message || "Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: formData.contactName,
          email: formData.email,
          contact: formData.phone || ''
        },
        theme: {
          color: "#10b981"
        },
        modal: {
          ondismiss: function() {
            setPaymentStatus('pending');
            setIsLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      console.error('Request data sent:', {
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        email: formData.email,
        organizationName: formData.organizationName,
        contactName: formData.contactName,
        phone: formData.phone,
        causeTitle: selectedCause,
        toteQuantity: formData.toteQuantity,
        unitPrice: formData.unitPrice,
        totalAmount: grandTotal,
        shippingCost
      });
      setPaymentStatus('failed');
      setIsLoading(false);
      toast({
        title: "Payment Failed",
        description: error.response?.data?.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPaymentButtonText = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing Payment...';
      case 'completed':
        return 'Payment Completed ✓';
      case 'failed':
        return 'Retry Payment';
      default:
        return 'Complete Payment';
    }
  };

  const getPaymentButtonVariant = () => {
    switch (paymentStatus) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-2">Review Your Sponsorship</h2>
      <p className="text-gray-600 mb-6">
        Please review your sponsorship details before finalizing.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Organization Details</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Organization:</span>
                  <span className="font-medium">{formData.organizationName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Contact:</span>
                  <span className="font-medium">{formData.contactName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{formData.email}</span>
                </li>
                {formData.phone && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.phone}</span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Sponsorship Details</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Cause:</span>
                  <span className="font-medium">{selectedCause}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{formData.toteQuantity} totes</span>
                </li>
                {formData.claimedTotes !== undefined && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">Already Claimed:</span>
                    <span className="font-medium">{formData.claimedTotes} totes</span>
                  </li>
                )}
                {formData.availableTotes !== undefined && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">Available After Sponsorship:</span>
                    <span className="font-medium text-green-600">{formData.availableTotes} totes</span>
                  </li>
                )}
                <li className="flex justify-between">
                  <span className="text-gray-600">Price per tote:</span>
                  <span className="font-medium">₹{unitPrice.toFixed(2)}</span>
                </li>
                {isOnlineDistribution && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">Shipping (₹{shippingCostPerTote} x {formData.toteQuantity}):</span>
                    <span className="font-medium">₹{shippingCost.toLocaleString()}</span>
                  </li>
                )}
                <Separator className="my-2" />
                <li className="flex justify-between text-lg">
                  <span className="font-semibold">Total{isOnlineDistribution ? ' (incl. shipping)' : ''}:</span>
                  <span className="font-bold">₹{grandTotal.toLocaleString()}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Distribution Information Card - Only show for physical distribution */}
          {formData.distributionType !== 'online' && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Distribution Information</h3>
                <ul className="space-y-3">
                  {/* Distribution Date */}
                  {/* Show different date fields based on distribution type */}
                  {formData.distributionType === 'physical' ? (
                    <>
                      <li className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">
                          {formData.distributionStartDate 
                            ? format(new Date(formData.distributionStartDate), "MMMM d, yyyy") 
                            : "Not specified"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-medium">
                          {formData.distributionEndDate 
                            ? format(new Date(formData.distributionEndDate), "MMMM d, yyyy") 
                            : "Not specified"}
                        </span>
                      </li>
                    </>
                  ) : (
                    <li className="flex justify-between">
                      <span className="text-gray-600">Distribution Date:</span>
                      <span className="font-medium">
                        {formData.distributionDate 
                          ? format(new Date(formData.distributionDate), "MMMM d, yyyy") 
                          : "Not specified"}
                      </span>
                    </li>
                  )}
                  
                  {/* Distribution Points */}
                  <li>
                    <span className="text-gray-600 block">Distribution Points:</span>
                    {formData.distributionPoints && formData.distributionPoints.length > 0 ? (
                      <ul className="list-disc pl-5 mt-1">
                        {formData.distributionPoints.map((point, i) => (
                          <li key={i} className="font-medium text-sm">{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="font-medium">None specified</span>
                    )}
                  </li>
                  
                  {/* Demographics */}
                  <li>
                    <span className="text-gray-600 block">Target Demographics:</span>
                    <span className="font-medium">{formatDemographics()}</span>
                    
                    {formData.demographics?.other && (
                      <div className="mt-1 text-sm italic">
                        "{formData.demographics.other}"
                      </div>
                    )}
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Payment Section */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-xl font-bold text-green-600">₹{grandTotal.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Secure payment powered by Razorpay
                  </p>
                </div>
                
                <Button
                  onClick={handlePayment}
                  disabled={isLoading || paymentStatus === 'completed'}
                  variant={getPaymentButtonVariant()}
                  className="w-full"
                  size="lg"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {getPaymentButtonText()}
                </Button>
                
                {paymentStatus === 'completed' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Payment completed successfully!</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1 rounded-full mt-1">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Ready to Complete!</h4>
                <p className="text-sm text-green-700">
                  {paymentStatus === 'completed' 
                    ? "Your sponsorship has been confirmed and payment processed successfully."
                    : "Review your sponsorship details and complete payment to finalize."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Your QR Code</h3>
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
                  <QRCodeSVG value={qrValue} size={180} />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  This QR code will be printed on your sponsored totes.
                  <br />Users can scan it to learn more about your cause.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {formData.logoUrl && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Your Logo</h3>
                <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                  <img 
                    src={formData.logoUrl.startsWith('/uploads/') 
                      ? `${config.uploadsUrl}${formData.logoUrl.replace('/uploads', '')}` 
                      : formData.logoUrl} 
                    alt="Organization Logo" 
                    className="max-h-32 max-w-full object-contain" 
                    onError={(e) => {
                      console.error('Error loading logo image:', formData.logoUrl);
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center mt-2">
                  This logo will appear on your sponsored totes.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationStep;
