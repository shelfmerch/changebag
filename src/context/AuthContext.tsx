import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getApiUrl } from '@/utils/apiUtils';
import { User, UserRole } from '@/types';
import config from '@/config';

interface AuthResult {
  success: boolean;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, name: string, password: string, role: UserRole) => Promise<AuthResult>;
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

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      // Simple validation
      if (!email || !password) {
        return { success: false };
      }

      // For testing with the real backend
      try {
        // Make a real API call to get a token
        const response = await fetch(getApiUrl('/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Login response:', data);
          
          // Store the token
          if (data.token) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
          }
          
          // Store user info
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            return { success: true, role: data.user.role };
          }
        } else {
          // If API call fails, fall back to mock login for testing
          console.warn('API login failed, using mock login');
        }
      } catch (apiError) {
        console.error('API login error:', apiError);
        // Continue with mock login on API error
      }

      // Only use mock login in development environment
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock login in development environment');
        
        // Validate email format for mock login
        if (!email.includes('@')) {
          console.error('Invalid email format for mock login');
          return { success: false };
        }
        
        // Determine role based on email for demo purposes
        let role: UserRole = 'user';
        if (email.includes('admin')) {
          role = 'admin';
        } else if (email.includes('sponsor')) {
          role = 'sponsor';
        } else if (email.includes('claimer')) {
          role = 'claimer';
        } else {
          // If email doesn't specify a role, don't allow mock login
          console.error('Email must include role identifier (admin/sponsor/claimer) for mock login');
          return { success: false };
        }

        const mockUser: User = {
          _id: '123',
          email,
          name: 'Test User',
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // For testing, create a mock token
        const mockToken = `mock_token_${Date.now()}`;
        localStorage.setItem('token', mockToken);
        setToken(mockToken);
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return { success: true, role: mockUser.role };
      }
      
      // In production, don't allow mock login
      console.error('Login failed: API error and mock login not allowed in production');
      return { success: false };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false };
    }
  };

  const register = async (email: string, name: string, password: string, role: UserRole): Promise<AuthResult> => {
    try {
      // Simple validation
      if (!email || !name || !password) {
        return { success: false };
      }

      // Make a real API call to register user
      try {
        console.log('Registering user with API:', { email, name, password, role });
        
        const response = await fetch(getApiUrl('/auth/register'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, name, role })
        });

        const data = await response.json();
        console.log('Registration response:', data);

        if (response.ok) {
          // Store the token
          if (data.token) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
          }
          
          // Store user info
          if (data.user) {
            const userData = {
              _id: data.user.id || data.user._id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true, role: userData.role };
          }
        } else {
          console.error('API registration failed:', data.message);
          return { success: false };
        }
      } catch (apiError) {
        console.error('API registration error:', apiError);
        // Fall back to mock registration on API error
      }

      // Mock registration as fallback
      console.warn('Using mock registration as fallback');
      const mockUser: User = {
        _id: '123',
        email,
        name,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // For testing, create a mock token
      const mockToken = `mock_token_${Date.now()}`;
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      return { success: true, role: mockUser.role };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
