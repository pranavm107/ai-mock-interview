import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { getReadinessProfile } from '../services/analytics/readinessIntelligenceService';

export const getReadinessIntelligence = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await getReadinessProfile(userId);

    // Optional: Could add an AI layer here to explain the weaknesses if we want,
    // but the prompt strictly says it must be based on evidence and fallback if AI fails.
    // For now, the deterministic profile alone fulfills all requirements heavily.

    return res.status(200).json(profile);
  } catch (error: any) {
    console.error('Readiness Intelligence Error:', error.message || error);
    return res.status(500).json({ error: 'Failed to generate readiness profile' });
  }
};
