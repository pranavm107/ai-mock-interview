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
    if (error.message?.startsWith('ACTIVE_SESSION_CONFLICT')) {
      const parts = error.message.split(':');
      const existingSessionId = parts.length > 1 ? parts[1] : undefined;
      return res.status(409).json({ 
        success: false, 
        error: 'ACTIVE_SESSION_CONFLICT',
        existingSessionId 
      });
    }
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

    const sessionId = req.params.sessionId as string;
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

    const sessionId = req.params.sessionId as string;
    const { signalId, type, occurredAt, metadata } = req.body;

    if (!signalId || !type) {
      return res.status(400).json({ success: false, error: 'INVALID_SIGNAL' });
    }

    const result = await integrityService.processSignal(sessionId, userId, signalId, type, occurredAt, metadata);
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

    const sessionId = req.params.sessionId as string;
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

export const heartbeatIntegritySession = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }

    const sessionId = req.params.sessionId as string;
    const session = await integrityService.heartbeatSession(sessionId, userId);
    res.json({ success: true, data: session });
  } catch (error: any) {
    if (error.message === 'SESSION_NOT_FOUND' || error.message === 'SESSION_ACCESS_DENIED' || error.message === 'SESSION_NOT_ACTIVE') {
      return res.status(400).json({ success: false, error: error.message });
    }
    console.error('Error heartbeating integrity session:', error);
    res.status(500).json({ success: false, error: 'INTERNAL_SERVER_ERROR' });
  }
};

export const getIntegrityEvents = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }

    const sessionId = req.params.sessionId as string;
    const { cursor, limit } = req.query;

    let parsedCursor;
    if (cursor && typeof cursor === 'string') {
      try {
        parsedCursor = JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
        if (!parsedCursor.receivedAt || !parsedCursor.eventId) {
          throw new Error('INVALID_CURSOR_FORMAT');
        }
      } catch (err) {
        return res.status(400).json({ success: false, error: 'INVALID_CURSOR' });
      }
    }

    let parsedLimit = 50;
    if (limit && typeof limit === 'string') {
      const parsed = parseInt(limit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        parsedLimit = parsed;
      } else {
        return res.status(400).json({ success: false, error: 'INVALID_PAGE_SIZE' });
      }
    }

    const result = await integrityService.getEvents(sessionId, userId, parsedLimit, parsedCursor);
    res.json({ success: true, data: result });
  } catch (error: any) {
    if (error.message === 'SESSION_NOT_FOUND' || error.message === 'SESSION_ACCESS_DENIED') {
      return res.status(403).json({ success: false, error: error.message });
    }
    console.error('Error fetching integrity events:', error);
    res.status(500).json({ success: false, error: 'INTEGRITY_EVENT_READ_FAILED' });
  }
};

export const getUserMalpracticeRecords = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    const userId = auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'UNAUTHENTICATED' });
    }

    const records = await integrityService.getMalpracticeRecords(userId);
    res.json({ success: true, data: records });
  } catch (error: any) {
    console.error('Error fetching malpractice records:', error);
    res.status(500).json({ success: false, error: 'MALPRACTICE_READ_FAILED' });
  }
};
