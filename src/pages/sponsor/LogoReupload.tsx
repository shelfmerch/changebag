import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import config from '@/config';

import authAxios from '@/utils/authAxios';


const LogoReuploadPage = () => {
  const { sponsorshipId } = useParams<{ sponsorshipId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sponsorship, setSponsorship] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch sponsorship details
  useEffect(() => {
    const fetchSponsorship = async () => {
      if (!sponsorshipId) {
        setError('Invalid sponsorship ID');
        setIsLoading(false);
        return;
      }

      try {
        const response = await authAxios.get(`/api/sponsorships/public/${sponsorshipId}`);
        setSponsorship(response.data);
      } catch (err) {
        console.error('Error fetching sponsorship:', err);
        setError('Could not find the sponsorship. The link may be invalid or expired.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSponsorship();
  }, [sponsorshipId]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, or SVG file.',
        variant: 'destructive'
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Handle logo upload
  const handleUpload = async () => {
    if (!selectedFile || !sponsorshipId) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('logo', selectedFile); // Correct field name

      const uploadResponse = await authAxios.post('/api/upload/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const logoUrl = uploadResponse.data.url;

      await authAxios.patch(`/api/sponsorships/${sponsorshipId}/reupload`, {
        logoUrl
      });

      setUploadSuccess(true);
      toast({
        title: 'Logo uploaded successfully',
        description: 'Your new logo has been submitted for review.',
        variant: 'default'
      });
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo. Please try again.');
      toast({
        title: 'Upload failed',
        description: 'There was a problem uploading your logo. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };


  // Loading state
  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Success state
  if (uploadSuccess) {
    return (
      <div className="container max-w-3xl mx-auto py-12">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Logo Uploaded Successfully!</CardTitle>
            <CardDescription>
              Your new logo has been submitted and is pending review. We'll notify you once it's approved.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Upload a New Logo</CardTitle>
          <CardDescription>
            Please upload a new logo for your sponsorship of the{' '}
            <strong>{sponsorship?.cause?.title || 'campaign'}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current logo */}
          {sponsorship?.logoUrl && (
            <div>
              <h3 className="text-sm font-medium mb-2">Current Logo (Rejected)</h3>
              <div className="bg-gray-50 border rounded-md p-4 flex justify-center">
                <img
                  src={sponsorship.logoUrl.startsWith('http')
                    ? sponsorship.logoUrl
                    : `${config.uploadsUrl}${sponsorship.logoUrl.replace('/uploads', '')}`
                  }
                  alt="Current Logo"
                  className="max-h-40 object-contain"
                />
              </div>
              {sponsorship?.rejectionReason && (
                <div className="mt-2 text-sm text-destructive">
                  <strong>Reason for rejection:</strong> {sponsorship.rejectionReason}
                </div>
              )}
            </div>
          )}

          {/* Upload new logo */}
          <div>
            <h3 className="text-sm font-medium mb-2">Upload New Logo</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
              <input
                type="file"
                id="logo-upload"
                className="hidden"
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={handleFileChange}
                disabled={isUploading}
              />

              {previewUrl ? (
                <div className="mb-4 flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Logo Preview"
                    className="max-h-40 object-contain mb-4"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    disabled={isUploading}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    SVG, PNG, or JPG (max. 5MB)
                  </p>
                  <label
                    htmlFor="logo-upload"
                    className="mt-4 cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    Select File
                  </label>
                </>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload New Logo'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LogoReuploadPage;