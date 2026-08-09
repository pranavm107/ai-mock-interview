import { db } from '../config/firebaseAdmin';
import { getDashboardMetadata } from './dashboard/dashboardService';
import { getEnrichedUserSessions } from './interview/interviewAggregationService';
import { 
  SuggestedInterviewRequest, 
  SuggestedInterview, 
  RecommendationContext, 
  RecommendationSource,
  IncompleteProfileState
} from '../types/recommendation';
import { recommendInterview } from './interviewRecommendationEngine';
import { enrichRecommendation, mergeAIRecommendation } from './interviewRecommendationAIService';
import { logger } from '../utils/logger';

export const getSuggestedInterview = async (
  userId: string, 
  options?: SuggestedInterviewRequest
): Promise<SuggestedInterview | IncompleteProfileState> => {
  const startTime = Date.now();
  
  if (!db) {
    throw new Error("Firestore Admin not initialized");
  }

  // 1. Fetch all data in one parallel batch
  const dashboardMeta = await getDashboardMetadata(userId);
  const careerProfileData = dashboardMeta.rawProfile;

  // 2. Validate Resume if provided
  let validatedResumeId: string | undefined = undefined;
  let resumeSkills: string[] = [];
  let resumeHasAnalysis = false;
  
  if (options?.resumeId) {
    const resumeData = dashboardMeta.rawResumes?.find((r: any) => r.id === options.resumeId);
    if (!resumeData) {
      throw new Error("Unauthorized: Resume does not belong to the user or not found");
    }
    validatedResumeId = options.resumeId;
    resumeHasAnalysis = !!resumeData?.analysis?.structuredResume;
    resumeSkills = resumeData?.analysis?.skills || resumeData?.skills || [];
  } else if (dashboardMeta.activeResume) {
    // Fallback to latest resume if none provided and user has one
    validatedResumeId = dashboardMeta.activeResume.id;
    resumeHasAnalysis = dashboardMeta.activeResume.hasAnalysis;
    const lrData = dashboardMeta.rawResumes?.find((r: any) => r.id === validatedResumeId);
    if (lrData) {
      resumeSkills = lrData.analysis?.skills || lrData.skills || [];
    }
  }

  // Extract recent difficulties
  const recentDifficulties = dashboardMeta.recentInterviews.map(i => i.difficulty || 'MEDIUM');

  // Find weak areas from the latest report
  let weakAreas: string[] = [];
  if (dashboardMeta.rawReports && dashboardMeta.rawReports.length > 0) {
    const sortedReports = [...dashboardMeta.rawReports].sort((a: any, b: any) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return bTime - aTime;
    });
    
    const latestReport = sortedReports[0];
    if (latestReport?.scores?.areasForImprovement?.length > 0) {
      weakAreas = latestReport.scores.areasForImprovement.map((area: any) => area.topic || 'technical skills');
    }
  }

  // 3. Build RecommendationContext
  const context: RecommendationContext = {
    userId,
    profile: {
      targetRole: careerProfileData?.profile?.targetRole || careerProfileData?.profile?.recommendedRoles?.[0],
      targetCompany: careerProfileData?.profile?.targetCompany,
      experienceLevel: careerProfileData?.profile?.experienceLevel,
    },
    resume: {
      id: validatedResumeId,
      skills: resumeSkills,
      hasAnalysis: resumeHasAnalysis
    },
    performance: {
      completedInterviews: dashboardMeta.stats.completedInterviews,
      averageScore: dashboardMeta.stats.averageScore,
      scoreTrend: dashboardMeta.stats.scoreTrend,
      weakAreas,
      recentDifficulties,
    },
    activity: {
      currentStreak: dashboardMeta.stats.currentStreak,
      lastInterviewDate: dashboardMeta.recentInterviews.length > 0 
        ? dashboardMeta.recentInterviews[0].createdAt 
        : undefined,
    },
    requestId: options?.requestId
  };

  const dataAggregationDurationMs = Date.now() - startTime;
  const aiStartTime = Date.now();

  // 4. Delegate to Recommendation Engine (C4 - Baseline)
  const baselineDecision = recommendInterview(context);

  // 5. Delegate to AI Service (C5 - Enrichment)
  const aiEnhancement = await enrichRecommendation(context, baselineDecision);
  
  // 6. Safe Merge C4 + C5
  const finalDecision = mergeAIRecommendation(baselineDecision, aiEnhancement);
  const aiGenerationDurationMs = Date.now() - aiStartTime;

  // 7. Apply fallbacks and map to SuggestedInterview contract
  let targetRole = context.profile.targetRole;
  if (!targetRole) {
    return {
      status: 'incomplete_profile',
      message: 'We need a little more information to personalize your interview. Complete your profile',
      missingFields: ['targetRole']
    };
  }

  let targetCompany = context.profile.targetCompany || "Tech Industry";
  
  let experienceLevel = context.profile.experienceLevel as any || "Mid";
  const validExpLevels = ["Student", "Junior", "Mid", "Senior", "Lead"];
  if (!validExpLevels.includes(experienceLevel)) {
    if (experienceLevel.toLowerCase().includes("fresh") || experienceLevel.toLowerCase().includes("student")) {
      experienceLevel = "Student";
    } else {
      experienceLevel = "Mid";
    }
  }

  const suggestedInterview: SuggestedInterview = {
    targetRole,
    targetCompany,
    interviewType: finalDecision.interviewType,
    difficulty: finalDecision.difficulty,
    experienceLevel,
    questionCount: finalDecision.questionCount,
    durationMinutes: finalDecision.durationMinutes,
    resumeId: context.resume.id,
    focusAreas: finalDecision.focusAreas,
    recommendationReason: finalDecision.recommendationReason,
    recommendationSource: finalDecision.recommendationSource,
    generatedAt: new Date().toISOString()
  };

  const totalDurationMs = Date.now() - startTime;
  
  logger.info({
    event: 'recommendation.generated',
    userId,
    requestId: options?.requestId,
    recommendationType: finalDecision.recommendationSource,
    durationMs: totalDurationMs,
    dataAggregationDurationMs,
    aiGenerationDurationMs,
    success: true
  });

  return suggestedInterview;
};
