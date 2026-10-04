import { Router } from 'express';
import { generateResumeAssessmentHandler, getAssessmentHandler, generatePreparationAssessmentHandler, submitAssessmentHandler, getResultHandler, getAssessmentsHandler, getStatsHandler } from '../controllers/assessmentController';
import { getAnalyticsHandler } from '../controllers/assessmentAnalyticsController';
import { getRecommendationsHandler } from '../controllers/preparationRecommendationController';

const router = Router();

router.get('/', getAssessmentsHandler);
router.get('/stats', getStatsHandler);
router.get('/analytics', getAnalyticsHandler);
router.get('/recommendations', getRecommendationsHandler);
router.post('/resume/generate', generateResumeAssessmentHandler);
router.post('/placement/generate', generatePreparationAssessmentHandler);
router.get('/:assessmentId', getAssessmentHandler);
router.post('/:assessmentId/submit', submitAssessmentHandler);
router.get('/:assessmentId/result', getResultHandler);

export default router;
