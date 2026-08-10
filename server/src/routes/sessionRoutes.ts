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
router.get('/user/:userId', getUserSessions);
router.get('/:id', getSession);
router.delete('/:id', deleteSessionEndpoint);
router.post('/:id/start', startSessionEndpoint);
router.post('/:id/answer', submitSessionAnswer);
router.post('/:sessionId/adaptive-answer', submitAdaptiveAnswer);
router.post('/:id/next', advanceSession);
router.post('/:id/skip', skipSessionQuestion);

export default router;
