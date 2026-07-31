import { Router } from 'express';
import { 
  generateNewInterview, 
  getInterview, 
  regenerateInterview, 
  deleteInterviewEndpoint,
  generateInterviewQuestions
} from '../controllers/interviewController';
import { callGemini } from '../services/geminiService';

const router = Router();

router.post('/generate', generateNewInterview);
router.post('/generate-questions', generateInterviewQuestions);
router.get('/test-gemini', async (req, res) => {
  try {
    const response = await callGemini("Say Hello");
    res.send(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});
router.get('/:id', getInterview);
router.post('/:id/regenerate', regenerateInterview);
router.delete('/:id', deleteInterviewEndpoint);

export default router;

