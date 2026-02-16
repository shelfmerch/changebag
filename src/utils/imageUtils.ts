/**
 * Utility functions for handling image URLs
 * 
 * These functions handle image URLs for the CauseConnect application,
 * ensuring that images are loaded from the correct server (API server)
 * rather than the frontend server.
 */
import config from '@/config';

/**
 * Formats an image URL to ensure it can be properly displayed
 * - Handles both server-uploaded images and external URLs
 * - Provides fallback for missing or broken images
 * 
 * @param url The original image URL
 * @param fallbackImage Optional fallback image path (defaults to '/totebag.png')
 * @returns Properly formatted image URL
 */
export const getImageUrl = (url: string | undefined, fallbackImage: string = '/totebag.png'): string => {
  if (!url) return fallbackImage;
  
  // Log the original URL for debugging
  console.log('Processing image URL:', url);
  
  // If it's already an absolute URL (external), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a server upload path (starts with /uploads/), ensure it's properly formatted
  if (url.startsWith('/uploads/')) {
    // Extract the filename
    const filename = url.split('/').pop();
    if (filename) {
      // Use the configured uploads URL
      return `${config.uploadsUrl}/${filename}`;
    }
    
    // Extract the API domain without any path
    let apiDomain = '';
    
    if (config.apiUrl.includes('://')) {
      // Get just the domain part (e.g., 'api.changebag.org')
      const urlParts = config.apiUrl.split('://');
      const protocol = urlParts[0]; // 'https'
      const domainWithPath = urlParts[1].split('/')[0]; // 'api.changebag.org'
      apiDomain = `${protocol}://${domainWithPath}`;
    } else {
      // Fallback if apiUrl doesn't have protocol
      apiDomain = config.apiUrl.split('/')[0];
    }
    
    console.log('Using API domain for images:', apiDomain);
    return `${apiDomain}${url}`;
  }
  
  // If it's just a filename, assume it's in the uploads directory
  if (!url.includes('/')) {
    // Extract the API domain without any path
    let apiDomain = '';
    
    if (config.apiUrl.includes('://')) {
      // Get just the domain part (e.g., 'api.changebag.org')
      const urlParts = config.apiUrl.split('://');
      const protocol = urlParts[0]; // 'https'
      const domainWithPath = urlParts[1].split('/')[0]; // 'api.changebag.org'
      apiDomain = `${protocol}://${domainWithPath}`;
    } else {
      // Fallback if apiUrl doesn't have protocol
      apiDomain = config.apiUrl.split('/')[0];
    }
    
    return `${apiDomain}/uploads/${url}`;
  }
  
  // If it's a relative path to a local asset, ensure it starts with /
  if (!url.startsWith('/')) {
    return `/${url}`;
  }
  
  return url;
};

/**
 * Creates an image URL with error handling
 * Use this in img tags with onError to handle fallbacks
 * 
 * @example
 * <img 
 *   src={getImageUrl(imageUrl)} 
 *   onError={(e) => handleImageError(e, '/fallback.png')}
 * />
 */
export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = '/totebag.png'
) => {
  const img = event.currentTarget;
  const originalSrc = img.src;
  
  // Log the error for debugging
  console.error(`Error loading image: ${originalSrc}`);
  
  // If the image is from the server uploads directory, try the API server directly
  if (originalSrc.includes('/uploads/')) {
    const filename = originalSrc.split('/').pop();
    if (filename) {
      // Extract the API domain without any path
      let apiDomain = '';
      
      if (config.apiUrl.includes('://')) {
        // Get just the domain part (e.g., 'api.changebag.org')
        const urlParts = config.apiUrl.split('://');
        const protocol = urlParts[0]; // 'https'
        const domainWithPath = urlParts[1].split('/')[0]; // 'api.changebag.org'
        apiDomain = `${protocol}://${domainWithPath}`;
      } else {
        // Fallback if apiUrl doesn't have protocol
        apiDomain = config.apiUrl.split('/')[0];
      }
      
      const newSrc = `${apiDomain}/uploads/${filename}`;
      console.log(`Attempting to load from API server: ${newSrc}`);
      img.onerror = null; // Prevent infinite loop
      img.src = newSrc;
      return;
    }
  }
  
  // If we get here, use the fallback image
  img.onerror = null; // Prevent infinite loop
  img.src = fallbackSrc;
};
