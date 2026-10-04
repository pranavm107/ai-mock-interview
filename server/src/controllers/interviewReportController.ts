import { Request, Response } from 'express';
import { getReportBySessionId, listReportsByUser, deleteReport, getReport } from '../services/report/reportStorageService';

export const getSessionReport = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    // @ts-ignore - Clerk injects auth property
    const authReq = req as any;
    const auth = authReq.auth();
    const userId = auth.userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let report = await getReportBySessionId(sessionId);
    
    if (!report) {
      // Automatic recovery: If the report was not generated during session completion (e.g. due to rate limits), try to generate it now.
      const { getInterviewSessionById } = await import('../services/runtime/sessionStorageService');
      const session = await getInterviewSessionById(sessionId);
      
      if (session && (session.state === 'COMPLETED' || (session as any).status === 'completed')) {
        if (session.userId !== userId) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        
        const { getInterviewById } = await import('../services/interview/interviewStorageService');
        const interview = await getInterviewById(session.interviewId);
        if (interview) {
          const { generateInterviewReport } = await import('../services/report/reportGenerationService');
          report = await generateInterviewReport(session, interview);
        }
      }
    }
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found for this session.' });
    }

    if (report.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch report' });
  }
};

export const getUserReports = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const authReq = req as any;
    const auth = authReq.auth();
    const userId = auth.userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Force fetching reports for the authenticated user, ignoring params to prevent IDOR
    const reports = await listReportsByUser(userId);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user reports' });
  }
};

export const deleteUserReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.reportId as string;
    // @ts-ignore
    const authReq = req as any;
    const auth = authReq.auth();
    const userId = auth.userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const report = await getReport(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (report.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await deleteReport(reportId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete report' });
  }
};
