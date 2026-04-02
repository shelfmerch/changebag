import { Request, Response, Router, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import User, { UserRole } from '../models/User';
import { sendWelcomeEmail } from '../lib/email';
import { createRouter } from '../utils/routerHelper';
import { authGuard } from '../middleware/authGuard';
import OTPVerification from '../models/OTPVerification';
import { generateOTP, hashOTP, generateExpiryTime } from '../utils/otpUtils';
import { sendVerificationEmail } from '../services/emailService';
import { sendVerificationSMS } from '../services/smsService';
import { normalizeIndianMobile } from '../utils/phoneUtils';

dotenv.config();

const router: Router = createRouter();
const JWT_SECRET = process.env.JWT_SECRET as string;
const TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '119905627719-f7slrnitrpphqv28t7lc6049schg3qm3.apps.googleusercontent.com';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper to generate tokens and set cookie
const generateAndSetTokens = (user: any, res: Response) => {
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
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return token;
};

// Request OTP
router.post('/request-otp', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'Email or mobile number is required' });

    const isEmail = identifier.includes('@');
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiryTime = generateExpiryTime();
    const origin = req.headers.origin || '';
    const isLocalRequest = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

    if (isEmail) {
      await OTPVerification.create({
        email: identifier.toLowerCase(),
        otp: hashedOTP,
        expiresAt: expiryTime,
        type: 'email',
      });
      await sendVerificationEmail(identifier, otp);
    } else {
      const formattedPhone = normalizeIndianMobile(identifier);
      if (!formattedPhone) {
        return res.status(400).json({ message: 'Enter a valid 10-digit Indian mobile number.' });
      }
      const otpRecord = await OTPVerification.create({
        phone: formattedPhone,
        otp: hashedOTP,
        expiresAt: expiryTime,
        type: 'sms',
      });
      try {
        await sendVerificationSMS(formattedPhone, otp);
      } catch (smsErr) {
        await OTPVerification.deleteOne({ _id: otpRecord._id });
        console.error('[auth] SMS send failed:', smsErr);
        return res.status(503).json({
          message:
            smsErr instanceof Error
              ? smsErr.message
              : 'Could not send SMS. Please try again or contact support if this continues.',
        });
      }
    }

    res.json({ 
      success: true, 
      message: `OTP sent to ${identifier}`,
      ...(isLocalRequest ? { debugOtp: otp } : {})
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    const msg = error instanceof Error ? error.message : 'Error sending OTP';
    res.status(500).json({ message: msg });
  }
});

// Verify OTP
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) return res.status(400).json({ message: 'Identifier and OTP are required' });

    const isEmail = identifier.includes('@');
    const hashedOTP = hashOTP(otp);
    const phoneNorm = !isEmail ? normalizeIndianMobile(identifier) : null;
    if (!isEmail && !phoneNorm) {
      return res.status(400).json({ message: 'Enter a valid 10-digit Indian mobile number.' });
    }
    const query = isEmail
      ? { email: identifier.toLowerCase(), type: 'email' }
      : { phone: phoneNorm!, type: 'sms' };

    const otpRecord = await OTPVerification.findOne({
      ...query,
      otp: hashedOTP,
      expiresAt: { $gt: new Date() },
      verified: false
    });

    if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });

    otpRecord.verified = true;
    await otpRecord.save();

    // Check if user exists
    const userQuery = isEmail ? { email: identifier.toLowerCase() } : { phone: phoneNorm! };
    let user = await User.findOne(userQuery);

    if (!user) {
      return res.json({ success: true, isNewUser: true, message: 'OTP verified. Please complete registration.' });
    }

    // Update verification status for existing user
    let updated = false;
    if (isEmail && !user.emailVerified) {
      user.emailVerified = true;
      updated = true;
    } else if (!isEmail && !user.phoneVerified) {
      user.phoneVerified = true;
      updated = true;
    }
    if (updated) await user.save();

    const token = generateAndSetTokens(user, res);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// Complete Registration
router.post('/complete-registration', async (req: Request, res: Response) => {
  try {
    const { identifier, name } = req.body;
    if (!identifier || !name) return res.status(400).json({ message: 'Identifier and name are required' });

    const isEmail = identifier.includes('@');
    const regPhone = !isEmail ? normalizeIndianMobile(identifier) : null;
    if (!isEmail && !regPhone) {
      return res.status(400).json({ message: 'Enter a valid 10-digit Indian mobile number.' });
    }
    const userQuery = isEmail ? { email: identifier.toLowerCase() } : { phone: regPhone! };

    let user = await User.findOne(userQuery);
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({
      ...(isEmail
        ? { email: identifier.toLowerCase(), emailVerified: true }
        : { email: `${regPhone!}@changebag.local`, phone: regPhone!, phoneVerified: true }),
      name,
      role: UserRole.USER
    });

    await user.save();
    const token = generateAndSetTokens(user, res);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ message: 'Error completing registration' });
  }
});

// Google login
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: 'Invalid Google token' });

    const { email, name, sub: googleId } = payload;
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = new User({
        email: email.toLowerCase(),
        name,
        googleId,
        role: UserRole.USER,
        emailVerified: true
      });
      await user.save();
    } else {
      let updated = false;
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        updated = true;
      }
      if (updated) await user.save();
    }

    const token = generateAndSetTokens(user, res);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Error during Google login' });
  }
});


// Register a new user
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, phone, role } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      email,
      passwordHash,
      role: role || UserRole.USER, // Use the role from request body or default to USER
      name,
      phone
    });

    await newUser.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with registration even if email fails
    }

    // Generate token
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

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        emailVerified: newUser.emailVerified,
        phoneVerified: newUser.phoneVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
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

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

// Logout user
router.post('/logout', (req: Request, res: Response, next: NextFunction) => {
  // Clear the refresh token cookie
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// Get current user profile
router.get('/me', authGuard, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

export default router;
