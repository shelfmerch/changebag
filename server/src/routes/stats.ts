import express from 'express';
import { getPublicStats } from '../controllers/statsController';
import { createRouter } from '../utils/routerHelper';

const router = createRouter();

// Public stats endpoint (no authentication required)
router.get('/', getPublicStats);

export default router; 