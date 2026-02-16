require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

async function createSampleData() {
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

    // Get admin user (or create a regular user if admin doesn't exist)
    console.log('Finding or creating user...');
    let user = await User.findOne({ role: 'admin' });
    
    if (!user) {
      // Create a regular user if admin doesn't exist
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      
      user = new User({
        email: 'user@example.com',
        passwordHash,
        role: 'user',
        name: 'Sample User'
      });
      
      await user.save();
      console.log('Created sample user');
    }

    // Create a sample cause
    console.log('Creating sample cause...');
    const cause = new Cause({
      title: 'Sample Cause',
      description: 'This is a sample cause for testing purposes.',
      targetAmount: 1000,
      creator: user._id,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      category: 'Education',
      tags: ['sample', 'test', 'education']
    });
    
    await cause.save();
    console.log('Created sample cause');

    // Create a sample sponsorship
    console.log('Creating sample sponsorship...');
    const sponsorship = new Sponsorship({
      cause: cause._id,
      sponsor: user._id,
      amount: 100,
      paymentId: 'pay_' + Math.random().toString(36).substring(2, 15),
      status: 'completed',
      message: 'Good luck with your cause!'
    });
    
    await sponsorship.save();
    console.log('Created sample sponsorship');

    // Create a sample bag
    console.log('Creating sample bag...');
    const bag = new Bag({
      cause: cause._id,
      design: 'Standard Design',
      status: 'available'
    });
    
    await bag.save();
    console.log('Created sample bag');

    // Create a sample story
    console.log('Creating sample story...');
    const story = new Story({
      title: 'My Experience with this Cause',
      content: 'This is a sample story about my experience with this cause.',
      author: user._id,
      cause: cause._id
    });
    
    await story.save();
    console.log('Created sample story');

    console.log('All sample data created successfully!');
    console.log('Collections in the database:');
    console.log('- Users');
    console.log('- Causes');
    console.log('- Sponsorships');
    console.log('- Bags');
    console.log('- Stories');

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error creating sample data:', error);
    process.exit(1);
  }
}

// Run the function
createSampleData();
