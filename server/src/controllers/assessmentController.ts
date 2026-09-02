import { Request, Response } from 'express';
import { z } from 'zod';
import { generateResumeAssessment } from '../services/resumeAssessmentGenerationService';
import { getAssessmentById, getAssessmentQuestions, toUserSafeQuestion } from '../services/assessmentService';

const GenerateAssessmentRequestSchema = z.object({
  resumeId: z.string().min(1, "resumeId is required")
});

export const generateResumeAssessmentHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const parseResult = GenerateAssessmentRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parseResult.error.issues 
      });
    }

    const { resumeId } = parseResult.data;

    const safeAssessmentResponse = await generateResumeAssessment(userId, resumeId);

    return res.status(201).json({
      success: true,
      data: safeAssessmentResponse
    });
  } catch (error: any) {
    console.error('Assessment generation failed:', error);
    
    if (error.message === 'Unauthorized: Resume does not belong to the user') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message === 'Resume not found') {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Failed to generate assessment' });
  }
};

const GetAssessmentRequestParamsSchema = z.object({
  assessmentId: z.string().min(1, "assessmentId is required")
});

export const getAssessmentHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const parseResult = GetAssessmentRequestParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parseResult.error.issues 
      });
    }

    const { assessmentId } = parseResult.data;

    const assessment = await getAssessmentById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Assessment does not belong to the user' });
    }

    // Status Handling
    if (assessment.status === 'GENERATING' || assessment.status === 'FAILED') {
      return res.status(200).json({
        success: true,
        assessment
        // Do not fetch questions for GENERATING or FAILED
      });
    }

    // READY, IN_PROGRESS, COMPLETED
    const backendQuestions = await getAssessmentQuestions(assessmentId);
    const safeQuestions = backendQuestions.map(toUserSafeQuestion);

    return res.status(200).json({
      success: true,
      assessment,
      questions: safeQuestions
    });
  } catch (error: any) {
    console.error('Assessment retrieval failed:', error);
    return res.status(500).json({ error: 'Failed to retrieve assessment' });
  }
};
