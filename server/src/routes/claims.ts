import { createClaim, getRecentClaims, getClaimById, updateClaimStatus, getClaimsStats, getClaimerDashboardData, getVerifiedClaimsForSponsoredCauses, checkExistingClaim, getClaimsBySource, getQrCodeClaims, getClaimsStatsBySource, verifyQrCodeClaim, getDirectClaims, getVerifiedDirectClaims } from '../controllers/claimController';
import { authenticateToken } from '../middleware/auth';
import { createRouter } from '../utils/routerHelper';

const router = createRouter();

// Public routes
router.post('/', createClaim);

// Protected routes (require authentication)
router.get('/dashboard/claimer', authenticateToken, getClaimerDashboardData);
router.get('/sponsored-causes/verified-claims', authenticateToken, getVerifiedClaimsForSponsoredCauses);
router.get('/check-existing', authenticateToken, checkExistingClaim);

// Source tracking routes
router.get('/source/:source', authenticateToken, getClaimsBySource);
router.get('/qr-code', authenticateToken, getQrCodeClaims);
router.get('/stats/by-source', authenticateToken, getClaimsStatsBySource);

// Direct claims routes
router.get('/direct', authenticateToken, getDirectClaims);
router.get('/verified-direct', authenticateToken, getVerifiedDirectClaims);

// QR code claim verification
router.put('/qr-verify/:claimId', verifyQrCodeClaim);

// Admin routes
router.get('/recent', authenticateToken, getRecentClaims);
router.get('/stats', authenticateToken, getClaimsStats);
router.get('/:id', authenticateToken, getClaimById);
router.patch('/:id/status', authenticateToken, updateClaimStatus);

export default router;
