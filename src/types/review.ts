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

export interface ReviewResponse {
  review: InterviewReview;
  questionReviews: QuestionReview[];
}
