import { Request, Response } from 'express';
import { initializeSession, startSession, submitAnswer, proceedToNextQuestion, skipQuestion } from '../services/runtime/sessionService';
import { getInterviewById } from '../services/interview/interviewStorageService';
import { getInterviewSessionById } from '../services/runtime/sessionStorageService';

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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create session' });
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to start session' });
  }
};

export const submitSessionAnswer = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { questionId, answerText, startTime, wordCount } = req.body;
    
    if (!questionId || !answerText || !startTime) {
      return res.status(400).json({ error: 'Missing answer details' });
    }

    const updatedSession = await submitAnswer(id, questionId, answerText, startTime, wordCount || 0);
    res.json(updatedSession);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to submit answer' });
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to advance session' });
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to skip question' });
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
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch session' });
  }
};

export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const { listSessionsByUser } = await import('../services/runtime/sessionStorageService');
    const sessions = await listSessionsByUser(userId);
    
    // We need to enrich sessions with Interview metadata (company, role, etc)
    const enrichedSessions = await Promise.all(
      sessions.map(async (session) => {
        const interview = await getInterviewById(session.interviewId);
        return {
          ...session,
          company: interview?.company || 'Unknown',
          role: interview?.role || 'Unknown',
          interviewType: (interview?.settings as any)?.interviewType || 'Technical',
          difficulty: interview?.difficulty || 'Mixed',
          score: session.state === 'COMPLETED' ? calculateMockScore(session) : null
        };
      })
    );
    
    // Sort by createdAt desc
    enrichedSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(enrichedSessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user sessions' });
  }
};

// Helper since Phase 6 didn't implement scoring yet
const calculateMockScore = (session: any) => {
  if (session.metrics.questionsAnswered === 0) return 0;
  // A simple 0-100 score based on answered questions
  return Math.min(100, Math.round((session.metrics.questionsAnswered / session.progress.totalQuestions) * 100));
};
