import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Claim, { ClaimStatus, ClaimSource } from '../models/claims';

// Create a new claim
export const createClaim = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      causeId,
      causeTitle,
      fullName,
      email,
      phone,
      purpose,
      address,
      city,
      state,
      zipCode,
      emailVerified = false,
      source = ClaimSource.DIRECT,
      referrerUrl,
      qrCodeScanned = false,
      status
    } = req.body;

    // Check if user has already claimed a tote for this cause
    const existingClaim = await Claim.findOne({
      email: email,
      causeId: causeId
    });
    
    if (existingClaim) {
      res.status(400).json({
        message: 'You have already claimed a tote for this cause. Each user can claim only one tote per cause.'
      });
      return;
    }
    
    // Check if there are available totes for this cause
    const Cause = mongoose.model('Cause');
    const cause = await Cause.findById(causeId);
    
    if (!cause) {
      res.status(404).json({ message: 'Cause not found' });
      return;
    }
    
    if (cause.availableTotes <= 0) {
      res.status(400).json({ message: 'No totes available for this cause' });
      return;
    }

        // Determine source and partner info if coming from API partner
        let claimSource = source;
        let partnerId = undefined;
        let partnerApiKey = undefined;
        let partnerBusinessName = undefined;

        // Check if request is from an API partner
    if (req.apiPartner) {
      claimSource = ClaimSource.PARTNER_LINK;
      partnerId = req.apiPartner._id;
      partnerApiKey = req.apiPartner.apiKey;
      partnerBusinessName = req.apiPartner.businessName;
    }


    
    // For QR code claims, start with PENDING status and verify after OTP
    // For regular claims, use PENDING status
    const initialStatus = ClaimStatus.PENDING;
    
    // Create the claim
    const claim = new Claim({
      causeId,
      causeTitle,
      fullName,
      email,
      phone,
      purpose,
      address,
      city,
      state,
      zipCode,
      status: initialStatus,
      emailVerified: false, // Will be verified after OTP for QR claims
      source: claimSource,
      referrerUrl: referrerUrl || (req.apiPartner ? req.apiPartner.businessName : undefined),
      qrCodeScanned,
      partnerId,
      partnerApiKey,
      partnerBusinessName
    });

    await claim.save();
    
    // Update the cause's available totes count
    await Cause.findByIdAndUpdate(causeId, {
      $inc: { claimedTotes: 1, availableTotes: -1 }
    });
    
    res.status(201).json(claim);
  } catch (error) {
    console.error('Error creating claim:', error);
    res.status(500).json({ message: 'Error creating claim', error: error.message });
  }
};

// Get recent claims for admin dashboard
export const getRecentClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const claims = await Claim.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('causeId', 'title')
      .select('causeId causeTitle fullName email phone purpose address city state zipCode status emailVerified source referrerUrl qrCodeScanned createdAt updatedAt shippingDate deliveryDate');

    const total = await Claim.countDocuments();

    res.status(200).json({
      claims,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recent claims:', error);
    res.status(500).json({ message: 'Error fetching recent claims', error: error.message });
  }
};

// Get claim by ID
export const getClaimById = async (req: Request, res: Response): Promise<void> => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }
    res.status(200).json(claim);
  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ message: 'Error fetching claim' });
  }
};

// Update claim status
export const updateClaimStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    claim.status = status;
    
    // Update shipping or delivery date based on status
    if (status === ClaimStatus.SHIPPED) {
      claim.shippingDate = new Date();
    } else if (status === ClaimStatus.DELIVERED) {
      claim.deliveryDate = new Date();
    }

    await claim.save();
    res.status(200).json(claim);
  } catch (error) {
    console.error('Error updating claim status:', error);
    res.status(500).json({ message: 'Error updating claim status' });
  }
};

// Check if a user has already claimed a tote for a specific cause
export const checkExistingClaim = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, causeId } = req.query;
    
    if (!email || !causeId) {
      res.status(400).json({ message: 'Email and causeId are required' });
      return;
    }
    
    const existingClaim = await Claim.findOne({
      email: email as string,
      causeId: causeId as string
    });
    
    res.status(200).json({
      exists: !!existingClaim,
      message: existingClaim ? 'User has already claimed a tote for this cause' : 'No existing claim found'
    });
  } catch (error) {
    console.error('Error checking existing claim:', error);
    res.status(500).json({ message: 'Error checking existing claim' });
  }
};

