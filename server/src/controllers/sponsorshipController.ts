import { Request, Response } from 'express';
import Sponsorship, { SponsorshipStatus, DistributionType } from '../models/Sponsorship';
import Cause from '../models/Cause';
import mongoose from 'mongoose';

export const createSponsorship = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received sponsorship request body:', JSON.stringify(req.body, null, 2));
    
    // If selectedCause is provided but cause isn't, use selectedCause as cause
    if (!req.body.cause && req.body.selectedCause) {
      req.body.cause = req.body.selectedCause;
    }

    // Handle field name mismatches
    if (!req.body.numberOfTotes && req.body.toteQuantity) {
      req.body.numberOfTotes = req.body.toteQuantity;
    }

    // Extract distributionLocations from physicalDistributionDetails if present
    if (!req.body.distributionLocations && req.body.physicalDistributionDetails?.distributionLocations) {
      // Transform the distribution locations to match the expected schema
      req.body.distributionLocations = req.body.physicalDistributionDetails.distributionLocations.map((location: any) => {
        // Handle nested name object structure
        if (location.name && typeof location.name === 'object') {
          return {
            name: location.name.name || 'Unknown Location',
            address: location.name.address || 'N/A',
            contactPerson: location.name.contactPerson || 'N/A',
            phone: location.name.phone || 'N/A',
            location: location.name.location || '',
            totesCount: location.name.totesCount || location.totesCount || 0
          };
        } else {
          // Handle flat structure
          return {
            name: location.name || 'Unknown Location',
            address: location.address || 'N/A',
            contactPerson: location.contactPerson || 'N/A',
            phone: location.phone || 'N/A',
            location: location.location || '',
            totesCount: location.totesCount || 0
          };
        }
      });
    }
    
    // Check for required fields
    const requiredFields = [
      'cause',
      'organizationName',
      'contactName',
      'email',
      'phone',
      'unitPrice',
      'totalAmount',
      'distributionType',
      'selectedCities',
      'distributionStartDate',
      'distributionEndDate'
    ];
    
    // Check for tote quantity - either toteQuantity or numberOfTotes should be present
    if (!req.body.toteQuantity && !req.body.numberOfTotes) {
      requiredFields.push('toteQuantity');
    }
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    // Special check for distributionLocations - only required for physical distribution
    if (req.body.distributionType === 'physical' && !req.body.distributionLocations?.length) {
      missingFields.push('distributionLocations');
    }
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
      return;
    }
    
    // Handle logoUrl - if it's not provided or is a client-side placeholder, set a default
    if (!req.body.logoUrl || req.body.logoUrl === 'logo_uploaded_client_side') {
      req.body.logoUrl = 'https://api.changebag.org/uploads/default-logo.png';
    }

    // Set default values for optional fields
    const defaultValues = {
      message: req.body.message || '',
      logoPosition: req.body.logoPosition || {
        x: 0,
        y: 0,
        scale: 1,
        angle: 0
      },
      demographics: req.body.demographics || {
        ageGroups: [],
        income: '',
        education: '',
        other: ''
      },
      // Ensure numberOfTotes is set from toteQuantity if not provided
      numberOfTotes: req.body.numberOfTotes || req.body.toteQuantity
    };
    
    // Create the sponsorship with required fields and defaults
    const sponsorshipData = {
      ...req.body,
      ...defaultValues,
      sponsor: req.user?._id || null,
      status: SponsorshipStatus.PENDING
    };

    // Remove redundant fields that are now properly placed
    delete sponsorshipData.physicalDistributionDetails;
    // Don't delete distributionPoints as it might be used by frontend
    // delete sponsorshipData.distributionPoints;
    delete sponsorshipData.distributionPointName;
    delete sponsorshipData.distributionPointAddress;
    delete sponsorshipData.distributionPointContact;
    delete sponsorshipData.distributionPointPhone;
    delete sponsorshipData.distributionPointLocation;
    delete sponsorshipData.selectedMalls;
    delete sponsorshipData.selectedMetroStations;
    delete sponsorshipData.selectedAirports;
    delete sponsorshipData.selectedSchools;
    delete sponsorshipData.shippingAddress;
    delete sponsorshipData.shippingContactName;
    delete sponsorshipData.shippingPhone;
    delete sponsorshipData.shippingInstructions;
    
    console.log('Creating sponsorship with data:', JSON.stringify(sponsorshipData, null, 2));
    
    const sponsorship = new Sponsorship(sponsorshipData);
    
    // Validate the sponsorship before saving
    const validationError = sponsorship.validateSync();
    if (validationError) {
      console.error('Validation error details:', JSON.stringify(validationError.errors, null, 2));
      console.error('Validation error message:', validationError.message);
      console.error('Failed sponsorship data:', JSON.stringify(sponsorshipData, null, 2));
      res.status(400).json({ 
        message: 'Validation error', 
        errors: validationError.errors,
        details: Object.keys(validationError.errors).map(key => ({
          field: key,
          message: validationError.errors[key].message,
          value: validationError.errors[key].value
        }))
      });
      return;
    }
    
    await sponsorship.save();
    
    console.log('Sponsorship saved successfully with ID:', sponsorship._id);
    res.status(201).json(sponsorship);
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    res.status(500).json({ 
      message: 'Error creating sponsorship', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getPendingSponsorships = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== getPendingSponsorships START ===');
    console.log('Fetching pending sponsorships, authenticated as:', req.user);
    console.log('SponsorshipStatus.PENDING value:', SponsorshipStatus.PENDING);
    
    // First, let's check if the Sponsorship model is working by trying to count all sponsorships
    const totalSponsorships = await Sponsorship.countDocuments();
    console.log('Total sponsorships in database:', totalSponsorships);
    
    // Check if there are any sponsorships with any status
    const allSponsorships = await Sponsorship.find({}).limit(5);
    console.log('Sample sponsorships:', allSponsorships.map(s => ({ id: s._id, status: s.status, organizationName: s.organizationName })));
    
    console.log('About to query pending sponsorships...');
    const sponsorships = await Sponsorship.find({ status: SponsorshipStatus.PENDING })
      .populate('cause', 'title') // Populate cause with just the title field
      .select('_id status logoStatus cause organizationName contactName email phone toteQuantity unitPrice totalAmount logoUrl logoPosition qrCodeUrl toteDetails selectedCities distributionType distributionLocations distributionStartDate distributionEndDate documents createdAt updatedAt isOnline')
      .sort({ createdAt: -1 });
    
    console.log('Found pending sponsorships:', sponsorships.length);
    console.log('About to send response...');
    
    res.json(sponsorships);
    console.log('=== getPendingSponsorships SUCCESS ===');
  } catch (error) {
    console.error('=== getPendingSponsorships ERROR ===');
    console.error('Error fetching pending sponsorships:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error constructor:', error.constructor.name);
    
    // Check if it's a specific type of error
    if (error.name === 'CastError') {
      console.error('This is a CastError - likely invalid ObjectId');
    } else if (error.name === 'ValidationError') {
      console.error('This is a ValidationError');
    } else if (error.name === 'MongoError') {
      console.error('This is a MongoError');
    }
    
    res.status(500).json({ message: 'Error fetching pending sponsorships' });
    console.error('=== getPendingSponsorships ERROR END ===');
  }
};

