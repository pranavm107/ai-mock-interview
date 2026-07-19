import { InterviewSettings } from "../../types/interview";
import { InterviewBlueprint, SectionBlueprint } from "../../types/interviewBlueprint";
import { determineResumeCoverage } from "./resumeCoverageService";
import { determineSkillCoverage } from "./skillsCoverageEngine";
import { getTemplate } from "./interviewTemplateService";
import { calculateDifficultyDistribution } from "./difficultyEngine";
import { getCompanyProfile } from "./companyProfileService";
import { getRoleProfile } from "./roleProfileService";

export const planInterview = (
  settings: InterviewSettings,
  structuredResume: any,
  templateName?: string
): InterviewBlueprint => {
  const { totalQuestions, durationMinutes } = settings;

  const companyProfile = getCompanyProfile(settings.targetCompany);
  const roleProfile = getRoleProfile(settings.targetRole);
  
  // 1. Get Coverages
  const resumeCoverage = determineResumeCoverage(structuredResume);
  const skillCoverage = determineSkillCoverage(structuredResume, roleProfile);
  
  // 2. Get Distribution
  const template = getTemplate(templateName || "Standard");
  let dist = { ...template!.distribution };

  // If no resume provided, redistribute resume weight
  if (!structuredResume) {
    const halfResume = Math.floor(dist.RESUME / 2);
    dist.ROLE += halfResume;
    dist.BEHAVIORAL += (dist.RESUME - halfResume);
    dist.RESUME = 0;
  }

  const resumeCount = Math.round(totalQuestions * (dist.RESUME / 100));
  const roleCount = Math.round(totalQuestions * (dist.ROLE / 100));
  const companyCount = Math.round(totalQuestions * (dist.COMPANY / 100));
  const behavioralCount = totalQuestions - (resumeCount + roleCount + companyCount);

  const sections: SectionBlueprint[] = [
    { category: "RESUME", questions: resumeCount },
    { category: "ROLE", questions: roleCount },
    { category: "COMPANY", questions: companyCount },
    { category: "BEHAVIORAL", questions: behavioralCount }
  ];

  // 3. Difficulty
  const difficulty = calculateDifficultyDistribution(settings, companyProfile, roleProfile, totalQuestions);

  // 4. Blueprint
  return {
    totalQuestions,
    duration: durationMinutes,
    difficulty,
    sections,
    resumeCoverage,
    skillCoverage,
    metadata: {
      plannerVersion: "2.0.0", // Phase 5.0 planner
      generatedAt: new Date().toISOString()
    }
  };
};
