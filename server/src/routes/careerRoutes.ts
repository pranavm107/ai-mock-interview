import { Router } from 'express';
import {
  getDashboard,
  getMetrics,
  getScore,
  getWeekly,
  getMonthly,
  getRoadmap,
  getDailyGoals,
  generateCoaching
} from '../controllers/careerController';

const router = Router();

// All routes rely on req.auth?.userId checked in controllers

router.get('/dashboard', getDashboard);
router.get('/metrics', getMetrics);
router.get('/score', getScore);
router.get('/weekly', getWeekly);
router.get('/monthly', getMonthly);
router.get('/roadmap', getRoadmap);
router.get('/daily-goals', getDailyGoals);
router.post('/generate', generateCoaching);

export default router;
