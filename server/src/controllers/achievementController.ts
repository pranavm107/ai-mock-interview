import { Request, Response } from 'express';
import { achievementService } from '../services/achievementService';
import { getAuth } from '@clerk/express'; // Use getAuth to securely extract the auth state

export const getUserAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const achievements = await achievementService.getUserAchievements(userId);
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAchievementDefinitions = async (req: Request, res: Response): Promise<void> => {
  try {
    const definitions = await achievementService.getAchievementDefinitions();
    res.json(definitions);
  } catch (error) {
    console.error('Error fetching achievement definitions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAchievements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = await achievementService.getAchievementsForUser(userId);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching achievements aggregate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
