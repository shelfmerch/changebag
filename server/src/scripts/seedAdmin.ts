import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User, { UserRole } from '../models/User';
import connectToDatabase from '../lib/mongodb';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD as string;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Admin credentials not found in environment variables');
  process.exit(1);
}

/**
 * Seeds the admin user if it doesn't exist
 */
async function seedAdmin() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
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
        role: UserRole.ADMIN,
        name: 'Admin'
      });
      
      await admin.save();
      console.log('Admin user created successfully');
    }
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
    
    // Exit process
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

// Run the seeder
seedAdmin();

export default seedAdmin;
