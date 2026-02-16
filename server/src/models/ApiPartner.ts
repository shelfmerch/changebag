import mongoose, { Document, Schema } from 'mongoose';
import crypto from 'crypto';

export interface IApiPartner extends Document {
  businessName: string;
  businessEmail: string;
  contactName: string;
  apiKey: string;
  isActive: boolean;
  /**
   * Per-partner rate limit (requests/min). Enforced in `authenticateApiKey`.
   * If undefined, middleware uses `PARTNER_RATE_LIMIT_PER_MINUTE` (default 60).
   */
  rateLimitPerMinute?: number;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

const apiPartnerSchema = new Schema<IApiPartner>(
  {
    businessName: {
      type: String,
      required: true,
      unique: true
    },
    businessEmail: {
      type: String,
      required: true
    },
    contactName: {
      type: String,
      required: true
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
      default: () => `cb_${crypto.randomBytes(16).toString('hex')}`
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rateLimitPerMinute: {
      type: Number,
      min: 1,
      default: 60
    },
    lastUsedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
apiPartnerSchema.index({ apiKey: 1 });
apiPartnerSchema.index({ isActive: 1 });
apiPartnerSchema.index({ businessEmail: 1 });

export default mongoose.model<IApiPartner>('ApiPartner', apiPartnerSchema);