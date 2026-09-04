import { Request, Response } from 'express';
import { z } from 'zod';
import { generateResumeAssessment } from '../services/resumeAssessmentGenerationService';
import { getAssessmentById, getAssessmentQuestions, toUserSafeQuestion, saveAssessmentResultAtomically, getAssessmentResult, getUserAssessments } from '../services/assessmentService';
import { evaluateSubmission } from '../services/assessmentEvaluationService';

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

const AssessmentAnswerSubmissionSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1)
});

const SubmitAssessmentRequestSchema = z.object({
  answers: z.array(AssessmentAnswerSubmissionSchema)
});

export const submitAssessmentHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const paramParse = GetAssessmentRequestParamsSchema.safeParse(req.params);
    if (!paramParse.success) {
      return res.status(400).json({ error: 'Invalid assessment ID', details: paramParse.error.issues });
    }
    const { assessmentId } = paramParse.data;

    const bodyParse = SubmitAssessmentRequestSchema.safeParse(req.body);
    if (!bodyParse.success) {
      return res.status(400).json({ error: 'Invalid submission payload', details: bodyParse.error.issues });
    }
    const submission = bodyParse.data;

    const assessment = await getAssessmentById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    if (assessment.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Assessment does not belong to the user' });
    }

    if (assessment.status === 'COMPLETED' || assessment.status === 'FAILED' || assessment.status === 'GENERATING') {
      return res.status(400).json({ error: `Cannot submit assessment in status: ${assessment.status}` });
    }

    // Retrieve backend questions to evaluate
    const backendQuestions = await getAssessmentQuestions(assessmentId);

    // Evaluate
    const result = evaluateSubmission(assessment, backendQuestions, submission);

    // Save Results and Update Status Atomically
    const success = await saveAssessmentResultAtomically(assessmentId, result.answeredQuestions, result);
    
    if (!success) {
      return res.status(400).json({ error: 'Cannot submit assessment in status: COMPLETED' });
    }

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error: any) {
    console.error('Assessment submission failed:', error);
    return res.status(500).json({ error: 'Failed to submit assessment' });
  }
};

export const getAssessmentResultHandler = async (req: Request, res: Response) => {
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

    if (assessment.status !== 'COMPLETED') {
      return res.status(409).json({ error: 'Conflict: Assessment is not completed' });
    }

    const result = await getAssessmentResult(assessmentId);
    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }

    return res.status(200).json({
      success: true,
      assessmentId,
      result
    });
  } catch (error: any) {
    console.error('Result retrieval failed:', error);
    return res.status(500).json({ error: 'Failed to retrieve assessment result' });
  }
};

const GetAssessmentHistoryQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional(),
  cursor: z.string().optional(),
  type: z.string().optional(),
  resumeId: z.string().optional()
});

export const getAssessmentHistoryHandler = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = typeof authReq.auth === 'function' ? authReq.auth() : authReq.auth;
    const userId = auth?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const parseResult = GetAssessmentHistoryQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid query parameters', 
        details: parseResult.error.issues 
      });
    }

    const { limit, cursor, type, resumeId } = parseResult.data;

    const { assessments, nextCursor } = await getUserAssessments(userId, {
      limit, cursor, type, resumeId
    });

    return res.status(200).json({
      success: true,
      assessments,
      nextCursor
    });
  } catch (error: any) {
    console.error('History retrieval failed:', error);
    return res.status(500).json({ error: 'Failed to retrieve assessment history' });
  }
};
