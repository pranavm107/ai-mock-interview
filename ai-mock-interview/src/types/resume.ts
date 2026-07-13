export interface Resume {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string;
  fileSize: number;
  parsedText: string;
  atsScore: number;
  aiSummary: string;
  skills: string[];
  experience: any[];
  education: any[];
  projects: any[];
  isDefault: boolean;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface ResumeUploadMetadata {
  file: File;
  userId: string;
  title?: string;
}
