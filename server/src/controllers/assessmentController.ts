import { Request, Response } from 'express';
import { z } from 'zod';
import { generateResumeAssessment } from '../services/resumeAssessmentGenerationService';
import { generatePreparationAssessment } from '../services/preparationAssessmentGenerationService';
import { getAssessmentById, getAssessmentQuestions, toUserSafeQuestion, updateAssessmentStatus, getUserAssessments, getUserAssessmentStats } from '../services/assessmentService';
import { submitAssessment } from '../services/assessmentSubmissionService';

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

const GeneratePreparationAssessmentRequestSchema = z.object({
  categorySlug: z.enum(['aptitude', 'technical-mcqs', 'verbal-ability', 'logical-reasoning']),
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  questionCount: z.number().int().min(5).max(20),
  mode: z.enum(['PRACTICE', 'TIMED'])
});

export const generatePreparationAssessmentHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const parseResult = GeneratePreparationAssessmentRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: parseResult.error.issues 
      });
    }

    const { categorySlug, topic, difficulty, questionCount, mode } = parseResult.data;

    const safeAssessmentResponse = await generatePreparationAssessment(
      userId,
      categorySlug,
      topic,
      difficulty,
      questionCount,
      mode
    );

    return res.status(201).json({
      success: true,
      data: safeAssessmentResponse
    });
  } catch (error: any) {
    console.error('Preparation Assessment generation failed:', error);
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
    let isReady = assessment.status === 'READY';
    
    // If first fetch, start the assessment
    if (isReady) {
      const now = new Date().toISOString();
      await updateAssessmentStatus(assessmentId, 'IN_PROGRESS', { startedAt: now });
      assessment.status = 'IN_PROGRESS';
      assessment.startedAt = now;
    }

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

const SubmitAssessmentRequestSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1),
    selectedOptionId: z.string()
  }))
});

export const submitAssessmentHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const paramsParse = GetAssessmentRequestParamsSchema.safeParse(req.params);
    if (!paramsParse.success) {
      return res.status(400).json({ error: 'Invalid assessmentId' });
    }
    const { assessmentId } = paramsParse.data;

    const bodyParse = SubmitAssessmentRequestSchema.safeParse(req.body);
    if (!bodyParse.success) {
      return res.status(400).json({ error: 'Invalid submission data', details: bodyParse.error.issues });
    }
    const submission = bodyParse.data;

    const result = await submitAssessment(userId, assessmentId, submission);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Assessment submission failed:', error);
    if (error.message.startsWith('Forbidden')) return res.status(403).json({ error: error.message });
    if (error.message.startsWith('Assessment not found')) return res.status(404).json({ error: error.message });
    if (error.message.startsWith('Assessment is not ready')) return res.status(400).json({ error: error.message });
    
    return res.status(500).json({ error: 'Failed to submit assessment' });
  }
};

export const getResultHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const parseResult = GetAssessmentRequestParamsSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const { assessmentId } = parseResult.data;

    const assessment = await getAssessmentById(assessmentId);

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Assessment does not belong to the user' });
    }

    if (assessment.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Assessment is not completed yet.' });
    }

    // Since we don't have a direct getResult service method yet, we can fetch it via submission service 
    // passing empty answers. The service already returns the cached result if status === 'COMPLETED'.
    const result = await submitAssessment(userId, assessmentId, { answers: [] });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Result retrieval failed:', error);
    return res.status(500).json({ error: 'Failed to retrieve results' });
  }
};

const GetAssessmentsQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(['GENERATING', 'READY', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).optional(),
  limit: z.preprocess((val) => (val ? parseInt(String(val), 10) : undefined), z.number().int().positive()).optional()
});

export const getAssessmentsHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const parseResult = GetAssessmentsQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid query parameters', details: parseResult.error.issues });
    }

    const { category, status, limit = 50 } = parseResult.data;

    const assessments = await getUserAssessments(userId, { category, status, limit });

    return res.status(200).json({
      success: true,
      data: assessments
    });
  } catch (error: any) {
    console.error('Failed to retrieve assessments:', error);
    return res.status(500).json({ error: 'Failed to retrieve assessments' });
  }
};

export const getStatsHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const stats = await getUserAssessmentStats(userId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Failed to retrieve assessment stats:', error);
    return res.status(500).json({ error: 'Failed to retrieve assessment stats' });
  }
};
