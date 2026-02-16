require('dotenv').config();
import mongoose from 'mongoose';
import ApiPartner from '../models/ApiPartner';

const MONGODB_URI = process.env.MONGODB_URI;

async function createTestPartner() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI || '');
    console.log('Connected to MongoDB');

    // Check if test partner already exists
    const existing = await ApiPartner.findOne({ businessName: 'Test Business' });
    if (existing) {
      console.log('\n✅ Test partner already exists:');
      console.log('Business Name:', existing.businessName);
      console.log('API Key:', existing.apiKey);
      console.log('Status:', existing.isActive ? 'Active' : 'Inactive');
      await mongoose.disconnect();
      return;
    }

    // Create test partner
    const partner = new ApiPartner({
      businessName: 'Test Business',
      businessEmail: 'test@example.com',
      contactName: 'Test Contact',
      isActive: true
    });

    await partner.save();

    console.log('\n✅ Test API Partner Created Successfully!');
    console.log('==========================================');
    console.log('Business Name:', partner.businessName);
    console.log('API Key:', partner.apiKey);
    console.log('Status: Active');
    console.log('\n💡 Use this API key to test the partner claims endpoint');
    console.log('==========================================\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test partner:', error);
    process.exit(1);
  }
}

createTestPartner();