import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { aiAnalysisService } from '../services/coding/aiAnalysisService';
import { integrityService } from '../services/coding/integrityService';

export const analyzeCode = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { problemSlug, source, language, sessionId } = req.body;

    if (!problemSlug || !source || !language) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    if (typeof source !== 'string' || typeof language !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid payload types' });
    }

    if (sessionId) {
      try {
        const session = await integrityService.getSession(sessionId, userId);
        if (session.status !== 'ACTIVE') {
          return res.status(403).json({ success: false, error: 'Integrity session is no longer active' });
        }
      } catch (err: any) {
        return res.status(403).json({ success: false, error: 'Unauthorized integrity session access' });
      }
    }

    const result = await aiAnalysisService.analyzeCode(userId, problemSlug, source, language);
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error analyzing code:', error);
    if (error.message && error.message.includes('exceeds maximum allowed size')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (error.message && error.message.includes('CONCURRENT_ANALYSIS')) {
      return res.status(429).json({ success: false, error: 'Concurrent analysis limit reached. Please wait.' });
    }
    if (error.message && (error.message.includes('AI service is temporarily unavailable') || error.message.includes('Quota exceeded'))) {
      return res.status(503).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};
