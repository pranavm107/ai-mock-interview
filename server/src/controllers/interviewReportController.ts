import { Request, Response } from 'express';
import { getReportBySessionId, listReportsByUser, deleteReport, getReport } from '../services/report/reportStorageService';

export const getSessionReport = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const report = await getReportBySessionId(sessionId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found for this session.' });
    }
    
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch report' });
  }
};

export const getUserReports = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const reports = await listReportsByUser(userId);
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user reports' });
  }
};

export const deleteUserReport = async (req: Request, res: Response) => {
  try {
    const reportId = req.params.reportId as string;
    
    const report = await getReport(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    await deleteReport(reportId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete report' });
  }
};
