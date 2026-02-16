/**
 * API Configuration Utility
 * 
 * This file centralizes all API URL configuration to avoid hardcoded localhost URLs
 * throughout the codebase. It uses the central config.ts file to determine the correct
 * base URL for API requests in different environments.
 */

import config from '@/config';

// Use the API base URL from config
export const API_BASE_URL = config.apiUrl;

// Use the uploads URL from config
export const UPLOADS_BASE_URL = config.uploadsUrl;

// Get the site URL for absolute links
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:8085';

/**
 * Creates a full API endpoint URL
 * @param endpoint - The API endpoint path (without leading slash)
 * @returns The complete API URL
 */
export const apiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  
  // In production, we don't need to add /api since we're using api.changebag.org
  if (isProduction) {
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }
  
  // In development, add /api prefix
  return `${API_BASE_URL}/api/${cleanEndpoint}`;
};

/**
 * Creates a full URL for uploaded files
 * @param filePath - The file path (without leading slash)
 * @returns The complete uploads URL
 */
export const uploadsUrl = (filePath: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  return `${UPLOADS_BASE_URL}/${cleanPath}`;
};

/**
 * Environment detection helpers
 */
export const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
export const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

export default {
  API_BASE_URL,
  UPLOADS_BASE_URL,
  SITE_URL,
  apiUrl,
  uploadsUrl,
  isDevelopment,
  isProduction
};
