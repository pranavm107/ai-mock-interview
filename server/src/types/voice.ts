export enum VoiceSessionStatus {
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ERROR = 'ERROR',
  COMPLETED = 'COMPLETED'
}

export enum VoiceEvent {
  QUESTION_STARTED = 'QUESTION_STARTED',
  QUESTION_FINISHED = 'QUESTION_FINISHED',
  AI_SPEAKING = 'AI_SPEAKING',
  AI_FINISHED = 'AI_FINISHED',
  USER_STARTED = 'USER_STARTED',
  USER_STOPPED = 'USER_STOPPED',
  USER_PAUSED = 'USER_PAUSED',
  TRANSCRIPT = 'TRANSCRIPT',
  SUBMITTING = 'SUBMITTING',
  SCORING = 'SCORING',
  NEXT_QUESTION_READY = 'NEXT_QUESTION_READY',
  MIC_MUTED = 'MIC_MUTED',
  MIC_UNMUTED = 'MIC_UNMUTED',
  CONNECTION_LOST = 'CONNECTION_LOST',
  CONNECTION_RESTORED = 'CONNECTION_RESTORED',
  ERROR = 'ERROR'
}

export interface VoiceMetrics {
  wordsPerMinute: number;
  totalSpeakingTime: number; // in ms
  silenceDuration: number; // in ms
  interruptions: number;
  connectionDrops: number;
}

export interface VoiceSession {
  id: string;
  sessionId: string;
  status: VoiceSessionStatus;
  connectionId?: string;
  microphoneState: 'muted' | 'unmuted';
  speakerState: 'muted' | 'unmuted';
  currentTranscript: string;
  currentWords: any[]; // Stores word metadata
  language: string;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}
