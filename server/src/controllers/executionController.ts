import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { executionService } from '../services/coding/executionService';
import { evaluationService } from '../services/coding/evaluationService';
import { ExecutionRequest } from '../types/execution';
import { db } from '../config/firebaseAdmin';

export const executeCode = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { language, sourceCode, stdin } = req.body;

    if (!language || typeof language !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid language' });
    }
    if (typeof sourceCode !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid source code' });
    }

    const requestPayload: ExecutionRequest = {
      language,
      sourceCode,
      stdin: stdin || ''
    };

    const result = await executionService.execute(userId, requestPayload);
    
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error executing code:', error);
    // Differentiate between user-facing limits and true server errors
    if (error.message && error.message.includes('exceeds maximum allowed size')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const runTests = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { problemSlug, source, language } = req.body;
    if (!problemSlug || !source || !language) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await evaluationService.evaluate(userId, problemSlug, source, language, false);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error running tests:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

export const submitCode = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { problemSlug, source, language } = req.body;
    if (!problemSlug || !source || !language) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await evaluationService.evaluate(userId, problemSlug, source, language, true);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error submitting code:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

export const getSubmissions = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { problemSlug } = req.query;
    
    let query = db.collection('codingSubmissions').where('userId', '==', userId);
    
    if (problemSlug && typeof problemSlug === 'string') {
      query = query.where('problemSlug', '==', problemSlug);
    }
    
    query = query.orderBy('submittedAt', 'desc').limit(20);

    const snapshot = await query.get();
    const submissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ success: true, data: submissions });
  } catch (error: any) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
