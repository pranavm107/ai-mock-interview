import type { InterviewType, InterviewDifficulty } from './interview';

export interface ReplayMetadata {
  sessionId: string;
  interviewId: string;
  userId: string;
  startedAt: string;
  completedAt: string;
  totalDurationMs: number;
}

export interface ReplayAudio {
  url: string;
  durationMs: number;
}

export interface ReplayTranscript {
  speaker: 'AI' | 'Candidate';
  text: string;
  startTimeMs: number;
  endTimeMs: number;
}

export interface ReplayAnswer {
  id: string;
  questionId: string;
  transcript: ReplayTranscript[];
  aiAudio: ReplayAudio | null;
  candidateAudio: ReplayAudio | null;
  durationMs: number;
  timestamp: string;
  wordCount: number;
  communicationAnalytics: Record<string, unknown> | null;
  technicalEvaluation: Record<string, unknown> | null;
}

export interface ReplayTimelineEvent {
  id: string;
  type: 'Interview Started' | 'Question Asked' | 'AI Speaking' | 'Candidate Speaking' | 'Evaluation Complete' | 'Difficulty Increased' | 'Difficulty Decreased' | 'Follow-up Question' | 'Interview Finished';
  timestamp: string;
  timeOffsetMs: number;
  questionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ReplayBookmark {
  id: string;
  sessionId: string;
  type: 'Important' | 'Mistake' | 'Excellent' | 'Review Later' | 'Custom Note';
  timestamp: string;
  timeOffsetMs: number;
  questionId: string;
  note: string;
  colorLabel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReplayQuestion {
  id: string;
  index: number;
  text: string;
  type: InterviewType | string;
  difficulty: InterviewDifficulty | string;
  answer: ReplayAnswer | null;
  adaptiveDecision: Record<string, unknown> | null;
  recommendations: string[];
}

export interface ReplayNavigation {
  previousQuestionId: string | null;
  nextQuestionId: string | null;
  currentQuestionId: string | null;
}

export interface ReplayPlayerState {
  status: 'Idle' | 'Loading' | 'Playing' | 'Paused' | 'Seeking' | 'Completed';
  currentTimeMs: number;
  durationMs: number;
  playbackSpeed: number;
  volume: number;
}

export interface ReplaySession {
  metadata: ReplayMetadata;
  questions: ReplayQuestion[];
  bookmarks: ReplayBookmark[];
  timeline: ReplayTimelineEvent[];
}
