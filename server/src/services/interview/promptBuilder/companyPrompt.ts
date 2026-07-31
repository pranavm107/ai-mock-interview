import { CompanyProfile } from "../companyProfileService";

export const buildCompanyPrompt = (companyProfile: CompanyProfile | null, targetCompany: string): string => {
  if (!companyProfile) {
    return `--- COMPANY CONTEXT ---\nTarget Company: ${targetCompany}\nFocus on standard high-bar tech interview practices.\n-----------------------`;
  }

  return `
--- COMPANY CONTEXT ---
Target Company: ${companyProfile.company}
Company Interview Style: ${companyProfile.interviewStyle}
Common Topics Evaluated: ${companyProfile.commonTopics.join(", ")}
Preferred Difficulty: ${companyProfile.preferredDifficulty}
-----------------------
When generating "COMPANY" or "BEHAVIORAL" category questions, tailor them to match the ${companyProfile.company} interview style and focus areas.
`;
};
