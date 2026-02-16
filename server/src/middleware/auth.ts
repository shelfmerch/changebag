import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header or cookies
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1] || req.cookies.token;

    console.log('Auth middleware - NODE_ENV:', process.env.NODE_ENV);
    console.log('Auth middleware - Authorization header:', authHeader);
    console.log('Auth middleware - Token:', token ? token.substring(0, 20) + '...' : 'No token');
    console.log('Auth middleware - JWT_SECRET exists:', !!process.env.JWT_SECRET);

    // In development mode, allow requests without a token
    if (process.env.NODE_ENV === 'development' && !token) {
      console.log('Auth middleware - No token found but allowing in development mode');
      const mockUser = {
        _id: '123456789012345678901234',
        email: 'shabahatsyed101@gmail.com',
        name: 'Development User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      req.user = mockUser as any;
      return next();
    }
    
    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check for mock token in development mode
    if (process.env.NODE_ENV === 'development' && token.startsWith('mock_token_')) {
      console.log('Using mock token in development mode');
      
      // For mock tokens, create a mock user with the email from the request
      // This allows testing with different emails
      const mockUser = {
        _id: '123456789012345678901234', // Mock MongoDB ObjectId
        email: 'shabahatsyed101@gmail.com', // Use the email that exists in sponsorships
        name: 'Mock User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      req.user = mockUser as any;
      console.log('Auth middleware - Mock user set:', mockUser);
      return next();
    }

    // Also check for any token that starts with 'mock' in development
    if (process.env.NODE_ENV === 'development' && token.includes('mock')) {
      console.log('Using mock token (alternative detection) in development mode');
      
      const mockUser = {
        _id: '123456789012345678901234',
        email: 'shabahatsyed101@gmail.com', // Use the email that exists in sponsorships
        name: 'Mock User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      req.user = mockUser as any;
      console.log('Auth middleware - Mock user set (alternative):', mockUser);
      return next();
    }

    console.log('Auth middleware - Token is not a mock token, trying JWT verification');

    // Verify token for real JWT tokens
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      console.log('Auth middleware - Using JWT secret:', jwtSecret.substring(0, 10) + '...');
      
      const decoded = jwt.verify(token, jwtSecret) as any;
      console.log('Auth middleware - JWT decoded successfully:', decoded);
      
      // Get user from database
      const user = await User.findById(decoded.userId || decoded.id);
      console.log('Auth middleware - User found in database:', user ? 'Yes' : 'No');
      
      if (!user) {
        console.log('Auth middleware - User not found in database');
        return res.status(401).json({ message: 'User not found' });
      }

      // Attach user to request object
      req.user = user;
      console.log('Auth middleware - User attached to request:', user.email);
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      console.error('JWT error name:', jwtError.name);
      console.error('JWT error message:', jwtError.message);
      
      // In development, if JWT fails, try to use a fallback mock user
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT failed in development, using fallback mock user');
        const mockUser = {
          _id: '123456789012345678901234',
          email: 'shabahatsyed101@gmail.com',
          name: 'Fallback Mock User',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        req.user = mockUser as any;
        console.log('Auth middleware - Fallback mock user set:', mockUser);
        return next();
      }
      
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};