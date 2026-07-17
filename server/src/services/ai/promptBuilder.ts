import { StructuredResume } from '../../types/resume';

export const PROMPT_VERSION = "v1.0";

export const buildResumeAnalysisPrompt = (structuredResume: StructuredResume): string => {
  const schemaInstruction = `
You must return exactly ONE valid JSON object matching this schema. Do NOT wrap it in markdown block quotes. Do not explain anything.

Schema:
{
  "summary": "String, 2-3 sentences max evaluating the candidate",
  "strengths": ["String array, top 3-5 technical or professional strengths"],
  "weaknesses": ["String array, 2-3 areas lacking or needing improvement"],
  "missingSkills": ["String array, 3-5 skills missing for their level/role"],
  "recommendedRoles": ["String array, 2-3 job titles they are suited for"],
  "careerLevel": "String enum: Student, Intern, Junior, Mid, Senior",
  "experienceLevel": "String, e.g., '5+ years' based on dates",
  "atsScore": "Number 0-100",
  "technicalScore": "Number 0-100",
  "communicationScore": "Number 0-100",
  "overallScore": "Number 0-100",
  "confidence": "Number 0-100 representing your confidence in this analysis",
  "recommendations": ["String array, 3-5 actionable resume improvements"]
}
`;

  const inputData = `
Analyze the following structured resume JSON:

${JSON.stringify(structuredResume)}
`;

  return `You are an expert Technical ATS and Senior Recruiter.\n${schemaInstruction}\n${inputData}`;
};
