import {
  createSponsorship,
  getPendingSponsorships,
  getApprovedSponsorships,
  approveSponsorship,
  rejectSponsorship,
  toggleSponsorshipOnlineStatus,
  getSponsorshipById,
  getSponsorshipByIdForSponsor,
  getUserSponsorships,
  reuploadLogo,
  testSponsorshipModel,
  testPendingSponsorships,
  testSponsorshipCreation,
  testFrontendData,
  testNestedDistributionLocations,
  getDashboardMetrics,
  testDashboardMetrics,
  endCampaign
} from '../controllers/sponsorshipController';
import { authenticateToken } from '../middleware/auth';
import { adminGuard } from '../middleware/authGuard';
import { createRouter } from '../utils/routerHelper';

const router = createRouter();

// Public routes
router.post('/', createSponsorship); // Can work with or without authentication

// Protected routes (require authentication)
router.get('/user', authenticateToken, getUserSponsorships);
router.get('/sponsor/:id', authenticateToken, getSponsorshipByIdForSponsor); // Allow sponsors to access their own sponsorship

// Public routes with validation
router.get('/public/:id', getSponsorshipByIdForSponsor); // Public route for logo reupload (no auth required)
router.patch('/:sponsorshipId/reupload', reuploadLogo); // Public route for sponsors to reupload logos

// Admin routes (require authentication and admin role)
router.get('/pending', authenticateToken, adminGuard, getPendingSponsorships);
router.get('/approved', authenticateToken, adminGuard, getApprovedSponsorships);
router.get('/dashboard-metrics', authenticateToken, adminGuard, getDashboardMetrics);
router.patch('/:id/approve', authenticateToken, adminGuard, approveSponsorship);
router.patch('/:id/reject', authenticateToken, adminGuard, rejectSponsorship);
router.patch('/:id/toggle-online', authenticateToken, adminGuard, toggleSponsorshipOnlineStatus);
router.patch('/:id/end-campaign', authenticateToken, adminGuard, endCampaign);

// Generic sponsorship route (admin only) - must come after specific routes
router.get('/:id', authenticateToken, adminGuard, getSponsorshipById);

// Test routes (admin only)
router.get('/test/model', authenticateToken, adminGuard, testSponsorshipModel);
router.get('/test/pending', authenticateToken, adminGuard, testPendingSponsorships);
router.post('/test/create', authenticateToken, adminGuard, testSponsorshipCreation);
router.post('/test/frontend-data', authenticateToken, adminGuard, testFrontendData);
router.post('/test/nested-distribution', authenticateToken, adminGuard, testNestedDistributionLocations);
router.get('/test/dashboard-metrics', testDashboardMetrics); // No auth required for testing

export default router; 