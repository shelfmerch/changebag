import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, ZoomIn, ZoomOut, RotateCw, RotateCcw, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import config from '@/config';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  DEFAULT_CANVAS_SIZE,
  DEFAULT_LOGO_POSITION,
  type LogoPosition,
} from '@/utils/canvasUtils';

/** Center of the printable tote area (bag body), not the full 400×400 canvas — matches canvasUtils defaults. */
const RESET_LOGO_POSITION: LogoPosition = {
  ...DEFAULT_LOGO_POSITION,
  scale: 0.25,
};

const MIN_LOGO_SCALE = 0.05;
const MAX_LOGO_SCALE = 2.5;
const ZOOM_STEP = 1.08;

const CANVAS_W = DEFAULT_CANVAS_SIZE.width;
const CANVAS_H = DEFAULT_CANVAS_SIZE.height;

/** Map pointer coordinates from CSS pixels to canvas backing-store pixels. */
function clientToCanvas(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * sx,
    y: (clientY - rect.top) * sy,
  };
}

interface LogoUploadStepProps {
  formData: {
    logoUrl: string;
    message: string;
    selectedCause?: string;
    causeImageUrl?: string;
    logoPosition?: LogoPosition;
    causeImagePosition?: {
      x: number;
      y: number;
      scale: number;
      angle: number;
    };
  };
  updateFormData: (data: Partial<{
    logoUrl: string;
    message: string;
    logoPosition?: LogoPosition;
    causeImagePosition?: {
      x: number;
      y: number;
      scale: number;
      angle: number;
    };
  }>) => void;
  validationError: string | null;
}

