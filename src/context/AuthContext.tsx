import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiUrl } from '@/utils/apiUtils';
import { User, UserRole } from '@/types';

export interface AuthResult {
  success: boolean;
  message?: string;
  role?: UserRole;
  isNewUser?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  requestOtp: (identifier: string) => Promise<AuthResult>;
  verifyOtp: (identifier: string, otp: string) => Promise<AuthResult>;
  completeRegistration: (identifier: string, name: string) => Promise<AuthResult>;
  googleLogin: (credential: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const requestOtp = async (identifier: string): Promise<AuthResult> => {
    try {
      const response = await fetch(getApiUrl('/auth/request-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Request OTP failed:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const verifyOtp = async (identifier: string, otp: string): Promise<AuthResult> => {
    try {
      const response = await fetch(getApiUrl('/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, otp })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.isNewUser) {
           return { success: true, isNewUser: true, message: data.message };
        }
        
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { success: true, isNewUser: false, role: data.user?.role };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Verify OTP failed:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const completeRegistration = async (identifier: string, name: string): Promise<AuthResult> => {
    try {
      const response = await fetch(getApiUrl('/auth/complete-registration'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, name })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { success: true, role: data.user?.role };
      }
      return { success: false, message: data.message };
    } catch (error) {
       console.error('Complete registration failed:', error);
       return { success: false, message: 'Network error occurred' };
    }
  };

  const googleLogin = async (credential: string): Promise<AuthResult> => {
    try {
      const response = await fetch(getApiUrl('/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential })
      });
      const data = await response.json();
      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        }
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { success: true, role: data.user?.role };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Google login failed:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading, requestOtp, verifyOtp, completeRegistration, googleLogin, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
