export interface CandidateProject {
  name: string;
  mentionCount: number;
  lastMentioned: string; // ISO String timestamp
  description?: string;
  technologiesUsed?: string[];
}

export interface CandidateSkill {
  name: string;
  category: 'Language' | 'Framework' | 'Library' | 'Database' | 'Cloud' | 'Concept' | 'SoftSkill' | 'Other';
  mentionCount: number;
  lastMentioned: string;
}

export interface CandidateAchievement {
  description: string;
  mentionCount: number;
  lastMentioned: string;
  context?: string; // Where this was achieved
}

export interface WeakTopic {
  topic: string;
  reason: string;
  identifiedAt: string;
}

export interface StrongTopic {
  topic: string;
  reason: string;
  identifiedAt: string;
}

export interface FollowUpItem {
  id: string;
  questionText: string;
  topic: string;
  type: string;
  createdAt: string;
}

export interface AnswerSummary {
  questionId: string;
  summary: string;
  timestamp: string;
}

export interface ConfidenceEntry {
  score: number;
  timestamp: string;
}

export interface MemorySnapshot {
  id: string;
  sessionId: string;
  timestamp: string;
  triggerQuestionId: string;
  changes: string[]; // e.g., "Added skill React", "Identified weak topic Promises"
}

export interface MemoryUpdate {
  projects?: CandidateProject[];
  skills?: CandidateSkill[];
  achievements?: CandidateAchievement[];
  weakTopics?: WeakTopic[];
  strongTopics?: StrongTopic[];
  summary?: AnswerSummary;
  confidence?: ConfidenceEntry;
  rawText?: string;
}

export interface ConversationMemory {
  id: string;
  sessionId: string;
  candidateProfile?: {
    targetRole?: string;
    level?: string;
  };
  projectsMentioned: CandidateProject[];
  skillsMentioned: CandidateSkill[];
  achievements: CandidateAchievement[];
  leadershipExamples: string[];
  conflictResolutionExamples: string[];
  failuresDiscussed: string[];
  successStories: string[];
  weakAreas: WeakTopic[];
  strongAreas: StrongTopic[];
  currentDifficulty: string;
  currentConfidence: number;
  confidenceHistory: ConfidenceEntry[];
  questionHistory: string[]; // IDs
  answerHistory: AnswerSummary[];
  followUpHistory: FollowUpItem[];
  topicsCovered: string[];
  topicsRemaining: string[];
  aiNotes: string[];
  createdAt: string;
  updatedAt: string;
}
