import { Request, Response } from 'express';
import { codingDashboardService } from '../services/coding/codingDashboardService';
import { getAuth } from '@clerk/express';
import { db } from '../config/firebaseAdmin';

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Attempt to parse timezone from query or default to a safe value
    let timezone = req.query.timezone as string;
    if (!timezone) {
      timezone = 'UTC';
    }

    const data = await codingDashboardService.getDashboardData(userId, timezone);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching coding dashboard data:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getProblemBySlug = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { slug } = req.params;
    
    const snapshot = await db.collection('codingProblems').doc(slug).get();
    if (!snapshot.exists) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    const problem = { id: snapshot.id, ...snapshot.data() };
    res.json({ success: true, data: problem });
  } catch (error: any) {
    console.error('Error fetching problem details:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