export const getApprovedSponsorships = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== getApprovedSponsorships START ===');
    console.log('Fetching approved sponsorships, authenticated as:', req.user);
    
    const sponsorships = await Sponsorship.find({ status: SponsorshipStatus.APPROVED })
      .populate('cause', 'title description category targetAmount currentAmount imageUrl status')
      .select('_id status logoStatus cause organizationName contactName email phone toteQuantity unitPrice totalAmount logoUrl qrCodeUrl toteDetails selectedCities distributionType distributionLocations distributionStartDate distributionEndDate documents createdAt updatedAt isOnline')
      .sort({ createdAt: -1 });
    
    console.log('Found approved sponsorships:', sponsorships.length);
    
    res.json(sponsorships);
    console.log('=== getApprovedSponsorships SUCCESS ===');
  } catch (error) {
    console.error('=== getApprovedSponsorships ERROR ===');
    console.error('Error fetching approved sponsorships:', error);
    res.status(500).json({ message: 'Error fetching approved sponsorships' });
  }
};

export const toggleSponsorshipOnlineStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id).populate('cause', 'title');
    if (!sponsorship) {
      res.status(404).json({ message: 'Sponsorship not found' });
      return;
    }

    // Toggle the isOnline status
    sponsorship.isOnline = !sponsorship.isOnline;
    await sponsorship.save();

    res.json(sponsorship);
  } catch (error) {
    console.error('Error toggling sponsorship online status:', error);
    res.status(500).json({ message: 'Error toggling sponsorship online status' });
  }
};

