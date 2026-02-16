import mongoose, { Document, Schema } from 'mongoose';

export interface IOTPVerification extends Document {
  email?: string;
  phone?: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
  type: 'email' | 'sms';
}

const otpVerificationSchema = new Schema<IOTPVerification>({
  email: {
    type: String,
    required: function() { return this.type === 'email'; },
  },
  phone: {
    type: String,
    required: function() { return this.type === 'sms'; },
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    enum: ['email', 'sms'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Document will be automatically deleted after 10 minutes
  },
});

export default mongoose.model<IOTPVerification>('OTPVerification', otpVerificationSchema);