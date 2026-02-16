import mongoose, { Document, Schema } from 'mongoose';

export enum WaitlistStatus {
  WAITING = 'waiting',
  NOTIFIED = 'notified',
  CLAIMED = 'claimed',
  EXPIRED = 'expired'
}

export interface IWaitlist extends Document {
  causeId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  message?: string;
  notifyEmail: boolean;
  notifySms: boolean;
  position: number;
  status: WaitlistStatus;
  magicLinkToken?: string;
  magicLinkSentAt?: Date;
  magicLinkExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const waitlistSchema = new Schema(
  {
    causeId: {
      type: Schema.Types.ObjectId,
      ref: 'Cause',
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    notifyEmail: {
      type: Boolean,
      default: true
    },
    notifySms: {
      type: Boolean,
      default: false
    },
    position: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(WaitlistStatus),
      default: WaitlistStatus.WAITING
    },
    magicLinkToken: {
      type: String,
      required: false
    },
    magicLinkSentAt: {
      type: Date,
      required: false
    },
    magicLinkExpires: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
waitlistSchema.index({ causeId: 1 });
waitlistSchema.index({ email: 1 });
waitlistSchema.index({ status: 1 });
waitlistSchema.index({ createdAt: 1 });

// Static method to get the next position for a cause
waitlistSchema.statics.getNextPosition = async function(causeId: string): Promise<number> {
  const lastEntry = await this.findOne({ causeId }).sort({ position: -1 });
  return lastEntry ? lastEntry.position + 1 : 1;
};

// Static method to get waitlist count for a cause
waitlistSchema.statics.getWaitlistCount = async function(causeId: string): Promise<number> {
  return await this.countDocuments({ 
    causeId, 
    status: { $in: [WaitlistStatus.WAITING, WaitlistStatus.NOTIFIED] }
  });
};

const Waitlist = mongoose.models.Waitlist || mongoose.model('Waitlist', waitlistSchema);

export default Waitlist; 