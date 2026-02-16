/**
  * Imports the Express framework for creating web server routes and middleware.
  * @module express
  */
import express from 'express';
import multer from 'multer';
import { createClaim, getRecentClaims, getClaimById, updateClaimStatus, getClaimsStats, checkExistingClaim, getClaimerDashboardData, getVerifiedClaimsForSponsoredCauses } from '../controllers/claimController';
import { authenticateToken } from '../middleware/auth';
import { createRouter } from '../utils/routerHelper';
import { uploadCauseImage } from '../controllers/causeController';

const router = createRouter();
const upload = multer({ dest: 'uploads/' });

// Public routes
router.post('/', createClaim);
router.get('/check', checkExistingClaim); // New route to check for existing claims

// Protected routes (require authentication)
router.get('/dashboard/claimer', authenticateToken, getClaimerDashboardData); // Get claimer dashboard data
router.get('/sponsored-causes/verified-claims', authenticateToken, getVerifiedClaimsForSponsoredCauses); // Get verified claims for sponsored causes

// Protected routes (admin only)
router.get('/recent', authenticateToken, getRecentClaims);
router.get('/stats', authenticateToken, getClaimsStats);
router.get('/:id', authenticateToken, getClaimById);
router.patch('/:id/status', authenticateToken, updateClaimStatus);

// This route matches your frontend POST request
router.post(
  '/v1/admin/causes/:id/images/upload',
  upload.single('image'), // 'image' matches the FormData key in your frontend
  uploadCauseImage
);

export default router;