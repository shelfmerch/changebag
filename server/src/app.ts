import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import causeRoutes from './routes/causes';
import sponsorshipRoutes from './routes/sponsorshipRoutes';
import claimRoutes from './routes/claims';
import uploadRoutes from './routes/uploadRoutes';
import otpRoutes from './routes/otpRoutes';
import paymentRoutes from './routes/paymentRoutes';
import statsRoutes from './routes/stats';
import waitlistRoutes from './routes/waitlist';
import { authGuard, adminGuard } from './middleware/authGuard';
import configureStaticFiles from './middleware/staticFiles';
import copyUploadsToPublic from './utils/copyUploadsToPublic';
import distributionRoutes from './routes/distributionRoutes';
import partnerClaimsRoutes from './routes/partnerClaims';
import apiPartnersAdminRoutes from './routes/apiPartnersAdmin';

// Create Express app
const app: Application = express();

// Middleware
// Using type assertions to fix TypeScript errors
app.use((express as any).json({ limit: '10mb' }));
app.use((express as any).urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// Configure CORS to allow requests from the frontend domain
// Comment out or remove this section
/*
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://changebag.org', 
      'https://www.changebag.org',
      'http://localhost:8083',
      'http://localhost:8085',
      'http://localhost:8087',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // Cache preflight response for 24 hours
}));
*/

// Add CORS headers to all responses with improved preflight handling
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://changebag.org', 
      'https://www.changebag.org',
      'http://localhost:8080',
      'http://localhost:8083',
      'http://localhost:8085',
      'http://localhost:8087',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      // IMPORTANT: Partner API uses `X-API-Key`, so we must allow it for preflight.
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key, API-Key');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        console.log('Received OPTIONS request from origin:', origin);
        res.status(204).end();
        return;
      }
    }
  }
  next();
});

// Configure Helmet for security headers with appropriate CSP - Updated for Render deployment
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://fonts.googleapis.com", "https://*.vercel.app"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.vercel.app", "https://gs-extension-embeds-final.vercel.app"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://*.vercel.app", "https://gs-extension-embeds-final.vercel.app"],
      imgSrc: ["'self'", "data:", "https://*", "blob:", "http://localhost:*"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://fonts.googleapis.com", "https://*.vercel.app"],
      connectSrc: ["'self'", "https://*", "http://localhost:*"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configure static file serving for uploaded files
configureStaticFiles(app);

// Copy uploaded files to public directory for frontend access
copyUploadsToPublic();
console.log('Copied uploaded files to public directory');

// Routes
// Using type assertion to fix TypeScript errors
app.use('/api/auth', authRoutes as any);
app.use('/api/causes', causeRoutes as any);
// Compatibility alias: allows `/causes` (no `/api`) for external integrations if desired.
app.use('/causes', causeRoutes as any);
app.use('/api/sponsorships', sponsorshipRoutes as any);
app.use('/api/claims', claimRoutes as any);
app.use('/api/upload', uploadRoutes as any);
app.use('/api/otp', otpRoutes as any);
app.use('/api/payments', paymentRoutes as any);
app.use('/api/stats', statsRoutes as any);
app.use('/api/waitlist', waitlistRoutes as any);
app.use('/api/admin/distribution', distributionRoutes);
app.use('/api/partner', partnerClaimsRoutes);
// Compatibility alias: allows `/partner/*` (no `/api`) if desired.
app.use('/partner', partnerClaimsRoutes);
// Admin endpoints for issuing/revoking API keys.
app.use('/api/admin/api-partners', apiPartnersAdminRoutes as any);

// Protected route example
app.get('/api/profile', authGuard as any, (req: Request, res: Response) => {
  res.json({ 
    message: 'Profile data', 
    user: {
      id: req.user?._id,
      email: req.user?.email,
      role: req.user?.role,
      name: req.user?.name
    } 
  });
});

// Admin-only route example
app.get('/api/admin', [authGuard, adminGuard] as any, (req: Request, res: Response) => {
  res.json({ message: 'Admin dashboard data' });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Testing end point' });
});

// Root route handler
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'CauseConnect API Server',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: [
      '/api/auth',
      '/api/causes',
      '/api/sponsorships',
      '/api/claims',
      '/api/upload',
      '/api/otp',
      '/api/profile',
      '/api/admin',
      '/api/health'
    ]
  });
});

export default app;

