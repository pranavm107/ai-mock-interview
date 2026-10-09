import { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { integrityService } from '../services/coding/integrityService';

export const createIntegritySession = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }

    const { problemId, language, mode } = req.body;
    
    if (!problemId || !language || mode !== 'INTEGRITY') {
      return res.status(400).json({ success: false, error: 'INVALID_SESSION' });
    }

    const session = await integrityService.createSession(userId, problemId, language, mode);
    res.json({ success: true, data: session });
  } catch (error: any) {
    console.error('Error creating integrity session:', error);
    res.status(500).json({ success: false, error: 'INTEGRITY_SESSION_CREATION_FAILED' });
  }
};

export const getIntegritySession = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }

    const { sessionId } = req.params;
    const session = await integrityService.getSession(sessionId, userId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    if (error.message === 'SESSION_NOT_FOUND' || error.message === 'SESSION_ACCESS_DENIED') {
      return res.status(403).json({ success: false, error: error.message });
    }
    console.error('Error fetching integrity session:', error);
    res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR' });
  }
};

export const processIntegritySignal = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }

    const { sessionId } = req.params;
    const { signalId, type } = req.body;

    if (!signalId || !type) {
      return res.status(400).json({ success: false, error: 'INVALID_SIGNAL' });
    }

    const result = await integrityService.processSignal(sessionId, userId, signalId, type);
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'SESSION_NOT_FOUND' || error.message === 'SESSION_ACCESS_DENIED' || error.message === 'INVALID_SIGNAL') {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Error processing integrity signal:', error);
    res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR' });
  }
};

export const endIntegritySession = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }

    const { sessionId } = req.params;
    const session = await integrityService.endSession(sessionId, userId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    if (error.message === 'SESSION_NOT_FOUND' || error.message === 'SESSION_ACCESS_DENIED') {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Error ending integrity session:', error);
    res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR' });
  }
};
