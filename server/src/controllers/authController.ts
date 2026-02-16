import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    console.log('Registration request:', req.body);
    
    const { email, password, name, role = UserRole.USER, phone } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Validate role
    if (role && !Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      email,
      passwordHash,
      role,
      name,
      phone
    });
    
    // Save user to database
    const savedUser = await newUser.save();
    console.log('User created successfully:', savedUser._id);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: savedUser._id, email: savedUser.email, role: savedUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Return user info (excluding password) and token
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        name: savedUser.name,
        phone: savedUser.phone,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login request:', req.body);
    
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Return user info (excluding password) and token
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // User is attached to request by authGuard middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    res.json({
      user: {
        _id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        name: req.user.name,
        phone: req.user.phone,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default {
  register,
  login,
  getCurrentUser
};
