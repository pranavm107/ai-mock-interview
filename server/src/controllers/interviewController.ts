import { Request, Response } from 'express';
import { generateInterview } from '../services/interview/interviewGenerationService';
import { saveInterview, getInterviewById, deleteInterview } from '../services/interview/interviewStorageService';
import { InterviewSettings } from '../types/interview';
import { generateQuestions } from '../services/interviewQuestionService';
import { getSuggestedInterview } from '../services/interviewRecommendationService';
import { SuggestedInterviewRequestSchema, SuggestedInterviewValidationSchema } from '../types/recommendation';
import { requireAuth } from '@clerk/express';
import { db } from '../config/firebaseAdmin';
import { logger } from '../utils/logger';

export const generateNewInterview = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const auth = authReq.auth ? authReq.auth() : null;
    const actualUserId = auth?.userId;
    
    if (!actualUserId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const requestId = (req as any).requestId;

    logger.info({
      event: 'interview.generation.started',
      userId: actualUserId,
      requestId,
      generationType: req.body.useRecommendation ? 'recommended' : 'custom'
    });

    const { 
      resumeId, 
      targetCompany, 
      targetRole, 
      durationMinutes, 
      totalQuestions, 
      candidateExperienceLevel, 
      atsScore,
      useRecommendation,
      difficulty,
      interviewType,
      experience,
      questionCount,
      company,
      role
    } = req.body;

    const finalCompany = targetCompany || company || '';
    const finalRole = targetRole || role;
    const finalQuestions = totalQuestions || questionCount;
    const finalExperience = candidateExperienceLevel || experience || 'Mid';

    if (!finalRole || typeof finalRole !== 'string' || finalRole.trim() === '') {
      return res.status(400).json({ error: 'Invalid or missing targetRole' });
    }

    if (finalQuestions === undefined || typeof finalQuestions !== 'number' || finalQuestions < 3 || finalQuestions > 10) {
      return res.status(400).json({ error: 'Invalid question count. Must be between 3 and 10.' });
    }
    
    if (durationMinutes !== undefined && (typeof durationMinutes !== 'number' || durationMinutes < 15 || durationMinutes > 60)) {
      return res.status(400).json({ error: 'Invalid duration. Must be between 15 and 60 minutes.' });
    }

    const allowedExperience = ['Student', 'Fresher', 'Junior', 'Mid', 'Senior', 'Lead'];
    if (finalExperience && !allowedExperience.includes(finalExperience)) {
      return res.status(400).json({ error: 'Invalid experience level.' });
    }

    if (difficulty) {
      const allowedDifficulty = ['EASY', 'MEDIUM', 'HARD', 'Easy', 'Medium', 'Hard'];
      if (!allowedDifficulty.includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty level.' });
      }
    }

    if (interviewType) {
      const allowedTypes = ['Technical', 'HR', 'Behavioral', 'Mixed', 'MCQ'];
      if (!allowedTypes.includes(interviewType)) {
        return res.status(400).json({ error: 'Invalid interview type.' });
      }
    }

    let actualResumeId = resumeId || null;

    if (actualResumeId) {
      const resumeDoc = await db.collection('resumes').doc(actualResumeId).get();
      if (!resumeDoc.exists) {
        return res.status(404).json({ 
          success: false,
          error: { code: 'NOT_FOUND', message: 'Resume not found' }
        });
      }
      if (resumeDoc.data()?.userId !== actualUserId) {
        return res.status(403).json({ 
          success: false,
          error: { code: 'FORBIDDEN', message: 'Unauthorized access to resume' } 
        });
      }
    }

    const settings: InterviewSettings = {
      durationMinutes: durationMinutes || 45,
      totalQuestions: finalQuestions,
      targetCompany: finalCompany,
      targetRole: finalRole,
      candidateExperienceLevel: finalExperience as any,
      interviewType: (interviewType || 'Mixed') as any,
      ...(atsScore !== undefined && { atsScore })
    };

    const interview = await generateInterview(actualUserId, actualResumeId, settings);
    const interviewId = await saveInterview(interview);

    logger.info({
      event: 'interview.generation.completed',
      userId: actualUserId,
      requestId,
      durationMs: interview.metadata?.generationTimeMs,
      questionCount: interview.questions?.length,
      success: true
    });

    let responseInterview = interview;
    if (interview.settings?.interviewType === 'MCQ') {
      const safeQuestions = interview.questions?.map((q: any) => {
        const { correctOptionId, explanation, ...safeQ } = q;
        return safeQ;
      });
      responseInterview = { ...interview, questions: safeQuestions } as any;
    }

    res.status(201).json({ id: interviewId, interview: responseInterview });
  } catch (error: any) {
    logger.error({
      event: 'interview.generation.failed',
      userId: (req as any).auth?.userId,
      requestId: (req as any).requestId,
      errorCode: 'INTERVIEW_GENERATION_FAILED',
      success: false
    });
    console.error('Error generating interview:', error.message);
    res.status(500).json({ 
      success: false,
      error: {
        code: 'INTERVIEW_GENERATION_FAILED', 
        message: 'An unexpected error occurred during interview generation.'
      }
    });
  }
};

