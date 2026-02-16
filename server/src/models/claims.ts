import mongoose, { Document, Schema } from 'mongoose';

export enum ClaimStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum ClaimSource {
  DIRECT = 'direct',
  QR_CODE = 'qr',
  WAITLIST = 'waitlist',
  MAGIC_LINK = 'magic-link',
  SPONSOR_LINK = 'sponsor-link', 
  PARTNER_LINK = 'PARTNER_API'
}

export interface IClaim extends Document {
  causeId: mongoose.Types.ObjectId;
  causeTitle: string;
  fullName: string;
  email: string;
  phone: string;
  purpose: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: ClaimStatus;
  emailVerified: boolean;
  source: ClaimSource;
  referrerUrl?: string;
  qrCodeScanned: boolean;
  createdAt: Date;
  updatedAt: Date;
  shippingDate?: Date;
  deliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;

  partnerId?: mongoose.Types.ObjectId; // Add this
  partnerApiKey?: string; // Add this
  partnerBusinessName?: string; // Add this for quick reference
}

const claimSchema = new Schema<IClaim>(
  {
    causeId: {
      type: Schema.Types.ObjectId,
      ref: 'Cause',
      required: true
    },
    partnerId: {
      type: Schema.Types.ObjectId,
      ref: 'ApiPartner',
      required: false
    },
    partnerApiKey: {
      type: String,
      required: false
    },
    partnerBusinessName: {
      type: String,
      required: false
    },
    causeTitle: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ClaimStatus),
      default: ClaimStatus.PENDING
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    source: {
      type: String,
      enum: Object.values(ClaimSource),
      default: ClaimSource.DIRECT
    },
    referrerUrl: {
      type: String
    },
    qrCodeScanned: {
      type: Boolean,
      default: false
    },
    shippingDate: {
      type: Date
    },
    deliveryDate: {
      type: Date
    },
    trackingNumber: {
      type: String
    },
    carrier: {
      type: String
    },
    estimatedDelivery: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
claimSchema.index({ createdAt: -1 });
claimSchema.index({ status: 1 });
claimSchema.index({ causeId: 1 });
claimSchema.index({ email: 1 });
claimSchema.index({ source: 1 });
claimSchema.index({ qrCodeScanned: 1 });

export default mongoose.model<IClaim>('Claim', claimSchema);
