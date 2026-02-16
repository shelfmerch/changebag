import { Router, Request, Response } from 'express';
import {createClaim} from '../controllers/claimController';
import {authenticateApiKey} from '../middleware/apiKeyAuth';
import { getPartnerCauses } from '../controllers/causeController'; 
import ApiPartner from '../models/ApiPartner';

const router = Router();

// Basic signup throttling by IP (in-memory)
const SIGNUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const SIGNUP_MAX_PER_WINDOW = 10;
const signupByIp = new Map<string, { windowStartMs: number; count: number }>();

//Partner API endpoint - requires API key authentication
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Use a conservative approach for TS typing across Express versions.
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      ((req as any).socket?.remoteAddress as string | undefined) ||
      ((req as any).connection?.remoteAddress as string | undefined) ||
      'unknown';
    const now = Date.now();
    const existing = signupByIp.get(ip);
    const inWindow = existing && now - existing.windowStartMs < SIGNUP_WINDOW_MS;
    const state = inWindow
      ? { windowStartMs: existing!.windowStartMs, count: existing!.count + 1 }
      : { windowStartMs: now, count: 1 };
    signupByIp.set(ip, state);

    if (state.count > SIGNUP_MAX_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many registrations from this IP. Please try again later.'
      });
    }

    const { businessName, businessEmail, contactName } = req.body as {
      businessName?: string;
      businessEmail?: string;
      contactName?: string;
    };

    if (!businessName || !businessEmail || !contactName) {
      return res.status(400).json({
        success: false,
        message: 'businessName, businessEmail, and contactName are required'
      });
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(businessEmail);
    if (!emailLooksValid) {
      return res.status(400).json({
        success: false,
        message: 'businessEmail is invalid'
      });
    }

    const already = await ApiPartner.findOne({ businessName });
    if (already) {
      return res.status(409).json({
        success: false,
        message: 'A partner with that businessName already exists'
      });
    }

    const partner = new ApiPartner({
      businessName,
      businessEmail,
      contactName,
      isActive: true
    });

    await partner.save();

    // Show the API key once on creation. Treat it like a secret.
    return res.status(201).json({
      success: true,
      apiKey: partner.apiKey,
      partner: {
        id: partner._id,
        businessName: partner.businessName,
        businessEmail: partner.businessEmail,
        contactName: partner.contactName,
        isActive: partner.isActive,
        rateLimitPerMinute: partner.rateLimitPerMinute,
        createdAt: partner.createdAt
      }
    });
  } catch (error: any) {
    console.error('Partner register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register partner',
      error: error.message
    });
  }
});

router.post('/claim', authenticateApiKey, createClaim);
router.get('/causes', authenticateApiKey, getPartnerCauses);
router.get('/me', authenticateApiKey, (req: Request, res: Response) => {
  res.json({
    success: true,
    partner: req.apiPartner
      ? {
          id: req.apiPartner._id,
          businessName: req.apiPartner.businessName,
          businessEmail: req.apiPartner.businessEmail,
          contactName: req.apiPartner.contactName,
          isActive: req.apiPartner.isActive,
          rateLimitPerMinute: req.apiPartner.rateLimitPerMinute,
          lastUsedAt: req.apiPartner.lastUsedAt,
          createdAt: req.apiPartner.createdAt
        }
      : null
  });
});

export default router;