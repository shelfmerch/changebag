// Simple JavaScript version of the seed script for immediate use
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Define a simple User schema for the script
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

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('Checking if admin user exists...');
    const adminExists = await User.findOne({ email: ADMIN_EMAIL });
    
    if (adminExists) {
      console.log('Admin user already exists');
    } else {
      console.log('Creating admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);
      
      // Create admin user
      const admin = new User({
        email: ADMIN_EMAIL,
        passwordHash,
        role: 'admin',
        name: 'Admin'
      });
      
      await admin.save();
      console.log('Admin user created successfully');
    }
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
    
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

// Run the seeder
seedAdmin();
