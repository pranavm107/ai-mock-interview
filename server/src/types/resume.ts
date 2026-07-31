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
  state: 'UPLOADED' | 'PROCESSING' | 'PARSED' | 'NORMALIZING' | 'NORMALIZED' | 'STRUCTURING' | 'STRUCTURED' | 'AI_ANALYZING' | 'AI_COMPLETED' | 'AI_ANALYSIS_FAILED' | 'ANALYZING' | 'ANALYZED' | 'QUESTION_GENERATED' | 'FAILED';
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
  entityExtractionMs?: number;
  sectionDetectionMs?: number;
  skillsNormalizationMs?: number;
  structureMs?: number;
  validationMs?: number;
  analyzeMs?: number;
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

export interface StructuredExperience {
  company: string;
  role: string;
  duration: string;
  bullets: string[];
}

export interface StructuredProject {
  title: string;
  technologies: string[];
  description: string[];
  outcomes: string[];
}

export interface StructuredEducation {
  degree: string;
  institution: string;
  cgpa: string;
  startYear: string;
  endYear: string;
}

export interface StructuredSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloud: string[];
  tools: string[];
  concepts: string[];
}

export interface StructuredResume {
  candidate: {
    name: string;
    headline: string;
    location: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    portfolio: string;
  };
  skills: StructuredSkills;
  experience: StructuredExperience[];
  education: StructuredEducation[];
  projects: StructuredProject[];
  certifications: string[];
  languages: string[];
}

export interface ResumeAIAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendedRoles: string[];
  careerLevel: 'Student' | 'Intern' | 'Junior' | 'Mid' | 'Senior';
  experienceLevel: string;
  atsScore: number;
  technicalScore: number;
  communicationScore: number;
  overallScore: number;
  confidence: number;
  recommendations: string[];
  promptVersion?: string;
}

export interface ResumeAnalysis {
  parsedText?: string;
  normalizedText?: string;
  sections?: ResumeSections;
  entities?: ResumeEntities;
  language?: ResumeLanguage;
  structuredResume?: StructuredResume;
  aiAnalysis?: ResumeAIAnalysis;
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