const LogoUploadStep = ({ formData, updateFormData, validationError }: LogoUploadStepProps) => {
  const { toast } = useToast();
  // Fetch selected cause if available
  const { data: selectedCauseData } = useQuery({
    queryKey: ['cause', formData.selectedCause],
    queryFn: async () => {
      if (!formData.selectedCause) return null;
      const response = await fetch(`${config.apiUrl}/causes/${formData.selectedCause}`);
      if (!response.ok) throw new Error('Failed to fetch cause');
      return response.json();
    },
    enabled: !!formData.selectedCause,
  });

  // State for user logo upload section
  const [userLogoPreview, setUserLogoPreview] = useState<string>(formData.logoUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Canvas refs for dual preview system
  const userLogoCanvasRef = useRef<HTMLCanvasElement>(null);
  const adminLogoCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Image refs
  const userLogoRef = useRef<HTMLImageElement>(null);
  const adminLogoRef = useRef<HTMLImageElement>(null);
  
  // User logo manipulation state
  const [isDragging, setIsDragging] = useState(false);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>(
    () => formData.logoPosition ?? { ...DEFAULT_LOGO_POSITION, scale: 0.25 }
  );

  const dragRef = useRef<LogoPosition>(logoPosition);
  const isDraggingRef = useRef(false);
  /** Pointer-to-logo-center offset at drag start (canvas space). */
  const dragPointerOffsetRef = useRef({ x: 0, y: 0 });

  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    dragRef.current = logoPosition;
  }, [logoPosition]);
  
  // Admin logo state
  const [adminLogoLoaded, setAdminLogoLoaded] = useState(false);

  // Add new state for admin canvas
  const [adminCanvasSize] = useState({ width: 400, height: 400 });
  const [isAdminImageLoading, setIsAdminImageLoading] = useState(true);

  // Debug logging for admin image
  useEffect(() => {
    console.log('=== Admin Logo Debug ===');
    console.log('Selected Cause ID:', formData.selectedCause);
    console.log('Selected Cause Data:', selectedCauseData);
    console.log('Admin Image URL:', selectedCauseData?.adminImageUrl);
    console.log('========================');
  }, [formData.selectedCause, selectedCauseData]);

  // Show validation errors as toast instead of a large banner
  useEffect(() => {
    if (validationError) {
      toast({
        title: 'Validation error',
        description: validationError,
        variant: 'destructive',
      });
    }
  }, [validationError, toast]);

  // Get the effective admin image URL
  const effectiveAdminImageUrl = selectedCauseData?.adminImageUrl;

  const drawLogo = useCallback((ctx: CanvasRenderingContext2D, logo: HTMLImageElement, pos: LogoPosition) => {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate((pos.angle * Math.PI) / 180);
    ctx.scale(pos.scale, pos.scale);
    const width = logo.width;
    const height = logo.height;
    ctx.drawImage(logo, -width / 2, -height / 2, width, height);
    ctx.restore();
  }, []);

  const drawCurrentState = useCallback(() => {
    const canvas = userLogoCanvasRef.current;
    if (!canvas || !backgroundCanvasRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundCanvasRef.current, 0, 0);

    if (userLogoPreview && userLogoRef.current) {
      drawLogo(ctx, userLogoRef.current, logoPosition);
    }
  }, [userLogoPreview, logoPosition, drawLogo]);

  const redrawUserCanvasWithDrag = useCallback(() => {
    const canvas = userLogoCanvasRef.current;
    if (!canvas || !backgroundCanvasRef.current || !userLogoRef.current || !userLogoPreview) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundCanvasRef.current, 0, 0);
    drawLogo(ctx, userLogoRef.current, dragRef.current);
  }, [userLogoPreview, drawLogo]);

  const scheduleDragRedraw = useCallback(() => {
    if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = undefined;
      redrawUserCanvasWithDrag();
    });
  }, [redrawUserCanvasWithDrag]);

  const handleUserLogoPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!userLogoPreview || !userLogoRef.current) return;

    const canvas = userLogoCanvasRef.current;
    if (!canvas) return;

    const { x, y } = clientToCanvas(e.clientX, e.clientY, canvas);
    const logoPos = logoPosition;
    const logoW = userLogoRef.current.width * logoPos.scale;
    const logoH = userLogoRef.current.height * logoPos.scale;

    if (
      x >= logoPos.x - logoW / 2 &&
      x <= logoPos.x + logoW / 2 &&
      y >= logoPos.y - logoH / 2 &&
      y <= logoPos.y + logoH / 2
    ) {
      dragPointerOffsetRef.current = { x: x - logoPos.x, y: y - logoPos.y };
      dragRef.current = { ...logoPos };
      isDraggingRef.current = true;
      setIsDragging(true);
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handleUserLogoPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !userLogoCanvasRef.current) return;

    const canvas = userLogoCanvasRef.current;
    const { x, y } = clientToCanvas(e.clientX, e.clientY, canvas);
    const off = dragPointerOffsetRef.current;
    dragRef.current = {
      ...dragRef.current,
      x: x - off.x,
      y: y - off.y,
    };
    scheduleDragRedraw();
  };

  const handleUserLogoPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const canvas = userLogoCanvasRef.current;
    if (canvas?.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    isDraggingRef.current = false;
    setIsDragging(false);
    if (rafRef.current !== undefined) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
    const finalPosition = dragRef.current;
    setLogoPosition(finalPosition);
    updateFormData({ logoPosition: finalPosition });
  };

  // Function to draw admin image on canvas
  const drawAdminImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvasWidth: number, canvasHeight: number) => {
    // Calculate scale to fit image within canvas while preserving aspect ratio
    // Reduced from 0.8 to 0.5 for smaller size
    const scale = Math.min(
      canvasWidth / img.width,
      canvasHeight / img.height
    ) * 0.5; // 50% of canvas size instead of 80%

    // Calculate centered position
    const x = (canvasWidth - img.width * scale) / 2;
    const y = (canvasHeight - img.height * scale) / 2;

    // Draw the admin image
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  // Store the background canvas state
  const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial canvas setup and background drawing
  useEffect(() => {
    const canvas = userLogoCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // Create background canvas if it doesn't exist
    if (!backgroundCanvasRef.current) {
      backgroundCanvasRef.current = document.createElement('canvas');
      backgroundCanvasRef.current.width = canvas.width;
      backgroundCanvasRef.current.height = canvas.height;
    }

    // Draw background (tote bag and admin image) only when these dependencies change
    const bgCtx = backgroundCanvasRef.current.getContext('2d');
    if (!bgCtx) return;

    // Clear background canvas
    bgCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tote bag image
    const toteBag = new Image();
    toteBag.src = '/totebag.png';

    toteBag.onload = () => {
      // Draw tote bag centered on background canvas
      const scale = Math.min(canvas.width / toteBag.width, canvas.height / toteBag.height) * 0.9;
      const x = (canvas.width - toteBag.width * scale) / 2;
      const y = (canvas.height - toteBag.height * scale) / 2;
      bgCtx.drawImage(toteBag, x, y, toteBag.width * scale, toteBag.height * scale);

      // Draw admin image if available
      if (selectedCauseData?.adminImageUrl && adminLogoRef.current) {
        drawAdminImage(bgCtx, adminLogoRef.current, canvas.width, canvas.height);
      }

      // Initial draw of the complete canvas
      drawCurrentState();
    };

    toteBag.onerror = (error) => {
      console.error('Error loading totebag image:', error);
    };
  }, [selectedCauseData?.adminImageUrl]); // Only redraw background when admin image changes

  // Update canvas when logo position changes
  useEffect(() => {
    drawCurrentState();
  }, [drawCurrentState, logoPosition]);

  // Function to get correct image URL
  const getFullImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    
    // If it's already a full URL (http/https), return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a server-side uploads path
    if (imageUrl.startsWith('/uploads/')) {
      return `${config.uploadsUrl}${imageUrl.replace('/uploads', '')}`;
    }

    // If it's an absolute path to the uploads directory
    if (imageUrl.includes('/uploads/') || imageUrl.includes('\\uploads\\')) {
      // Extract just the filename from the path
      const filename = imageUrl.split(/[\/\\]/).pop();
      return `${config.uploadsUrl}/${filename}`;
    }
    
    // For relative paths, append to API URL
    return `${config.apiUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  };

  // Update admin logo loading effect with canvas drawing
  useEffect(() => {
    const canvas = adminLogoCanvasRef.current;
    if (!canvas || !selectedCauseData?.adminImageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set fixed canvas size
    canvas.width = adminCanvasSize.width;
    canvas.height = adminCanvasSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Start loading sequence
    setIsAdminImageLoading(true);

    // Load and draw tote bag first
    const toteBag = new Image();
    toteBag.src = '/totebag.png';

    toteBag.onload = () => {
      // Draw tote bag centered and scaled
      const toteBagScale = Math.min(canvas.width / toteBag.width, canvas.height / toteBag.height) * 0.9;
      const toteBagX = (canvas.width - toteBag.width * toteBagScale) / 2;
      const toteBagY = (canvas.height - toteBag.height * toteBagScale) / 2;
      ctx.drawImage(toteBag, toteBagX, toteBagY, toteBag.width * toteBagScale, toteBag.height * toteBagScale);

      // Now load and draw admin image
      const adminImg = new Image();
      const fullImageUrl = getFullImageUrl(selectedCauseData.adminImageUrl);
      
      console.log('[DEBUG] Admin Image - Attempting to load from:', fullImageUrl);
      
      adminImg.onload = () => {
        // Calculate scale to fit admin image within canvas
        const scale = Math.min(
          canvas.width / adminImg.width,
          canvas.height / adminImg.height
        ) * 0.4; // 40% of canvas size

        // Calculate centered position with offset for y to move image down
        const x = (canvas.width - adminImg.width * scale) / 2;
        const y = ((canvas.height - adminImg.height * scale) / 2) + 80; // Added +50 to move down

        // Draw the admin image on top
        ctx.drawImage(adminImg, x, y, adminImg.width * scale, adminImg.height * scale);
        
        console.log('[DEBUG] Admin Image - Successfully loaded and drawn');
        setIsAdminImageLoading(false);
        setAdminLogoLoaded(true);
      };

      adminImg.onerror = (error) => {
        console.error('[DEBUG] Admin Image - Failed to load from:', fullImageUrl, error);
        setIsAdminImageLoading(false);
        setAdminLogoLoaded(false);
      };

      adminImg.src = fullImageUrl;
    };

    toteBag.onerror = (error) => {
      console.error('Error loading tote bag:', error);
      setIsAdminImageLoading(false);
    };
  }, [selectedCauseData?.adminImageUrl, adminCanvasSize]);

  // Load user logo image when URL changes
  useEffect(() => {
    if (!userLogoPreview) return;

    const logoImg = new Image();
    // Handle server-side URLs
    if (userLogoPreview.startsWith('/uploads/')) {
      logoImg.src = `${config.uploadsUrl}${userLogoPreview.replace('/uploads', '')}`;
    } else {
      logoImg.src = userLogoPreview;
    }

    logoImg.onload = () => {
      userLogoRef.current = logoImg;
      // Trigger redraw
      setLogoPosition(prev => ({ ...prev }));
    };

    logoImg.onerror = (error) => {
      console.error('Error loading user logo image:', error);
    };
  }, [userLogoPreview]);

  // Handle user logo upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // First, show a preview of the selected image
      const reader = new FileReader();

              reader.onload = async (event) => {
                if (!event.target?.result) {
                  throw new Error('Failed to read file');
                }

                // Use the data URL as the preview temporarily
                const dataUrl = event.target.result as string;
                console.log('Logo loaded as data URL for preview');

                try {
                  // Compress the image before uploading to server - reduced scale for smaller display
                  const compressedDataUrl = await compressImage(dataUrl, file.type, 300, 0.4);
                  console.log('Original size:', Math.round(dataUrl.length / 1024), 'KB');
                  console.log('Compressed size:', Math.round(compressedDataUrl.length / 1024), 'KB');

                  // Create a FormData object to send the file to the server
                  const formData = new FormData();

                  // Convert the compressed data URL back to a Blob
                  const byteString = atob(compressedDataUrl.split(',')[1]);
                  const mimeType = compressedDataUrl.split(',')[0].split(':')[1].split(';')[0];
                  const ab = new ArrayBuffer(byteString.length);
                  const ia = new Uint8Array(ab);

                  for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                  }

                  const blob = new Blob([ab], { type: mimeType });
                  formData.append('logo', blob, file.name);

                  // Upload to server
                  console.log('Uploading logo to server...');
                  const response = await axios.post(`${config.apiUrl}/upload/logo`, formData, {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                    },
                  });

                  console.log('Server response:', response.data);

                  if (response.data && response.data.url) {
                    // Use the server-provided URL
                    const logoUrl = response.data.url;
                    console.log('Logo uploaded successfully, server URL:', logoUrl);

                    // Set the preview to the compressed data URL for immediate display
                    setUserLogoPreview(compressedDataUrl);

                    // But save the server URL to the form data
                    updateFormData({ logoUrl });

                    const newPosition: LogoPosition = { ...DEFAULT_LOGO_POSITION };
                    setLogoPosition(newPosition);
                    updateFormData({ logoPosition: newPosition });
                  } else {
                    throw new Error('Invalid server response');
                  }
                } catch (uploadError) {
                  console.error('Error uploading logo to server:', uploadError);

                  // Fall back to client-side approach if server upload fails
                  console.log('Falling back to client-side approach');
                  setUserLogoPreview(dataUrl);
                  updateFormData({ logoUrl: dataUrl });

                  const newPosition: LogoPosition = { ...DEFAULT_LOGO_POSITION };
                  setLogoPosition(newPosition);
                  updateFormData({ logoPosition: newPosition });

                  setError('Could not upload to server. Using local preview instead.');
                }

                setUploading(false);
              };

      reader.onerror = () => {
        console.error('Error reading file');
        setError('Failed to read logo file. Please try again.');
        setUploading(false);
      };

      // Start reading the file
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error handling logo:', error);
      setError('Failed to process logo. Please try again.');
      setUploading(false);
    }
  };

  // Image compression function with enhanced compression
  const compressImage = (dataUrl: string, fileType: string, maxWidth: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed data URL
        const compressedDataUrl = canvas.toDataURL(fileType, quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };

      img.src = dataUrl;
    });
  };

  // Handle message change
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateFormData({ message: e.target.value });
  };

  // User logo manipulation functions
  const handleZoomIn = () => {
    setLogoPosition(prev => {
      const newPosition = {
        ...prev,
        scale: Math.min(MAX_LOGO_SCALE, prev.scale * ZOOM_STEP),
      };
      updateFormData({ logoPosition: newPosition });
      return newPosition;
    });
  };

  const handleZoomOut = () => {
    setLogoPosition(prev => {
      const newPosition = {
        ...prev,
        scale: Math.max(MIN_LOGO_SCALE, prev.scale / ZOOM_STEP),
      };
      updateFormData({ logoPosition: newPosition });
      return newPosition;
    });
  };

  const handleRotateClockwise = () => {
    setLogoPosition(prev => {
      const newPosition = { ...prev, angle: prev.angle + 15 };
      updateFormData({ logoPosition: newPosition });
      return newPosition;
    });
  };

  const handleRotateCounterClockwise = () => {
    setLogoPosition(prev => {
      const newPosition = { ...prev, angle: prev.angle - 15 };
      updateFormData({ logoPosition: newPosition });
      return newPosition;
    });
  };

  const handleResetLogo = () => {
    const newPosition: LogoPosition = { ...RESET_LOGO_POSITION };
    setLogoPosition(newPosition);
    updateFormData({ logoPosition: newPosition });
  };

  // Inside the LogoUploadStep component, add this debugging function
  const debugImageLoading = (imageUrl: string | undefined, source: string) => {
    if (!imageUrl) {
      console.log(`[DEBUG] ${source} - No image URL provided`);
      return;
    }

    const fullUrl = getFullImageUrl(imageUrl);
    console.log(`[DEBUG] ${source} - Attempting to load from:`, fullUrl);
    
    const testImg = new Image();
    testImg.onload = () => {
      console.log(`[DEBUG] ${source} - Successfully loaded image from:`, fullUrl);
    };
    testImg.onerror = (err) => {
      console.error(`[DEBUG] ${source} - Failed to load image from:`, fullUrl, err);
    };
    testImg.src = fullUrl;
  };

  // Call this function in your useEffect for admin image loading
  useEffect(() => {
    debugImageLoading(effectiveAdminImageUrl, 'Admin Image');
    
    // Rest of your existing code...
  }, [effectiveAdminImageUrl]);

  // Update the render function for admin preview
  const renderAdminPreview = () => {
    if (!formData.selectedCause) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
          <p className="text-gray-400">No cause selected</p>
        </div>
      );
    }
    
    if (!selectedCauseData?.adminImageUrl) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
          <p className="text-gray-400">No admin image available for this cause</p>
        </div>
      );
    }
    
    return (
      <div className="relative border rounded-lg overflow-hidden bg-gray-50">
        <canvas 
          ref={adminLogoCanvasRef}
          width={adminCanvasSize.width}
          height={adminCanvasSize.height}
          className="w-full h-auto"
        />
        {isAdminImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-gray-600">Loading preview...</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Validation errors are handled via toast; no large inline banner */}
        
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Your Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="logo-upload" 
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                    validationError && !formData.logoUrl ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> your logo
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG, SVG, WEBP (MAX. 5MB)</p>
                  </div>
                  <Input
                    id="logo-upload"
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.svg,.webp"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>
              
              {validationError && !formData.logoUrl && (
                <p className="text-red-500 text-sm mt-1">
                  Please upload your organization logo
                </p>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {uploading && (
                <div className="text-center text-sm text-gray-500">
                  Uploading logo...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dual Preview System */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Logo Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Your Logo Preview
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Drag your logo to reposition it on the tote bag</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Logo Controls */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={!userLogoPreview}
                  >
                    <ZoomIn className="h-4 w-4 mr-1" />
                    Zoom In
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={!userLogoPreview}
                  >
                    <ZoomOut className="h-4 w-4 mr-1" />
                    Zoom Out
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotateClockwise}
                    disabled={!userLogoPreview}
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    Rotate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRotateCounterClockwise}
                    disabled={!userLogoPreview}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Rotate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetLogo}
                    disabled={!userLogoPreview}
                  >
                    Reset
                  </Button>
                </div>

                {/* User Logo Canvas */}
                <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                  <canvas 
                    ref={userLogoCanvasRef} 
                    width={CANVAS_W}
                    height={CANVAS_H}
                    className={`w-full h-auto touch-none select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    onPointerDown={handleUserLogoPointerDown}
                    onPointerMove={handleUserLogoPointerMove}
                    onPointerUp={handleUserLogoPointerUp}
                    onPointerCancel={handleUserLogoPointerUp}
                  />
                  {!userLogoPreview && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                      <p className="text-gray-500 text-sm text-center">
                        Upload a logo to see preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Logo Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Admin Logo Preview
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>This shows the admin-uploaded logo for the selected cause</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Admin Logo Canvas */}
                <div className="relative border rounded-lg overflow-hidden bg-gray-50">
                  <canvas 
                    ref={adminLogoCanvasRef} 
                    className="w-full h-auto" 
                  />
                  {!selectedCauseData?.adminImageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                      <p className="text-gray-500 text-sm text-center">
                        Select a cause to see admin logo
                      </p>
                    </div>
                  )}
                </div>
                
                {selectedCauseData?.adminImageUrl && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      Admin logo for "{selectedCauseData?.title}"
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sponsorship Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="message">Your message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to accompany your sponsorship..."
                value={formData.message}
                onChange={handleMessageChange}
                rows={3}
              />
              <p className="text-sm text-gray-500">
                This message will be displayed with your logo on the tote bag.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

export default LogoUploadStep;
