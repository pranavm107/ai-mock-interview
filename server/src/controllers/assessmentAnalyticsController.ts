import { Request, Response } from 'express';
import { getUserAnalytics } from '../services/assessmentAnalyticsService';

export const getAnalyticsHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const analytics = await getUserAnalytics(userId);

    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error: any) {
    console.error('Failed to retrieve analytics:', error);
    return res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
};
