import { Router } from 'express';
import { 
  generateNewInterview, 
  getInterview, 
  regenerateInterview, 
  deleteInterviewEndpoint 
} from '../controllers/interviewController';

const router = Router();

router.post('/generate', generateNewInterview);
router.get('/:id', getInterview);
router.post('/:id/regenerate', regenerateInterview);
router.delete('/:id', deleteInterviewEndpoint);

export default router;
