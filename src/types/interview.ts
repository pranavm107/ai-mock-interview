import { Timestamp } from 'firebase/firestore';

export type InterviewType = "Technical" | "HR" | "Behavioral" | "Mixed";
export type InterviewDifficulty = "Easy" | "Medium" | "Hard";
export type ExperienceLevel = "Fresher" | "Junior" | "Mid" | "Senior";
export type InterviewStatus = "Draft" | "Ready" | "In Progress" | "Completed" | "Cancelled" | "Paused";
export type QuestionStatus = "pending" | "current" | "answered";

export interface Interview {
  id: string;
  userId: string;
  resumeId: string | null;
  title: string;
  company: string;
  role: string;
  interviewType: InterviewType;
  difficulty: InterviewDifficulty;
  experienceLevel: ExperienceLevel;
  language: string;
  duration: number;
  totalQuestions: number;
  completedQuestions: number;
  score: number | null;
  feedbackId: string | null;
  currentQuestion: number;
  elapsedSeconds: number;
  aiProvider: string;
  status: InterviewStatus;
  cameraEnabled?: boolean;
  recordingStarted?: boolean;
  recordingCompleted?: boolean;
  videoUrl?: string | null;
  videoSize?: number | null;
  videoDuration?: number | null;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  order: number;
  question: string;
  expectedAnswer: string;
  answer: string;
  answerDuration: number;
  score: number | null;
  feedback: string | null;
  status: QuestionStatus;
  createdAt: Timestamp;
}
