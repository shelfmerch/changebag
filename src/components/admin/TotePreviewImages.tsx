import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import config from '@/config';
import axios from 'axios';

interface TotePreviewImage {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

interface TotePreviewImagesProps {
  causeId: string;
  causeName: string;
  onImageUploaded?: (imageUrl: string) => void;
}

const TotePreviewImages: React.FC<TotePreviewImagesProps> = ({ 
  causeId, 
  causeName, 
  onImageUploaded 
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or WEBP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append('image', file);
      formData.append('causeId', causeId);

      // Update endpoint to match backend structure
      const uploadEndpoint = `${config.apiUrl}/api/v1/causes/${causeId}/preview`;
      console.log('Uploading to:', uploadEndpoint);

      const response = await axios.post(
        uploadEndpoint, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        }
      );


      if (response.data && response.data.success) {
        toast({


          title: "Image Uploaded Successfully",
          description: "The cause image has been uploaded and is now available for sponsors.",
        });


        if (onImageUploaded && response.data?.url) {
          onImageUploaded(response.data.url);
        }
      } else {
        throw new Error(response.data?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', {
        message: error.message,
        status: error.response?.status,
        endpoint: error.config?.url
      });
      
      const errorMessage = error.response?.status === 404
        ? "Upload service not available. Please contact support."
        : "Failed to upload image. Please try again.";
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Tote Preview Image for {causeName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tote-preview-upload">Upload Tote Preview Image</Label>
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="tote-preview-upload" 
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> tote preview image
                </p>
                <p className="text-xs text-gray-500">JPG, PNG, WEBP (MAX. 5MB)</p>
              </div>
              <Input
                id="tote-preview-upload"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {uploading && (
          <div className="text-center text-sm text-gray-500">
            Uploading tote preview image...
          </div>
        )}

        {previewUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preview</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={clearPreview}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <img 
                src={previewUrl} 
                alt="Tote preview" 
                className="w-full h-auto max-h-64 object-contain"
              />
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>This image will be used as the tote bag preview specifically for this cause.</p>
          <p>It will be displayed on the second tote bag in the logo upload step.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TotePreviewImages;