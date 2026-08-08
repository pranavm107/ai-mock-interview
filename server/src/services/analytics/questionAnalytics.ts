import { InterviewSession } from '../../types/interviewSession';
import { QuestionAnalytics } from '../../types/analytics';

export const calculateQuestionAnalytics = (sessions: InterviewSession[]): QuestionAnalytics => {
  const result: QuestionAnalytics = {
    totalQuestions: 0,
    answered: 0,
    skipped: 0,
    completionRate: 0,
    skipRate: 0
  };

  const completed = sessions.filter(s => s.state === 'COMPLETED');
  
  if (completed.length === 0) return result;

  completed.forEach(s => {
    if (s.totalQuestions) result.totalQuestions += s.totalQuestions;
    else if (s.progress?.totalQuestions) result.totalQuestions += s.progress.totalQuestions;

    if (s.questionsAnswered) result.answered += s.questionsAnswered;
    else if (s.metrics?.questionsAnswered) result.answered += s.metrics.questionsAnswered;

    if (s.questionsSkipped) result.skipped += s.questionsSkipped;
    else if (s.metrics?.questionsSkipped) result.skipped += s.metrics.questionsSkipped;
  });

  const totalAttempted = result.answered + result.skipped;
  if (totalAttempted > 0) {
    result.completionRate = Math.round((result.answered / totalAttempted) * 100);
    result.skipRate = Math.round((result.skipped / totalAttempted) * 100);
  }

  return result;
};