export const approveSponsorship = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id).populate('cause', 'title');
    if (!sponsorship) {
      res.status(404).json({ message: 'Sponsorship not found' });
      return;
    }

    sponsorship.status = SponsorshipStatus.APPROVED;
    sponsorship.approvedBy = req.user?._id;
    sponsorship.approvedAt = new Date();
    await sponsorship.save();

    // Send approval email to the sponsor
    try {
      const { sendLogoApprovalEmail } = require('../services/emailService');
      await sendLogoApprovalEmail(sponsorship.email, {
        organizationName: sponsorship.organizationName,
        causeTitle: sponsorship.cause.title || 'Campaign'
      });
      console.log(`Approval email sent to ${sponsorship.email}`);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Continue with the response even if email fails
    }

    // Notify waitlist members that the cause is now sponsored
    try {
      const { notifyWaitlistMembers } = require('./waitlistController');
      await notifyWaitlistMembers(sponsorship.cause._id.toString());
      console.log(`Waitlist notifications triggered for cause: ${sponsorship.cause._id}`);
    } catch (waitlistError) {
      console.error('Error notifying waitlist members:', waitlistError);
      // Continue with the response even if waitlist notification fails
    }

    res.json(sponsorship);
  } catch (error) {
    console.error('Error approving sponsorship:', error);
    res.status(500).json({ message: 'Error approving sponsorship' });
  }
};

export const rejectSponsorship = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id).populate('cause', 'title');
    if (!sponsorship) {
      res.status(404).json({ message: 'Sponsorship not found' });
      return;
    }

    sponsorship.status = SponsorshipStatus.REJECTED;
    sponsorship.rejectionReason = req.body.reason;
    await sponsorship.save();

    // Send rejection email to the sponsor
    try {
      const { sendLogoRejectionEmail } = require('../services/emailService');
      await sendLogoRejectionEmail(sponsorship.email, {
        sponsorshipId: sponsorship._id.toString(),
        organizationName: sponsorship.organizationName,
        causeTitle: sponsorship.cause.title || 'Campaign',
        rejectionReason: sponsorship.rejectionReason || 'Logo does not meet our guidelines'
      });
      console.log(`Rejection email sent to ${sponsorship.email}`);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
      // Continue with the response even if email fails
    }

    res.json(sponsorship);
  } catch (error) {
    console.error('Error rejecting sponsorship:', error);
    res.status(500).json({ message: 'Error rejecting sponsorship' });
  }
};

export const getSponsorshipById = async (req: Request, res: Response): Promise<void> => {
  try {
    const sponsorship = await Sponsorship.findById(req.params.id)
      .populate('cause', 'title'); // Populate cause with title
    
    if (!sponsorship) {
      res.status(404).json({ message: 'Sponsorship not found' });
      return;
    }
    res.json(sponsorship);
  } catch (error) {
    console.error('Error fetching sponsorship:', error);
    res.status(500).json({ message: 'Error fetching sponsorship' });
  }
};

export const getUserSponsorships = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Fetching sponsorships for user:', req.user?._id);
    
    // Find sponsorships by sponsor field OR by email (for backward compatibility)
    const sponsorships = await Sponsorship.find({
      $or: [
        { sponsor: req.user?._id },
        { email: req.user?.email }
      ]
    })
      .populate('cause', 'title description imageUrl targetAmount currentAmount category status')
      .sort({ createdAt: -1 });
    
    console.log('Found sponsorships for user:', sponsorships.length);
    
    res.json(sponsorships);
  } catch (error) {
    console.error('Error fetching user sponsorships:', error);
    res.status(500).json({ message: 'Error fetching user sponsorships' });
  }
};

/**
 * Get sponsorship by ID for sponsors (allows sponsors to access their own sponsorship)
 */
export const getSponsorshipByIdForSponsor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sponsorship = await Sponsorship.findById(id)
      .populate('cause', 'title'); // Populate cause with title
    
    if (!sponsorship) {
      res.status(404).json({ message: 'Sponsorship not found' });
      return;
    }

    // If user is authenticated, check if they are the sponsor
    if (req.user) {
      const isSponsor = sponsorship.sponsor?.toString() === req.user._id?.toString() || 
                       sponsorship.email === req.user?.email;

      if (!isSponsor) {
        res.status(403).json({ message: 'You do not have permission to access this sponsorship' });
        return;
      }
    }

    // For public access (logo reupload), allow access without authentication
    // The sponsorship ID serves as a form of authentication
    res.json(sponsorship);
  } catch (error) {
    console.error('Error fetching sponsorship:', error);
    res.status(500).json({ message: 'Error fetching sponsorship' });
  }
};

