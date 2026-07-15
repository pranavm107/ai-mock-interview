export interface ResumeMetadata {
  title: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string;
  fileSize: number;
  fileType?: string;
  hash?: string;
  uploadedAt: any; // Firestore Timestamp
}

export interface ResumeStatus {
  state: 'UPLOADED' | 'PROCESSING' | 'PARSED' | 'NORMALIZING' | 'NORMALIZED' | 'STRUCTURING' | 'STRUCTURED' | 'ANALYZING' | 'ANALYZED' | 'QUESTION_GENERATED' | 'FAILED';
  uploadedAt: any; // Firestore Timestamp
  processingStartedAt?: any;
  processedAt?: any;
  lastAnalysisAt?: any;
  analysisVersion?: number;
  error?: {
    phase: string;
    message: string;
    timestamp: any;
  };
}

export interface ResumeSection {
  text: string;
  confidence: number;
}

export interface ResumeSections {
  summary?: ResumeSection;
  experience?: ResumeSection;
  education?: ResumeSection;
  skills?: ResumeSection;
  projects?: ResumeSection;
  certifications?: ResumeSection;
  achievements?: ResumeSection;
  languages?: ResumeSection;
  internships?: ResumeSection;
  publications?: ResumeSection;
  awards?: ResumeSection;
  hobbies?: ResumeSection;
  contact?: ResumeSection;
  unclassified?: ResumeSection;
  [key: string]: ResumeSection | undefined;
}

export interface NormalizationStats {
  originalCharacters: number;
  normalizedCharacters: number;
  compressionRatio: number;
  removedBlankLines: number;
  removedPageHeaders: number;
  removedPageNumbers: number;
  normalizedBullets: number;
  normalizedWhitespace: boolean;
}

export interface ProcessingMetrics {
  downloadMs: number;
  parseMs: number;
  normalizeMs: number;
  structureMs?: number;
  totalMs: number;
}

export interface ResumeEntities {
  emails: string[];
  phones: string[];
  linkedin: string[];
  github: string[];
  portfolio: string[];
  websites: string[];
}

export interface ResumeLanguage {
  primary: string;
  confidence: number;
}

export interface StructuredResume {
  candidate: {
    name: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    portfolio: string;
  };
  skills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  certifications: string[];
  languages: string[];
}

export interface ResumeAnalysis {
  parsedText?: string;
  normalizedText?: string;
  sections?: ResumeSections;
  entities?: ResumeEntities;
  language?: ResumeLanguage;
  structuredResume?: StructuredResume;
  normalizationStats?: NormalizationStats;
  processingMetrics?: ProcessingMetrics;
  
  atsScore?: number;
  resumeScore?: number;
  aiSummary?: string;
  skills?: string[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  strengths?: string[];
  weaknesses?: string[];
}

export interface Resume {
  id: string;
  userId: string;
  version: number;
  source: string;
  isDefault: boolean;
  metadata: ResumeMetadata;
  status: ResumeStatus;
  analysis: ResumeAnalysis;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface ResumeUploadMetadata {
  file: File;
  userId: string;
  title?: string;
}