export const getInterview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const interview = await getInterviewById(id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }
    if (interview.settings?.interviewType === 'MCQ') {
      const safeQuestions = interview.questions?.map(q => {
        const { correctOptionId, explanation, ...safeQ } = q;
        return safeQ;
      });
      return res.json({ ...interview, questions: safeQuestions });
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
    let responseInterview = newInterview;
    if (newInterview.settings?.interviewType === 'MCQ') {
      const safeQuestions = newInterview.questions?.map((q: any) => {
        const { correctOptionId, explanation, ...safeQ } = q;
        return safeQ;
      });
      responseInterview = { ...newInterview, questions: safeQuestions } as any;
    }

    res.status(201).json({ id: interviewId, interview: responseInterview });
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

export const generateInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { company, role, experience, difficulty, skills, questionCount } = req.body;

    if (!company || !role || !questionCount) {
      return res.status(400).json({ error: 'Missing required fields: company, role, or questionCount' });
    }

    const questions = await generateQuestions({
      company,
      role,
      experience: experience || 'Mid',
      difficulty: difficulty || 'Medium',
      skills,
      questionCount
    });

    res.json(questions);
  } catch (error: any) {
    console.error('Error generating questions:', error.message);
    res.status(500).json({ error: error.message || 'Failed to generate questions.' });
  }
};

export const getSuggestedInterviewController = async (req: Request, res: Response) => {
  try {
    // req.auth is provided by Clerk requireAuth middleware
    const authReq = req as any;
    const auth = authReq.auth();
    const userId = auth.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user identity' });
    }

    const requestId = authReq.requestId;

    logger.info({
      event: 'recommendation.requested',
      userId,
      requestId
    });

    // Validate the request body
    const parseResult = SuggestedInterviewRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parseResult.error.format() });
    }

    const suggestedInterview = await getSuggestedInterview(userId, {
      ...parseResult.data,
      requestId // Pass requestId down for timing/logging
    });
    
    if ('status' in suggestedInterview && suggestedInterview.status === 'incomplete_profile') {
      return res.json({
        success: true,
        status: 'incomplete_profile',
        message: suggestedInterview.message,
        missingFields: suggestedInterview.missingFields
      });
    }

    // C7: Final backend security boundary / invariant check
    const validatedSuggestion = SuggestedInterviewValidationSchema.parse(suggestedInterview);

    res.json({
      success: true,
      status: 'ready',
      data: {
        suggestion: validatedSuggestion
      }
    });
  } catch (error: any) {
    let errorCode = 'RECOMMENDATION_FAILED';
    if (error.message === 'AI_RECOMMENDATION_FAILED') errorCode = 'AI_RECOMMENDATION_FAILED';
    else if (error.message.includes('Unauthorized')) errorCode = 'AUTHENTICATION_REQUIRED';
    else if (error.message.includes('not found')) errorCode = 'NOT_FOUND';

    logger.error({
      event: 'recommendation.failed',
      userId: (req as any).auth?.userId || (req as any).auth?.()?.userId || 'unknown',
      requestId: (req as any).requestId,
      errorCode,
      success: false
    });
    console.error('Error generating suggested interview:', error.message);
    
    // Controlled error codes for C14
    if (errorCode === 'AI_RECOMMENDATION_FAILED') {
      return res.status(503).json({
        success: false,
        error: {
          code: 'AI_RECOMMENDATION_FAILED',
          message: 'We couldn\'t prepare an AI recommendation right now.'
        }
      });
    }
    
    // Convert common errors to appropriate status codes
    if (errorCode === 'AUTHENTICATION_REQUIRED') {
      return res.status(401).json({ 
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: error.message 
        }
      });
    }
    if (errorCode === 'NOT_FOUND') {
      return res.status(404).json({ 
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message 
        }
      });
    }

    res.status(500).json({ 
      success: false,
      error: {
        code: 'RECOMMENDATION_FAILED',
        message: 'Failed to generate recommendation.' 
      }
    });
  }
};