/**
 * Handle logo reupload for a rejected sponsorship
 */
export const reuploadLogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sponsorshipId } = req.params;
    const { logoUrl } = req.body;

    if (!logoUrl) {
      res.status(400).json({ message: 'Logo URL is required' });
      return;
    }

    const sponsorship = await Sponsorship.findById(sponsorshipId);
    if (!sponsorship) {
      res.status(404).json({ message: 'Sponsorship not found' });
      return;
    }

    // Check if the user is the sponsor of this sponsorship (if user is authenticated)
    if (req.user) {
      const isSponsor = sponsorship.sponsor?.toString() === req.user._id?.toString() || 
                       sponsorship.email === req.user.email;

      if (!isSponsor) {
        res.status(403).json({ message: 'You do not have permission to update this sponsorship' });
        return;
      }
    }

    // Store the previous logo URL for reference
    const previousLogoUrl = sponsorship.logoUrl;

    // Update the sponsorship with the new logo URL
    sponsorship.logoUrl = logoUrl;
    
    // Change status back to pending for review
    sponsorship.status = SponsorshipStatus.PENDING;
    
    // Clear any previous rejection reason
    sponsorship.rejectionReason = undefined;
    
    await sponsorship.save();

    // Log the reupload activity
    console.log(`Logo reuploaded for sponsorship ${sponsorshipId}. Previous URL: ${previousLogoUrl}, New URL: ${logoUrl}`);

    res.status(200).json({ 
      message: 'Logo updated successfully and pending review',
      sponsorship
    });
  } catch (error) {
    console.error('Error reuploading logo:', error);
    res.status(500).json({ 
      message: 'Error updating logo', 
      error: error.message 
    });
  }
};

export const testSponsorshipModel = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing Sponsorship model...');
    
    // Test 1: Check if the model is loaded
    console.log('Sponsorship model exists:', !!Sponsorship);
    console.log('Sponsorship model name:', Sponsorship.modelName);
    
    // Test 2: Check database connection
    const dbState = Sponsorship.db.readyState;
    console.log('Database ready state:', dbState);
    console.log('Database name:', Sponsorship.db.name);
    
    // Test 3: Try a simple count without any filters
    const count = await Sponsorship.countDocuments();
    console.log('Total sponsorships count:', count);
    
    // Test 4: Try to get one sponsorship without any filters
    const oneSponsorship = await Sponsorship.findOne();
    console.log('One sponsorship found:', !!oneSponsorship);
    if (oneSponsorship) {
      console.log('Sponsorship fields:', Object.keys(oneSponsorship.toObject()));
      console.log('Sponsorship status:', oneSponsorship.status);
      console.log('Sponsorship status type:', typeof oneSponsorship.status);
    }
    
    // Test 5: Check all unique status values
    const uniqueStatuses = await Sponsorship.distinct('status');
    console.log('Unique statuses in database:', uniqueStatuses);
    
    // Test 6: Count by status
    const statusCounts = await Sponsorship.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('Status counts:', statusCounts);
    
    // Test 7: Check what SponsorshipStatus.PENDING equals
    console.log('SponsorshipStatus.PENDING value:', SponsorshipStatus.PENDING);
    console.log('SponsorshipStatus.PENDING type:', typeof SponsorshipStatus.PENDING);
    
    res.json({
      modelExists: !!Sponsorship,
      modelName: Sponsorship.modelName,
      dbReadyState: dbState,
      dbName: Sponsorship.db.name,
      totalCount: count,
      hasOneSponsorship: !!oneSponsorship,
      sampleStatus: oneSponsorship?.status,
      sampleStatusType: typeof oneSponsorship?.status,
      uniqueStatuses: uniqueStatuses,
      statusCounts: statusCounts,
      pendingEnumValue: SponsorshipStatus.PENDING,
      pendingEnumType: typeof SponsorshipStatus.PENDING
    });
  } catch (error) {
    console.error('Test error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Test failed', 
      error: error.message,
      stack: error.stack 
    });
  }
};

