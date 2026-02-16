
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Register state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('sponsor');
  const [isRegLoading, setIsRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        // Redirect based on user role
        if (result.role === 'sponsor') {
          navigate('/dashboard/sponsor');
        } else if (result.role === 'claimer') {
          navigate('/dashboard/claimer');
        } else if (result.role === 'admin') {
          navigate('/dashboard/admin/');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegLoading(true);
    
    try {
      const result = await register(regEmail, name, regPassword, role as any);
      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created!",
        });
        
        // Redirect based on user role
        if (role === 'sponsor') {
          navigate('/dashboard/sponsor');
        } else if (role === 'claimer') {
          navigate('/dashboard/claimer');
        } else if (role === 'admin') {
          navigate('/dashboard/admin');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: "Registration Failed",
          description: "Please check your information and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-800 flex items-center justify-center">
            <span className="mr-2">🤲</span>
            <span>Changebag</span>
          </Link>
        </div>
        
        <Card>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardContent className="p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardContent className="p-6">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="regEmail">Email</Label>
                    <Input
                      id="regEmail"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="regPassword">Password</Label>
                    <Input
                      id="regPassword"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">I want to join as a:</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={role === 'sponsor' ? "default" : "outline"}
                        onClick={() => setRole('sponsor')}
                        className="w-full"
                      >
                        Sponsor
                      </Button>
                      <Button
                        type="button"
                        variant={role === 'claimer' ? "default" : "outline"}
                        onClick={() => setRole('claimer')}
                        className="w-full"
                      >
                        Claimer
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {role === 'sponsor' 
                        ? "As a sponsor, you can support causes with financial contributions." 
                        : "As a claimer, you can request sponsorship for your causes."}
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isRegLoading}
                    className="w-full"
                  >
                    {isRegLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="p-6 pt-0 text-center">
            <Button variant="link" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
