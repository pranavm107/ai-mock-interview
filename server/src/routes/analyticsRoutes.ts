import { Router } from 'express';
import { getUnifiedAnalytics } from '../controllers/analyticsController';

const router = Router();

// Route to get unified analytics for a user
router.get('/', getUnifiedAnalytics);

export default router;
