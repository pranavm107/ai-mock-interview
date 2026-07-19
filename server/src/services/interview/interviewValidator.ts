import { InterviewGenerationResponse } from "../../types/interview";
import { InterviewBlueprint } from "../../types/interviewBlueprint";
import { runHallucinationGuard } from "./hallucinationGuard";
import { runQuestionQualityFilter } from "./questionQualityService";

export class InterviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InterviewValidationError";
  }
}

export const validateGeneratedInterview = (
  response: any,
  blueprint: InterviewBlueprint
): InterviewGenerationResponse => {
  if (!response || typeof response !== "object") {
    throw new InterviewValidationError("Response is not a valid JSON object.");
  }

  if (!Array.isArray(response.questions)) {
    throw new InterviewValidationError("Response must contain a 'questions' array.");
  }

  const { questions } = response;

  if (questions.length !== blueprint.totalQuestions) {
    throw new InterviewValidationError(
      `Expected ${blueprint.totalQuestions} questions, but got ${questions.length}.`
    );
  }

  const sectionCounts: Record<string, number> = {
    RESUME: 0,
    ROLE: 0,
    COMPANY: 0,
    BEHAVIORAL: 0
  };
  
  const difficultyCounts: Record<string, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0
  };

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.section || !(q.section in sectionCounts)) {
      throw new InterviewValidationError(`Invalid or missing section for question at index ${i}.`);
    }
    sectionCounts[q.section]++;

    if (!q.difficulty || !(q.difficulty in difficultyCounts)) {
      throw new InterviewValidationError(`Invalid or missing difficulty for question at index ${i}.`);
    }
    difficultyCounts[q.difficulty]++;
  }

  // Enforce section distribution
  for (const bp of blueprint.sections) {
    if (sectionCounts[bp.category] !== bp.questions) {
      throw new InterviewValidationError(
        `Distribution mismatch for ${bp.category}: Expected ${bp.questions}, got ${sectionCounts[bp.category]}.`
      );
    }
  }

  // Enforce difficulty distribution
  if (difficultyCounts.EASY !== blueprint.difficulty.easy || 
      difficultyCounts.MEDIUM !== blueprint.difficulty.medium || 
      difficultyCounts.HARD !== blueprint.difficulty.hard) {
      throw new InterviewValidationError(
        `Difficulty mismatch: Expected E/M/H ${blueprint.difficulty.easy}/${blueprint.difficulty.medium}/${blueprint.difficulty.hard}, got ${difficultyCounts.EASY}/${difficultyCounts.MEDIUM}/${difficultyCounts.HARD}.`
      );
  }

  // Run additional quality & hallucination guards
  runQuestionQualityFilter(questions);
  runHallucinationGuard(questions, blueprint);

  return response as InterviewGenerationResponse;
};
