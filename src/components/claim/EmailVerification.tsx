import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface EmailVerificationProps {
  onVerificationComplete: (email: string) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onVerificationComplete }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async () => {
    try {
      setIsLoading(true);
      await axios.post('/api/otp/send', { email });
      setIsOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'Please check your email for the verification code.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      await axios.post('/api/otp/verify', { email, otp });
      toast({
        title: 'Success',
        description: 'Email verified successfully!',
      });
      onVerificationComplete(email);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid or expired verification code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email Address
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={isOtpSent || isLoading}
        />
      </div>

      {!isOtpSent ? (
        <Button
          onClick={handleSendOTP}
          disabled={!email || isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Send Verification Code'}
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="otp" className="block text-sm font-medium">
              Verification Code
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter verification code"
              disabled={isLoading}
              maxLength={6}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleVerifyOTP}
              disabled={!otp || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsOtpSent(false);
                setOtp('');
              }}
              disabled={isLoading}
            >
              Change Email
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailVerification; 