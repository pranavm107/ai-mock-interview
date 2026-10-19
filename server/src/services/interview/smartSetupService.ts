import { aiGateway } from '../ai/aiGateway';

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
  jobDescription: string | null,
  userId?: string
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
    const response = await aiGateway.executeStructured<SmartSetupResult>({
      task: 'SMART_SETUP',
      prompt,
      userId,
      validator: (parsed: any): SmartSetupResult => {
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Expected parsed JSON object');
        }

        const result = { ...parsed } as SmartSetupResult;

        // Apply deterministic fallbacks and clamping
        if (!['Fresher', 'Junior', 'Mid', 'Senior', 'Lead'].includes(result.experienceLevel)) {
          result.experienceLevel = 'Mid';
        }
        if (!['Technical', 'HR', 'Behavioral', 'Mixed'].includes(result.recommendedInterviewType)) {
          result.recommendedInterviewType = 'Technical';
        }
        if (!['Easy', 'Medium', 'Hard'].includes(result.recommendedDifficulty)) {
          result.recommendedDifficulty = 'Medium';
        }
        if (
          typeof result.recommendedQuestionCount !== 'number' ||
          result.recommendedQuestionCount < 3 ||
          result.recommendedQuestionCount > 10
        ) {
          result.recommendedQuestionCount = 5;
        }
        if (!Array.isArray(result.skills)) {
          result.skills = [];
        }
        if (!Array.isArray(result.focusAreas)) {
          result.focusAreas = [];
        }
        if (!['High', 'Medium', 'Low'].includes(result.confidence)) {
          result.confidence = 'Medium';
        }
        result.role = typeof result.role === 'string' ? result.role : '';
        result.company = typeof result.company === 'string' ? result.company : '';
        result.reasoning = typeof result.reasoning === 'string' ? result.reasoning : '';

        return result;
      },
    });

    return response.data;
  } catch (err: any) {
    console.error('Smart Setup Analysis failed:', err);
    throw new Error('Failed to analyze setup configuration: ' + err.message);
  }
};
