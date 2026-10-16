import { Request, Response } from 'express';
import { codingAnalyticsService } from '../services/coding/codingAnalyticsService';
import { getAuth } from '@clerk/express';

export const getCodingAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const timezone = (req.query.timezone as string) || 'UTC';
    const analytics = await codingAnalyticsService.getUserAnalytics(userId, timezone);

    res.json(analytics);
  } catch (error: any) {
    console.error('Error fetching coding analytics:', error);
    res.status(500).json({ error: 'Failed to fetch coding analytics' });
  }
};
