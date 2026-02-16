// Configuration for API endpoints and assets

// Get API URL based on environment
const getApiUrl = () => {
  // First priority: Environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log('Using API URL from environment variable:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Second priority: Production URL if in production mode
  if (import.meta.env.PROD) {
    // Always use the current domain for API requests in production
    const currentDomain = window.location.origin;
    console.log('Using current domain for API URL:', `${currentDomain}/api`);
    return `${currentDomain}/api`;
  }
  
  // For local development, check if we're running on changebag.org
  if (window.location.hostname === 'changebag.org' || 
      window.location.hostname === 'www.changebag.org') {
    const currentDomain = window.location.origin;
    console.log('Detected changebag.org domain, using:', `${currentDomain}/api`);
    return `${currentDomain}/api`;
  }
  
  // Default: Local development
  console.log('Using default local API URL');
  return 'http://localhost:5000/api'; // This will be proxied through Vite
};

// Get uploads URL based on environment
const getUploadsUrl = () => {
  // First priority: Environment variable
  if (import.meta.env.VITE_UPLOADS_URL) {
    console.log('Using uploads URL from environment variable:', import.meta.env.VITE_UPLOADS_URL);
    return import.meta.env.VITE_UPLOADS_URL;
  }
  
  // Second priority: Production URL if in production mode
  if (import.meta.env.PROD) {
    // Always use the current domain for uploads in production
    const currentDomain = window.location.origin;
    return `${currentDomain}/uploads`;
  }
  
  // For local development, check if we're running on changebag.org
  if (window.location.hostname === 'changebag.org' || 
      window.location.hostname === 'www.changebag.org') {
    const currentDomain = window.location.origin;
    console.log('Detected changebag.org domain, using:', `${currentDomain}/uploads`);
    return `${currentDomain}/uploads`;
  }
  
  // Default: Local development
  console.log('Using default local uploads URL');
  return 'http://localhost:5000/uploads'; // Use absolute URL for consistency
};

const config = {
  apiUrl: getApiUrl(),
  uploadsUrl: getUploadsUrl(),
  defaultImagePath: '/totebag.png',
  // Add other configuration values here
};

console.log('Application config:', config);
export default config;
