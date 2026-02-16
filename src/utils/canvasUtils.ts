import config from '@/config';

export interface CanvasSize {
  width: number;
  height: number;
}

export interface LogoPosition {
  x: number;
  y: number;
  scale: number;
  angle: number;
}

export const DEFAULT_CANVAS_SIZE: CanvasSize = {
  width: 400,
  height: 400
};

export const DEFAULT_LOGO_POSITION: LogoPosition = {
  x: 200,
  y: 280,
  scale: 0.15,
  angle: 0
};

// Helper to get full URL for images
export const getFullImageUrl = (imageUrl: string): string => {
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

// Draw the tote bag preview with logo
export const drawTotePreview = (
  canvas: HTMLCanvasElement,
  logoUrl: string,
  position: LogoPosition = DEFAULT_LOGO_POSITION,
  onComplete?: () => void
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  canvas.width = DEFAULT_CANVAS_SIZE.width;
  canvas.height = DEFAULT_CANVAS_SIZE.height;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Load and draw tote bag
  const toteBag = new Image();
  toteBag.src = '/totebag.png';

  toteBag.onload = () => {
    // Draw tote bag centered and scaled
    const toteBagScale = Math.min(canvas.width / toteBag.width, canvas.height / toteBag.height) * 0.9;
    const toteBagX = (canvas.width - toteBag.width * toteBagScale) / 2;
    const toteBagY = (canvas.height - toteBag.height * toteBagScale) / 2;
    ctx.drawImage(toteBag, toteBagX, toteBagY, toteBag.width * toteBagScale, toteBag.height * toteBagScale);

    // Load and draw logo
    const logo = new Image();
    const fullLogoUrl = getFullImageUrl(logoUrl);
    logo.src = fullLogoUrl;

    logo.onload = () => {
      ctx.save();
      
      // Apply transformations
      ctx.translate(position.x, position.y);
      ctx.rotate(position.angle * Math.PI / 180);
      ctx.scale(position.scale, position.scale);

      // Draw logo centered at transform point
      ctx.drawImage(logo, -logo.width / 2, -logo.height / 2, logo.width, logo.height);

      ctx.restore();

      // Call completion handler if provided
      if (onComplete) {
        onComplete();
      }
    };

    logo.onerror = (error) => {
      console.error('Error loading logo for preview:', error);
    };
  };

  toteBag.onerror = (error) => {
    console.error('Error loading tote bag:', error);
  };
}; 