import { generateJson } from '../ai/groqClient';

export interface SmartSetupResult {
  role: string;
  company: string;
  experienceLevel: "Fresher" | "Junior" | "Mid" | "Senior" | "Lead";
  recommendedInterviewType: "Technical" | "HR" | "Behavioral" | "Mixed";
  recommendedDifficulty: "Easy" | "Medium" | "Hard";
  recommendedQuestionCount: number;
  skills: string[];
  focusAreas: string[];
  reasoning: string;
  confidence: "High" | "Medium" | "Low";
}

export const analyzeSmartSetup = async (
  resumeText: string | null,
  jobDescription: string | null
): Promise<SmartSetupResult> => {
  if (!resumeText && !jobDescription) {
    throw new Error('Must provide either a resume or job description for analysis.');
  }

  const prompt = `
You are an expert technical recruiter and interview strategist.
Analyze the following context to recommend the optimal mock interview setup.

${resumeText ? `RESUME:\n${resumeText}\n` : ''}
${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ''}

You MUST return your response as a valid JSON object matching the following structure exactly:
{
  "role": "string (the inferred target role)",
  "company": "string (the inferred target company, or '' if not specified)",
  "experienceLevel": "string (one of: 'Fresher', 'Junior', 'Mid', 'Senior', 'Lead')",
  "recommendedInterviewType": "string (one of: 'Technical', 'HR', 'Behavioral', 'Mixed')",
  "recommendedDifficulty": "string (one of: 'Easy', 'Medium', 'Hard')",
  "recommendedQuestionCount": number (a realistic number between 3 and 10),
  "skills": ["string", "string"],
  "focusAreas": ["string", "string"],
  "reasoning": "string (A concise 1-2 sentence explanation of WHY this setup is recommended)",
  "confidence": "string (one of: 'High', 'Medium', 'Low')"
}
`;

  try {
    const responseJson = await generateJson(prompt);
    const parsed = JSON.parse(responseJson) as SmartSetupResult;
    
    // Fallback/validation if needed
    if (!['Fresher', 'Junior', 'Mid', 'Senior', 'Lead'].includes(parsed.experienceLevel)) {
      parsed.experienceLevel = 'Mid';
    }
    if (!['Technical', 'HR', 'Behavioral', 'Mixed'].includes(parsed.recommendedInterviewType)) {
      parsed.recommendedInterviewType = 'Technical';
    }
    if (!['Easy', 'Medium', 'Hard'].includes(parsed.recommendedDifficulty)) {
      parsed.recommendedDifficulty = 'Medium';
    }
    if (parsed.recommendedQuestionCount < 3 || parsed.recommendedQuestionCount > 10) {
      parsed.recommendedQuestionCount = 5;
    }
    
    return parsed;
  } catch (err: any) {
    console.error('Smart Setup Analysis failed:', err);
    throw new Error('Failed to analyze setup configuration: ' + err.message);
  }
};
