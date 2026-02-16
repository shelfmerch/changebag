/**
 * Application configuration
 * Handles environment-specific settings
 */

interface Config {
  apiUrl: string;
  uploadsUrl: string;
  frontendUrl: string;
  isProduction: boolean;
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };
  security: {
    maxFileSize: number;
    allowedFileTypes: string[];
    maxUploadRetries: number;
  };
}

// Determine if we're in production or development
const isProduction = import.meta.env.PROD || 
  window.location.hostname === 'changebag.org' || 
  window.location.hostname === 'www.changebag.org';

// Base domain for API requests
const apiDomain = isProduction ? 'https://api.changebag.org' : 'http://localhost:5000';

// Production URLs
const PROD_API_URL = 'https://api.changebag.org';
const PROD_UPLOADS_URL = 'https://api.changebag.org/uploads';
const PROD_FRONTEND_URL = 'https://changebag.org';

// Development URLs (from environment variables or defaults)
const DEV_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const DEV_UPLOADS_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000/uploads';
const DEV_FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:8085';

const config: Config = {
  apiUrl: isProduction ? PROD_API_URL : DEV_API_URL,
  uploadsUrl: isProduction ? PROD_UPLOADS_URL : DEV_UPLOADS_URL,
  frontendUrl: isProduction ? PROD_FRONTEND_URL : DEV_FRONTEND_URL,
  isProduction,
  email: {
    host: isProduction 
      ? (import.meta.env.VITE_EMAIL_HOST || 'smtp.gmail.com')
      : 'smtp.gmail.com',
    port: isProduction 
      ? parseInt(import.meta.env.VITE_EMAIL_PORT || '587', 10)
      : 587,
    secure: isProduction 
      ? (import.meta.env.VITE_EMAIL_SECURE === 'true')
      : false,
    user: isProduction 
      ? (import.meta.env.VITE_EMAIL_USER || '')
      : 'test@example.com',
    password: isProduction 
      ? (import.meta.env.VITE_EMAIL_PASSWORD || '')
      : 'test-password',
    from: isProduction 
      ? (import.meta.env.VITE_EMAIL_FROM || '"CauseBags" <noreply@changebag.org>')
      : '"CauseBags Dev" <noreply@localhost>'
  },
  security: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml'
    ],
    maxUploadRetries: 3
  }
};

// Helper function to get the full image URL
export function getFullImageUrl(path: string): string {
  // If the path is already an absolute URL, return it as-is
  if (/^(http|https):\/\//i.test(path)) {
    return path;
  }

  // Clean the path to prevent directory traversal
  const cleanPath = path.replace(/\.\./g, '').replace(/^\/+/, '');

  // Otherwise, assume it's a relative path and prepend the API URL
  return `${config.apiUrl}/${cleanPath}`;
}

// Helper function to validate file upload
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (file.size > config.security.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${config.security.maxFileSize / 1024 / 1024}MB`
    };
  }

  if (!config.security.allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Please upload an image file (JPEG, PNG, WebP, GIF, or SVG).'
    };
  }

  return { valid: true };
}

// Debug function to log configuration (only in development)
export function debugConfig() {
  if (!isProduction) {
console.log('App config:', { 
  isProduction, 
  apiUrl: config.apiUrl, 
  uploadsUrl: config.uploadsUrl,
  hostname: window.location.hostname,
      apiDomain,
      email: {
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        user: config.email.user,
        from: config.email.from
      },
      security: {
        maxFileSize: `${config.security.maxFileSize / 1024 / 1024}MB`,
        allowedFileTypes: config.security.allowedFileTypes,
        maxUploadRetries: config.security.maxUploadRetries
      }
    });
  }
}

// Only log configuration in development
if (!isProduction) {
  debugConfig();
}

export default config;
