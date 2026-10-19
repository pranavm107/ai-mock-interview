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
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/smart-setup', requireAuth(), analyzeSmartSetupController);

router.post('/generate', requireAuth(), generateNewInterview);
router.post('/suggest', requireAuth(), getSuggestedInterviewController);
router.post('/generate-questions', requireAuth(), generateInterviewQuestions);
router.get('/test-groq', asyncHandler(async (req, res) => {
  const response = await callGroq("Say Hello");
  res.send(response);
}));
router.get('/:id/mcq', requireAuth(), getMcqInterview);
router.post('/:id/mcq/submit', requireAuth(), submitMcqInterview);
router.get('/:id', requireAuth(), getInterview);
router.post('/:id/regenerate', requireAuth(), regenerateInterview);
router.delete('/:id', requireAuth(), deleteInterviewEndpoint);

export default router;

