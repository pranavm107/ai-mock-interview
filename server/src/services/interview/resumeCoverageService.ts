import { ResumeCoveragePlan } from "../../types/interviewBlueprint";

export const determineResumeCoverage = (structuredResume: any): ResumeCoveragePlan => {
  // Extract project names and experience roles for deterministic targeting
  const targetProjects: string[] = [];
  if (structuredResume?.projects && Array.isArray(structuredResume.projects)) {
    targetProjects.push(...structuredResume.projects.map((p: any) => p.name || p.title).filter(Boolean));
  }

  const targetExperience: string[] = [];
  if (structuredResume?.experience && Array.isArray(structuredResume.experience)) {
    targetExperience.push(...structuredResume.experience.map((e: any) => e.company || e.role).filter(Boolean));
  }

  // Base weights (deterministic as per Phase 5 specs)
  let projectsWeight = 45;
  let experienceWeight = 25;
  let skillsWeight = 20;
  let educationWeight = 10;
  let certificatesWeight = 0;
  let achievementsWeight = 0;

  // Adjust if candidate lacks projects or experience
  if (targetProjects.length === 0) {
    experienceWeight += 25;
    skillsWeight += 20;
    projectsWeight = 0;
  }
  
  if (targetExperience.length === 0) {
    projectsWeight += 15;
    skillsWeight += 10;
    experienceWeight = 0;
  }

  return {
    projectsWeight,
    experienceWeight,
    skillsWeight,
    educationWeight,
    certificatesWeight,
    achievementsWeight,
    targetProjects,
    targetExperience
  };
};
