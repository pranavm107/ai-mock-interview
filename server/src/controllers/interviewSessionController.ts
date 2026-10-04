import { Request, Response } from 'express';
import { initializeSession, startSession, submitAnswer, proceedToNextQuestion, skipQuestion } from '../services/runtime/sessionService';
import { processAdaptiveAnswer } from '../services/adaptive/adaptiveInterviewService';
import { getInterviewById } from '../services/interview/interviewStorageService';
import { getInterviewSessionById, deleteInterviewSession } from '../services/runtime/sessionStorageService';
import { deleteInterview } from '../services/interview/interviewStorageService';
import { getActiveVoiceSession } from './voiceController';
import { generateCommunicationAnalytics } from '../services/speech/speechAnalyticsEngine';
import { saveSpeechAnalytics, getSessionSpeechSummary, getSpeechTimeline } from '../services/speech/speechStorageService';

export const createNewSession = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.body;
    const authReq = req as any;
    const userId = authReq.auth ? authReq.auth().userId : null;
    
    if (!interviewId || !userId) {
      return res.status(400).json({ error: 'Missing interviewId or unauthorized' });
    }

    const interview = await getInterviewById(interviewId);
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const session = await initializeSession(interviewId, userId, interview);
    res.status(201).json(session);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create session';
    res.status(500).json({ error: msg });
  }
};

export const startSessionEndpoint = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;
    
    const session = await getInterviewSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    
    const interview = await getInterviewById(session.interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const updatedSession = await startSession(id, interview);
    res.json(updatedSession);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to start session';
    res.status(500).json({ error: msg });
  }
};

export const submitSessionAnswer = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;
    const { questionId, answerText, startTime, wordCount } = req.body;
    
    if (!questionId || !answerText || !startTime) {
      return res.status(400).json({ error: 'Missing answer details' });
    }
    if (typeof answerText !== 'string' || answerText.length > 10000) {
      return res.status(400).json({ error: 'Answer is invalid or too long' });
    }

    const session = await getInterviewSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const { getAnswersBySession } = await import('../services/runtime/answerStorageService');
    const existingAnswers = await getAnswersBySession(id);
    const existingAnswer = existingAnswers.find(a => a.questionId === questionId && a.answerText === answerText);
    
    if (existingAnswer) {
      return res.json(session);
    }

    const { session: updatedSession } = await submitAnswer(id, questionId, answerText, startTime, wordCount || 0);
    res.json(updatedSession);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to submit answer';
    res.status(500).json({ error: msg });
  }
};

export const advanceSession = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;
    
    const session = await getInterviewSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    
    const interview = await getInterviewById(session.interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const updatedSession = await proceedToNextQuestion(id, interview);
    
    if (updatedSession.state === 'COMPLETED') {
      const { generateInterviewReport } = await import('../services/report/reportGenerationService');
      try {
        await generateInterviewReport(updatedSession, interview);
      } catch (generationError) {
        console.error('Failed to generate interview report:', generationError);
        return res.json({
          success: true,
          reportPending: true,
          message: "Interview completed. AI report generation failed due to quota limits.",
          session: updatedSession
        });
      }
    }

    res.json(updatedSession);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to advance session';
    res.status(500).json({ error: msg });
  }
};

export const skipSessionQuestion = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;
    
    const session = await getInterviewSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    
    const interview = await getInterviewById(session.interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const updatedSession = await skipQuestion(id, interview);
    
    if (updatedSession.state === 'COMPLETED') {
      const { generateInterviewReport } = await import('../services/report/reportGenerationService');
      try {
        await generateInterviewReport(updatedSession, interview);
      } catch (generationError) {
        console.error('Failed to generate interview report:', generationError);
        return res.json({
          success: true,
          reportPending: true,
          message: "Interview completed. AI report generation failed due to quota limits.",
          session: updatedSession
        });
      }
    }

    res.json(updatedSession);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to skip question';
    res.status(500).json({ error: msg });
  }
};

export const getSession = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;
    const session = await getInterviewSessionById(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    
    res.json(session);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch session';
    res.status(500).json({ error: msg });
  }
};

export const deleteSessionEndpoint = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id as string;
    const session = await getInterviewSessionById(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (session.userId !== userId) return res.status(403).json({ error: 'Forbidden' });
    
    // Delete the session document
    await deleteInterviewSession(id);
    
    // Delete the associated interview configuration
    if (session.interviewId) {
      await deleteInterview(session.interviewId);
    }
    
    // Note: We could also delete associated answers and speech analytics here, 
    // but deleting the session and interview satisfies the main cleanup requirement.
    
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete session';
    res.status(500).json({ error: msg });
  }
};

interface SessionWithSettings {
  settings?: {
    interviewType?: string;
    skills?: string[];
  };
}

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const authUserId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!authUserId) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.params.userId as string;
    if (userId !== authUserId) return res.status(403).json({ error: 'Forbidden' });

    const { getEnrichedUserSessions } = await import('../services/interview/interviewAggregationService');
    const enrichedSessions = await getEnrichedUserSessions(userId);
    
    res.json(enrichedSessions);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch user sessions';
    res.status(500).json({ error: msg });
  }
};

