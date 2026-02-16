/**
 * API Client Utility
 * 
 * This file provides a centralized API client for making HTTP requests
 * to the backend. It automatically uses the correct base URL from environment
 * variables and handles common request/response processing.
 */

import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_BASE_URL, isProduction } from './apiConfig';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: isProduction ? 'https://api.changebag.org' : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/authentication
});

// Add request logging for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.url);
    console.log('With params:', config.params);
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log('No token found or no headers config');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response logging for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('API response:', response.config.url, response.status);
    // If the response is HTML, it means we're getting a raw response
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('Received HTML response instead of JSON:', response.data);
      return Promise.reject(new Error('Invalid response format'));
    }
    return response;
  },
  (error: AxiosError) => {
    console.error('API error:', error.config?.url, error.response?.status);
    console.error('Error details:', error.response?.data);
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      // Optional: Redirect to login page
      // window.location.href = '/login';
    }
    
    // Handle server errors
    if (error.response?.status === 500) {
      console.error('Server error occurred:', error.message);
      // You could show a toast notification here
    }
    
    return Promise.reject(error);
  }
);

/**
 * Generic API request method
 */
export const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    console.error(`API request failed: ${method.toUpperCase()} ${url}`, error);
    throw error;
  }
};

/**
 * Convenience methods for common HTTP verbs
 */
export const get = <T>(url: string, config?: AxiosRequestConfig) => 
  apiRequest<T>('get', url, undefined, config);

export const post = <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
  apiRequest<T>('post', url, data, config);

export const put = <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
  apiRequest<T>('put', url, data, config);

export const del = <T>(url: string, config?: AxiosRequestConfig) => 
  apiRequest<T>('delete', url, undefined, config);

export default {
  get,
  post,
  put,
  delete: del,
  request: apiRequest,
  client: apiClient,
};
