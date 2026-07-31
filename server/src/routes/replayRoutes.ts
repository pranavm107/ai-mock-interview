import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { 
  getReplaySession, 
  addBookmark, 
  updateBookmark, 
  deleteBookmark 
} from '../controllers/replayController';

const router = Router();

// Base route is /api/interview-sessions

router.get('/:sessionId/replay', requireAuth(), getReplaySession);
router.post('/:sessionId/bookmarks', requireAuth(), addBookmark);
router.patch('/:sessionId/bookmarks/:bookmarkId', requireAuth(), updateBookmark);
router.delete('/:sessionId/bookmarks/:bookmarkId', requireAuth(), deleteBookmark);

export default router;
