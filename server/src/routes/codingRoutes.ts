import { Router } from 'express';
import { getDashboardData, getProblemBySlug } from '../controllers/codingController';
import { executeCode, runTests, submitCode, getSubmissions } from '../controllers/executionController';
import { analyzeCode } from '../controllers/codingAnalysisController';
import { getCodingAnalytics } from '../controllers/codingAnalyticsController';
import { getCodingReadiness } from '../controllers/codingReadinessController';
import { createIntegritySession, getIntegritySession, processIntegritySignal, endIntegritySession, heartbeatIntegritySession, getIntegrityEvents, getUserMalpracticeRecords } from '../controllers/integrityController';
import { requireAuth } from '@clerk/express';

const router = Router();

// Dashboard data endpoint
// We use requireAuth to ensure the user is authenticated
router.get('/dashboard', requireAuth(), getDashboardData);
router.get('/analytics', requireAuth(), getCodingAnalytics);
router.get('/readiness', requireAuth(), getCodingReadiness);
router.get('/problems/:slug', requireAuth(), getProblemBySlug);
router.get('/submissions', requireAuth(), getSubmissions);
router.post('/execute', requireAuth(), executeCode);
router.post('/run-tests', requireAuth(), runTests);
router.post('/submit', requireAuth(), submitCode);
router.post('/analyze', requireAuth(), analyzeCode);

// Integrity endpoints
router.post('/integrity/session', requireAuth(), createIntegritySession);
router.get('/integrity/session/:sessionId', requireAuth(), getIntegritySession);
router.post('/integrity/session/:sessionId/signal', requireAuth(), processIntegritySignal);
router.post('/integrity/session/:sessionId/end', requireAuth(), endIntegritySession);
router.post('/integrity/session/:sessionId/heartbeat', requireAuth(), heartbeatIntegritySession);
router.get('/integrity/session/:sessionId/events', requireAuth(), getIntegrityEvents);
router.get('/integrity/malpractice', requireAuth(), getUserMalpracticeRecords);

export default router;