export const testPendingSponsorships = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Testing pending sponsorships step by step...');
    
    // Step 1: Find pending sponsorships without populate
    console.log('Step 1: Finding pending sponsorships without populate...');
    const pendingWithoutPopulate = await Sponsorship.find({ status: SponsorshipStatus.PENDING });
    console.log('Found pending sponsorships without populate:', pendingWithoutPopulate.length);
    
    if (pendingWithoutPopulate.length > 0) {
      console.log('Sample sponsorship without populate:', {
        id: pendingWithoutPopulate[0]._id,
        status: pendingWithoutPopulate[0].status,
        cause: pendingWithoutPopulate[0].cause,
        causeType: typeof pendingWithoutPopulate[0].cause
      });
    }
    
    // Step 2: Try populate on one sponsorship
    if (pendingWithoutPopulate.length > 0) {
      console.log('Step 2: Testing populate on one sponsorship...');
      try {
        const populatedOne = await Sponsorship.findById(pendingWithoutPopulate[0]._id).populate('cause', 'title');
        console.log('Successfully populated one sponsorship:', {
          id: populatedOne._id,
          cause: populatedOne.cause,
          causeTitle: populatedOne.cause?.title
        });
      } catch (populateError) {
        console.error('Error populating one sponsorship:', populateError);
        throw populateError;
      }
    }
    
    // Step 3: Try the full query
    console.log('Step 3: Testing full query with populate...');
    const pendingWithPopulate = await Sponsorship.find({ status: SponsorshipStatus.PENDING })
      .populate('cause', 'title')
      .sort({ createdAt: -1 });
    
    console.log('Successfully found pending sponsorships with populate:', pendingWithPopulate.length);
    
    res.json({
      withoutPopulate: pendingWithoutPopulate.length,
      withPopulate: pendingWithPopulate.length,
      sampleWithoutPopulate: pendingWithoutPopulate.length > 0 ? {
        id: pendingWithoutPopulate[0]._id,
        status: pendingWithoutPopulate[0].status,
        cause: pendingWithoutPopulate[0].cause
      } : null,
      sampleWithPopulate: pendingWithPopulate.length > 0 ? {
        id: pendingWithPopulate[0]._id,
        status: pendingWithPopulate[0].status,
        cause: pendingWithPopulate[0].cause
      } : null
    });
  } catch (error) {
    console.error('Test pending sponsorships error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Test failed', 
      error: error.message,
      stack: error.stack 
    });
  }
};

export const testSponsorshipCreation = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Testing Sponsorship Creation ===');
    
    // Create a test sponsorship with minimal required data
    const testData = {
      cause: req.body.cause || '507f1f77bcf86cd799439011', // Sample ObjectId
      organizationName: 'Test Organization',
      contactName: 'Test Contact',
      email: 'test@example.com',
      phone: '1234567890',
      toteQuantity: 10,
      unitPrice: 100,
      totalAmount: 1000,
      logoUrl: 'https://api.changebag.org/uploads/default-logo.png',
      distributionType: 'online',
      selectedCities: ['Mumbai'],
      distributionStartDate: new Date(),
      distributionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      distributionLocations: [{
        name: 'Online Distribution',
        address: 'N/A',
        contactPerson: 'N/A',
        phone: 'N/A'
      }],
      message: 'Test sponsorship',
      logoPosition: {
        x: 0,
        y: 0,
        scale: 1,
        angle: 0
      },
      demographics: {
        ageGroups: [],
        income: '',
        education: '',
        other: ''
      }
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const sponsorship = new Sponsorship(testData);
    
    // Validate the sponsorship
    const validationError = sponsorship.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      res.status(400).json({ 
        message: 'Validation error', 
        errors: validationError.errors 
      });
      return;
    }
    
    console.log('Validation passed!');
    res.json({ message: 'Test sponsorship validation passed', data: testData });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      message: 'Test failed', 
      error: error.message 
    });
  }
};

