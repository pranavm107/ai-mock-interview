import { Request, Response } from 'express';
import { getDashboardMetadata } from '../services/dashboard/dashboardService';

export const getDashboardState = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const metadata = await getDashboardMetadata(userId as string);
    
    // We return the state explicitly at the top level and the rest as metadata,
    // as requested: { "dashboardState": "RETURNING_USER", "metadata": { ... } }
    const { dashboardState, ...restMetadata } = metadata;
    res.json({
      dashboardState,
      metadata: restMetadata
    });
  } catch (error: any) {
    console.error('Error fetching dashboard state:', error.message || error);
    // Error Handling requirement: "Never crash the dashboard. Always return a valid DashboardState."
    // If something crashes, gracefully fallback to NEW_USER and explicitly return 200 OK
    res.status(200).json({
      dashboardState: "NEW_USER",
      metadata: {
        resumeUploaded: false,
        resumeAnalysed: false,
        careerGenerated: false,
        completedInterviews: 0,
        draftInterviews: 0,
        activeInterview: false,
        activeResume: undefined,
        recentInterviews: [],
        stats: {
          totalResumes: 0,
          completedInterviews: 0,
          averageScore: 0,
          scoreTrend: 0,
          currentStreak: 0,
          averageDuration: 0
        },
        achievements: [],
        performanceData: [],
        recommendations: [],
        onboardingProgress: {
          totalSteps: 5,
          completedCount: 0,
          isCompleted: false,
          completedSteps: [],
          nextStep: 'UPLOAD_RESUME',
          steps: [
            { id: 'UPLOAD_RESUME', completed: false, enabled: true },
            { id: 'ANALYZE_RESUME', completed: false, enabled: false },
            { id: 'GENERATE_INTERVIEW', completed: false, enabled: false },
            { id: 'COMPLETE_INTERVIEW', completed: false, enabled: false },
            { id: 'VIEW_FEEDBACK', completed: false, enabled: false }
          ]
        }
      }
    });
  }
};
