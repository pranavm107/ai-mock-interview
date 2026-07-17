import { InterviewSection } from "./interview";

export interface DifficultyPlan {
  easy: number;
  medium: number;
  hard: number;
}

export interface SectionBlueprint {
  category: InterviewSection;
  questions: number;
}

export interface ResumeCoveragePlan {
  projectsWeight: number;
  experienceWeight: number;
  skillsWeight: number;
  educationWeight: number;
  certificatesWeight?: number;
  achievementsWeight?: number;
  
  targetProjects: string[];
  targetExperience: string[];
}

export interface SkillCoveragePlan {
  prioritySkills: string[];
  optionalSkills: string[];
}

export interface BlueprintMetadata {
  plannerVersion: string;
  generatedAt: string;
}

export interface InterviewBlueprint {
  totalQuestions: number;
  duration: number;
  difficulty: DifficultyPlan;
  sections: SectionBlueprint[];
  resumeCoverage: ResumeCoveragePlan;
  skillCoverage: SkillCoveragePlan;
  metadata: BlueprintMetadata;
}