// Get claims statistics
export const getClaimsStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Claim.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Claim.countDocuments();
    const today = await Claim.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    res.status(200).json({
      byStatus: stats,
      total,
      today
    });
  } catch (error) {
    console.error('Error fetching claims statistics:', error);
    res.status(500).json({ message: 'Error fetching claims statistics' });
  }
};

// Get claimer dashboard data
export const getClaimerDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching claimer dashboard data for user:', req.user?._id);
    
    // Step 1: Fetch causes created by the logged-in user (claimer)
    const Cause = mongoose.model('Cause');
    const myCauses = await Cause.find({ creator: req.user?._id })
      .sort({ createdAt: -1 });
    
    // Step 2: Fetch claimed totes made by this user
    const claimedTotes = await Claim.find({ email: req.user?.email })
      .sort({ createdAt: -1 })
      .populate('causeId', 'title imageUrl'); // for contextual display
    
    console.log('Found causes for user:', myCauses.length);
    console.log('Found claims for user:', claimedTotes.length);
    
    // Step 3: Return JSON response
    res.json({
      myCauses,
      claimedTotes
    });
  } catch (error) {
    console.error('Error fetching claimer dashboard data:', error);
    res.status(500).json({ message: 'Error fetching claimer dashboard data' });
  }
};

// Get verified claims for sponsored causes
export const getVerifiedClaimsForSponsoredCauses = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== getVerifiedClaimsForSponsoredCauses START ===');
    console.log('Fetching verified claims for sponsored causes, user:', req.user?._id, 'email:', req.user?.email);
    
    if (!req.user) {
      console.log('No user found in request');
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    // Step 1: Get all causes that the current user has sponsored
    // Check both by user ID and by email (since some sponsorships might have null sponsor field)
    const Sponsorship = mongoose.model('Sponsorship');
    console.log('Looking for sponsorships with user ID:', req.user._id, 'or email:', req.user.email);
    
    const sponsoredCauses = await Sponsorship.find({ 
      $or: [
        { sponsor: req.user._id },
        { email: req.user.email }
      ],
      status: 'approved' // Only approved sponsorships
    }).select('cause');
    
    console.log('Found sponsored causes:', sponsoredCauses.length);
    console.log('Sponsored causes data:', sponsoredCauses);
    
    if (sponsoredCauses.length === 0) {
      console.log('No sponsored causes found for user');
      res.json([]);
      return;
    }
    
    // Extract cause IDs from sponsorships
    const causeIds = sponsoredCauses.map(sponsorship => sponsorship.cause).filter(Boolean);
    console.log('Sponsored cause IDs:', causeIds);
    
    if (causeIds.length === 0) {
      console.log('No valid cause IDs found');
      res.json([]);
      return;
    }
    
    // Step 2: Get all verified claims for these causes (only status 'verified')
    const Claim = mongoose.model('Claim');
    console.log('Looking for claims with cause IDs:', causeIds, 'and status: verified');
    
    const verifiedClaims = await Claim.find({
      causeId: { $in: causeIds },
      status: 'verified' // Only verified status
    })
    .populate('causeId', 'title imageUrl category')
    .sort({ createdAt: -1 })
    .select('causeId causeTitle fullName email phone purpose address city state zipCode status emailVerified source referrerUrl qrCodeScanned createdAt updatedAt shippingDate deliveryDate');
    
    console.log('Found verified claims:', verifiedClaims.length);
    console.log('Verified claims data:', verifiedClaims);
    
    // Step 3: Group claims by cause for better organization
    const claimsByCause = verifiedClaims.reduce((acc, claim) => {
      // Skip claims with null causeId
      if (!claim.causeId || !claim.causeId._id) {
        console.log('Skipping claim with null causeId:', claim._id);
        return acc;
      }
      
      const causeId = claim.causeId._id.toString();
      if (!acc[causeId]) {
        acc[causeId] = {
          cause: claim.causeId,
          claims: []
        };
      }
      acc[causeId].claims.push(claim);
      return acc;
    }, {});
    
    // Convert to array format
    const result = Object.values(claimsByCause).map((group: any) => ({
      causeId: group.cause._id,
      causeTitle: group.cause.title,
      causeImageUrl: group.cause.imageUrl,
      causeCategory: group.cause.category,
      totalClaims: group.claims.length,
      claims: group.claims
    }));
    
    console.log('=== getVerifiedClaimsForSponsoredCauses SUCCESS ===');
    console.log('Final result:', result);
    res.json(result);
  } catch (error) {
    console.error('=== getVerifiedClaimsForSponsoredCauses ERROR ===');
    console.error('Error fetching verified claims for sponsored causes:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    res.status(500).json({ 
      message: 'Error fetching verified claims for sponsored causes',
      error: error.message,
      stack: error.stack
    });
  }
};

