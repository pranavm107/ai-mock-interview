import { Router } from 'express';
import { getSessionReport, getUserReports, deleteUserReport } from '../controllers/interviewReportController';

const router = Router();

router.get('/session/:sessionId', getSessionReport);
router.get('/user/:userId', getUserReports);
router.delete('/:reportId', deleteUserReport);

export default router;
