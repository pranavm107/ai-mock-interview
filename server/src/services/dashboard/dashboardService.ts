import { db } from '../../config/firebaseAdmin';
import { DashboardStateResult } from './dashboardTypes';
import { determineDashboardState, DashboardContext } from './dashboardStateService';
import { logDashboardStateEvaluation } from './dashboardUtils';

export const getDashboardMetadata = async (userId: string): Promise<DashboardStateResult> => {
  if (!db) {
    throw new Error("Firestore Admin not initialized");
  }

  console.log('Dashboard Query');
  let resumesSnapshot;
  let interviewsSnapshot;
  let careerProfileDoc;
  let reportsSnapshot;

  try {
    resumesSnapshot = await db.collection('resumes').where('userId', '==', userId).get();
    console.log('✓ Resumes loaded');
  } catch (error) {
    console.error('Failed to load resumes:', error);
    throw error;
  }

  let enrichedSessions: any[] = [];
  try {
    const { getEnrichedUserSessions } = await import('../interview/interviewAggregationService');
    enrichedSessions = await getEnrichedUserSessions(userId);
    console.log('✓ Enriched Sessions loaded');
  } catch (error) {
    console.error('Failed to load enriched sessions:', error);
    throw error;
  }

  try {
    careerProfileDoc = await db.collection('careerProfiles').doc(userId).get();
    console.log('✓ Career Profile loaded');
  } catch (error) {
    console.error('Failed to load career profile:', error);
    throw error;
  }

  try {
    reportsSnapshot = await db.collection('interviewReports').where('userId', '==', userId).get();
    console.log('✓ Reports loaded');
  } catch (error) {
    console.error('Failed to load reports:', error);
    throw error;
  }

  let resumeUploaded = false;
  let resumeAnalysed = false;
  let latestResumeId: string | undefined = undefined;
  let activeResume: any = undefined;
  let totalResumes = 0;

  if (resumesSnapshot && !resumesSnapshot.empty) {
    totalResumes = resumesSnapshot.size;
    // Sort in memory by createdAt desc and pick the latest one
    const sortedResumes = resumesSnapshot.docs.sort((a, b) => {
      const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
      const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
      return bTime - aTime;
    });

    const latestResume = sortedResumes[0];
    const resumeData = latestResume.data();
    resumeUploaded = true;
    latestResumeId = latestResume.id;
    
    let atsScore;
    if (resumeData.analysis?.structuredResume) {
      resumeAnalysed = true;
      atsScore = resumeData.analysis.score; // Or however the score is stored
    }
    
    activeResume = {
      id: latestResume.id,
      filename: resumeData.originalFileName || resumeData.fileName || 'Resume.pdf',
      uploadedAt: resumeData.createdAt?.toDate ? resumeData.createdAt.toDate().toISOString() : new Date().toISOString(),
      size: resumeData.size || 0,
      hasAnalysis: resumeAnalysed,
      atsScore: atsScore || 0
    };
  }

  let completedInterviews = 0;
  let draftInterviews = 0;
  let inProgressInterviews = 0;
  let latestInterviewId: string | undefined = undefined;
  let latestDraftInterviewId: string | undefined = undefined;
  let hasAnyInterview = false;
  let recentInterviews: any[] = [];
  
  let totalScore = 0;
  let scoredCount = 0;
  let totalDuration = 0;
  let durationCount = 0;
  let currentStreak = 0;

  let sortedInterviews: any[] = [];

  if (enrichedSessions.length > 0) {
    hasAnyInterview = true;

    // enrichedSessions is already sorted by createdAt desc in getEnrichedUserSessions
    sortedInterviews = enrichedSessions;

    // Use the parent interviewId as the latestInterviewId so that "Start New" flows that check for it work
    latestInterviewId = sortedInterviews[0].interviewId || sortedInterviews[0].id;
    
    // Store recent interviews
    recentInterviews = sortedInterviews.slice(0, 5).map(session => {
      return {
        ...session,
        currentQuestion: session.progress?.currentQuestionIndex !== undefined ? session.progress.currentQuestionIndex + 1 : 1,
        totalQuestions: session.progress?.totalQuestions || 10
      };
    });
    
    // Calculate streak
    let currentStreakDays = 0;
    const completedDates = sortedInterviews
      .filter(session => session.state === 'COMPLETED' && session.createdAt)
      .map(session => {
        const dateObj = session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt);
        return dateObj.toISOString().split('T')[0];
      });
      
    // Remove duplicates and sort by date descending
    const uniqueDates = [...new Set(completedDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (uniqueDates.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      let expectedDate = new Date(uniqueDates[0]);
      
      if (uniqueDates[0] === todayStr || uniqueDates[0] === yesterdayStr) {
        currentStreakDays = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          expectedDate.setDate(expectedDate.getDate() - 1);
          if (uniqueDates[i] === expectedDate.toISOString().split('T')[0]) {
            currentStreakDays++;
          } else {
            break;
          }
        }
      }
    }
    currentStreak = currentStreakDays;
    
    sortedInterviews.forEach(session => {
      const status = session.state || 'UNKNOWN';
      if (status === 'COMPLETED') {
        completedInterviews++;
        if (typeof session.score === 'number') {
           totalScore += session.score;
           scoredCount++;
        }
        if (typeof session.duration === 'number' || (session.metrics && session.metrics.totalDurationMs)) {
           const dur = session.duration || Math.round((session.metrics.totalDurationMs || 0) / 60000);
           totalDuration += dur;
           durationCount++;
        }
      } else if (status === 'IN_PROGRESS') {
        inProgressInterviews++;
        if (!latestDraftInterviewId) latestDraftInterviewId = session.id;
      } else {
        // Assume draft/ready if not completed or in progress but session exists
        draftInterviews++;
        if (!latestDraftInterviewId) latestDraftInterviewId = session.id;
      }
    });
  }

  // Calculate performance data and score trend
  let performanceData: any[] = [];
  let scoreTrend = 0;
  
  if (completedInterviews > 0) {
    // Get all completed interviews that have a score, sorted oldest to newest for the graph
    const completedWithScores = sortedInterviews
      .filter(session => session.state === 'COMPLETED' && typeof session.score === 'number' && !Number.isNaN(session.score))
      .sort((a, b) => {
        const aTime = a.completedAt?.toMillis ? a.completedAt.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
        const bTime = b.completedAt?.toMillis ? b.completedAt.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
        return aTime - bTime;
      });

    performanceData = completedWithScores.map((session, index) => {
      const date = session.completedAt?.toDate ? session.completedAt.toDate() : (session.createdAt?.toDate ? session.createdAt.toDate() : new Date(session.createdAt || 0));
      return {
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score: session.score,
        interviewId: session.id,
        role: session.role || 'Mock Interview',
        company: session.company || 'Unknown'
      };
    });

    if (performanceData.length >= 2) {
      const latestScore = performanceData[performanceData.length - 1].score;
      const previousScore = performanceData[performanceData.length - 2].score;
      scoreTrend = latestScore - previousScore;
    } else {
      scoreTrend = 0;
    }
  }

  let viewFeedback = false;
  let latestCompletedReportId: string | undefined = undefined;
  if (!reportsSnapshot.empty) {
    // Sort in memory by createdAt desc
    const sortedReports = reportsSnapshot.docs.sort((a, b) => {
      const aTime = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
      const bTime = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    
    viewFeedback = true;
    latestCompletedReportId = sortedReports[0].data().sessionId || sortedReports[0].id;
  }

  const activeInterview = draftInterviews > 0 || inProgressInterviews > 0;
  const careerGenerated = careerProfileDoc.exists;

  // Define the raw completion statuses based on the queries
  const UPLOAD_RESUME_COMPLETE = totalResumes > 0;
  const ANALYZE_RESUME_COMPLETE = resumeAnalysed;
  const GENERATE_INTERVIEW_COMPLETE = hasAnyInterview;
  const COMPLETE_INTERVIEW_COMPLETE = completedInterviews > 0;
  const VIEW_FEEDBACK_COMPLETE = viewFeedback;

  const rawSteps = [
    { id: 'UPLOAD_RESUME', completed: UPLOAD_RESUME_COMPLETE },
    { id: 'ANALYZE_RESUME', completed: ANALYZE_RESUME_COMPLETE },
    { id: 'GENERATE_INTERVIEW', completed: GENERATE_INTERVIEW_COMPLETE },
    { id: 'COMPLETE_INTERVIEW', completed: COMPLETE_INTERVIEW_COMPLETE },
    { id: 'VIEW_FEEDBACK', completed: VIEW_FEEDBACK_COMPLETE }
  ];

  const steps = [];
  let nextStep: string | null = null;
  let allPreviousCompleted = true;
  let completedCount = 0;
  const completedStepsList: string[] = [];

  for (const step of rawSteps) {
    if (step.completed) {
      completedCount++;
      completedStepsList.push(step.id);
    }
    
    // A step is enabled if it's already completed, OR if it's the exact next step in the sequence (meaning all previous are completed)
    const enabled = step.completed || allPreviousCompleted;
    
    steps.push({
      id: step.id,
      completed: step.completed,
      enabled
    });
    
    // As soon as we find the first incomplete step, we mark nextStep and flag that not all previous are completed for subsequent steps
    if (!step.completed && allPreviousCompleted) {
      nextStep = step.id;
      allPreviousCompleted = false;
    }
  }

  const isCompleted = completedCount === rawSteps.length;

  const onboardingProgress = {
    totalSteps: rawSteps.length,
    completedCount,
    isCompleted,
    completedSteps: completedStepsList,
    nextStep,
    steps
  };

  const avgScore = scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0;
  const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0;

  const achievements = [
    { id: 'first_resume', title: 'First Resume', unlocked: resumeUploaded },
    { id: 'first_interview', title: 'First Interview', unlocked: completedInterviews >= 1 },
    { id: 'five_interviews', title: '5 Completed', unlocked: completedInterviews >= 5, progress: completedInterviews, max: 5 },
    { id: 'ten_interviews', title: '10 Completed', unlocked: completedInterviews >= 10, progress: completedInterviews, max: 10 },
    { id: 'high_score', title: '90+ Score', unlocked: sortedInterviews.length > 0 && sortedInterviews.some(session => (session.score || 0) >= 90) },
    { id: 'streak_7', title: '7 Day Streak', unlocked: currentStreak >= 7, progress: currentStreak, max: 7 },
  ];

  let recommendations: string[] = [];

  // Generate dynamic recommendations based on real Firestore data
  if (completedInterviews === 0 && inProgressInterviews === 0) {
    recommendations.push("Complete your first mock interview to unlock personalized AI feedback.");
  } else {
    // 1. Weakness-based recommendations from actual reports
    if (!reportsSnapshot.empty) {
      // Find the most recent report with improvements
      const latestReport = reportsSnapshot.docs
        .map(doc => doc.data())
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const bTime = b.data?.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return bTime - aTime;
        })[0];

      if (latestReport && latestReport.scores?.areasForImprovement?.length > 0) {
        const topWeakness = latestReport.scores.areasForImprovement[0];
        recommendations.push(`Focus your next practice on improving: ${topWeakness.topic || 'technical depth'}.`);
      }
    }

    // 2. Score-based recommendations
    if (avgScore > 0 && avgScore < 60) {
      recommendations.push(`Your average score is ${avgScore}%. Try a lower difficulty interview to build foundational confidence.`);
    } else if (avgScore >= 85) {
      recommendations.push("You are performing excellently. Challenge yourself with a higher difficulty or different role.");
    }

    // 3. Streak/Activity-based recommendations
    if (currentStreak === 0 && completedInterviews > 0) {
      recommendations.push("You lost your streak. Complete a quick interview today to get back on track.");
    }

    // 4. Role-based fallback from Career Profile if we need more recommendations
    if (recommendations.length < 3 && careerProfileDoc && careerProfileDoc.exists) {
      const cpData = careerProfileDoc.data();
      if (cpData && cpData.profile?.recommendedRoles?.length > 0) {
         recommendations.push(`Consider tailoring your next interview for ${cpData.profile.recommendedRoles[0]} positions.`);
      }
    }

    // 5. Generic dynamic fallback if still empty
    if (recommendations.length === 0) {
      recommendations.push("Keep up the great work! Consistency is key to acing your interviews.");
    }
  }

  const context: DashboardContext = {
    resumeUploaded,
    resumeAnalysed,
    careerGenerated,
    completedInterviews,
    draftInterviews,
    activeInterview,
    latestResumeId,
    latestInterviewId
  };

  const { state, reason } = determineDashboardState(context);

  const result: DashboardStateResult = {
    dashboardState: state,
    resumeUploaded,
    resumeAnalysed,
    careerGenerated,
    completedInterviews,
    draftInterviews,
    activeInterview,
    latestResumeId,
    latestInterviewId,
    latestDraftInterviewId,
    latestCompletedReportId,
    onboardingProgress,
    activeResume,
    recentInterviews,
    stats: {
      totalResumes,
      completedInterviews,
      averageScore: avgScore,
      scoreTrend,
      currentStreak,
      averageDuration: avgDuration
    },
    achievements,
    performanceData,
    recommendations
  };

  // Log only in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    logDashboardStateEvaluation(userId, result, reason);
  }

  return result;
};
