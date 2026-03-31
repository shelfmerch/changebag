import { Request, Response, Router, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';

import User, { UserRole } from '../models/User';
import OTPVerification from '../models/OTPVerification';
import { sendWelcomeEmail } from '../lib/email';
import { createRouter } from '../utils/routerHelper';
import { authGuard } from '../middleware/authGuard';
import { generateOTP, hashOTP, generateExpiryTime } from '../utils/otpUtils';
import { sendVerificationEmail } from '../services/emailService';
import { sendVerificationSMS } from '../services/smsService';

dotenv.config();

const router: Router = createRouter();
const JWT_SECRET = process.env.JWT_SECRET as string;
const TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function isEmail(identifier: string) {
  return identifier.includes('@');
}

// Standardize phone number format
const standardizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.substring(2);
  if (cleaned.length === 10) return `+91${cleaned}`;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return `+${cleaned}`;
  if (cleaned.length === 13 && cleaned.startsWith('91')) return `+${cleaned}`;
  return `+91${cleaned}`;
};

// Request OTP endpoint
router.post('/request-otp', async (req: Request, res: Response) => {
  try {
    let { identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ message: 'Email or phone number is required' });
    }

    const method = isEmail(identifier) ? 'email' : 'sms';
    if (method === 'sms') {
      identifier = standardizePhoneNumber(identifier);
    }
    
    // Check for recent OTP
    const twoMinutesAgo = new Date();
    twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);
    
    const recentOTP = await OTPVerification.findOne({
      [method === 'email' ? 'email' : 'phone']: identifier,
      type: method,
      expiresAt: { $gt: new Date() },
      createdAt: { $gt: twoMinutesAgo }
    });

    if (recentOTP) {
      return res.status(200).json({
        message: 'OTP already sent recently. Please check your inbox/messages.',
        method
      });
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiryTime = generateExpiryTime();

    await OTPVerification.create({
      [method === 'email' ? 'email' : 'phone']: identifier,
      otp: hashedOTP,
      expiresAt: expiryTime,
      type: method,
    });

    console.log(`[AUTH ROUTE] Sending ${method} OTP to ${identifier}: ${otp}`);

    if (method === 'email') {
      try {
        await sendVerificationEmail(identifier, otp);
      } catch (err) {
        console.error('Email OTP failed:', err);
        return res.status(500).json({ message: 'Failed to deliver Email OTP. Check server logs.' });
      }
    } else {
      const smsResult = await sendVerificationSMS(identifier, otp);
      if (smsResult && smsResult.status === 'logged') {
        console.warn('SMS delivery failed, falling back to console log.');
      }
    }

    res.status(200).json({ message: 'OTP sent successfully', method });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    let { identifier, otp } = req.body;
    
    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Identifier and OTP are required' });
    }

    const method = isEmail(identifier) ? 'email' : 'sms';
    if (method === 'sms') {
      identifier = standardizePhoneNumber(identifier);
    }
    const hashedOTP = hashOTP(otp);

    const records = await OTPVerification.find({
      [method === 'email' ? 'email' : 'phone']: identifier,
      type: method
    }).sort({ createdAt: -1 });

    if (!records.length) {
      return res.status(400).json({ message: 'No verification code found' });
    }

    const record = records[0];

    if (record.otp !== hashedOTP) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Code has expired' });
    }

    // Mark verified
    record.verified = true;
    await record.save();

    // Check if user exists
    const query = method === 'email' ? { email: identifier } : { phone: identifier };
    const user = await User.findOne(query);

    if (user) {
      // User exists, log them in
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );
      const refreshToken = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        message: 'Login successful',
        isNewUser: false,
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          phone: user.phone
        }
      });
    } else {
      // User is new, needs to provide name
      return res.status(200).json({
        message: 'OTP verified. Please provide your name to continue.',
        isNewUser: true
      });
    }

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Complete Registration endpoint
router.post('/complete-registration', async (req: Request, res: Response) => {
  try {
    let { identifier, name } = req.body;
    
    if (!identifier || !name) {
      return res.status(400).json({ message: 'Identifier and Name are required' });
    }

    const method = isEmail(identifier) ? 'email' : 'sms';
    if (method === 'sms') {
      identifier = standardizePhoneNumber(identifier);
    }

    // Ensure OTP was verified recently
    const recentVerifiedOTP = await OTPVerification.findOne({
      [method === 'email' ? 'email' : 'phone']: identifier,
      type: method,
      verified: true
    }).sort({ createdAt: -1 });

    if (!recentVerifiedOTP) {
      return res.status(400).json({ message: 'Please verify OTP first' });
    }

    const newUser = new User({
      [method === 'email' ? 'email' : 'phone']: identifier,
      name,
      role: UserRole.USER
    });

    await newUser.save();

    if (method === 'email') {
      try {
        await sendWelcomeEmail(identifier, name);
      } catch (err) {
        console.error('Welcome email failed:', err);
      }
    }

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    const refreshToken = jwt.sign(
      { userId: newUser._id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        phone: newUser.phone
      }
    });

  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ message: 'Failed to complete registration' });
  }
});

// Google Authentication
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
       return res.status(400).json({ message: 'Google credential missing' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google token payload' });
    }

    const { sub: googleId, email, name } = payload;

    // Try finding by Google ID or Email
    let user = await User.findOne({ 
      $or: [
        { googleId },
        { email }
      ]
    });

    if (user) {
      // Update googleId if matched by email but googleId was empty
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user automatically
      user = new User({
        email,
        name,
        googleId,
        role: UserRole.USER
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
      }
    });

  } catch(error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Failed to authenticate with Google' });
  }
});

/* =========================================================
   NOTE: Kept legacy endpoints for backward compatibility
========================================================= */

// Legacy Register
router.post('/register', async (req: Request, res: Response) => {
  return res.status(400).json({ message: 'Registration has been moved to a new flow. Please use /request-otp and /complete-registration' });
});

// Legacy Login
router.post('/login', async (req: Request, res: Response) => {
  return res.status(400).json({ message: 'Login has been moved to a new flow. Please use /request-otp and /verify-otp' });
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({ message: 'Token refreshed successfully', token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid or expired payload' });
  }
});

// Logout user
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// Get current user profile
router.get('/me', authGuard, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
