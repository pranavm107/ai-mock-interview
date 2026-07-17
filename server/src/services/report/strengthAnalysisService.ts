import { QuestionEvaluation } from "../../types/interviewReport";

export const analyzeStrengths = (evaluations: QuestionEvaluation[]): string[] => {
  const allStrengths = evaluations.flatMap(e => e.goodPoints);
  
  // Basic deduplication and filtering
  const uniqueStrengths = Array.from(new Set(allStrengths)).filter(s => s.trim().length > 0);
  
  // Return top 5
  return uniqueStrengths.slice(0, 5);
};
