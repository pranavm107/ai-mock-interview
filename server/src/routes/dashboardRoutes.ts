import { Router } from 'express';
import { getDashboardState } from '../controllers/dashboardController';

const router = Router();

// Route to get dashboard state for a user
router.get('/:userId', getDashboardState);

export default router;
