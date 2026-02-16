import { Router } from 'express';
import { joinWaitlist, getWaitlistForCause, validateMagicLink, markWaitlistAsClaimed, getAllWaitlistEntries, getUserWaitlistEntries, leaveWaitlist, resendNotification } from '../controllers/waitlistController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/join', joinWaitlist);
router.get('/validate/:token', validateMagicLink);

// User-specific routes (no authentication required for these)
router.get('/user/:email', getUserWaitlistEntries);
router.delete('/:waitlistId/leave', leaveWaitlist);

// Protected routes (admin only)
router.get('/cause/:causeId', authenticateToken, requireRole(['admin']), getWaitlistForCause);
router.get('/all', authenticateToken, requireRole(['admin']), getAllWaitlistEntries);
router.put('/:waitlistId/claim', authenticateToken, requireRole(['admin']), markWaitlistAsClaimed);
router.post('/:waitlistId/resend-notification', authenticateToken, requireRole(['admin']), resendNotification);

export default router; 