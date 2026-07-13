import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string; // Clerk User ID
  name: string;
  email: string;
  image: string;
  plan: 'Free' | 'Pro' | 'Enterprise'; // Default: 'Free'
  resumeCount: number; // Default: 0
  defaultResumeId: string | null; // Default: null
  interviewCount: number; // Default: 0
  completedInterviewCount: number; // Default: 0
  overallScore: number; // Default: 0
  currentStreak: number; // Default: 0
  longestStreak: number; // Default: 0
  totalPracticeHours: number; // Default: 0
  isOnboarded: boolean; // Default: false
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
}

export type { Resume, ResumeUploadMetadata } from './resume';
export type {
  Interview,
  InterviewQuestion,
  InterviewType,
  InterviewDifficulty,
  ExperienceLevel,
  InterviewStatus
} from './interview';
