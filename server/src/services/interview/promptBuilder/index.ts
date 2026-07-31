import { InterviewBlueprint } from "../../../types/interviewBlueprint";
import { InterviewSettings } from "../../../types/interview";
import { buildSystemPrompt } from "./systemPrompt";
import { buildResumePrompt } from "./resumePrompt";
import { buildRolePrompt } from "./rolePrompt";
import { buildCompanyPrompt } from "./companyPrompt";
import { buildBlueprintPrompt } from "./blueprintPrompt";
import { buildSchemaPrompt } from "./schemaPrompt";
import { getCompanyProfile } from "../companyProfileService";
import { getRoleProfile } from "../roleProfileService";

export const buildFinalPrompt = (
  settings: InterviewSettings,
  blueprint: InterviewBlueprint,
  structuredResume: any
): string => {
  const companyProfile = getCompanyProfile(settings.targetCompany);
  const roleProfile = getRoleProfile(settings.targetRole);

  const title = `Mock Interview for ${settings.targetRole} at ${settings.targetCompany}`;

  const parts = [
    buildSystemPrompt(),
    buildBlueprintPrompt(blueprint),
    buildRolePrompt(roleProfile, settings.targetRole),
    buildCompanyPrompt(companyProfile, settings.targetCompany),
    buildResumePrompt(structuredResume),
    buildSchemaPrompt(title, blueprint.duration)
  ];

  return parts.join("\n\n");
};
