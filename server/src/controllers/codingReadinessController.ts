import { Request, Response } from 'express';
import { codingReadinessService } from '../services/coding/codingReadinessService';
import { getAuth } from '@clerk/express';

export const getCodingReadiness = async (req: Request, res: Response): Promise<void> => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const timezone = (req.query.timezone as string) || 'UTC';
    const readiness = await codingReadinessService.getReadiness(userId, timezone);
    
    res.json({ success: true, data: readiness });
  } catch (error) {
    console.error('Error fetching coding readiness:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
