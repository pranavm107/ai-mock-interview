import { Router } from 'express';
import { generateInterviewQuestions } from '../controllers/interviewController';
import { callGemini } from '../services/geminiService';

const router = Router();

router.post('/generate', generateInterviewQuestions);

// Temporary test route for Phase 1 verification
router.get('/test-gemini', async (req, res) => {
  try {
    const response = await callGemini("Say Hello");
    res.send(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

export default router;
