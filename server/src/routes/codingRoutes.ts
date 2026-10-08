import { Router } from 'express';
import { getDashboardData, getProblemBySlug } from '../controllers/codingController';
import { requireAuth } from '@clerk/express';

const router = Router();

// Dashboard data endpoint
// We use requireAuth to ensure the user is authenticated
router.get('/dashboard', requireAuth(), getDashboardData);
router.get('/problems/:slug', requireAuth(), getProblemBySlug);

export default router;
