import { InterviewSession, InterviewSessionState, SessionAnswer } from "../../types/interviewSession";
import { Interview } from "../../types/interview";
import { createInterviewSession, getInterviewSessionById, updateInterviewSession } from "./sessionStorageService";
import { logSessionEvent } from "./eventLogger";
import { validateSessionTransition } from "./runtimeValidator";
import { advanceToNextQuestion, skipCurrentQuestion } from "./questionRuntimeService";
import { saveSessionAnswer } from "./answerStorageService";
import { calculateElapsedMs } from "./sessionTimerService";

export const initializeSession = async (
  interviewId: string,
  userId: string,
  interviewData: Interview
): Promise<InterviewSession> => {
  const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  const session: InterviewSession = {
    id: sessionId,
    interviewId,
    userId,
    state: InterviewSessionState.CREATED,
    progress: {
      currentQuestionIndex: -1, // Not started
      totalQuestions: interviewData.questions.length,
      isComplete: false
    },
    metrics: {
      totalDurationMs: 0,
      activeDurationMs: 0,
      pausedDurationMs: 0,
      questionsAnswered: 0,
      questionsSkipped: 0,
      averageAnswerDurationMs: 0
    },
    settings: {
      allowSkip: true,
      allowPause: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await createInterviewSession(session);
  await logSessionEvent(sessionId, 'Session Created', undefined, { interviewId });
  
  return session;
};

export const startSession = async (sessionId: string, _interview?: any): Promise<InterviewSession> => {
  const session = await getInterviewSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  if (!validateSessionTransition(session.state, InterviewSessionState.STARTED)) {
    throw new Error(`Invalid transition from ${session.state} to STARTED`);
  }

  session.state = InterviewSessionState.STARTED;
  session.startedAt = new Date().toISOString();
  session.progress.currentQuestionIndex = 0; // Move to first question
  session.updatedAt = new Date().toISOString();

  await updateInterviewSession(sessionId, session);
  await logSessionEvent(sessionId, 'Session Started');
  
  return session;
};

export const submitAnswer = async (
  sessionId: string, 
  questionId: string, 
  answerText: string,
  startTime: string,
  wordCount: number
): Promise<InterviewSession> => {
  const session = await getInterviewSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  const endTime = new Date().toISOString();
  const durationMs = calculateElapsedMs(startTime, endTime);

  const answer: SessionAnswer = {
    id: `answer_${Date.now()}`,
    sessionId,
    questionId,
    answerText,
    startTime,
    endTime,
    durationMs,
    wordCount,
    questionIndex: session.progress.currentQuestionIndex,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await saveSessionAnswer(answer);
  
  session.metrics.questionsAnswered += 1;
  session.metrics.activeDurationMs += durationMs;
  // Recalculate average
  session.metrics.averageAnswerDurationMs = 
    session.metrics.activeDurationMs / session.metrics.questionsAnswered;

  await updateInterviewSession(sessionId, { metrics: session.metrics });
  await logSessionEvent(sessionId, 'Answer Submitted', questionId, { durationMs, wordCount });

  return session;
};

export const proceedToNextQuestion = async (sessionId: string, interview: Interview): Promise<InterviewSession> => {
  const session = await getInterviewSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  const updatedSession = advanceToNextQuestion(session, interview.questions);
  
  if (updatedSession.progress.isComplete) {
    updatedSession.state = InterviewSessionState.COMPLETED;
    updatedSession.completedAt = new Date().toISOString();
    updatedSession.metrics.totalDurationMs = calculateElapsedMs(updatedSession.startedAt!, updatedSession.completedAt);
    await logSessionEvent(sessionId, 'Session Completed');
  } else {
    await logSessionEvent(sessionId, 'Question Advanced', interview.questions[updatedSession.progress.currentQuestionIndex].id);
  }

  updatedSession.updatedAt = new Date().toISOString();
  await updateInterviewSession(sessionId, updatedSession);

  return updatedSession;
};

export const skipQuestion = async (sessionId: string, interview: Interview): Promise<InterviewSession> => {
  const session = await getInterviewSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  const updatedSession = skipCurrentQuestion(session, interview.questions);
  
  if (updatedSession.progress.isComplete) {
    updatedSession.state = InterviewSessionState.COMPLETED;
    updatedSession.completedAt = new Date().toISOString();
    updatedSession.metrics.totalDurationMs = calculateElapsedMs(updatedSession.startedAt!, updatedSession.completedAt);
    await logSessionEvent(sessionId, 'Session Completed after Skip');
  } else {
    await logSessionEvent(sessionId, 'Question Skipped', interview.questions[session.progress.currentQuestionIndex].id);
  }

  updatedSession.updatedAt = new Date().toISOString();
  await updateInterviewSession(sessionId, updatedSession);

  return updatedSession;
};
