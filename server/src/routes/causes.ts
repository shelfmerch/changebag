import { Router } from 'express';
import { authGuard, adminGuard } from '../middleware/authGuard';
import causeController from '../controllers/causeController';
import upload, { compressImage } from '../middleware/fileUpload';
import { createRouter } from '../utils/routerHelper';
import Cause from '../models/Cause'; // Added import for Cause model

const router: Router = createRouter();

// Public routes
router.get('/', causeController.getAllCauses);

// Protected routes (require authentication)
// Route for getting sponsor causes with claim statistics (must come before /:id)
router.get('/sponsor-causes-with-claims', authGuard, causeController.getSponsorCausesWithClaimStats);

// Add image compression middleware to reduce file sizes
router.post('/', authGuard, upload.single('image'), compressImage, causeController.createCause);
router.put('/:id', authGuard, causeController.updateCause);
router.delete('/:id', authGuard, causeController.deleteCause);
// Route for getting causes by user ID (current user if no ID provided)
router.get('/user/:userId', authGuard, causeController.getCausesByUser);
router.get('/user', authGuard, causeController.getCausesByUser);

// Public route for getting a single cause (must come after specific routes)
router.get('/:id', causeController.getCauseById);

// Update cause content
router.put('/:id/content', authGuard, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('Content update request for cause:', id);
    console.log('Update data received:', JSON.stringify(updateData, null, 2));
    
    // Validate that the user is an admin
    if (req.user.role !== 'admin') {
      console.log('User is not admin:', req.user.role);
      return res.status(403).json({ message: 'Only admins can update cause content' });
    }
    
    // Find the cause
    const cause = await Cause.findById(id);
    if (!cause) {
      console.log('Cause not found:', id);
      return res.status(404).json({ message: 'Cause not found' });
    }
    
    console.log('Found cause:', cause.title);
    console.log('Current cause data:', JSON.stringify(cause.toObject(), null, 2));
    
    // Update the cause with the new content
    const updatedCause = await Cause.findByIdAndUpdate(
      id,
      {
        $set: {
          // Hero section
          heroTitle: updateData.heroTitle,
          heroSubtitle: updateData.heroSubtitle,
          heroImageUrl: updateData.heroImageUrl,
          heroBackgroundColor: updateData.heroBackgroundColor,
          
          // Impact section
          impactTitle: updateData.impactTitle,
          impactSubtitle: updateData.impactSubtitle,
          impactStats: updateData.impactStats,
          
          // Progress section
          progressTitle: updateData.progressTitle,
          progressSubtitle: updateData.progressSubtitle,
          progressBackgroundImageUrl: updateData.progressBackgroundImageUrl,
          progressCards: updateData.progressCards,
          
          // FAQs
          faqs: updateData.faqs,
          
          // CTA
          ctaTitle: updateData.ctaTitle,
          ctaSubtitle: updateData.ctaSubtitle,
          ctaPrimaryButtonText: updateData.ctaPrimaryButtonText,
          ctaSecondaryButtonText: updateData.ctaSecondaryButtonText,
          
          // Theming
          primaryColor: updateData.primaryColor,
          secondaryColor: updateData.secondaryColor,
          accentColor: updateData.accentColor,
          customCSS: updateData.customCSS,
          
          // SEO
          metaTitle: updateData.metaTitle,
          metaDescription: updateData.metaDescription,
          metaKeywords: updateData.metaKeywords,
          ogImageUrl: updateData.ogImageUrl,
          
          // Additional content
          testimonials: updateData.testimonials,
          gallery: updateData.gallery,
          partners: updateData.partners,
        }
      },
      { new: true, runValidators: true }
    );
    
    console.log('Updated cause data:', JSON.stringify(updatedCause.toObject(), null, 2));
    res.json(updatedCause);
  } catch (error) {
    console.error('Error updating cause content:', error);
    res.status(500).json({ message: 'Error updating cause content' });
  }
});

// Admin routes
router.patch('/:id/status', authGuard, adminGuard, causeController.updateCauseStatus);
router.post('/:id/tote-preview', authGuard, adminGuard, upload.single('image'), compressImage, causeController.updateCauseTotePreviewImage);
router.post('/:id/upload-image', authGuard, adminGuard, upload.single('image'), compressImage, causeController.uploadCauseImage);
// Update image upload route to match frontend
router.post(
  '/admin/causes/:id/images/upload',
  authGuard,
  adminGuard,
  upload.single('image'),
  causeController.uploadCauseImage
);

// Test endpoint to check if dynamic content is saved
router.get('/:id/test-content', async (req, res) => {
  try {
    const { id } = req.params;
    const cause = await Cause.findById(id);
    
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }
    
    console.log('Test endpoint - Cause data:', JSON.stringify(cause.toObject(), null, 2));
    
    res.json({
      message: 'Test endpoint',
      cause: {
        _id: cause._id,
        title: cause.title,
        heroTitle: cause.heroTitle,
        heroSubtitle: cause.heroSubtitle,
        impactStats: cause.impactStats,
        progressCards: cause.progressCards,
        faqs: cause.faqs,
        ctaTitle: cause.ctaTitle,
        hasDynamicContent: !!(cause.heroTitle || cause.impactStats?.length || cause.progressCards?.length || cause.faqs?.length)
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Test endpoint error' });
  }
});

export default router;
