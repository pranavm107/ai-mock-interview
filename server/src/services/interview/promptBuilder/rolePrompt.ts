import { RoleProfile } from "../roleProfileService";

export const buildRolePrompt = (roleProfile: RoleProfile | null, targetRole: string): string => {
  if (!roleProfile) {
    return `--- ROLE CONTEXT ---\nTarget Role: ${targetRole}\nFocus on standard industry expectations for this role.\n--------------------`;
  }

  return `
--- ROLE CONTEXT ---
Target Role: ${roleProfile.role}
Priority Skills to Evaluate: ${roleProfile.prioritySkills.join(", ")}
Common Topics: ${roleProfile.commonTopics.join(", ")}
Expected Project Types: ${roleProfile.expectedProjects.join(", ")}
--------------------
When generating "ROLE" category questions, focus on the priority skills and common topics listed above.
`;
};
