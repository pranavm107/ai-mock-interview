import { Router } from 'express';
import { generateResumeAssessmentHandler, getAssessmentHandler, submitAssessmentHandler, getAssessmentHistoryHandler, getAssessmentResultHandler } from '../controllers/assessmentController';

const router = Router();

router.get('/', getAssessmentHistoryHandler);
router.post('/resume/generate', generateResumeAssessmentHandler);
router.get('/:assessmentId/result', getAssessmentResultHandler);
router.get('/:assessmentId', getAssessmentHandler);
router.post('/:assessmentId/submit', submitAssessmentHandler);

export default router;
