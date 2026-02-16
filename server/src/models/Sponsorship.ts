import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ICause } from './Cause';

export enum SponsorshipStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum DistributionType {
  ONLINE = 'online',
  PHYSICAL = 'physical'
}

interface ILogoPosition {
  x: number;
  y: number;
  scale: number;
  angle: number;
}

interface IDistributionLocation {
  name: string;
  address: string;
  contactPerson: string;
  phone: string;
  location?: string;
  totesCount?: number;
}

interface IDemographics {
  ageGroups: string[];
  income: string;
  education: string;
  other: string;
}

export interface ISponsorship extends Document {
  sponsor?: mongoose.Types.ObjectId | IUser;
  cause: mongoose.Types.ObjectId | ICause;
  selectedCause?: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  toteQuantity: number;
  numberOfTotes?: number;
  unitPrice: number;
  totalAmount: number;
  logoUrl: string;
  mockupUrl?: string;
  qrCodeUrl?: string; // Add QR code URL field
  message: string;
  distributionType: DistributionType;
  selectedCities: string[];
  distributionStartDate: Date;
  distributionEndDate: Date;
  distributionLocations: IDistributionLocation[];
  demographics: IDemographics;
  logoPosition: ILogoPosition;
  status: SponsorshipStatus;
  approvedBy?: mongoose.Types.ObjectId | IUser;
  approvedAt?: Date;
  rejectionReason?: string;
  isOnline?: boolean;
  endedAt?: Date;
  endedBy?: mongoose.Types.ObjectId | IUser;
  // Payment fields
  paymentId?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  paymentOrderId?: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sponsorshipSchema = new Schema<ISponsorship>(
  {
    sponsor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    cause: {
      type: Schema.Types.ObjectId,
      ref: 'Cause',
      required: true
    },
    selectedCause: {
      type: String,
      required: false
    },
    organizationName: {
      type: String,
      required: true
    },
    contactName: {
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
    toteQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    numberOfTotes: {
      type: Number,
      required: false,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    logoUrl: {
      type: String,
      required: true
    },
    mockupUrl: {
      type: String
    },
    qrCodeUrl: {
      type: String,
      required: false
    },
    message: {
      type: String,
      default: ''
    },
    distributionType: {
      type: String,
      enum: Object.values(DistributionType),
      required: true
    },
    selectedCities: [{
      type: String,
      required: true
    }],
    distributionStartDate: {
      type: Date,
      required: true
    },
    distributionEndDate: {
      type: Date,
      required: true
    },
    distributionLocations: [{
      name: { type: String, required: true },
      address: { type: String, required: true },
      contactPerson: { type: String, required: true },
      phone: { type: String, required: true },
      location: { type: String, required: false },
      totesCount: { type: Number, required: false }
    }],
    demographics: {
      ageGroups: [String],
      income: String,
      education: String,
      other: String
    },
    logoPosition: {
      x: { type: Number, required: false, default: 0 },
      y: { type: Number, required: false, default: 0 },
      scale: { type: Number, required: false, default: 1 },
      angle: { type: Number, required: false, default: 0 }
    },
    status: {
      type: String,
      enum: Object.values(SponsorshipStatus),
      default: SponsorshipStatus.PENDING
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    isOnline: Boolean,
    endedAt: Date,
    endedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    // Payment fields
    paymentId: {
      type: String,
      required: false
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    paymentOrderId: {
      type: String,
      required: false
    },
    paymentAmount: {
      type: Number,
      required: false
    },
    paymentCurrency: {
      type: String,
      required: false,
      default: 'INR'
    },
    paymentDate: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
sponsorshipSchema.index({ sponsor: 1 });
sponsorshipSchema.index({ cause: 1 });
sponsorshipSchema.index({ status: 1 });
sponsorshipSchema.index({ organizationName: 1 });
sponsorshipSchema.index({ email: 1 });
sponsorshipSchema.index({ createdAt: 1 });

// Calculate totalAmount before saving
sponsorshipSchema.pre('save', function(next) {
  if (!this.totalAmount && this.toteQuantity && this.unitPrice) {
    this.totalAmount = this.toteQuantity * this.unitPrice;
  }
  next();
});

// Update cause's currentAmount after sponsorship is saved
sponsorshipSchema.post('save', async function() {
  try {
    const Cause = mongoose.model('Cause');
    if (this.cause) {
      await Cause.updateCauseAmount(this.cause);
    }
  } catch (error) {
    console.error('Error updating cause amount:', error);
  }
});

// Update cause's currentAmount after sponsorship is updated
sponsorshipSchema.post('findOneAndUpdate', async function(doc) {
  try {
    if (doc && doc.cause) {
      const Cause = mongoose.model('Cause');
      await Cause.updateCauseAmount(doc.cause);
    }
  } catch (error) {
    console.error('Error updating cause amount after update:', error);
  }
});

// Update cause's currentAmount after sponsorship is removed
sponsorshipSchema.post('findOneAndDelete', async function(doc) {
  try {
    if (doc && doc.cause) {
      const Cause = mongoose.model('Cause');
      await Cause.updateCauseAmount(doc.cause);
    }
  } catch (error) {
    console.error('Error updating cause amount after removal:', error);
  }
});

const Sponsorship = mongoose.models.Sponsorship || mongoose.model<ISponsorship>('Sponsorship', sponsorshipSchema);

export default Sponsorship;
