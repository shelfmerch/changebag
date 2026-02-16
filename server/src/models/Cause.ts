import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User';
import { ISponsorship } from './Sponsorship';
import { IClaim } from './claims';

export enum CauseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  COMPLETED = 'completed',
  REJECTED = 'rejected'
}

export interface ICause extends Document {
  title: string;
  description: string;
  imageUrl: string;
  adminImageUrl?: string;
  totePreviewImageUrl?: string;
  images?: string[];
  targetAmount: number;
  currentAmount: number;
  creator: mongoose.Types.ObjectId | IUser;
  status: CauseStatus;
  startDate: Date;
  location?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  isOnline: boolean;
  sponsorships?: ISponsorship[];
  claims?: IClaim[];
  totalTotes?: number;
  claimedTotes?: number;
  availableTotes?: number;
  distributionStartDate?: Date;
  distributionEndDate?: Date;
  
  // Dynamic content fields
  story?: string;
  detailedDescription?: string;
  whyItMatters?: string;
  
  // Hero section
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  heroBackgroundColor?: string;
  
  // Impact section
  impactTitle?: string;
  impactSubtitle?: string;
  impactStats?: Array<{
    icon: string;
    value: string;
    label: string;
    description?: string;
  }>;
  
  // Progress section
  progressTitle?: string;
  progressSubtitle?: string;
  progressBackgroundImageUrl?: string;
  progressCards?: Array<{
    title: string;
    value: string;
    description: string;
    icon: string;
    additionalInfo?: string;
  }>;
  
  // FAQs
  faqs?: Array<{
    question: string;
    answer: string;
    category?: string;
  }>;
  
  // Call to action
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimaryButtonText?: string;
  ctaSecondaryButtonText?: string;
  
  // Theming
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  customCSS?: string;
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImageUrl?: string;
  
  // Additional content
  testimonials?: Array<{
    name: string;
    role: string;
    content: string;
    avatarUrl?: string;
  }>;
  
  gallery?: Array<{
    imageUrl: string;
    caption?: string;
    alt?: string;
  }>;
  
  partners?: Array<{
    name: string;
    logoUrl: string;
    website?: string;
  }>;
}

const causeSchema = new Schema<ICause>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    adminImageUrl: {
      type: String,
      default: ''
    },
    totePreviewImageUrl: {
      type: String,
      default: ''
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: Object.values(CauseStatus),
      default: CauseStatus.PENDING
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    location: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    isOnline: {
      type: Boolean,
      default: true
    },
    images: {
      type: [String],
      default: []
    },
    distributionStartDate: {
      type: Date
    },
    distributionEndDate: {
      type: Date
    },
    
    // Dynamic content fields
    story: {
      type: String,
      trim: true
    },
    detailedDescription: {
      type: String,
      trim: true
    },
    whyItMatters: {
      type: String,
      trim: true
    },
    
    // Hero section
    heroTitle: {
      type: String,
      trim: true
    },
    heroSubtitle: {
      type: String,
      trim: true
    },
    heroImageUrl: {
      type: String,
      default: ''
    },
    heroBackgroundColor: {
      type: String,
      default: ''
    },
    
    // Impact section
    impactTitle: {
      type: String,
      trim: true
    },
    impactSubtitle: {
      type: String,
      trim: true
    },
    impactStats: [{
      icon: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      description: {
        type: String
      }
    }],
    
    // Progress section
    progressTitle: {
      type: String,
      trim: true
    },
    progressSubtitle: {
      type: String,
      trim: true
    },
    progressBackgroundImageUrl: {
      type: String,
      default: ''
    },
    progressCards: [{
      title: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      icon: {
        type: String,
        required: true
      },
      additionalInfo: {
        type: String
      }
    }],
    
    // FAQs
    faqs: [{
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      },
      category: {
        type: String
      }
    }],
    
    // Call to action
    ctaTitle: {
      type: String,
      trim: true
    },
    ctaSubtitle: {
      type: String,
      trim: true
    },
    ctaPrimaryButtonText: {
      type: String,
      trim: true
    },
    ctaSecondaryButtonText: {
      type: String,
      trim: true
    },
    
    // Theming
    primaryColor: {
      type: String,
      default: ''
    },
    secondaryColor: {
      type: String,
      default: ''
    },
    accentColor: {
      type: String,
      default: ''
    },
    customCSS: {
      type: String
    },
    
    // SEO
    metaTitle: {
      type: String,
      trim: true
    },
    metaDescription: {
      type: String,
      trim: true
    },
    metaKeywords: [{
      type: String,
      trim: true
    }],
    ogImageUrl: {
      type: String,
      default: ''
    },
    
    // Additional content
    testimonials: [{
      name: {
        type: String,
        required: true
      },
      role: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      avatarUrl: {
        type: String,
        default: ''
      }
    }],
    
    gallery: [{
      imageUrl: {
        type: String,
        required: true
      },
      caption: {
        type: String
      },
      alt: {
        type: String
      }
    }],
    
    partners: [{
      name: {
        type: String,
        required: true
      },
      logoUrl: {
        type: String,
        required: true
      },
      website: {
        type: String
      }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for sponsorships
causeSchema.virtual('sponsorships', {
  ref: 'Sponsorship',
  localField: '_id',
  foreignField: 'cause'
});

// Virtual field for total totes (based on funding)
causeSchema.virtual('totalTotes').get(function() {
  // Calculate number of totes based on funding amount
  // Assuming each tote costs a fixed amount (e.g., $100)
  const totePrice = 100; // Set this to your actual tote price
  return Math.floor(this.currentAmount / totePrice);
});

// Create indexes for better query performance
causeSchema.index({ status: 1 });
causeSchema.index({ category: 1 });
causeSchema.index({ creator: 1 });

// No pre-find middleware needed for now

// Method to update current amount based on sponsorships
causeSchema.methods.updateCurrentAmount = async function() {
  const Sponsorship = mongoose.model('Sponsorship');
  
  // Find all approved sponsorships for this cause
  const sponsorships = await Sponsorship.find({
    cause: this._id,
    status: 'approved' // Only count approved sponsorships
  });
  
  // Calculate total amount from sponsorships
  const totalAmount = sponsorships.reduce((sum: number, sponsorship: any) => {
    return sum + (sponsorship.totalAmount || 0);
  }, 0);
  
  // Update the current amount
  this.currentAmount = totalAmount;
  
  // Save the updated cause
  return this.save();
};

// Static method to update current amount for a specific cause
causeSchema.statics.updateCauseAmount = async function(causeId) {
  const cause = await this.findById(causeId);
  if (cause) {
    return cause.updateCurrentAmount();
  }
  return null;
};

const Cause = mongoose.models.Cause || mongoose.model<ICause>('Cause', causeSchema);

export default Cause;
