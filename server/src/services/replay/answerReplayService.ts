import { Interview } from '../../types/interview';
import { SessionAnswer } from '../../types/interviewSession';
import { ReplayAnswer, ReplayQuestion, ReplayTranscript } from '../../types/replay';

export const prepareReplayQuestions = (
  interview: Interview,
  answers: SessionAnswer[],
  // Add other necessary data stores (like speech summaries) if we wanted deep analytics integration
  // but keeping it simple based on available data in SessionAnswer and Interview
): ReplayQuestion[] => {
  return interview.questions.map((q, index) => {
    const answer = answers.find(a => a.questionId === q.id);
    
    let replayAnswer: ReplayAnswer | null = null;
    
    if (answer) {
      replayAnswer = {
        id: answer.id,
        questionId: q.id as string,
        transcript: [], // Replay unavailable due to lack of persisted timing data
        aiAudio: null,
        candidateAudio: null,
        durationMs: answer.durationMs,
        timestamp: answer.startTime,
        wordCount: answer.wordCount,
        communicationAnalytics: null,
        technicalEvaluation: null,
      };
    }

    return {
      id: q.id as string,
      index: index,
      text: q.question, // 'question' inside InterviewQuestion
      type: q.type || 'Technical',
      difficulty: q.difficulty || interview.difficulty,
      answer: replayAnswer,
      adaptiveDecision: null, // Would map if adaptive session
      recommendations: [], // Would map from answer analytics
    };
  });
};