export const getMcqInterview = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = req.params.id as string;
    const interview = await getInterviewById(id);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (interview.settings?.interviewType !== 'MCQ') {
      return res.status(400).json({ error: 'Not an MCQ interview' });
    }

    // Strip correctOptionId and explanation
    const safeQuestions = interview.questions?.map(q => {
      const { correctOptionId, explanation, ...safeQ } = q;
      return safeQ;
    });

    res.json({ ...interview, questions: safeQuestions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve interview' });
  }
};

export const submitMcqInterview = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const id = req.params.id as string;
    const { answers } = req.body; 

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Invalid answers payload' });
    }

    const interviewRef = db.collection('interviews').doc(id);
    
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(interviewRef);
      if (!doc.exists) {
        throw new Error('NOT_FOUND');
      }

      const interview = doc.data() as any;

      if (interview.userId !== userId) {
        throw new Error('FORBIDDEN');
      }

      if (interview.settings?.interviewType !== 'MCQ') {
        throw new Error('NOT_MCQ');
      }

      if (interview.status === 'Completed') {
        throw new Error('ALREADY_COMPLETED');
      }

      let correctCount = 0;
      let incorrectCount = 0;
      let unansweredCount = 0;
      const totalQuestions = interview.questions?.length || 0;

      const results = interview.questions?.map((q: any) => {
        const selectedOptionId = answers[q.id];
        const isCorrect = selectedOptionId === q.correctOptionId;
        
        if (!selectedOptionId) {
          unansweredCount++;
        } else if (isCorrect) {
          correctCount++;
        } else {
          incorrectCount++;
        }

        return {
          questionId: q.id,
          selectedOptionId: selectedOptionId || null,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
          isCorrect
        };
      }) || [];

      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      const updateData = {
        status: 'Completed',
        score,
        mcqResult: {
          correctCount,
          incorrectCount,
          unansweredCount,
          totalQuestions,
          score,
          results
        },
        completedAt: new Date().toISOString()
      };

      transaction.update(interviewRef, updateData);

      return updateData;
    });

    res.json({ success: true, result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Interview not found' });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ error: 'Forbidden' });
    if (error.message === 'NOT_MCQ') return res.status(400).json({ error: 'Not an MCQ interview' });
    if (error.message === 'ALREADY_COMPLETED') return res.status(400).json({ error: 'Already completed' });
    
    res.status(500).json({ error: error.message || 'Failed to submit MCQ interview' });
  }
};

import { analyzeSmartSetup } from '../services/interview/smartSetupService';

export const analyzeSmartSetupController = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { resumeId, jobDescription } = req.body;
    let resumeText: string | null = null;
    
    if (resumeId) {
      const resumeDoc = await db.collection('resumes').doc(resumeId).get();
      if (resumeDoc.exists && resumeDoc.data()?.userId === userId) {
        // Find text content, inside analysis.parsedText or analysis.normalizedText
        const data = resumeDoc.data();
        resumeText = data?.analysis?.parsedText || data?.analysis?.normalizedText || null;
      }
    }
    
    if (!resumeText && !jobDescription) {
      return res.status(400).json({ error: 'Must provide either a valid resume ID or job description.' });
    }

    const result = await analyzeSmartSetup(resumeText, jobDescription || null);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Smart Setup Analysis failed:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'SMART_SETUP_FAILED',
        message: error.message || 'Failed to analyze smart setup.'
      }
    });
  }
};

