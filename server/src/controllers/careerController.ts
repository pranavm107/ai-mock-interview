import { Request, Response } from 'express';
import { generateCareerCoaching } from '../services/career/careerCoachService';
import {
  getCareerProfile,
  getLatestCareerScore,
  getLatestWeeklyCoaching,
  getLatestMonthlyCoaching,
  getLatestLearningRoadmap,
  getLatestDailyGoals
} from '../services/career/careerRepository';
import {
  CareerGenerationError,
  CareerValidationError,
  GeminiTimeoutError,
  FirestoreError
} from '../types/careerErrors';
import { aggregateCareerData } from '../services/career/careerAggregationService';
import { getCareerDashboardIntelligence } from '../services/career/careerIntelligenceService';
import { getAuth } from '@clerk/express';

// Define custom interface to extend Express Request with auth from Clerk
interface AuthRequest extends Request {
  auth?: {
    userId: string;
  };
}

import { getCareerMetrics } from '../services/career/careerMetricsService';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    const intelligence = await getCareerDashboardIntelligence(userId);
    res.json(intelligence);
  } catch (error: any) {
    console.error('GET /dashboard Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    const metrics = await getCareerMetrics(userId);
    res.json(metrics);
  } catch (error: any) {
    console.error('GET /metrics Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getScore = async (req: AuthRequest, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await getLatestCareerScore(userId);
    res.json(data);
  } catch (error: any) {
    console.error('GET /score Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getWeekly = async (req: AuthRequest, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await getLatestWeeklyCoaching(userId);
    res.json(data);
  } catch (error: any) {
    console.error('GET /weekly Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getMonthly = async (req: AuthRequest, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await getLatestMonthlyCoaching(userId);
    res.json(data);
  } catch (error: any) {
    console.error('GET /monthly Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getRoadmap = async (req: AuthRequest, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await getLatestLearningRoadmap(userId);
    res.json(data);
  } catch (error: any) {
    console.error('GET /roadmap Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getDailyGoals = async (req: AuthRequest, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const data = await getLatestDailyGoals(userId);
    res.json(data);
  } catch (error: any) {
    console.error('GET /daily Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const generateCoaching = async (req: AuthRequest, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }
    
    // 1. Fetch and aggregate real career data
    const careerContext = await aggregateCareerData(userId);
    
    // 2. Generate coaching based on real data
    const result = await generateCareerCoaching(userId, careerContext);
    res.json(result);
  } catch (error: unknown) {
    console.error('Error generating coaching:', error);
    if (error instanceof CareerValidationError) {
      res.status(400).json({ error: error.message, code: 'VALIDATION_ERROR' });
    } else if (error instanceof GeminiTimeoutError) {
      res.status(408).json({ error: error.message, code: 'TIMEOUT_ERROR' });
    } else if (error instanceof CareerGenerationError) {
      res.status(500).json({ error: error.message, code: 'GENERATION_ERROR' });
    } else if (error instanceof FirestoreError) {
      res.status(500).json({ error: error.message, code: 'FIRESTORE_ERROR' });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' });
    }
  }
};
