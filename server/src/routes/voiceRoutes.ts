import express from 'express';
import { requireAuth } from '@clerk/express';
import { startVoiceSession, stopVoiceSession, replayQuestion, getVoiceSessionStatus } from '../controllers/voiceController';
import { startAnswer, finishAnswer, restartAnswer, nextQuestion } from '../controllers/voiceController';

const router = express.Router();

// Start a voice session
router.post('/session/:sessionId/start', requireAuth(), startVoiceSession);

// Stop a voice session
router.post('/session/:sessionId/stop', requireAuth(), stopVoiceSession);

// Replay a question (Text-to-Speech)
router.post('/session/:sessionId/replay', requireAuth(), replayQuestion);

// Get status of a voice session
router.get('/session/:sessionId/status', requireAuth(), getVoiceSessionStatus);

router.post('/session/:sessionId/start-answer', requireAuth(), startAnswer);
router.post('/session/:sessionId/finish-answer', requireAuth(), finishAnswer);
router.post('/session/:sessionId/restart-answer', requireAuth(), restartAnswer);
router.post('/session/:sessionId/next-question', requireAuth(), nextQuestion);

export default router;
