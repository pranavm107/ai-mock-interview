import { StructuredResume, ResumeAIAnalysis } from '../../types/resume';
import { buildResumeAnalysisPrompt, PROMPT_VERSION } from './promptBuilder';
import { validateAIAnalysis } from './responseValidator';
import { aiGateway } from './aiGateway';

export const analyzeStructuredResume = async (
  structuredResume: StructuredResume,
  userId?: string
): Promise<ResumeAIAnalysis> => {
  const prompt = buildResumeAnalysisPrompt(structuredResume);

  const response = await aiGateway.executeStructured<ResumeAIAnalysis>({
    task: 'RESUME_ANALYSIS',
    prompt,
    userId,
    validator: (parsed) => validateAIAnalysis(typeof parsed === 'string' ? parsed : JSON.stringify(parsed)),
  });

  const aiAnalysis = response.data;

  // Attach prompt version for tracking
  aiAnalysis.promptVersion = PROMPT_VERSION;

  return aiAnalysis;
};
