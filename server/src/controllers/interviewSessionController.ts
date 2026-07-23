import { Request, Response } from 'express';
import { initializeSession, startSession, submitAnswer, proceedToNextQuestion, skipQuestion } from '../services/runtime/sessionService';
import { processAdaptiveAnswer } from '../services/adaptive/adaptiveInterviewService';
import { getInterviewById } from '../services/interview/interviewStorageService';
import { getInterviewSessionById } from '../services/runtime/sessionStorageService';
import { getActiveVoiceSession } from './voiceController';
import { generateCommunicationAnalytics } from '../services/speech/speechAnalyticsEngine';
import { saveSpeechAnalytics, getSessionSpeechSummary, getSpeechTimeline } from '../services/speech/speechStorageService';

export const createNewSession = async (req: Request, res: Response) => {
  try {
    const { interviewId, userId } = req.body;
    
    if (!interviewId || !userId) {
      return res.status(400).json({ error: 'Missing interviewId or userId' });
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
    const id = req.params.id as string;
    
    const session = await getInterviewSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
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
    const id = req.params.id as string;
    const { questionId, answerText, startTime, wordCount } = req.body;
    
    if (!questionId || !answerText || !startTime) {
      return res.status(400).json({ error: 'Missing answer details' });
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
    const id = req.params.id as string;
    
    const session = await getInterviewSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
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
    const id = req.params.id as string;
    
    const session = await getInterviewSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    
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
    const id = req.params.id as string;
    const session = await getInterviewSessionById(id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch session';
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
    const userId = req.params.userId as string;
    const { listSessionsByUser } = await import('../services/runtime/sessionStorageService');
    const sessions = await listSessionsByUser(userId);
    
    // We need to enrich sessions with Interview metadata (company, role, etc)
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const interview = await getInterviewById(session.interviewId);
        const interviewSettings = interview as unknown as SessionWithSettings;
        return {
          ...session,
          company: interview?.company || 'Unknown',
          role: interview?.role || 'Unknown',
          interviewType: interviewSettings?.settings?.interviewType || 'Technical',
          difficulty: interview?.difficulty || 'Mixed',
          score: session.state === 'COMPLETED' ? calculateMockScore(session) : null
        };
      })
    );
    
    // Sort by createdAt desc
    enrichedSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(enrichedSessions);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch user sessions';
    res.status(500).json({ error: msg });
  }
};

// Helper since Phase 6 didn't implement scoring yet
const calculateMockScore = (session: any) => {
  if (session.metrics.questionsAnswered === 0) return 0;
  // A simple 0-100 score based on answered questions
  return Math.min(100, Math.round((session.metrics.questionsAnswered / session.progress.totalQuestions) * 100));
};

export const submitAdaptiveAnswer = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId as string;
    const { questionId, answerText, startTime, wordCount } = req.body;
    
    if (!questionId || !answerText || !startTime) {
      return res.status(400).json({ error: 'Missing answer details' });
    }

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
