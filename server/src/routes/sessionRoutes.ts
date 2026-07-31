import { Router } from 'express';
import { 
  createNewSession, 
  startSessionEndpoint, 
  submitSessionAnswer, 
  advanceSession, 
  skipSessionQuestion, 
  getSession,
  getUserSessions
} from '../controllers/interviewSessionController';

const router = Router();

router.post('/', createNewSession);
router.get('/user/:userId', getUserSessions);
router.get('/:id', getSession);
router.post('/:id/start', startSessionEndpoint);
router.post('/:id/answer', submitSessionAnswer);
router.post('/:id/next', advanceSession);
router.post('/:id/skip', skipSessionQuestion);

export default router;
