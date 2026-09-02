import { Router } from 'express';
import { generateResumeAssessmentHandler, getAssessmentHandler } from '../controllers/assessmentController';

const router = Router();

router.post('/resume/generate', generateResumeAssessmentHandler);
router.get('/:assessmentId', getAssessmentHandler);

export default router;
