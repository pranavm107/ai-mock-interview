import express from 'express';
import { startVoiceSession, stopVoiceSession, replayQuestion, getVoiceSessionStatus } from '../controllers/voiceController';

const router = express.Router();

// Start a voice session
router.post('/session/:sessionId/start', startVoiceSession);

// Stop a voice session
router.post('/session/:sessionId/stop', stopVoiceSession);

// Replay a question (Text-to-Speech)
router.post('/session/:sessionId/replay', replayQuestion);

// Get status of a voice session
router.get('/session/:sessionId/status', getVoiceSessionStatus);

import { startAnswer, finishAnswer, restartAnswer, nextQuestion } from '../controllers/voiceController';

router.post('/session/:sessionId/start-answer', startAnswer);
router.post('/session/:sessionId/finish-answer', finishAnswer);
router.post('/session/:sessionId/restart-answer', restartAnswer);
router.post('/session/:sessionId/next-question', nextQuestion);

export default router;
