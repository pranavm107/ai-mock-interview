import { InterviewQuestion } from "../../types/interview";

export class QualityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QualityError";
  }
}

export const runQuestionQualityFilter = (questions: InterviewQuestion[]) => {
  const seen = new Set<string>();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // 1. Detect exact or near duplicates
    const normalizedQ = q.question.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(normalizedQ)) {
      throw new QualityError(`Duplicate question detected: "${q.question}"`);
    }
    seen.add(normalizedQ);

    // 2. Too short / generic
    if (q.question.split(" ").length < 3) {
      throw new QualityError(`Question is too short or generic: "${q.question}"`);
    }

    // 3. Missing expected answers or followups
    if (!q.expectedTopics || q.expectedTopics.length === 0) {
      throw new QualityError(`Question is missing expected topics: "${q.question}"`);
    }

    if (!q.followUps || q.followUps.length === 0) {
      throw new QualityError(`Question is missing follow-ups: "${q.question}"`);
    }
  }

  return true;
};
