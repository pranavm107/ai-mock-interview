import { StructuredResume, ResumeAIAnalysis } from '../../types/resume';
import { buildResumeAnalysisPrompt, PROMPT_VERSION } from './promptBuilder';
import { generateJson } from './groqClient';
import { validateAIAnalysis } from './responseValidator';
import { executeWithRetry } from './retryStrategy';

export const analyzeStructuredResume = async (structuredResume: StructuredResume): Promise<ResumeAIAnalysis> => {
  const prompt = buildResumeAnalysisPrompt(structuredResume);
  
  const operation = async () => {
    // 1. Generate JSON using Groq
    const jsonString = await generateJson(prompt);
    
    // 2. Validate strict schema
    const validatedData = validateAIAnalysis(jsonString);
    
    return validatedData;
  };

  // Run with 1 retry on failure
  const aiAnalysis = await executeWithRetry(operation);
  
  // Attach prompt version for tracking
  aiAnalysis.promptVersion = PROMPT_VERSION;

  return aiAnalysis;
};
