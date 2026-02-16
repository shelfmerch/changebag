import axios from 'axios';

/**
 * API Client for CauseConnect
 * 
 * This module creates a configured Axios instance that:
 * 1. Uses the current domain for API requests in production
 * 2. Falls back to localhost:5000 in development
 * 3. Includes proper error handling and logging
 */

// Determine the base URL for API requests
const getBaseUrl = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In production or on changebag.org, use the current domain
    if (window.location.hostname === 'changebag.org' || 
        window.location.hostname === 'www.changebag.org' ||
        import.meta.env.PROD) {
      return `${window.location.origin}/api`;
    }
  }
  
  // In development, use localhost
  return 'http://localhost:5000/api';
};

// Create a configured Axios instance
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for logging and dynamic URL adjustment
apiClient.interceptors.request.use(
  (config) => {
    // Log the request
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Ensure we're always using the correct base URL
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'changebag.org' || 
         window.location.hostname === 'www.changebag.org' ||
         import.meta.env.PROD)) {
      config.baseURL = `${window.location.origin}/api`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      
      // If the error is a connection error to localhost:5000, try with the current domain
      if (error.config && error.config.url && error.config.url.includes('localhost:5000')) {
        console.log('Retrying request with current domain...');
        const newUrl = error.config.url.replace('http://localhost:5000', window.location.origin);
        return apiClient(newUrl);
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common API operations
const api = {
  // GET request
  get: (endpoint, params = {}) => {
    console.log('API Client: Making GET request to', endpoint, 'with params:', params);
    return apiClient.get(endpoint, { params });
  },
  
  // POST request
  post: (endpoint, data = {}) => {
    return apiClient.post(endpoint, data);
  },
  
  // PUT request
  put: (endpoint, data = {}) => {
    return apiClient.put(endpoint, data);
  },
  
  // DELETE request
  delete: (endpoint) => {
    return apiClient.delete(endpoint);
  },
  
  // Upload file
  upload: (endpoint, formData) => {
    return apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get the current base URL
  getBaseUrl,
};

export default api;
