import { Router } from 'express';
import { processResumeHandler, reanalyzeResumeHandler } from '../controllers/resumeController';

const router = Router();

router.post('/process', processResumeHandler);
router.post('/:id/reanalyze', reanalyzeResumeHandler);

export default router;
