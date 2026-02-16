import { RequestHandler } from 'express';
import { sendOTP, verifyOTP, sendPhoneOTP, verifyPhoneOTP, debugOTPRecords, debugMSG91Config, testSenderIDs, testSMSDelivery } from '../controllers/otpController';
import { createRouter } from '../utils/routerHelper';

const router = createRouter();

// Email OTP routes
router.post('/send', sendOTP as RequestHandler);
router.post('/verify', verifyOTP as RequestHandler);

// Phone OTP routes
router.post('/send-phone', sendPhoneOTP as RequestHandler);
router.post('/verify-phone', verifyPhoneOTP as RequestHandler);

// Debug routes (remove in production)
router.get('/debug', debugOTPRecords as RequestHandler);
router.get('/debug-msg91', debugMSG91Config as RequestHandler);
router.get('/test-sender-ids', testSenderIDs as RequestHandler);
router.get('/test-sms', testSMSDelivery as RequestHandler);

export default router;