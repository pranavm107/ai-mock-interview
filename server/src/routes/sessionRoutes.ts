import { Router } from 'express';
import { 
  createNewSession, 
  startSessionEndpoint, 
  submitSessionAnswer, 
  submitAdaptiveAnswer,
  advanceSession, 
  skipSessionQuestion, 
  getSession,
  getUserSessions,
  deleteSessionEndpoint
} from '../controllers/interviewSessionController';

import { requireAuth } from '@clerk/express';

const router = Router();

router.post('/', requireAuth(), createNewSession);
router.get('/user/:userId', requireAuth(), getUserSessions);
router.get('/:id', requireAuth(), getSession);
router.delete('/:id', requireAuth(), deleteSessionEndpoint);
router.post('/:id/start', requireAuth(), startSessionEndpoint);
router.post('/:id/answer', requireAuth(), submitSessionAnswer);
router.post('/:sessionId/adaptive-answer', requireAuth(), submitAdaptiveAnswer);
router.post('/:id/next', requireAuth(), advanceSession);
router.post('/:id/skip', requireAuth(), skipSessionQuestion);

export default router;
