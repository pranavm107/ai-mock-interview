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
      // Mocking transcripts as they would be generated or fetched from storage
      const mockTranscript: ReplayTranscript[] = [
        {
          speaker: 'AI',
          text: q.question, // The question text itself
          startTimeMs: 0,
          endTimeMs: 5000,
        },
        {
          speaker: 'Candidate',
          text: answer.answerText,
          startTimeMs: 5000,
          endTimeMs: 5000 + answer.durationMs,
        }
      ];

      replayAnswer = {
        id: answer.id,
        questionId: q.id as string,
        transcript: mockTranscript,
        aiAudio: null, // Would fetch from TTS storage
        candidateAudio: null, // Would fetch from TTS storage
        durationMs: answer.durationMs,
        timestamp: answer.startTime,
        wordCount: answer.wordCount,
        communicationAnalytics: null, // Would map from speechAnalytics engine output
        technicalEvaluation: null, // Would map from evaluation engine output
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
