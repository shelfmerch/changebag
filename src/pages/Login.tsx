import React, { useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '119905627719-f7slrnitrpphqv28t7lc6049schg3qm3.apps.googleusercontent.com';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestOtp, verifyOtp, completeRegistration, googleLogin: handleGoogleAuth } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || (location.state?.from?.pathname ? location.state.from.pathname + (location.state.from.search || '') : location.state?.from || null);

  // Step state: 1: Identifier, 2: OTP, 3: Name
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Determine redirection after successful login/register
  const handleRedirect = (role?: string) => {
    if (from) {
      navigate(from);
    } else if (role === 'sponsor') {
      navigate('/dashboard/sponsor');
    } else if (role === 'claimer' || role === 'user') {
      navigate('/dashboard/claimer');
    } else if (role === 'admin') {
      navigate('/dashboard/admin');
    } else {
      navigate('/');
    }
  };

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) return;

    setIsLoading(true);
    try {
      const result = await requestOtp(identifier);
      if (result.success) {
        toast({ title: "OTP Sent", description: result.message || "Please check your email or phone." });
        setStep(2);
      } else {
        toast({ title: "Failed", description: result.message || "Could not send OTP.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    try {
      const result = await verifyOtp(identifier, otp);
      if (result.success) {
        toast({ title: "Verified", description: result.message || "OTP verified successfully." });
        
        if (result.isNewUser) {
          // Move to name collection step
          setStep(3);
        } else {
          // Logged in
          handleRedirect(result.role);
        }
      } else {
        toast({ title: "Error", description: result.message || "Invalid OTP.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsLoading(true);
    try {
      const result = await completeRegistration(identifier, name);
      if (result.success) {
        toast({ title: "Welcome!", description: "Account created successfully." });
        handleRedirect(result.role);
      } else {
        toast({ title: "Error", description: result.message || "Could not create account.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      if (!credentialResponse.credential) throw new Error("Missing Google Credential");
      const result = await handleGoogleAuth(credentialResponse.credential);
      if (result.success) {
        toast({ title: "Logged In", description: "Google Authentication successful!" });
        handleRedirect(result.role);
      } else {
        toast({ title: "Error", description: result.message || "Google Authentication failed.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Network error occurred during Google sign in", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center justify-center gap-2 text-[32px] font-semibold text-[#6d8a35]">
            <span className="italic text-[#5f7d2b]">Changebag</span>
          </div>

          <div className="rounded-2xl border border-[#e8ecd9] bg-white px-5 py-6 shadow-sm">
            <div className="mb-6 grid grid-cols-2 rounded-md bg-[#f5f5f5] p-1 text-sm">
              <div className="rounded bg-white py-2 text-center font-medium text-black shadow-sm">
                Login
              </div>
              <div className="py-2 text-center text-gray-500">
                Register
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-center text-lg font-semibold text-gray-900">
                {step === 1 ? 'Login' : step === 2 ? 'Verify OTP' : 'Complete Registration'}
              </h2>
              {step === 2 && (
                <p className="mt-2 text-center text-sm text-gray-500">
                  We sent an OTP to {identifier}
                </p>
              )}
              {step === 3 && (
                <p className="mt-2 text-center text-sm text-gray-500">
                  You verified {identifier}. What should we call you?
                </p>
              )}
            </div>

            {step === 1 && (
              <form onSubmit={handleIdentifierSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-sm font-medium text-gray-800">
                    Email or mobile number
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter email or phone"
                    className="h-11 border-gray-200 bg-[#f7f9ff] shadow-none focus-visible:ring-0"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !identifier}
                  className="h-11 w-full rounded-md bg-[#12182b] text-white hover:bg-[#0e1424]"
                >
                  {isLoading ? "Sending..." : "Continue"}
                </Button>

                <div className="relative py-3">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-[0.2em]">
                    <span className="bg-white px-3 text-gray-400">or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={onGoogleSuccess}
                    onError={() => toast({ title: "Google Sign-In Failed", variant: "destructive" })}
                    useOneTap
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    text="signin_with"
                    width="100%"
                  />
                </div>

                <div className="pt-2 text-center text-xs leading-relaxed text-gray-500">
                  By continuing, you agree to Changebag's <Link to="/terms" className="text-blue-600 hover:underline">Conditions of Use</Link> and <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Notice</Link>.
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-gray-800">
                    Enter 6-digit OTP
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="h-11 border-gray-200 bg-[#f7f9ff] text-center tracking-[0.4em] shadow-none focus-visible:ring-0"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="h-11 rounded-md border-gray-200 text-gray-700"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || otp.length < 4}
                    className="h-11 rounded-md bg-[#12182b] text-white hover:bg-[#0e1424]"
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-800">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-11 border-gray-200 bg-[#f7f9ff] shadow-none focus-visible:ring-0"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !name}
                  className="h-11 w-full rounded-md bg-[#12182b] text-white hover:bg-[#0e1424]"
                >
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </form>
            )}

            <div className="mt-6 text-left">
              <Link to="/" className="text-sm text-[#12182b] hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
