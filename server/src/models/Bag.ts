import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ICause } from './Cause';

export enum BagStatus {
  AVAILABLE = 'available',
  CLAIMED = 'claimed',
  WAITLISTED = 'waitlisted'
}

export interface IBag extends Document {
  cause: mongoose.Types.ObjectId | ICause;
  design: string;
  status: BagStatus;
  claimedBy?: mongoose.Types.ObjectId | IUser;
  claimedAt?: Date;
  waitlist: Array<mongoose.Types.ObjectId | IUser>;
  createdAt: Date;
  updatedAt: Date;
}

const bagSchema = new Schema<IBag>(
  {
    cause: {
      type: Schema.Types.ObjectId,
      ref: 'Cause',
      required: true
    },
    design: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(BagStatus),
      default: BagStatus.AVAILABLE
    },
    claimedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    claimedAt: {
      type: Date
    },
    waitlist: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
bagSchema.index({ cause: 1 });
bagSchema.index({ status: 1 });
bagSchema.index({ claimedBy: 1 });

const Bag = mongoose.models.Bag || mongoose.model<IBag>('Bag', bagSchema);

export default Bag;
