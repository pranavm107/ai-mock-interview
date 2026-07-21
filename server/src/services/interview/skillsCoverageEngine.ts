import { SkillCoveragePlan } from "../../types/interviewBlueprint";

export const determineSkillCoverage = (structuredResume: any, roleProfile: any): SkillCoveragePlan => {
  const prioritySkills: Set<string> = new Set();
  const optionalSkills: Set<string> = new Set();

  // Extract skills from resume
  const resumeSkills: string[] = [];
  if (structuredResume?.skills) {
    if (Array.isArray(structuredResume.skills)) {
      resumeSkills.push(...structuredResume.skills.map((s: any) => typeof s === 'string' ? s : s.name));
    } else if (typeof structuredResume.skills === 'object') {
      Object.values(structuredResume.skills).forEach((group: any) => {
        if (Array.isArray(group)) {
          resumeSkills.push(...group.map((s: any) => typeof s === 'string' ? s : s.name));
        }
      });
    }
  }

  const rolePriority = roleProfile?.prioritySkills || [];

  // Match resume skills with role priority to form priority list
  resumeSkills.forEach(skill => {
    const normalizedSkill = skill.toLowerCase().trim();
    const isPriority = rolePriority.some((rs: string) => rs.toLowerCase().includes(normalizedSkill) || normalizedSkill.includes(rs.toLowerCase()));
    
    if (isPriority) {
      prioritySkills.add(skill);
    } else {
      optionalSkills.add(skill);
    }
  });

  // Ensure role priority skills that candidate might not have listed are still considered if they are core to the role
  rolePriority.forEach((rs: string) => {
    const hasSkill = Array.from(prioritySkills).some(ps => ps.toLowerCase().includes(rs.toLowerCase()));
    if (!hasSkill) {
      // Add core role skills to optional if not explicitly on resume to test role fit
      optionalSkills.add(rs);
    }
  });

  return {
    prioritySkills: Array.from(prioritySkills).filter(Boolean),
    optionalSkills: Array.from(optionalSkills).filter(Boolean)
  };
};
