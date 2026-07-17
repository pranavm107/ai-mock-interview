import { Request, Response } from 'express';
import { generateInterview } from '../services/interview/interviewGenerationService';
import { saveInterview, getInterviewById, deleteInterview } from '../services/interview/interviewStorageService';
import { InterviewSettings } from '../types/interview';

export const generateNewInterview = async (req: Request, res: Response) => {
  try {
    const { userId, resumeId, targetCompany, targetRole, durationMinutes, totalQuestions, candidateExperienceLevel, atsScore } = req.body;

    if (!targetCompany || !targetRole || !totalQuestions) {
      return res.status(400).json({ error: 'Missing required fields: targetCompany, targetRole, or totalQuestions' });
    }

    const settings: InterviewSettings = {
      durationMinutes: durationMinutes || 45,
      totalQuestions,
      targetCompany,
      targetRole,
      candidateExperienceLevel: candidateExperienceLevel || 'Mid',
      ...(atsScore !== undefined && { atsScore })
    };

    const interview = await generateInterview(userId || 'anonymous', resumeId, settings);
    const interviewId = await saveInterview(interview);

    res.status(201).json({ id: interviewId, interview });
  } catch (error: any) {
    console.error('Error generating interview:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate interview.' });
  }
};

export const getInterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const interview = await getInterviewById(id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    res.json(interview);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve interview' });
  }
};

export const regenerateInterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existingInterview = await getInterviewById(id);
    
    if (!existingInterview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    
    // Regenerate using the same settings
    const newInterview = await generateInterview(
      existingInterview.userId || 'anonymous', 
      existingInterview.resumeId, 
      existingInterview.settings
    );
    
    const interviewId = await saveInterview(newInterview);
    res.status(201).json({ id: interviewId, interview: newInterview });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to regenerate interview' });
  }
};

export const deleteInterviewEndpoint = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await deleteInterview(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete interview' });
  }
};
