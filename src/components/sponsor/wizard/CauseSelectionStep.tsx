import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface CauseSelectionStepProps {
  formData: {
    organizationName: string;
    contactName: string;
    email: string;
    phone: string;
    selectedCause: string;
  };
  updateFormData: (data: Partial<{
    organizationName: string;
    contactName: string;
    email: string;
    phone: string;
    selectedCause: string;
  }>) => void;
  causeData?: any;
  validationError: string | null;
  emailStatus: 'unverified' | 'verified';
  phoneStatus: 'unverified' | 'verified';
  setEmailStatus: (status: 'unverified' | 'verified') => void;
  setPhoneStatus: (status: 'unverified' | 'verified') => void;
}

const CauseSelectionStep = ({ 
  formData, 
  updateFormData, 
  causeData, 
  validationError,
  emailStatus,
  phoneStatus,
  setEmailStatus,
  setPhoneStatus
}: CauseSelectionStepProps) => {
  const { requestOtp, verifyOtp } = useAuth();
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isSendingPhone, setIsSendingPhone] = useState(false);
  const [showEmailOtp, setShowEmailOtp] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      updateFormData({ [name]: cleaned });
      setPhoneStatus('unverified');
      setShowPhoneOtp(false);
      return;
    }

    if (name === 'email') {
      updateFormData({ [name]: value });
      setEmailStatus('unverified');
      setShowEmailOtp(false);
      return;
    }

    updateFormData({ [name]: value });
  };

  const handleSendOtp = async (type: 'email' | 'sms') => {
    const identifier = type === 'email' ? formData.email : formData.phone;
    if (!identifier) {
      toast({ title: "Error", description: `Please enter a valid ${type}.`, variant: "destructive" });
      return;
    }

    try {
      if (type === 'email') setIsSendingEmail(true);
      else setIsSendingPhone(true);

      const result = await requestOtp(identifier);
      if (result.success) {
        if (type === 'email') setShowEmailOtp(true);
        else setShowPhoneOtp(true);

        toast({ title: "OTP Sent", description: result.message || `Code sent to ${identifier}` });
      } else {
        toast({ title: "Error", description: result.message || "Failed to send OTP", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" });
    } finally {
      if (type === 'email') setIsSendingEmail(false);
      else setIsSendingPhone(false);
    }
  };

  const handleVerifyOtp = async (type: 'email' | 'sms') => {
    const identifier = type === 'email' ? formData.email : formData.phone;
    const otpValue = type === 'email' ? emailOtp : phoneOtp;

    if (!otpValue || otpValue.length < 4) return;

    try {
      const result = await verifyOtp(identifier, otpValue);
      if (result.success) {
        if (type === 'email') {
          setEmailStatus('verified');
          setShowEmailOtp(false);
        } else {
          setPhoneStatus('verified');
          setShowPhoneOtp(false);
        }
        toast({ title: "Verified", description: result.message || `${type === 'email' ? 'Email' : 'Phone'} verified successfully!` });
      } else {
        toast({ title: "Error", description: result.message || "Invalid OTP", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: "Invalid OTP", variant: "destructive" });
    }
  };

  // Validation regex for contact name
  const nameRegex = /^[a-zA-Z\s']+$/;
  const isNameInvalid = formData.contactName && !nameRegex.test(formData.contactName);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Organization Details</h2>
      
      {validationError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {validationError}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="organizationName">Organization Name</Label>
          <Input
            id="organizationName"
            name="organizationName"
            placeholder="Shelf Merch"
            value={formData.organizationName}
            onChange={handleInputChange}
            required
            className={validationError && !formData.organizationName ? "border-red-500" : ""}
          />
          {validationError && !formData.organizationName && (
            <p className="text-red-500 text-sm mt-1">Organization name is required</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            name="contactName"
            placeholder="Jane Doe"
            value={formData.contactName}
            onChange={handleInputChange}
            required
            className={(validationError && !formData.contactName) || isNameInvalid ? "border-red-500" : ""}
          />
          {isNameInvalid && (
            <p className="text-red-500 text-sm mt-1">Only letters, spaces, and apostrophes allowed</p>
          )}
          {validationError && !formData.contactName && !isNameInvalid && (
            <p className="text-red-500 text-sm mt-1">Contact name is required</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="flex gap-2">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={showEmailOtp}
              className={validationError && !formData.email ? "border-red-500" : ""}
            />
            {emailStatus === 'verified' ? (
              <div className="flex items-center text-green-600 text-sm font-medium px-2 shrink-0">
                <CheckCircle className="h-4 w-4 mr-1" />
                Verified
              </div>
            ) : !showEmailOtp ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSendOtp('email')}
                disabled={isSendingEmail || !formData.email}
                className="shrink-0"
              >
                {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </Button>
            ) : null}
          </div>
          {showEmailOtp && (
            <div className="mt-2 flex flex-col gap-2 p-3 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Enter Email OTP</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Code"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value)}
                  maxLength={6}
                  className="h-9 text-center tracking-widest"
                />
                <Button 
                  type="button" 
                  size="sm"
                  onClick={() => handleVerifyOtp('email')}
                  disabled={emailOtp.length < 4}
                >
                  Confirm
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowEmailOtp(false)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
          {validationError && !formData.email && (
            <p className="text-red-500 text-sm mt-1">Email is required</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="flex gap-2">
            <div className="flex items-center bg-gray-100 px-3 border border-r-0 rounded-l-md text-gray-500 font-medium">
              +91
            </div>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="9876543210"
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={showPhoneOtp}
              className={`rounded-l-none ${validationError && !formData.phone ? "border-red-500" : ""}`}
            />
            {phoneStatus === 'verified' ? (
              <div className="flex items-center text-green-600 text-sm font-medium px-2 shrink-0">
                <CheckCircle className="h-4 w-4 mr-1" />
                Verified
              </div>
            ) : !showPhoneOtp ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleSendOtp('sms')}
                disabled={isSendingPhone || formData.phone.length < 10}
                className="shrink-0"
              >
                {isSendingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </Button>
            ) : null}
          </div>
          {showPhoneOtp && (
            <div className="mt-2 flex flex-col gap-2 p-3 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">Enter Phone OTP</p>
              <div className="flex gap-2">
                <Input
                  placeholder="123456"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  maxLength={6}
                  className="h-9 text-center tracking-widest"
                />
                <Button 
                  type="button" 
                  size="sm"
                  onClick={() => handleVerifyOtp('sms')}
                  disabled={phoneOtp.length < 4}
                >
                  Confirm
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowPhoneOtp(false)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
          {validationError && !formData.phone && (
            <p className="text-red-500 text-sm mt-1">Phone number is required</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CauseSelectionStep;
