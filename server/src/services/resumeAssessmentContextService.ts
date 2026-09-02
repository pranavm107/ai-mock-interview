import { Resume } from '../types/resume';

export interface ResumeAssessmentContext {
  skills: string[];
  experience: string[];
  projects: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendedRoles: string[];
}

export const buildResumeAssessmentContext = (resume: Resume): ResumeAssessmentContext => {
  const structured = resume.analysis?.structuredResume;
  const ai = resume.analysis?.aiAnalysis;

  const skills: string[] = [];
  if (structured?.skills) {
    if (structured.skills.languages) skills.push(...structured.skills.languages);
    if (structured.skills.frameworks) skills.push(...structured.skills.frameworks);
    if (structured.skills.databases) skills.push(...structured.skills.databases);
    if (structured.skills.cloud) skills.push(...structured.skills.cloud);
    if (structured.skills.tools) skills.push(...structured.skills.tools);
    if (structured.skills.concepts) skills.push(...structured.skills.concepts);
  }

  const experience = structured?.experience?.map(e => `${e.role} at ${e.company}`) || [];
  const projects = structured?.projects?.map(p => p.title) || [];
  
  const weaknesses = ai?.weaknesses || [];
  const missingSkills = ai?.missingSkills || [];
  const recommendedRoles = ai?.recommendedRoles || [];

  return {
    skills,
    experience,
    projects,
    weaknesses,
    missingSkills,
    recommendedRoles
  };
};
