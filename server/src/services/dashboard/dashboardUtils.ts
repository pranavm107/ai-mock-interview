import { DashboardStateResult } from './dashboardTypes';

/**
 * Helper to log dashboard state engine evaluation during development.
 */
export const logDashboardStateEvaluation = (userId: string, result: DashboardStateResult, reason: string) => {
  console.log(`
========================
Dashboard State Engine
User: ${userId}
Reason: ${reason}
Resume Uploaded: ${result.resumeUploaded}
Resume Analysed: ${result.resumeAnalysed}
Career Generated: ${result.careerGenerated}
Completed Interviews: ${result.completedInterviews}
Draft Interviews: ${result.draftInterviews}
Active Interview: ${result.activeInterview}
Latest Resume: ${result.latestResumeId || 'None'}
Latest Interview: ${result.latestInterviewId || 'None'}
Computed State: ${result.dashboardState}
========================
`);
};
