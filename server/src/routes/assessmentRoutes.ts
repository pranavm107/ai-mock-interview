import { Router } from 'express';
import { generateResumeAssessmentHandler, getAssessmentHandler, submitAssessmentHandler } from '../controllers/assessmentController';

const router = Router();

router.post('/resume/generate', generateResumeAssessmentHandler);
router.post('/resume/generate', generateResumeAssessmentHandler);
router.get('/:assessmentId', getAssessmentHandler);
router.post('/:assessmentId/submit', submitAssessmentHandler);

export default router;
