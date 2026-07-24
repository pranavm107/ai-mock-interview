import { getInterviewSessionById } from '../runtime/sessionStorageService';
import { getInterviewById } from '../interview/interviewStorageService';
import { getAnswersBySession } from '../runtime/answerStorageService';
import { ReplaySession, ReplayMetadata } from '../../types/replay';
import { generateTimelineEvents } from './replayTimelineService';
import { prepareReplayQuestions } from './answerReplayService';
import { getReplayBookmarks } from './replayStorageService';

export const generateReplayPayload = async (sessionId: string): Promise<ReplaySession> => {
  const session = await getInterviewSessionById(sessionId);
  if (!session) {
    throw new Error('Interview session not found');
  }

  const interview = await getInterviewById(session.interviewId);
  if (!interview) {
    throw new Error('Interview not found');
  }

  const answers = await getAnswersBySession(sessionId);
  const bookmarks = await getReplayBookmarks(sessionId);
  
  const questions = prepareReplayQuestions(interview, answers);
  const timeline = generateTimelineEvents(session, answers);

  const metadata: ReplayMetadata = {
    sessionId: session.id,
    interviewId: interview.id || session.interviewId,
    userId: session.userId,
    startedAt: session.startedAt || session.createdAt,
    completedAt: session.completedAt || new Date().toISOString(),
    totalDurationMs: session.metrics.totalDurationMs || 0
  };

  return {
    metadata,
    questions,
    bookmarks,
    timeline
  };
};
