import { ResumeAIAnalysis } from '../../../../src/types/resume';

export const validateAIAnalysis = (jsonString: string): ResumeAIAnalysis => {
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err: any) {
    throw new Error(`Failed to parse AI JSON response: ${err.message}`);
  }

  // Ensure string fields exist
  const stringFields = ['summary', 'careerLevel', 'experienceLevel'];
  for (const field of stringFields) {
    if (typeof parsed[field] !== 'string') {
      throw new Error(`Validation Error: Missing or invalid string field '${field}'`);
    }
  }

  // Ensure array fields exist
  const arrayFields = ['strengths', 'weaknesses', 'missingSkills', 'recommendedRoles', 'recommendations'];
  for (const field of arrayFields) {
    if (!Array.isArray(parsed[field])) {
      throw new Error(`Validation Error: Missing or invalid array field '${field}'`);
    }
  }

  // Ensure scores exist and are between 0 and 100
  const scoreFields = ['atsScore', 'technicalScore', 'communicationScore', 'overallScore', 'confidence'];
  for (const field of scoreFields) {
    const val = parsed[field];
    if (typeof val !== 'number' || val < 0 || val > 100) {
      throw new Error(`Validation Error: Score field '${field}' must be a number between 0 and 100. Got: ${val}`);
    }
  }

  return parsed as ResumeAIAnalysis;
};
