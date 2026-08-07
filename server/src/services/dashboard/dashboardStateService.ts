import { DashboardState, DashboardStateResult } from './dashboardTypes';

export interface DashboardContext {
  resumeUploaded: boolean;
  resumeAnalysed: boolean;
  careerGenerated: boolean;
  completedInterviews: number;
  draftInterviews: number;
  activeInterview: boolean;
  latestInterviewId?: string;
  latestResumeId?: string;
}

/**
 * Computes the dashboard state based on the provided context.
 * Evaluates rules in exact order, first matching rule wins.
 */
export const determineDashboardState = (context: DashboardContext): { state: DashboardState, reason: string } => {
  const {
    resumeUploaded,
    resumeAnalysed,
    careerGenerated,
    completedInterviews,
    activeInterview
  } = context;

  // Rule 1: POWER_USER
  // Completed interviews >= 5 AND Career Intelligence exists
  if (completedInterviews >= 5 && careerGenerated) {
    return { state: DashboardState.POWER_USER, reason: "Rule 1: POWER_USER" };
  }

  // Rule 2: INTERVIEW_IN_PROGRESS
  // There exists an interview whose status is draft OR in_progress (represented by activeInterview boolean)
  if (activeInterview) {
    return { state: DashboardState.INTERVIEW_IN_PROGRESS, reason: "Rule 2: INTERVIEW_IN_PROGRESS" };
  }

  // Rule 3: RETURNING_USER
  // Completed interviews >= 1 AND No active interview
  if (completedInterviews >= 1 && !activeInterview) {
    return { state: DashboardState.RETURNING_USER, reason: "Rule 3: RETURNING_USER" };
  }

  // Rule 4: READY_FOR_INTERVIEW
  // Resume uploaded AND Resume analysed AND No interviews
  if (resumeUploaded && resumeAnalysed && completedInterviews === 0 && !activeInterview) {
    return { state: DashboardState.READY_FOR_INTERVIEW, reason: "Rule 4: READY_FOR_INTERVIEW" };
  }

  // Rule 5: RESUME_UPLOADED
  // Resume uploaded AND Resume analysis missing
  if (resumeUploaded && !resumeAnalysed) {
    return { state: DashboardState.RESUME_UPLOADED, reason: "Rule 5: RESUME_UPLOADED" };
  }

  // Rule 6: NEW_USER
  // Everything else.
  return { state: DashboardState.NEW_USER, reason: "Rule 6: NEW_USER" };
};
