
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/use-toast';
import config from '@/config';
import axios from 'axios';

const MagicLinkClaimPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing token');
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${config.apiUrl}/waitlist/validate/${token}`);
        
        if (response.data.valid) {
          // Store waitlist data for the claim form
          sessionStorage.setItem('waitlistClaimData', JSON.stringify(response.data.waitlistEntry));
          
          // Redirect to claim form with special parameter
          navigate(`/claim/${response.data.waitlistEntry.causeId}?source=waitlist`);
        } else {
          setError('This link has expired or is invalid');
        }
      } catch (err: any) {
        console.error('Error validating magic link:', err);
        setError(err.response?.data?.message || 'This link has expired or is invalid');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-20">
          <Spinner className="h-8 w-8" />
          <span className="ml-2">Validating your link...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Invalid Link</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <p className="text-sm text-gray-500 mb-4">
                This could happen if:
              </p>
              <ul className="text-sm text-gray-500 text-left mb-6 space-y-1">
                <li>• The link has expired (links are valid for 48 hours)</li>
                <li>• The link has already been used</li>
                <li>• The link is invalid or corrupted</li>
              </ul>
              <button 
                onClick={() => navigate('/causes')}
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
              >
                Browse Causes
              </button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return null;
};

export default MagicLinkClaimPage;
