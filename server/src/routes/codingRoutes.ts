import { Router } from 'express';
import { getDashboardData, getProblemBySlug } from '../controllers/codingController';
import { executeCode, runTests, submitCode, getSubmissions } from '../controllers/executionController';
import { requireAuth } from '@clerk/express';

const router = Router();

// Dashboard data endpoint
// We use requireAuth to ensure the user is authenticated
router.get('/dashboard', requireAuth(), getDashboardData);
router.get('/problems/:slug', requireAuth(), getProblemBySlug);
router.get('/submissions', requireAuth(), getSubmissions);
router.post('/execute', requireAuth(), executeCode);
router.post('/run-tests', requireAuth(), runTests);
router.post('/submit', requireAuth(), submitCode);

export default router;