// Get claims by source
export const getClaimsBySource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { source } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const claims = await Claim.find({ source })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('causeId', 'title')
      .select('causeId causeTitle fullName email phone purpose address city state zipCode status emailVerified source referrerUrl qrCodeScanned createdAt updatedAt shippingDate deliveryDate');

    const total = await Claim.countDocuments({ source });

    res.status(200).json({
      claims,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching claims by source:', error);
    res.status(500).json({ message: 'Error fetching claims by source', error: error.message });
  }
};

// Get QR code claims specifically
export const getQrCodeClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const claims = await Claim.find({ 
      $or: [
        { source: ClaimSource.QR_CODE },
        { qrCodeScanned: true }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('causeId', 'title')
      .select('causeId causeTitle fullName email phone purpose address city state zipCode status emailVerified source referrerUrl qrCodeScanned createdAt updatedAt shippingDate deliveryDate');

    const total = await Claim.countDocuments({ 
      $or: [
        { source: ClaimSource.QR_CODE },
        { qrCodeScanned: true }
      ]
    });

    res.status(200).json({
      claims,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching QR code claims:', error);
    res.status(500).json({ message: 'Error fetching QR code claims', error: error.message });
  }
};

// Get claims statistics by source
export const getClaimsStatsBySource = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await Claim.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          verified: {
            $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
          },
          shipped: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    const qrCodeStats = await Claim.aggregate([
      {
        $match: { qrCodeScanned: true }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          verified: {
            $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] }
          },
          shipped: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      bySource: stats,
      qrCodeStats: qrCodeStats[0] || { total: 0, verified: 0, shipped: 0, delivered: 0 }
    });
  } catch (error) {
    console.error('Error fetching claims statistics by source:', error);
    res.status(500).json({ message: 'Error fetching claims statistics by source' });
  }
};

// Verify QR code claim after OTP verification
export const verifyQrCodeClaim = async (req: Request, res: Response): Promise<void> => {
  try {
    const { claimId } = req.params;
    
    if (!claimId) {
      res.status(400).json({ message: 'Claim ID is required' });
      return;
    }

    const claim = await Claim.findById(claimId);
    
    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    // Check if this is a QR code claim
    if (claim.source !== ClaimSource.QR_CODE && !claim.qrCodeScanned) {
      res.status(400).json({ message: 'This claim is not a QR code claim' });
      return;
    }

    // Update claim status to verified
    claim.status = ClaimStatus.VERIFIED;
    claim.emailVerified = true; // Mark as verified since OTP was successful
    claim.updatedAt = new Date();

    await claim.save();

    res.status(200).json({
      message: 'QR code claim verified successfully',
      claim: {
        _id: claim._id,
        status: claim.status,
        emailVerified: claim.emailVerified,
        source: claim.source,
        qrCodeScanned: claim.qrCodeScanned
      }
    });
  } catch (error) {
    console.error('Error verifying QR code claim:', error);
    res.status(500).json({ message: 'Error verifying QR code claim', error: error.message });
  }
};

// Get direct claims (claims made via "claim a tote" button)
export const getDirectClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const claims = await Claim.find({ source: ClaimSource.DIRECT })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('causeId', 'title')
      .select('causeId causeTitle fullName email phone purpose address city state zipCode status emailVerified source referrerUrl qrCodeScanned createdAt updatedAt shippingDate deliveryDate');

    const total = await Claim.countDocuments({ source: ClaimSource.DIRECT });

    res.status(200).json({
      claims,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching direct claims:', error);
    res.status(500).json({ message: 'Error fetching direct claims', error: error.message });
  }
};

// Get verified direct claims for shipping management
export const getVerifiedDirectClaims = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const claims = await Claim.find({ 
      source: ClaimSource.DIRECT,
      status: ClaimStatus.VERIFIED
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('causeId', 'title')
      .select('causeId causeTitle fullName email phone purpose address city state zipCode status emailVerified source referrerUrl qrCodeScanned createdAt updatedAt shippingDate deliveryDate trackingNumber carrier estimatedDelivery');

    const total = await Claim.countDocuments({ 
      source: ClaimSource.DIRECT,
      status: ClaimStatus.VERIFIED
    });

    res.status(200).json({
      claims,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching verified direct claims:', error);
    res.status(500).json({ message: 'Error fetching verified direct claims', error: error.message });
  }
};