// calculateMockScore was moved to interviewAggregationService

export const submitAdaptiveAnswer = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.auth?.userId || authReq.auth?.()?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sessionId = req.params.sessionId as string;
    const { questionId, answerText, startTime, wordCount } = req.body;
    
    if (!questionId || !answerText || !startTime) {
      return res.status(400).json({ error: 'Missing answer details' });
    }
    if (typeof answerText !== 'string' || answerText.length > 10000) {
      return res.status(400).json({ error: 'Answer is invalid or too long' });
    }

    const sessionCheck = await getInterviewSessionById(sessionId);
    if (!sessionCheck) return res.status(404).json({ error: 'Session not found' });
    if (sessionCheck.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    // --- IDEMPOTENCY CHECK (I6 FEATURE 17) ---
    const { getAnswersBySession } = await import('../services/runtime/answerStorageService');
    const existingAnswers = await getAnswersBySession(sessionId);
    const existingAnswer = existingAnswers.find(a => a.questionId === questionId);
    
    if (existingAnswer && existingAnswer.answerText === answerText) {
      // Return cached state if it exists
      const { getAdaptiveState } = await import('../services/adaptive/adaptiveStorageService');
      const { getSessionSpeechSummary, getSpeechTimeline } = await import('../services/speech/speechStorageService');
      
      const state = await getAdaptiveState(sessionId);
      const session = await getInterviewSessionById(sessionId);
      const summary = await getSessionSpeechSummary(sessionId);
      const timeline = await getSpeechTimeline(sessionId);

      let nextQuestion;
      if (state) {
        // Look for the follow up generated for this question
        const followUp = state.followUpHistory.find(f => f.originalQuestionId === questionId);
        if (followUp) {
          nextQuestion = {
            id: `q_followup_${Date.now()}`,
            question: followUp.followUpQuestion,
            context: "Follow-up question based on your previous answer"
          };
        }
      }

      return res.json({
        session,
        liveEvaluation: state?.liveEvaluation,
        communicationAnalytics: null, // Omit or fetch from DB if needed
        summary,
        timeline,
        adaptiveResult: state ? {
          difficulty: state.currentDifficulty,
          personality: state.personality,
          liveEvaluation: state.liveEvaluation
        } : null,
        nextQuestion,
        isIdempotentResponse: true
      });
    }
    // -----------------------------------------

    // 1. Persist the standard answer and get updated session
    const { session: updatedSession, answerId } = await submitAnswer(sessionId, questionId, answerText, startTime, wordCount || 0);

    // 2. Lookup interview for adaptive details
    const interview = await getInterviewById(updatedSession.interviewId);
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const currentQIndex = updatedSession.progress.currentQuestionIndex;
    const question = interview.questions.find((q) => q.id === questionId);
    const questionText = question?.question || 'Unknown question';
    
    const remainingQuestions = updatedSession.progress.totalQuestions - currentQIndex - 1;
    const durationMs = new Date().getTime() - new Date(startTime).getTime();

    const interviewSettings = interview as unknown as SessionWithSettings;
    const expectedSkills = interviewSettings?.settings?.skills || [];

    // 3. Process adaptive answer
    const adaptiveResult = await processAdaptiveAnswer({
      sessionId,
      questionId,
      questionText,
      answerText,
      remainingQuestions: Math.max(0, remainingQuestions),
      durationMs,
      remainingTimeMs: 30 * 60 * 1000,
      targetRole: interview.role,
      expectedSkills
    });

    const nextQuestion = adaptiveResult.followUp?.question ? {
      id: `q_followup_${Date.now()}`,
      question: adaptiveResult.followUp.question,
      context: "Follow-up question based on your previous answer"
    } : undefined;

    // 4. Generate Communication Analytics
    const activeVoiceSession = getActiveVoiceSession(sessionId);
    const isVoice = !!activeVoiceSession;
    let wordMetadata = [];

    if (activeVoiceSession) {
      wordMetadata = activeVoiceSession.getCurrentWords();
    }

    const communicationAnalytics = await generateCommunicationAnalytics(
      answerText,
      wordMetadata,
      durationMs,
      isVoice
    );

    if (activeVoiceSession) {
      // Clear transcript/words here to prevent memory growth.
      activeVoiceSession.clearTranscript();
    }

    // Save analytics
    await saveSpeechAnalytics(
      sessionId,
      answerId,
      currentQIndex,
      durationMs,
      communicationAnalytics,
      adaptiveResult.liveEvaluation
    );
    
    const summary = await getSessionSpeechSummary(sessionId);
    const timeline = await getSpeechTimeline(sessionId);

    res.json({
      session: updatedSession,
      liveEvaluation: adaptiveResult.liveEvaluation,
      communicationAnalytics, // This must be the detailed CommunicationAnalytics for the current answer
      summary,
      timeline,
      adaptiveResult,
      nextQuestion
    });
  } catch (error: unknown) {
    console.error('Failed to submit adaptive answer:', error);
    const msg = error instanceof Error ? error.message : 'Failed to submit adaptive answer';
    res.status(500).json({ error: msg });
  }
};
