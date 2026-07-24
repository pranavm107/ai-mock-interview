import { Request, Response } from 'express';
import { generateReplayPayload } from '../services/replay/replayEngine';
import { createBookmark, editBookmark, removeBookmark } from '../services/replay/bookmarkService';
import { getInterviewSessionById } from '../services/runtime/sessionStorageService';

const verifyOwnership = async (req: Request, res: Response, sessionId: string) => {
  // @ts-ignore - Clerk injects auth property
  const userId = req.auth?.userId as string | undefined;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
    return false;
  }
  const session = await getInterviewSessionById(sessionId);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return false;
  }
  if (session.userId !== userId) {
    res.status(403).json({ error: 'Forbidden: You do not have access to this session replay' });
    return false;
  }
  return true;
};

export const getReplaySession = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const isAuthorized = await verifyOwnership(req, res, sessionId);
    if (!isAuthorized) return;

    const replaySession = await generateReplayPayload(sessionId);
    res.json(replaySession);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get replay session';
    res.status(500).json({ error: msg });
  }
};

export const addBookmark = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const isAuthorized = await verifyOwnership(req, res, sessionId);
    if (!isAuthorized) return;

    const bookmarkData = req.body;
    
    if (!bookmarkData || !bookmarkData.type || !bookmarkData.questionId) {
      return res.status(400).json({ error: 'Missing required bookmark data' });
    }

    const bookmark = await createBookmark(sessionId, bookmarkData);
    res.status(201).json(bookmark);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to add bookmark';
    res.status(500).json({ error: msg });
  }
};

export const updateBookmark = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const bookmarkId = req.params.bookmarkId as string;
    const isAuthorized = await verifyOwnership(req, res, sessionId);
    if (!isAuthorized) return;

    const updates = req.body;

    await editBookmark(sessionId, bookmarkId, updates);
    res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update bookmark';
    res.status(500).json({ error: msg });
  }
};

export const deleteBookmark = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const bookmarkId = req.params.bookmarkId as string;
    const isAuthorized = await verifyOwnership(req, res, sessionId);
    if (!isAuthorized) return;

    await removeBookmark(sessionId, bookmarkId);
    res.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete bookmark';
    res.status(500).json({ error: msg });
  }
};
