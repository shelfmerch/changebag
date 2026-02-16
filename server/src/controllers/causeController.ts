import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Cause, { CauseStatus } from '../models/Cause';

// Get all causes
export const getAllCauses = async (req: Request, res: Response) => {
  try {
    const { category, search, include, status, isOnline } = req.query;
    
    // Build the aggregation pipeline
    const pipeline = [];
    
    // First stage: Lookup sponsorships
    pipeline.push({
      $lookup: {
        from: 'sponsorships',
        localField: '_id',
        foreignField: 'cause',
        as: 'sponsorships'
      }
    });
    
    // Add filter for approved sponsorships
    pipeline.push({
      $addFields: {
        hasApprovedSponsorship: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: '$sponsorships',
                  as: 'sponsorship',
                  cond: { $eq: ['$$sponsorship.status', 'approved'] }
                }
              }
            },
            0
          ]
        }
      }
    });
    
    // Match stage for filtering
    const matchStage: any = {};
    
    // Filter by status if provided
    if (status) {
      matchStage.status = status;
    }
    
    // Filter by isOnline if provided
    if (isOnline !== undefined) {
      matchStage.isOnline = isOnline === 'true';
    }
    
    // Filter by category if provided
    if (category) {
      matchStage.category = category;
    }
    
    // Search in title or description if search term provided
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add match stage if there are any filters
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    // Add creator lookup
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator'
      }
    });

    // Unwind creator array to object
    pipeline.push({
      $unwind: {
        path: '$creator',
        preserveNullAndEmptyArrays: true
      }
    });
    
    // Project stage to shape the output
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        imageUrl: 1,
        targetAmount: 1,
        currentAmount: 1,
        category: 1,
        status: 1,
        location: 1,
        createdAt: 1,
        updatedAt: 1,
        isOnline: 1,
        hasApprovedSponsorship: 1,
        'creator._id': 1,
        'creator.name': 1,
        'creator.email': 1,
        sponsorships: {
          $map: {
            input: '$sponsorships',
            as: 'sponsorship',
            in: {
              _id: '$$sponsorship._id',
              status: '$$sponsorship.status',
              organizationName: '$$sponsorship.organizationName',
              toteQuantity: '$$sponsorship.toteQuantity',
              totalAmount: '$$sponsorship.totalAmount',
              createdAt: '$$sponsorship.createdAt',
              updatedAt: '$$sponsorship.updatedAt'
            }
          }
        }
      }
    });
    
    // Sort by creation date
    pipeline.push({ $sort: { createdAt: -1 } });
    
    console.log('Executing aggregation pipeline:', JSON.stringify(pipeline, null, 2));
    console.log('Query parameters:', { category, search, include, status, isOnline });
    
    const causes = await Cause.aggregate(pipeline);
    
    console.log(`Found ${causes.length} causes`);
    
    res.json(causes);
  } catch (error) {
    console.error('Error fetching causes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single cause by ID
export const getCauseById = async (req: Request, res: Response) => {
  try {
    const { include } = req.query;
    
    let causeQuery = Cause.findById(req.params.id)
      .populate('creator', 'name email');
    
    // Always include sponsorships for single cause view with toteQuantity
    causeQuery = causeQuery.populate({
      path: 'sponsorships',
      select: '_id status amount toteQuantity createdAt'
    });
    
    const cause = await causeQuery;
    
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }
    
    // Get total totes from approved sponsorships
    const approvedSponsorships = cause.sponsorships?.filter((s: { status: string }) => s.status === 'approved') || [];
    const totalTotes = approvedSponsorships.reduce((total: number, sponsorship: { toteQuantity?: number }) => {
      return total + (sponsorship.toteQuantity || 0);
    }, 0);
    
    // Count claimed totes from the database - only count verified, shipped, or delivered claims
    const Claim = mongoose.model('Claim');
    const claimedTotesCount = await Claim.countDocuments({ 
      causeId: cause._id,
      status: { $in: ['verified', 'shipped', 'delivered'] }
    });
    
    const claimedTotes = claimedTotesCount || 0;
    const availableTotes = Math.max(0, totalTotes - claimedTotes);
    
    // Add tote information to response
    const causeWithTotes = {
      ...cause.toObject(),
      totalTotes,
      claimedTotes,
      availableTotes,
      // Include all dynamic content fields
      heroTitle: cause.heroTitle,
      heroSubtitle: cause.heroSubtitle,
      heroImageUrl: cause.heroImageUrl,
      heroBackgroundColor: cause.heroBackgroundColor,
      impactTitle: cause.impactTitle,
      impactSubtitle: cause.impactSubtitle,
      impactStats: cause.impactStats,
      progressTitle: cause.progressTitle,
      progressSubtitle: cause.progressSubtitle,
      progressBackgroundImageUrl: cause.progressBackgroundImageUrl,
      progressCards: cause.progressCards,
      faqs: cause.faqs,
      ctaTitle: cause.ctaTitle,
      ctaSubtitle: cause.ctaSubtitle,
      ctaPrimaryButtonText: cause.ctaPrimaryButtonText,
      ctaSecondaryButtonText: cause.ctaSecondaryButtonText,
      primaryColor: cause.primaryColor,
      secondaryColor: cause.secondaryColor,
      accentColor: cause.accentColor,
      customCSS: cause.customCSS,
      metaTitle: cause.metaTitle,
      metaDescription: cause.metaDescription,
      metaKeywords: cause.metaKeywords,
      ogImageUrl: cause.ogImageUrl,
      testimonials: cause.testimonials,
      gallery: cause.gallery,
      partners: cause.partners,
    };
    
    console.log('Returning cause with dynamic content:', causeWithTotes);
    console.log('Hero title:', causeWithTotes.heroTitle);
    console.log('Impact stats:', causeWithTotes.impactStats);
    console.log('Progress cards:', causeWithTotes.progressCards);
    console.log('FAQs:', causeWithTotes.faqs);
    res.json(causeWithTotes);
  } catch (error) {
    console.error('Error fetching cause:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new cause
export const createCause = async (req: Request, res: Response) => {
  try {
    console.log('Creating cause with request body:', req.body);
    console.log('User from request:', req.user);
    console.log('Headers:', req.headers);
    console.log('File:', req.file); // Log uploaded file info
    
    const { 
      title, 
      description, 
      imageUrl, 
      targetAmount, 
      location, 
      category 
    } = req.body;
    
    console.log('Parsed request data:', { 
      title, 
      description, 
      imageUrl, 
      targetAmount, 
      location, 
      category 
    });
    
    // Validate required fields
    if (!title || !description || !targetAmount || !category) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({ 
        message: 'Please provide title, description, target amount, and category' 
      });
    }
    
    // Get authenticated user from request (set by authGuard middleware)
    if (!req.user || !req.user._id) {
      console.error('No authenticated user found in request');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const creatorId = req.user._id;
    const userRole = req.user.role;
    
    console.log('Creator ID:', creatorId);
    console.log('User role:', userRole);
    
    // Determine cause status based on user role
    let initialStatus = CauseStatus.PENDING; // Default status is pending
    
    // If creator is admin, automatically approve the cause
    if (userRole === 'admin') {
      initialStatus = CauseStatus.APPROVED;
      console.log('Creator is admin, setting cause status to APPROVED');
    } else {
      console.log('Creator is not admin, setting cause status to PENDING');
    }
    
    // Parse targetAmount as a number if it's a string
    let parsedTargetAmount = targetAmount;
    if (typeof targetAmount === 'string') {
      parsedTargetAmount = parseFloat(targetAmount);
    }
    
    // Determine the image URL
    let finalImageUrl = '';
    
    // If a file was uploaded, use its path
    if (req.file) {
      // Create a relative URL to the uploaded file
      finalImageUrl = `/uploads/${req.file.filename}`;
      console.log('Using uploaded image:', finalImageUrl);
    } else if (imageUrl) {
      // If no file but URL provided, use the URL
      finalImageUrl = imageUrl;
      console.log('Using provided image URL:', finalImageUrl);
    }
    
    // Create new cause with proper data types
    const causeData = {
      title,
      description,
      imageUrl: finalImageUrl,
      targetAmount: parsedTargetAmount,
      creator: creatorId,
      location: location || '',
      category,
      status: initialStatus // Set status based on user role
    };
    
    console.log('Creating cause with data:', causeData);
    
    try {
      const newCause = new Cause(causeData);
      console.log('New cause instance created');
      
      const savedCause = await newCause.save();
      console.log('Cause saved successfully with ID:', savedCause._id);
      
      return res.status(201).json({
        message: 'Cause created successfully',
        cause: savedCause
      });
    } catch (saveError: any) {
      console.error('Error saving cause to database:', saveError);
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: saveError.errors 
        });
      }
      throw saveError; // Re-throw to be caught by the outer catch block
    }
  } catch (error: any) {
    console.error('Error creating cause:', error);
    return res.status(500).json({ 
      message: 'Server error', 
      error: error.message || 'Unknown error' 
    });
  }
};

// Update a cause
export const updateCause = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      imageUrl, 
      targetAmount, 
      status,
      location, 
      category,
      distributionStartDate,
      distributionEndDate,
      isOnline
    } = req.body;
    
    const cause = await Cause.findById(req.params.id);
    
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }
    
    // Get user ID from request
    const userId = req.user && typeof req.user === 'object' && '_id' in req.user ? req.user._id : null;
    const userRole = req.user && typeof req.user === 'object' && 'role' in req.user ? req.user.role : null;
    
    // Check if user is the creator or an admin
    if ((!userId || cause.creator.toString() !== userId.toString()) && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this cause' });
    }
    
    // Update fields
    if (title) cause.title = title;
    if (description) cause.description = description;
    if (imageUrl) cause.imageUrl = imageUrl;
    if (targetAmount) cause.targetAmount = targetAmount;
    if (status && req.user?.role === 'admin') cause.status = status as CauseStatus;
    if (location) cause.location = location;
    if (category) cause.category = category;
    if (distributionStartDate) cause.distributionStartDate = new Date(distributionStartDate);
    if (distributionEndDate) cause.distributionEndDate = new Date(distributionEndDate);
    if (typeof isOnline === 'boolean') cause.isOnline = isOnline;
    
    await cause.save();
    
    res.json({
      message: 'Cause updated successfully',
      cause
    });
  } catch (error) {
    console.error('Error updating cause:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a cause
export const deleteCause = async (req: Request, res: Response) => {
  try {
    const cause = await Cause.findById(req.params.id);
    
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }
    
    // Get user ID from request
    const userId = req.user && typeof req.user === 'object' && '_id' in req.user ? req.user._id : null;
    const userRole = req.user && typeof req.user === 'object' && 'role' in req.user ? req.user.role : null;
    
    // Check if user is the creator or an admin
    if ((!userId || cause.creator.toString() !== userId.toString()) && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this cause' });
    }
    
    await Cause.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Cause deleted successfully' });
  } catch (error) {
    console.error('Error deleting cause:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get causes by user
export const getCausesByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId || req.user?._id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const causes = await Cause.find({ creator: userId })
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(causes);
  } catch (error) {
    console.error('Error fetching user causes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sponsor causes with claim statistics
export const getSponsorCausesWithClaimStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    console.log('Fetching sponsor causes with claims for user:', userId);
    
    // Build aggregation pipeline to get causes with claim statistics
    const pipeline = [
      // Match causes created by the current user
      {
        $match: {
          creator: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId
        }
      },
      // Lookup sponsorships to calculate total totes
      {
        $lookup: {
          from: 'sponsorships',
          localField: '_id',
          foreignField: 'cause',
          as: 'sponsorships'
        }
      },
      // Lookup claims to count claimed totes
      {
        $lookup: {
          from: 'claims',
          localField: '_id',
          foreignField: 'causeId',
          as: 'claims'
        }
      },
      // Add fields for calculations
      {
        $addFields: {
          // Calculate total totes from approved sponsorships
          totalTotes: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$sponsorships',
                    as: 'sponsorship',
                    cond: { $eq: ['$$sponsorship.status', 'approved'] }
                  }
                },
                as: 'approvedSponsorship',
                in: { $ifNull: ['$$approvedSponsorship.toteQuantity', 0] }
              }
            }
          },
          // Count total claims
          claimedTotes: { $size: '$claims' },
          // Count shipped/delivered claims
          shippedClaims: {
            $size: {
              $filter: {
                input: '$claims',
                as: 'claim',
                cond: { $in: ['$$claim.status', ['shipped', 'delivered']] }
              }
            }
          }
        }
      },
      // Project the final output
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          imageUrl: 1,
          targetAmount: 1,
          currentAmount: 1,
          category: 1,
          status: 1,
          location: 1,
          isOnline: 1,
          createdAt: 1,
          updatedAt: 1,
          distributionStartDate: 1,
          distributionEndDate: 1,
          totalTotes: 1,
          claimedTotes: 1,
          shippedClaims: 1,
          // Include claim details for shipped/delivered claims
          claimDetails: {
            $map: {
              input: {
                $filter: {
                  input: '$claims',
                  as: 'claim',
                  cond: { $in: ['$$claim.status', ['shipped', 'delivered']] }
                }
              },
              as: 'claim',
              in: {
                _id: '$$claim._id',
                status: '$$claim.status',
                fullName: '$$claim.fullName',
                city: '$$claim.city',
                state: '$$claim.state',
                createdAt: '$$claim.createdAt',
                shippingDate: '$$claim.shippingDate',
                deliveryDate: '$$claim.deliveryDate'
              }
            }
          }
        }
      },
      // Sort by creation date
      {
        $sort: { createdAt: -1 }
      }
    ];
    
    console.log('Executing sponsor causes aggregation pipeline');
    
    const causes = await Cause.aggregate(pipeline);
    
    console.log(`Found ${causes.length} sponsor causes with claim stats`);
    
    res.json(causes);
  } catch (error) {
    console.error('Error fetching sponsor causes with claims:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Admin: Approve or reject a cause
export const updateCauseStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!status || !Object.values(CauseStatus).includes(status as CauseStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const cause = await Cause.findById(req.params.id);
    
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }
    
    // Only admin can update status
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update cause status' });
    }
    
    cause.status = status as CauseStatus;
    await cause.save();
    
    res.json({
      message: `Cause ${status} successfully`,
      cause
    });
  } catch (error) {
    console.error('Error updating cause status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a cause's tote preview image
export const updateCauseTotePreviewImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if cause exists
    const cause = await Cause.findById(id);
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Get the file path
    const filePath = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
    
    // Update the cause with the new tote preview image URL
    cause.totePreviewImageUrl = filePath;
    await cause.save();
    
    res.json({ 
      message: 'Tote preview image updated successfully',
      cause: {
        _id: cause._id,
        title: cause.title,
        totePreviewImageUrl: cause.totePreviewImageUrl
      }
    });
  } catch (error) {
    console.error('Error updating tote preview image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const uploadCauseImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Check if cause exists
    const cause = await Cause.findById(id);
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Get the file path
    const filePath = req.file.path.replace(/\\/g, '/'); // Normalize path for Windows
    
    // Add the new image to the cause's images array
    cause.images = cause.images || [];
    cause.images.push(filePath);
    
    // Also set it as the admin image URL
    cause.adminImageUrl = filePath;
    
    await cause.save();
    
    res.json({ 
      success: true,
      message: 'Image uploaded successfully',
      cause: {
        _id: cause._id,
        title: cause.title,
        images: cause.images
      }
    });
  } catch (error) {
    console.error('Error uploading cause image:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Partner API: get causes (API-key protected)
// Note: We compute tote counts from Sponsorships + Claims; we do NOT rely on a stored "availableTotes" field.
export const getPartnerCauses = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const rawLimit = parseInt(req.query.limit as string, 10) || 25;
    const limit = Math.min(100, Math.max(1, rawLimit));
    const skip = (page - 1) * limit;

    const status = (req.query.status as string | undefined)?.trim();
    const isOnline = (req.query.isOnline as string | undefined)?.trim();
    const category = (req.query.category as string | undefined)?.trim();
    const search = (req.query.search as string | undefined)?.trim();

    // Defaults for external apps: only show public/approved causes.
    const matchStage: Record<string, any> = {
      status: CauseStatus.APPROVED
    };

    // Optional overrides
    if (status && status !== "approved") {
      // Keep behavior safe: only admins should ever see non-approved statuses.
      // For now, partners still get approved only.
      // (If you want paid tiers/scopes later, add it to ApiPartner + apiKeyAuth.)
    }
    if (isOnline !== undefined) matchStage.isOnline = isOnline === "true";
    if (category) matchStage.category = category;
    if (search) {
      matchStage.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const total = await Cause.countDocuments(matchStage);

    const claimedStatuses = ["verified", "shipped", "delivered"];

    const causes = await Cause.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "sponsorships",
          localField: "_id",
          foreignField: "cause",
          as: "sponsorships"
        }
      },
      {
        $lookup: {
          from: "claims",
          localField: "_id",
          foreignField: "causeId",
          as: "claims"
        }
      },
      {
        $addFields: {
          approvedSponsorships: {
            $filter: {
              input: "$sponsorships",
              as: "s",
              cond: { $eq: ["$$s.status", "approved"] }
            }
          },
          claimedTotes: {
            $size: {
              $filter: {
                input: "$claims",
                as: "c",
                cond: { $in: ["$$c.status", claimedStatuses] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          totalTotes: {
            $sum: {
              $map: {
                input: "$approvedSponsorships",
                as: "s",
                in: { $ifNull: ["$$s.toteQuantity", 0] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          availableTotes: {
            $max: [0, { $subtract: ["$totalTotes", "$claimedTotes"] }]
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          imageUrl: 1,
          category: 1,
          status: 1,
          isOnline: 1,
          createdAt: 1,
          updatedAt: 1,
          totalTotes: 1,
          claimedTotes: 1,
          availableTotes: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const frontendBase = process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production' ? 'https://changebag.org' : 'http://localhost:8085');
    const base = frontendBase.replace(/\/$/, '');

    const partnerCauses = causes.map((cause: any) => {
      const causeId = cause._id?.toString?.() ?? cause._id;
      return {
        causeId,
        causeTitle: cause.title,
        description: cause.description,
        imageUrl: cause.imageUrl,
        category: cause.category,
        status: cause.status,
        isOnline: cause.isOnline,
        totalTotes: cause.totalTotes ?? 0,
        claimedTotes: cause.claimedTotes ?? 0,
        availableTotes: cause.availableTotes ?? 0,
        createdAt: cause.createdAt,
        updatedAt: cause.updatedAt,
        sponsorUrl: `${base}/sponsor/new?causeId=${causeId}`,
        claimUrl: `${base}/claim/${causeId}?source=partner&ref=external`,
        causeUrl: `${base}/cause/${causeId}`,
        waitlistUrl: `${base}/waitlist/${causeId}`
      };
    });

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: partnerCauses.length,
      causes: partnerCauses
    });
  } catch (error: any) {
    console.error("Error fetching partner causes:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching causes",
      error: error.message
    });
  }
};

export default {
  getAllCauses,
  getCauseById,
  createCause,
  updateCause,
  deleteCause,
  getCausesByUser,
  getSponsorCausesWithClaimStats,
  updateCauseStatus,
  updateCauseTotePreviewImage,
  uploadCauseImage,
  getPartnerCauses
};
