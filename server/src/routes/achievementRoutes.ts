import { Router } from 'express';
import { getUserAchievements, getAchievementDefinitions, getAchievements } from '../controllers/achievementController';
import { requireAuth } from '@clerk/express';

const router = Router();

// Aggregate endpoint for frontend
router.get('/', requireAuth(), getAchievements);

// Endpoint to fetch all achievement definitions
router.get('/definitions', requireAuth(), getAchievementDefinitions);

// Endpoint to fetch user's achievement progress
router.get('/user', requireAuth(), getUserAchievements);

export default router;
