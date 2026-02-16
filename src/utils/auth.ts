import api from './apiClient';
import { isProduction } from './apiConfig';
import { AxiosResponse } from 'axios';

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response: AxiosResponse<LoginResponse> = await api.post<LoginResponse>('/api/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Store token in localStorage
    localStorage.setItem('token', token);
    
    return { token, user };
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('Login failed. Please check your credentials and try again.');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  login,
  logout,
  getToken,
  isAuthenticated,
  getAuthHeaders
}; 