import { Request, Response, NextFunction } from 'express';
import ApiPartner, { IApiPartner } from '../models/ApiPartner';

declare global {
  namespace Express {
    interface Request {
      apiPartner?: IApiPartner;
    }
  }
}

type RateState = {
  windowStartMs: number;
  count: number;
};

// Simple in-memory rate limiting per partner (good for single-instance deployments).
// If you run multiple instances, use a shared store (Redis) for consistent limits.
const RATE_WINDOW_MS = 60_000;
const rateStateByPartnerId = new Map<string, RateState>();

export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get API key from header or query parameter
    const apiKey = req.headers['x-api-key'] as string || 
                   req.headers['api-key'] as string ||
                   req.query.apiKey as string;

    if (!apiKey) {
      res.status(401).json({
        error: 'API key required',
        message: 'Please provide an API key in the X-API-Key header or apiKey query parameter'
      });
      return;
    }

    // Find partner by API key
    const partner = await ApiPartner.findOne({ 
      apiKey,
      isActive: true 
    });

    if (!partner) {
      res.status(401).json({
        error: 'Invalid API key',
        message: 'The provided API key is invalid or inactive'
      });
      return;
    }

    // Rate limiting
    const defaultLimit = parseInt(process.env.PARTNER_RATE_LIMIT_PER_MINUTE || '60', 10);
    const limitPerMinute = partner.rateLimitPerMinute || defaultLimit;
    const partnerId = partner._id.toString();
    const now = Date.now();

    const existing = rateStateByPartnerId.get(partnerId);
    const inWindow = existing && now - existing.windowStartMs < RATE_WINDOW_MS;
    const state: RateState = inWindow
      ? { windowStartMs: existing!.windowStartMs, count: existing!.count + 1 }
      : { windowStartMs: now, count: 1 };

    rateStateByPartnerId.set(partnerId, state);

    if (state.count > limitPerMinute) {
      const retryAfterSeconds = Math.max(1, Math.ceil((RATE_WINDOW_MS - (now - state.windowStartMs)) / 1000));
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Limit is ${limitPerMinute} requests per minute.`,
        retryAfterSeconds
      });
      return;
    }

    // Update last used timestamp
    partner.lastUsedAt = new Date();
    await partner.save();

    // Attach partner to request
    req.apiPartner = partner;
    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during API key validation'
    });
  }
};