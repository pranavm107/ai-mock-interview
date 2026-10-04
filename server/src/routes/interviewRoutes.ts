import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import { 
  generateNewInterview, 
  getInterview, 
  regenerateInterview, 
  deleteInterviewEndpoint,
  generateInterviewQuestions,
  getSuggestedInterviewController,
  getMcqInterview,
  submitMcqInterview,
  analyzeSmartSetupController
} from '../controllers/interviewController';
import { callGroq } from '../services/groqService';

const router = Router();

router.post('/smart-setup', requireAuth(), analyzeSmartSetupController);

router.post('/generate', requireAuth(), generateNewInterview);
router.post('/suggest', requireAuth(), getSuggestedInterviewController);
router.post('/generate-questions', generateInterviewQuestions);
router.get('/test-groq', async (req, res) => {
  try {
    const response = await callGroq("Say Hello");
    res.send(response);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});
router.get('/:id/mcq', requireAuth(), getMcqInterview);
router.post('/:id/mcq/submit', requireAuth(), submitMcqInterview);
router.get('/:id', getInterview);
router.post('/:id/regenerate', regenerateInterview);
router.delete('/:id', deleteInterviewEndpoint);

export default router;