export const testFrontendData = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Testing Frontend Data Structure ===');
    
    // Simulate the exact data structure the frontend sends
    const frontendData = {
      cause: req.body.cause || '507f1f77bcf86cd799439011',
      organizationName: 'Test Organization',
      contactName: 'Test Contact',
      email: 'test@example.com',
      phone: '1234567890',
      toteQuantity: 10,
      unitPrice: 100,
      totalAmount: 1000,
      logoUrl: 'logo_uploaded_client_side',
      distributionType: 'online',
      selectedCities: ['Mumbai'],
      distributionStartDate: '2025-01-01',
      distributionEndDate: '2025-01-31',
      message: 'Test message',
      // Physical distribution data (if applicable)
      physicalDistributionDetails: {
        distributionLocations: [{
          name: 'Test Location',
          address: 'Test Address',
          contactPerson: 'Test Person',
          phone: '1234567890',
          totesCount: 5
        }]
      }
    };
    
    console.log('Frontend data structure:', JSON.stringify(frontendData, null, 2));
    
    // Process the data through the same logic as the real endpoint
    const processedData: any = { ...frontendData };
    
    // Handle field name mismatches
    if (!processedData.numberOfTotes && processedData.toteQuantity) {
      processedData.numberOfTotes = processedData.toteQuantity;
    }
    
    // Extract distributionLocations from physicalDistributionDetails if present
    if (!processedData.distributionLocations && processedData.physicalDistributionDetails?.distributionLocations) {
      processedData.distributionLocations = processedData.physicalDistributionDetails.distributionLocations.map((location: any) => ({
        name: location.name || 'Unknown Location',
        address: location.address || 'N/A',
        contactPerson: location.contactPerson || 'N/A',
        phone: location.phone || 'N/A',
        location: location.location || '',
        totesCount: location.totesCount || 0
      }));
    }
    
    // Handle logoUrl
    if (!processedData.logoUrl || processedData.logoUrl === 'logo_uploaded_client_side') {
      processedData.logoUrl = 'https://api.changebag.org/uploads/default-logo.png';
    }
    
    // Set default values
    const defaultValues = {
      message: processedData.message || '',
      logoPosition: processedData.logoPosition || {
        x: 0,
        y: 0,
        scale: 1,
        angle: 0
      },
      demographics: processedData.demographics || {
        ageGroups: [],
        income: '',
        education: '',
        other: ''
      },
      numberOfTotes: processedData.numberOfTotes || processedData.toteQuantity
    };
    
    const finalData = {
      ...processedData,
      ...defaultValues,
      sponsor: null,
      status: 'pending'
    };
    
    console.log('Processed data:', JSON.stringify(finalData, null, 2));
    
    // Create and validate the sponsorship
    const sponsorship = new Sponsorship(finalData);
    const validationError = sponsorship.validateSync();
    
    if (validationError) {
      console.error('Validation error:', validationError);
      res.status(400).json({ 
        message: 'Validation error', 
        errors: validationError.errors 
      });
      return;
    }
    
    console.log('✅ All validations passed!');
    res.json({ 
      message: 'Frontend data structure is valid', 
      originalData: frontendData,
      processedData: finalData,
      validation: 'passed'
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ 
      message: 'Test failed', 
      error: error.message 
    });
  }
};

