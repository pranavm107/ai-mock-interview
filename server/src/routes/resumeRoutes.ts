import { Router } from 'express';
import { processResumeHandler } from '../controllers/resumeController';

const router = Router();

router.post('/process', processResumeHandler);

export default router;
