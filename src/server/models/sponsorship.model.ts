import mongoose from 'mongoose';

const sponsorshipSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  causeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cause', required: true },
  logoUrl: { type: String, required: true },
  message: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
}, {
  timestamps: true
});

// removed: distributionPoints, physicalDistributionDetails, distributionLocations fields

export const Sponsorship = mongoose.model('Sponsorship', sponsorshipSchema);
