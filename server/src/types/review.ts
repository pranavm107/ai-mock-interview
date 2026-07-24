export interface InterviewReview {
  id?: string;
  sessionId: string;
  userId: string;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  fluencyScore: number;
  relevanceScore: number;
  professionalismScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendation: string;
  createdAt: string;
}

export interface QuestionReview {
  id?: string;
  reviewId: string;
  questionId: string;
  question: string;
  candidateAnswer: string;
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
  createdAt: string;
}

export interface AIQuestionFeedback {
  score: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  idealAnswer: string;
}

export interface AIGeneratedReview {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  fluencyScore: number;
  relevanceScore: number;
  professionalismScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  recommendation: string;
  questionReviews: {
    questionId: string;
    feedback: AIQuestionFeedback;
  }[];
}
