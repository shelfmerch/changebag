require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

async function checkSponsorships() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the schemas inline since we can't import TypeScript files
    const sponsorshipSchema = new mongoose.Schema({
      cause: { type: mongoose.Schema.Types.ObjectId, ref: 'Cause' },
      organizationName: String,
      contactName: String,
      email: String,
      phone: String,
      toteQuantity: Number,
      unitPrice: Number,
      totalAmount: Number,
      logoUrl: String,
      status: String,
      createdAt: Date,
      updatedAt: Date
    });

    const userSchema = new mongoose.Schema({
      email: String,
      name: String,
      role: String,
      createdAt: Date,
      updatedAt: Date
    });

    const Sponsorship = mongoose.models.Sponsorship || mongoose.model('Sponsorship', sponsorshipSchema);
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Check for sponsorships with the specific email
    const email = 'shabahatsyed101@gmail.com';
    console.log(`Checking for sponsorships with email: ${email}`);
    
    const sponsorships = await Sponsorship.find({ email });
    
    console.log(`Found ${sponsorships.length} sponsorships for email: ${email}`);
    
    if (sponsorships.length > 0) {
      sponsorships.forEach((sponsorship, index) => {
        console.log(`Sponsorship ${index + 1}:`);
        console.log(`  ID: ${sponsorship._id}`);
        console.log(`  Status: ${sponsorship.status}`);
        console.log(`  Organization: ${sponsorship.organizationName}`);
        console.log(`  Cause: ${sponsorship.cause?.title || 'Unknown'}`);
        console.log(`  Tote Quantity: ${sponsorship.toteQuantity}`);
        console.log(`  Total Amount: ${sponsorship.totalAmount}`);
        console.log(`  Created: ${sponsorship.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('No sponsorships found for this email');
    }

    // Also check all sponsorships to see what's in the database
    const allSponsorships = await Sponsorship.find({});
    console.log(`\nTotal sponsorships in database: ${allSponsorships.length}`);
    
    if (allSponsorships.length > 0) {
      console.log('All sponsorships:');
      allSponsorships.forEach((sponsorship, index) => {
        console.log(`${index + 1}. Email: ${sponsorship.email}, Status: ${sponsorship.status}`);
      });
    }

    // Check if there are any users with this email
    const user = await User.findOne({ email });
    if (user) {
      console.log(`\nFound user with email ${email}:`, {
        id: user._id,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      });
    } else {
      console.log(`\nNo user found with email ${email}`);
    }

    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error checking sponsorships:', error);
    process.exit(1);
  }
}

// Run the function
checkSponsorships(); 