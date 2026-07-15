import { Request, Response } from 'express';
import { processResume } from '../services/resumeProcessingService';

export const processResumeHandler = async (req: Request, res: Response) => {
  const { resumeId, fileUrl } = req.body;

  if (!resumeId || !fileUrl) {
    return res.status(400).json({ error: 'resumeId and fileUrl are required' });
  }

  try {
    await processResume(resumeId, fileUrl);
    res.status(200).json({ message: 'Resume processed successfully' });
  } catch (error: any) {
    console.error('Error in processResumeHandler:', error);
    res.status(500).json({ error: 'Failed to process resume' });
  }
};
