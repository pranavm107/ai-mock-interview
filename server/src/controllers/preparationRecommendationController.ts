import { Request, Response } from 'express';
import { getPreparationRecommendations } from '../services/preparationRecommendationService';

export const getRecommendationsHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const result = await getPreparationRecommendations(userId);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Failed to retrieve recommendations:', error);
    return res.status(500).json({ error: 'Failed to retrieve recommendations' });
  }
};
