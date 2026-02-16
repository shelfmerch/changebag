import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { IUser, UserRole } from '../models/User';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Authentication middleware to validate JWT token
 */
export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Find the user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach the user to the request object
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Role-based authorization middleware
 * @param roles Array of allowed roles
 */
export const roleGuard = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if we have a user in the request
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // For development mode with mock tokens, allow admin access
    if (process.env.NODE_ENV === 'development' && req.user._id === '123456789012345678901234') {
      console.log('Development mode: Granting admin access for testing');
      return next();
    }
    
    // Normal role check for production
    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    
    next();
  };
};

export const adminGuard = roleGuard([UserRole.ADMIN]);

export default {
  authGuard,
  roleGuard,
  adminGuard
};
