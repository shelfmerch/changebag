/**
 * Direct API URL Fix for CauseConnect
 * 
 * This script is loaded directly in index.html before any other JavaScript
 * to ensure all API requests to localhost:5000 are redirected to the current domain.
 */

(function() {
  console.log('Direct API Fix: Initializing...');
  
  // Only apply in production or on changebag.org
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost')) {
    console.log('Direct API Fix: Not running on target domain, skipping');
    return;
  }
  
  console.log('Direct API Fix: Running on target domain, applying fixes');
  
  // Store original methods
  const originalFetch = window.fetch;
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  
  // Function to fix URLs
  function fixUrl(url) {
    if (typeof url === 'string' && url.includes('localhost:5000')) {
      const newUrl = url.replace('http://localhost:5000', window.location.origin);
      console.log(`Direct API Fix: Redirecting ${url} to ${newUrl}`);
      return newUrl;
    }
    return url;
  }
  
  // Override fetch
  window.fetch = function(resource, options) {
    if (typeof resource === 'string') {
      resource = fixUrl(resource);
    } else if (resource instanceof Request) {
      const url = fixUrl(resource.url);
      if (url !== resource.url) {
        resource = new Request(url, resource);
      }
    }
    return originalFetch.call(this, resource, options);
  };
  
  // Override XMLHttpRequest
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    const newUrl = fixUrl(url);
    return originalXhrOpen.call(this, method, newUrl, async, user, password);
  };
  
  // Create a global configuration override
  window.__API_CONFIG_OVERRIDE__ = {
    apiUrl: window.location.origin + '/api',
    uploadsUrl: window.location.origin + '/uploads'
  };
  
  // Override any config object that might be created later
  Object.defineProperty(window, 'config', {
    get: function() {
      return this._config || {};
    },
    set: function(newConfig) {
      // Store the original config
      this._config = newConfig;
      
      // Override API URLs if they point to localhost
      if (newConfig.apiUrl && newConfig.apiUrl.includes('localhost:5000')) {
        console.log(`Direct API Fix: Overriding config.apiUrl from ${newConfig.apiUrl} to ${window.location.origin}/api`);
        newConfig.apiUrl = window.location.origin + '/api';
      }
      
      if (newConfig.uploadsUrl && newConfig.uploadsUrl.includes('localhost:5000')) {
        console.log(`Direct API Fix: Overriding config.uploadsUrl from ${newConfig.uploadsUrl} to ${window.location.origin}/uploads`);
        newConfig.uploadsUrl = window.location.origin + '/uploads';
      }
      
      return newConfig;
    },
    configurable: true
  });
  
  console.log('Direct API Fix: Initialization complete');
})();
