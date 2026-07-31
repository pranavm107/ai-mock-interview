import { InterviewSettings } from "../../types/interview";
import { DifficultyPlan } from "../../types/interviewBlueprint";
import { CompanyProfile } from "./companyProfileService";
import { RoleProfile } from "./roleProfileService";

export const calculateDifficultyDistribution = (
  settings: InterviewSettings,
  companyProfile: CompanyProfile | null,
  roleProfile: RoleProfile | null,
  totalQuestions: number
): DifficultyPlan => {
  const { candidateExperienceLevel, atsScore } = settings;

  // Base percentages
  let easyPct = 33;
  let mediumPct = 34;
  let hardPct = 33;

  switch (candidateExperienceLevel) {
    case "Student":
    case "Junior":
      easyPct = 70; mediumPct = 20; hardPct = 10;
      break;
    case "Mid":
      easyPct = 30; mediumPct = 40; hardPct = 30;
      break;
    case "Senior":
    case "Lead":
      easyPct = 10; mediumPct = 40; hardPct = 50;
      break;
  }

  // Company modifier
  if (companyProfile?.preferredDifficulty === "HARD") {
    easyPct = Math.max(0, easyPct - 15);
    hardPct += 15;
  } else if (companyProfile?.preferredDifficulty === "EASY") {
    hardPct = Math.max(0, hardPct - 15);
    easyPct += 15;
  }

  // ATS modifier
  if (atsScore !== undefined) {
    if (atsScore > 85) {
      easyPct = Math.max(0, easyPct - 10);
      hardPct += 10;
    } else if (atsScore < 50) {
      hardPct = Math.max(0, hardPct - 10);
      easyPct += 10;
    }
  }

  // Normalize percentages
  const total = easyPct + mediumPct + hardPct;
  easyPct = (easyPct / total) * 100;
  mediumPct = (mediumPct / total) * 100;
  hardPct = (hardPct / total) * 100;

  // Calculate actual counts
  let easyCount = Math.round((easyPct / 100) * totalQuestions);
  let hardCount = Math.round((hardPct / 100) * totalQuestions);
  let mediumCount = totalQuestions - easyCount - hardCount;
  
  if (mediumCount < 0) {
    if (easyCount > hardCount) {
      easyCount += mediumCount; 
    } else {
      hardCount += mediumCount;
    }
    mediumCount = 0;
  }

  return {
    easy: easyCount,
    medium: mediumCount,
    hard: hardCount
  };
};