export const testNestedDistributionLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== Testing Nested Distribution Locations ===');
    
    // Test data with nested name objects (like the frontend sends)
    const testData = {
      cause: '507f1f77bcf86cd799439011',
      organizationName: 'Test Organization',
      contactName: 'Test Contact',
      email: 'test@example.com',
      phone: '1234567890',
      toteQuantity: 10,
      unitPrice: 100,
      totalAmount: 1000,
      logoUrl: 'logo_uploaded_client_side',
      distributionType: 'physical',
      selectedCities: ['Mumbai'],
      distributionStartDate: '2025-01-01',
      distributionEndDate: '2025-01-31',
      physicalDistributionDetails: {
        distributionLocations: [
          {
            name: {
              name: 'Lumbini Park',
              address: 'Hyderabad, India',
              contactPerson: 'Test Contact',
              phone: '1234567890',
              location: 'Hyderabad',
              totesCount: 300
            },
            type: 'other',
            totesCount: 410
          },
          {
            name: {
              name: 'Inorbit Mall',
              address: 'Hyderabad, India',
              contactPerson: 'Test Contact',
              phone: '1234567890',
              location: 'Hyderabad',
              totesCount: 430
            },
            type: 'other',
            totesCount: 410
          }
        ]
      }
    };
    
    // Process the data through the same logic as the real endpoint
    const processedData: any = { ...testData };
    
    // Extract distributionLocations from physicalDistributionDetails if present
    if (!processedData.distributionLocations && processedData.physicalDistributionDetails?.distributionLocations) {
      // Transform the distribution locations to match the expected schema
      processedData.distributionLocations = processedData.physicalDistributionDetails.distributionLocations.map((location: any) => {
        // Handle nested name object structure
        if (location.name && typeof location.name === 'object') {
          return {
            name: location.name.name || 'Unknown Location',
            address: location.name.address || 'N/A',
            contactPerson: location.name.contactPerson || 'N/A',
            phone: location.name.phone || 'N/A',
            location: location.name.location || '',
            totesCount: location.name.totesCount || location.totesCount || 0
          };
        } else {
          // Handle flat structure
          return {
            name: location.name || 'Unknown Location',
            address: location.address || 'N/A',
            contactPerson: location.contactPerson || 'N/A',
            phone: location.phone || 'N/A',
            location: location.location || '',
            totesCount: location.totesCount || 0
          };
        }
      });
    }
    
    console.log('Original nested structure:', JSON.stringify(testData.physicalDistributionDetails.distributionLocations, null, 2));
    console.log('Processed flat structure:', JSON.stringify(processedData.distributionLocations, null, 2));
    
    res.status(200).json({
      message: 'Nested distribution locations test passed',
      originalData: testData.physicalDistributionDetails.distributionLocations,
      processedData: processedData.distributionLocations,
      transformationSuccessful: true
    });
  } catch (error) {
    console.error('Error testing nested distribution locations:', error);
    res.status(500).json({ 
      message: 'Error testing nested distribution locations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== getDashboardMetrics START ===');
    
    // Import Claim model for comprehensive metrics
    const Claim = mongoose.model('Claim');
    
    // Get total sponsors (unique users who have created sponsorships)
    const totalSponsors = await Sponsorship.distinct('sponsor').countDocuments();
    console.log('Total unique sponsors:', totalSponsors);
    
    // Get total raised amount from all approved sponsorships
    const totalRaisedResult = await Sponsorship.aggregate([
      { $match: { status: SponsorshipStatus.APPROVED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRaised = totalRaisedResult.length > 0 ? totalRaisedResult[0].total : 0;
    console.log('Total raised:', totalRaised);
    
    // Get pending items (sponsorships with pending status)
    const pendingItems = await Sponsorship.countDocuments({ status: SponsorshipStatus.PENDING });
    console.log('Pending items:', pendingItems);
    
    // Get total causes
    const totalCauses = await Cause.countDocuments();
    console.log('Total causes:', totalCauses);
    
    // Calculate weekly changes
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Sponsors this week
    const sponsorsThisWeek = await Sponsorship.distinct('sponsor', {
      createdAt: { $gte: oneWeekAgo }
    }).countDocuments();
    
    // Raised this week
    const raisedThisWeekResult = await Sponsorship.aggregate([
      { 
        $match: { 
          status: SponsorshipStatus.APPROVED,
          createdAt: { $gte: oneWeekAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const raisedThisWeek = raisedThisWeekResult.length > 0 ? raisedThisWeekResult[0].total : 0;
    
    // Causes this week
    const causesThisWeek = await Cause.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    // Urgent pending items (pending for more than 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const urgentPendingItems = await Sponsorship.countDocuments({
      status: SponsorshipStatus.PENDING,
      createdAt: { $lte: threeDaysAgo }
    });
    
    // Claims statistics
    const totalClaims = await Claim.countDocuments();
    const verifiedClaims = await Claim.countDocuments({ status: 'verified' });
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const rejectedClaims = await Claim.countDocuments({ status: 'rejected' });
    
    // Claims this week
    const claimsThisWeek = await Claim.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    // Distribution statistics
    const totalTotesSponsored = await Sponsorship.aggregate([
      { $match: { status: SponsorshipStatus.APPROVED } },
      { $group: { _id: null, total: { $sum: '$toteQuantity' } } }
    ]);
    const totalTotes = totalTotesSponsored.length > 0 ? totalTotesSponsored[0].total : 0;
    
    // Active campaigns (approved and online)
    const activeCampaigns = await Sponsorship.countDocuments({
      status: SponsorshipStatus.APPROVED,
      isOnline: true
    });
    
    // Completed campaigns
    const completedCampaigns = await Sponsorship.countDocuments({
      status: SponsorshipStatus.COMPLETED
    });
    
    // Revenue metrics
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenueResult = await Sponsorship.aggregate([
      { 
        $match: { 
          status: SponsorshipStatus.APPROVED,
          createdAt: { $gte: thisMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;
    
    // Average sponsorship amount
    const avgSponsorshipResult = await Sponsorship.aggregate([
      { $match: { status: SponsorshipStatus.APPROVED } },
      { $group: { _id: null, average: { $avg: '$totalAmount' } } }
    ]);
    const avgSponsorshipAmount = avgSponsorshipResult.length > 0 ? avgSponsorshipResult[0].average : 0;
    
    const metrics = {
      totalCauses,
      totalSponsors,
      totalRaised,
      pendingItems,
      // Claims data
      totalClaims,
      verifiedClaims,
      pendingClaims,
      rejectedClaims,
      // Distribution data
      totalTotes,
      activeCampaigns,
      completedCampaigns,
      // Revenue data
      monthlyRevenue,
      avgSponsorshipAmount,
      weeklyStats: {
        causesChange: causesThisWeek,
        sponsorsChange: sponsorsThisWeek,
        raisedChange: raisedThisWeek,
        claimsChange: claimsThisWeek,
        urgentPendingItems
      }
    };
    
    console.log('Comprehensive dashboard metrics calculated:', metrics);
    console.log('=== getDashboardMetrics SUCCESS ===');
    
    res.json(metrics);
  } catch (error) {
    console.error('=== getDashboardMetrics ERROR ===');
    console.error('Error calculating dashboard metrics:', error);
    res.status(500).json({ message: 'Error calculating dashboard metrics' });
  }
};

export const endCampaign = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== endCampaign START ===');
    console.log('Ending campaign for sponsorship ID:', req.params.id);
    console.log('Authenticated user:', req.user);
    
    const sponsorshipId = req.params.id;
    
    // Find the sponsorship and populate the cause
    const sponsorship = await Sponsorship.findById(sponsorshipId).populate('cause', 'title');
    
    if (!sponsorship) {
      console.log('Sponsorship not found');
      res.status(404).json({ message: 'Sponsorship not found' });
      return;
    }
    
    // Check if the sponsorship is approved
    if (sponsorship.status !== SponsorshipStatus.APPROVED) {
      console.log('Cannot end campaign - sponsorship is not approved. Current status:', sponsorship.status);
      res.status(400).json({ 
        message: 'Cannot end campaign - sponsorship must be approved first',
        currentStatus: sponsorship.status
      });
      return;
    }
    
    // Update the sponsorship status to 'completed'
    sponsorship.status = SponsorshipStatus.COMPLETED;
    sponsorship.isOnline = false; // Take it offline when ending
    sponsorship.endedAt = new Date();
    sponsorship.endedBy = req.user?._id;
    
    await sponsorship.save();
    
    console.log('Campaign ended successfully');
    res.json({ 
      message: 'Campaign ended successfully',
      sponsorship: {
        _id: sponsorship._id,
        status: sponsorship.status,
        isOnline: sponsorship.isOnline,
        endedAt: sponsorship.endedAt
      }
    });
    
    // Send completion email to the sponsor
    try {
      const { sendCampaignCompletionEmail } = require('../services/emailService');
      await sendCampaignCompletionEmail(sponsorship.email, {
        organizationName: sponsorship.organizationName,
        causeTitle: sponsorship.cause.title || 'Campaign',
        totalAmount: sponsorship.totalAmount,
        toteQuantity: sponsorship.toteQuantity,
        distributionStartDate: sponsorship.distributionStartDate,
        distributionEndDate: sponsorship.distributionEndDate
      });
      console.log(`Campaign completion email sent to ${sponsorship.email}`);
    } catch (emailError) {
      console.error('Error sending campaign completion email:', emailError);
      // Continue with the response even if email fails
    }
    
    console.log('=== endCampaign SUCCESS ===');
  } catch (error) {
    console.error('=== endCampaign ERROR ===');
    console.error('Error ending campaign:', error);
    res.status(500).json({ 
      message: 'Error ending campaign', 
      error: error.message 
    });
  }
};

export const testDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== testDashboardMetrics START ===');
    
    // Import Claim model for comprehensive metrics
    const Claim = mongoose.model('Claim');
    
    // Get total sponsors (unique users who have created sponsorships)
    const totalSponsors = await Sponsorship.distinct('sponsor').countDocuments();
    console.log('Total unique sponsors:', totalSponsors);
    
    // Get total raised amount from all approved sponsorships
    const totalRaisedResult = await Sponsorship.aggregate([
      { $match: { status: SponsorshipStatus.APPROVED } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRaised = totalRaisedResult.length > 0 ? totalRaisedResult[0].total : 0;
    console.log('Total raised:', totalRaised);
    
    // Get pending items (sponsorships with pending status)
    const pendingItems = await Sponsorship.countDocuments({ status: SponsorshipStatus.PENDING });
    console.log('Pending items:', pendingItems);
    
    // Get total causes
    const totalCauses = await Cause.countDocuments();
    console.log('Total causes:', totalCauses);
    
    const metrics = {
      totalCauses,
      totalSponsors,
      totalRaised,
      pendingItems,
      message: 'Test metrics working'
    };
    
    console.log('Test dashboard metrics calculated:', metrics);
    console.log('=== testDashboardMetrics SUCCESS ===');
    
    res.json(metrics);
  } catch (error) {
    console.error('=== testDashboardMetrics ERROR ===');
    console.error('Error calculating test dashboard metrics:', error);
    res.status(500).json({ message: 'Error calculating test dashboard metrics', error: error.message });
  }
}; 