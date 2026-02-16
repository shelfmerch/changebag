const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

async function updateSponsorships() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the schemas inline since we can't import TypeScript files
    const sponsorshipSchema = new mongoose.Schema({
      sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

    // Find all sponsorships without a sponsor field
    const sponsorshipsWithoutSponsor = await Sponsorship.find({ sponsor: { $exists: false } });
    
    console.log(`Found ${sponsorshipsWithoutSponsor.length} sponsorships without sponsor field`);
    
    let updatedCount = 0;
    let skippedCount = 0;

    for (const sponsorship of sponsorshipsWithoutSponsor) {
      try {
        // Try to find a user with matching email
        const user = await User.findOne({ email: sponsorship.email });
        
        if (user) {
          // Update the sponsorship with the user's ID
          await Sponsorship.updateOne(
            { _id: sponsorship._id },
            { $set: { sponsor: user._id } }
          );
          console.log(`Updated sponsorship ${sponsorship._id} with sponsor ${user._id} (${user.email})`);
          updatedCount++;
        } else {
          console.log(`No user found for email: ${sponsorship.email}, skipping sponsorship ${sponsorship._id}`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`Error updating sponsorship ${sponsorship._id}:`, error);
        skippedCount++;
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Updated: ${updatedCount} sponsorships`);
    console.log(`- Skipped: ${skippedCount} sponsorships`);
    console.log(`- Total processed: ${sponsorshipsWithoutSponsor.length}`);

    // Verify the results
    const remainingWithoutSponsor = await Sponsorship.find({ sponsor: { $exists: false } });
    console.log(`\nRemaining sponsorships without sponsor field: ${remainingWithoutSponsor.length}`);

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
updateSponsorships(); 