import { Router } from 'express';
import { generateResumeAssessmentHandler, getAssessmentHandler, generatePreparationAssessmentHandler, submitAssessmentHandler, getResultHandler } from '../controllers/assessmentController';

const router = Router();

router.post('/resume/generate', generateResumeAssessmentHandler);
router.post('/placement/generate', generatePreparationAssessmentHandler);
router.get('/:assessmentId', getAssessmentHandler);
router.post('/:assessmentId/submit', submitAssessmentHandler);
router.get('/:assessmentId/result', getResultHandler);

export default router;
