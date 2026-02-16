import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

import { Upload, X, Image as ImageIcon, ArrowLeft, Link, CheckCircle } from 'lucide-react';
import config from '@/config';

const CauseImageUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [causeTitle, setCauseTitle] = useState('');
  const [originalFileType, setOriginalFileType] = useState<string>('');
  const [hasTransparency, setHasTransparency] = useState(false);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Mock fetch cause details
    setCauseTitle('Clean Water Initiative');
  }, [id]);

  // Redraw canvas when preview changes
  useEffect(() => {
    if (preview) {
      drawPreviewCanvas();
    }
  }, [preview]);

  // Function to detect transparency in PNG images
  const detectTransparency = (image: HTMLImageElement): Promise<boolean> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(false);
        return;
      }

      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Check if any pixel has alpha < 255 (transparency)
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          resolve(true);
          return;
        }
      }
      resolve(false);
    });
  };

  const validateImageFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PNG or JPEG image",
          variant: "destructive"
        });
        resolve(false);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image must be smaller than 5MB",
          variant: "destructive"
        });
        resolve(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width < 1000 || img.height < 1000) {
          toast({
            title: "Image Too Small",
            description: "Image must be at least 1000x1000 pixels",
            variant: "destructive"
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      if (!url.match(/^https?:\/\/.+/)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid HTTP/HTTPS URL",
          variant: "destructive"
        });
        return false;
      }

      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        toast({
          title: "URL Not Accessible",
          description: "Could not access the image at this URL",
          variant: "destructive"
        });
        return false;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.match(/^image\/(png|jpeg|jpg)/)) {
        toast({
          title: "Invalid Image Type",
          description: "URL must point to a PNG or JPEG image",
          variant: "destructive"
        });
        return false;
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
        toast({
          title: "Image Too Large",
          description: "Image must be smaller than 5MB",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Could not validate the image URL",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = await validateImageFile(file);
    if (isValid) {
      // Track original file type
      setOriginalFileType(file.type);
      
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      previewImageRef.current = new Image();
      previewImageRef.current.src = objectUrl;
      previewImageRef.current.onload = async () => {
        // Detect transparency for PNG files
        if (file.type === 'image/png') {
          const transparency = await detectTransparency(previewImageRef.current!);
          setHasTransparency(transparency);
        } else {
          setHasTransparency(false);
        }
        drawPreviewCanvas();
      };
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) return;

    const isValid = await validateImageUrl(imageUrl);
    if (isValid) {
      setPreview(imageUrl);
      previewImageRef.current = new Image();
      previewImageRef.current.src = imageUrl;
      previewImageRef.current.onload = async () => {
        // Try to detect file type from URL extension
        const urlLower = imageUrl.toLowerCase();
        if (urlLower.endsWith('.png')) {
          setOriginalFileType('image/png');
          const transparency = await detectTransparency(previewImageRef.current!);
          setHasTransparency(transparency);
        } else if (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg')) {
          setOriginalFileType('image/jpeg');
          setHasTransparency(false);
        } else {
          // Default to JPEG if we can't determine
          setOriginalFileType('image/jpeg');
          setHasTransparency(false);
        }
        drawPreviewCanvas();
      };
    }
  };

  const handleUpload = async () => {
    if (!preview) {
      toast({
        title: "Preview Error",
        description: "Failed to load image preview",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();

      // Determine output format based on transparency detection
      // Use PNG format for transparent images to preserve transparency
      const usePNG = hasTransparency && originalFileType === 'image/png';
      const outputFormat = usePNG ? 'image/png' : 'image/jpeg';
      const filename = usePNG ? 'image.png' : 'image.jpg';
      const quality = usePNG ? 1.0 : 0.95; // PNG doesn't use quality parameter, but we set it for consistency

      // Handle file upload vs URL
      if (preview.startsWith('data:') || preview.startsWith('blob:')) {
        // For file uploads, convert canvas to blob
        const canvas = previewCanvasRef.current;
        if (!canvas) throw new Error('Canvas not found');
        
        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error('Failed to create blob from image');
          
          formData.append('image', blob, filename);
          await uploadToServer(formData);
        }, outputFormat, quality);
      } else {
        // For URLs, fetch the image first and then upload as blob
        const response = await fetch(preview);
        const blob = await response.blob();
        formData.append('image', blob, filename);
        await uploadToServer(formData);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadToServer = async (formData: FormData) => {
    const response = await fetch(`${config.apiUrl}/causes/${id}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        // Remove Content-Type header to let browser set it with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success || data.adminImageUrl) {
      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
      navigate('/admin/causes');
    } else {
      throw new Error('Invalid response from server');
    }
  };

  // Update the drawPreviewCanvas function
  const drawPreviewCanvas = () => {
    const canvas = previewCanvasRef.current;
    const img = previewImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size while maintaining aspect ratio
    const maxWidth = 400;
    const maxHeight = 400;
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Draw the uploaded image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  // Add previewImageRef onError handler
  useEffect(() => {
    if (previewImageRef.current) {
      previewImageRef.current.onerror = () => {
        console.error('Error loading preview image');
        toast({
          title: "Error",
          description: "Failed to load image preview",
          variant: "destructive"
        });
        setPreview(null);
      };
    }
  }, [preview]);

  return (
    <AdminLayout title="Upload Cause Image" loading={false}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/causes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Causes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload Image for: {causeTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={uploadMethod === 'url' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('url')}
                className="h-12"
              >
                <Link className="h-4 w-4 mr-2" />
                Upload from URL
              </Button>
              <Button
                variant={uploadMethod === 'file' ? 'default' : 'outline'}
                onClick={() => setUploadMethod('file')}
                className="h-12"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>

            {uploadMethod === 'url' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button onClick={handleUrlSubmit} disabled={!imageUrl.trim()}>
                      Load
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {uploadMethod === 'file' && (
              <div>
                <Label htmlFor="fileUpload">Choose Image File</Label>
                <Input
                  id="fileUpload"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
            )}

            <Alert>
              <AlertDescription>
                Images must be PNG or JPEG format, minimum 1000×1000 pixels.
                High-resolution images work best for tote bag printing.
              </AlertDescription>
            </Alert>

            {preview && (
              <div className="space-y-4">
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <canvas
                      ref={previewCanvasRef}
                      className="max-w-full h-auto mx-auto"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full"
                  size="lg"
                >
                  {uploading ? (
                    'Uploading...'
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CauseImageUpload;