import { InterviewSession, SessionAnswer } from '../../types/interviewSession';
import { ReplayTimelineEvent } from '../../types/replay';

export const generateTimelineEvents = (
  session: InterviewSession,
  answers: SessionAnswer[]
): ReplayTimelineEvent[] => {
  const events: ReplayTimelineEvent[] = [];
  
  if (session.startedAt) {
    events.push({
      id: `evt_start_${session.id}`,
      type: 'Interview Started',
      timestamp: session.startedAt,
      timeOffsetMs: 0
    });
  }

  let cumulativeTimeMs = 0;

  // Assuming answers are sorted by questionIndex
  const sortedAnswers = [...answers].sort((a, b) => a.questionIndex - b.questionIndex);

  for (const answer of sortedAnswers) {
    events.push({
      id: `evt_q_${answer.questionId}`,
      type: 'Question Asked',
      timestamp: answer.startTime, // approximate based on answer
      timeOffsetMs: cumulativeTimeMs,
      questionId: answer.questionId,
    });
    cumulativeTimeMs += 5000; // AI speaking approx

    events.push({
      id: `evt_a_${answer.id}`,
      type: 'Candidate Speaking',
      timestamp: answer.startTime,
      timeOffsetMs: cumulativeTimeMs,
      questionId: answer.questionId,
    });
    cumulativeTimeMs += answer.durationMs;

    events.push({
      id: `evt_eval_${answer.id}`,
      type: 'Evaluation Complete',
      timestamp: answer.endTime,
      timeOffsetMs: cumulativeTimeMs,
      questionId: answer.questionId,
    });
  }

  if (session.completedAt) {
    events.push({
      id: `evt_end_${session.id}`,
      type: 'Interview Finished',
      timestamp: session.completedAt,
      timeOffsetMs: cumulativeTimeMs
    });
  }

  return events;
};
