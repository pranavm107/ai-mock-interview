import { InterviewSessionState, QuestionState } from "../../types/interviewSession";

export const validateSessionTransition = (current: InterviewSessionState, next: InterviewSessionState): boolean => {
  const allowedTransitions: Record<InterviewSessionState, InterviewSessionState[]> = {
    [InterviewSessionState.CREATED]: [InterviewSessionState.READY, InterviewSessionState.STARTED, InterviewSessionState.CANCELLED],
    [InterviewSessionState.READY]: [InterviewSessionState.STARTED, InterviewSessionState.CANCELLED],
    [InterviewSessionState.STARTED]: [InterviewSessionState.ASKING, InterviewSessionState.PAUSED, InterviewSessionState.CANCELLED, InterviewSessionState.FAILED],
    [InterviewSessionState.ASKING]: [InterviewSessionState.ANSWERING, InterviewSessionState.PAUSED, InterviewSessionState.FAILED, InterviewSessionState.CANCELLED],
    [InterviewSessionState.ANSWERING]: [InterviewSessionState.EVALUATING, InterviewSessionState.PAUSED, InterviewSessionState.FAILED, InterviewSessionState.CANCELLED],
    [InterviewSessionState.EVALUATING]: [InterviewSessionState.ASKING, InterviewSessionState.COMPLETED, InterviewSessionState.FAILED],
    [InterviewSessionState.PAUSED]: [InterviewSessionState.RESUMED, InterviewSessionState.CANCELLED],
    [InterviewSessionState.RESUMED]: [InterviewSessionState.ASKING, InterviewSessionState.ANSWERING, InterviewSessionState.PAUSED, InterviewSessionState.FAILED],
    [InterviewSessionState.COMPLETED]: [],
    [InterviewSessionState.CANCELLED]: [],
    [InterviewSessionState.FAILED]: [],
    [InterviewSessionState.EXPIRED]: []
  };

  return allowedTransitions[current]?.includes(next) ?? false;
};

export const validateQuestionTransition = (current: QuestionState, next: QuestionState): boolean => {
  const allowedTransitions: Record<QuestionState, QuestionState[]> = {
    [QuestionState.PENDING]: [QuestionState.ACTIVE, QuestionState.SKIPPED],
    [QuestionState.ACTIVE]: [QuestionState.ANSWERED, QuestionState.SKIPPED, QuestionState.EXPIRED],
    [QuestionState.ANSWERED]: [],
    [QuestionState.SKIPPED]: [],
    [QuestionState.EXPIRED]: []
  };

  return allowedTransitions[current]?.includes(next) ?? false;
};
