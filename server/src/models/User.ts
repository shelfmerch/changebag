import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  SPONSOR = 'sponsor',
  CLAIMER = 'claimer'
}

export interface IUser extends Document {
  email?: string;
  passwordHash?: string;
  role: UserRole;
  name?: string;
  phone?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER
  },
  name: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index is already created by the 'unique: true' property in the email field

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
