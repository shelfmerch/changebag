import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ICause } from './Cause';

export interface IStory extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId | IUser;
  cause: mongoose.Types.ObjectId | ICause;
  images: string[];
  likes: Array<mongoose.Types.ObjectId | IUser>;
  comments: Array<{
    user: mongoose.Types.ObjectId | IUser;
    content: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cause: {
      type: Schema.Types.ObjectId,
      ref: 'Cause',
      required: true
    },
    images: [{
      type: String
    }],
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// Create indexes for better query performance
storySchema.index({ author: 1 });
storySchema.index({ cause: 1 });

const Story = mongoose.models.Story || mongoose.model<IStory>('Story', storySchema);

export default Story;
