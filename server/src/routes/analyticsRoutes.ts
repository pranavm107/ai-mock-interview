import { Router } from 'express';
import { getUnifiedAnalytics } from '../controllers/analyticsController';
import { getReadinessIntelligence } from '../controllers/readinessController';

const router = Router();

// Route to get unified analytics for a user
router.get('/', getUnifiedAnalytics);

// Route to get longitudinal readiness intelligence (I7)
router.get('/readiness', getReadinessIntelligence);

export default router;
