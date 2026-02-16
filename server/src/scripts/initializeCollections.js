require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

// Define schemas for collections
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  name: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const causeSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'completed', 'rejected'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
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
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const sponsorshipSchema = new mongoose.Schema({
  cause: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cause',
    required: true
  },
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  paymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  anonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const bagSchema = new mongoose.Schema({
  cause: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cause',
    required: true
  },
  design: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'waitlisted'],
    default: 'available'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimedAt: {
    type: Date
  },
  waitlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const storySchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cause: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cause',
    required: true
  },
  images: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
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
}, {
  timestamps: true
});

async function initializeCollections() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define models
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Cause = mongoose.models.Cause || mongoose.model('Cause', causeSchema);
    const Sponsorship = mongoose.models.Sponsorship || mongoose.model('Sponsorship', sponsorshipSchema);
    const Bag = mongoose.models.Bag || mongoose.model('Bag', bagSchema);
    const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

    // Create indexes for better query performance
    console.log('Creating indexes...');
    await User.createIndexes();
    await Cause.createIndexes();
    await Sponsorship.createIndexes();
    await Bag.createIndexes();
    await Story.createIndexes();

    console.log('Collections initialized successfully:');
    console.log('- Users');
    console.log('- Causes');
    console.log('- Sponsorships');
    console.log('- Bags');
    console.log('- Stories');

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing collections:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeCollections();
