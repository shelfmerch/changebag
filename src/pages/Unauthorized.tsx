import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Shield } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-full bg-red-100 mb-4">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="mt-2 text-2xl font-bold text-center text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-center text-gray-600">
            You don't have permission to access this page. This area is restricted to authorized users only.
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button 
            onClick={() => navigate('/')}
            className="w-full"
          >
            Go to Home
          </Button>
          
          <Button 
            onClick={() => navigate('/login')}
            variant="outline"
            className="w-full"
          >
            Log in with a different account
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
