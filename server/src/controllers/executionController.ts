import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { executionService } from '../services/coding/executionService';
import { evaluationService } from '../services/coding/evaluationService';
import { ExecutionRequest } from '../types/execution';
import { db } from '../config/firebaseAdmin';
import { integrityService } from '../services/coding/integrityService';

export const executeCode = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { language, sourceCode, stdin, sessionId } = req.body;

    if (!language || typeof language !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid language' });
    }
    if (typeof sourceCode !== 'string') {
      return res.status(400).json({ success: false, error: 'Invalid source code' });
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
    if (error.message && error.message.includes('CONCURRENT_EXECUTION')) {
      return res.status(429).json({ success: false, error: 'Concurrent execution limit reached. Please wait.' });
    }
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const runTests = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { problemSlug, source, language, sessionId } = req.body;
    if (!problemSlug || !source || !language) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
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

    const result = await evaluationService.evaluate(userId, problemSlug, source, language, false, sessionId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error running tests:', error);
    if (error.message && (error.message.includes('CONCURRENT_EXECUTION') || error.message.includes('CONCURRENT_EVALUATION'))) {
      return res.status(429).json({ success: false, error: 'Concurrent execution limit reached. Please wait.' });
    }
    if (error.message && error.message.includes('terminated during evaluation')) {
      return res.status(403).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

export const submitCode = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { problemSlug, source, language, sessionId } = req.body;
    if (!problemSlug || !source || !language) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
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

    const result = await evaluationService.evaluate(userId, problemSlug, source, language, true, sessionId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error submitting code:', error);
    if (error.message && (error.message.includes('CONCURRENT_EXECUTION') || error.message.includes('CONCURRENT_EVALUATION'))) {
      return res.status(429).json({ success: false, error: 'Concurrent execution limit reached. Please wait.' });
    }
    if (error.message && error.message.includes('terminated during evaluation')) {
      return res.status(403).json({ success: false, error: error.message });
    }
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
