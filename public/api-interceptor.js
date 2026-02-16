/**
 * API Request Interceptor
 * 
 * This script intercepts all API requests to localhost:5000 and redirects them
 * to the current domain. It's loaded before the main application code.
 */

(function() {
  // Only run in production environments
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('API Interceptor: Skipping in development environment');
    return;
  }
  
  console.log('API Interceptor: Initializing');
  
  // Store the original fetch and XHR open methods
  const originalFetch = window.fetch;
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  
  // Create a function to replace localhost:5000 with the current domain
  function replaceLocalhostUrl(url) {
    if (typeof url === 'string' && url.includes('localhost:5000')) {
      const newUrl = url.replace('http://localhost:5000', window.location.origin);
      console.log(`API Interceptor: Redirecting request from ${url} to ${newUrl}`);
      return newUrl;
    }
    return url;
  }
  
  // Override the fetch method
  window.fetch = function(resource, options) {
    // If the resource is a string URL, check and replace if needed
    if (typeof resource === 'string') {
      resource = replaceLocalhostUrl(resource);
    } 
    // If the resource is a Request object, we need to create a new one with the modified URL
    else if (resource instanceof Request) {
      const url = replaceLocalhostUrl(resource.url);
      if (url !== resource.url) {
        const newRequest = new Request(url, resource);
        return originalFetch.call(this, newRequest, options);
      }
    }
    
    return originalFetch.call(this, resource, options);
  };
  
  // Override the XMLHttpRequest open method
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    const newUrl = replaceLocalhostUrl(url);
    return originalXhrOpen.call(this, method, newUrl, async, user, password);
  };
  
  // Override Axios if it's available
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (window.axios) {
        console.log('API Interceptor: Configuring Axios interceptors');
        
        // Add a request interceptor
        window.axios.interceptors.request.use(function(config) {
          if (config.url && typeof config.url === 'string' && config.url.includes('localhost:5000')) {
            config.url = config.url.replace('http://localhost:5000', window.location.origin);
            console.log(`API Interceptor: Axios redirecting to ${config.url}`);
          }
          return config;
        });
      }
      
      // Force update config object if it exists
      if (window.config) {
        const originalApiUrl = window.config.apiUrl;
        const originalUploadsUrl = window.config.uploadsUrl;
        
        if (originalApiUrl && originalApiUrl.includes('localhost:5000')) {
          window.config.apiUrl = originalApiUrl.replace('http://localhost:5000', window.location.origin);
          console.log(`API Interceptor: Updated config.apiUrl from ${originalApiUrl} to ${window.config.apiUrl}`);
        }
        
        if (originalUploadsUrl && originalUploadsUrl.includes('localhost:5000')) {
          window.config.uploadsUrl = originalUploadsUrl.replace('http://localhost:5000', window.location.origin);
          console.log(`API Interceptor: Updated config.uploadsUrl from ${originalUploadsUrl} to ${window.config.uploadsUrl}`);
        }
      }
    }, 100);
  });
  
  // Create a global variable to store the override configuration
  window.__API_INTERCEPTOR__ = {
    enabled: true,
    originalDomain: 'http://localhost:5000',
    targetDomain: window.location.origin,
    redirectCount: 0,
    log: function(message) {
      console.log(`API Interceptor: ${message}`);
    }
  };
  
  console.log('API Interceptor: Initialized successfully');
})();
