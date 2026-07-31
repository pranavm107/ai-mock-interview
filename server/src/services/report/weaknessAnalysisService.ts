import { QuestionEvaluation } from "../../types/interviewReport";

export const analyzeWeaknesses = (evaluations: QuestionEvaluation[]): string[] => {
  const allWeaknesses = evaluations.flatMap(e => e.areasForImprovement);
  
  // Basic deduplication and filtering
  const uniqueWeaknesses = Array.from(new Set(allWeaknesses)).filter(w => w.trim().length > 0);
  
  // Return top 5
  return uniqueWeaknesses.slice(0, 5);
};
