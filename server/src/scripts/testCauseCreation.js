require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

// Define the Cause schema
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

// Define the User schema (simplified)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: String,
  role: String
}, { timestamps: true });

async function testCauseCreation() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define models
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Cause = mongoose.models.Cause || mongoose.model('Cause', causeSchema);

    // Find an existing user (preferably admin)
    const user = await User.findOne({ role: 'admin' });
    
    if (!user) {
      console.error('No admin user found. Please run seedAdmin.js first.');
      process.exit(1);
    }

    console.log('Found user:', user._id);

    // Create a test cause
    const testCause = new Cause({
      title: 'Test Cause ' + Date.now(),
      description: 'This is a test cause created directly via script',
      targetAmount: 1000,
      creator: user._id,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      category: 'Test',
      tags: ['test']
    });

    console.log('Saving test cause...');
    const savedCause = await testCause.save();
    console.log('Test cause saved successfully:', savedCause);

    // List all causes
    const allCauses = await Cause.find();
    console.log(`Total causes in database: ${allCauses.length}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error in test script:', error);
    process.exit(1);
  }
}

// Run the test
testCauseCreation();
