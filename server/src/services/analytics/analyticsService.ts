import { db } from '../../config/firebaseAdmin';
import {
  DashboardAnalytics,
  PerformanceTrend,
  SkillTrend,
  CategoryTrend,
  DifficultyAnalytics,
  ActivityHeatmap,
  SpeechAnalytics,
  ResumeAnalytics
} from '../../types/analytics';
import { InterviewSession } from '../../types/interviewSession';
import { calculateLongestStreak } from './streakService';

// Helper to format date as "Jan 02"
const formatShortDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
};

export const getDashboardAnalytics = (sessions: InterviewSession[]): DashboardAnalytics => {
  const defaultAnalytics: DashboardAnalytics = {
    totalInterviews: sessions.length,
    completedInterviews: 0,
    draftInterviews: 0,
    inProgressInterviews: 0,
    averageScore: 0,
    bestScore: 0,
    latestScore: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPracticeDuration: 0,
    averageInterviewDuration: 0
  };

  if (sessions.length === 0) return defaultAnalytics;

  let totalScore = 0;
  let scoredCount = 0;
  
  const completedSessions = sessions.filter(s => s.state === 'COMPLETED');
  defaultAnalytics.completedInterviews = completedSessions.length;
  defaultAnalytics.inProgressInterviews = sessions.filter(s => s.state === 'STARTED' || s.state === 'ASKING' || s.state === 'ANSWERING' || s.state === 'PAUSED').length;
  defaultAnalytics.draftInterviews = sessions.length - defaultAnalytics.completedInterviews - defaultAnalytics.inProgressInterviews;
  
  defaultAnalytics.completionRate = Math.round((defaultAnalytics.completedInterviews / defaultAnalytics.totalInterviews) * 100) || 0;

  completedSessions.forEach(s => {
    if (s.overallScore !== undefined) {
      totalScore += s.overallScore;
      scoredCount++;
      if (s.overallScore > defaultAnalytics.bestScore) defaultAnalytics.bestScore = s.overallScore;
    }
    if (s.duration) {
      defaultAnalytics.totalPracticeDuration += s.duration;
    }
  });

  if (scoredCount > 0) {
    defaultAnalytics.averageScore = Math.round(totalScore / scoredCount);
  }

  if (defaultAnalytics.completedInterviews > 0) {
    defaultAnalytics.averageInterviewDuration = Math.round(defaultAnalytics.totalPracticeDuration / defaultAnalytics.completedInterviews);
  }

  const sortedCompleted = [...completedSessions].sort((a, b) => {
    const timeA = new Date(a.completedAt || a.createdAt).getTime();
    const timeB = new Date(b.completedAt || b.createdAt).getTime();
    return timeB - timeA; 
  });

  if (sortedCompleted.length > 0 && sortedCompleted[0].overallScore !== undefined) {
    defaultAnalytics.latestScore = sortedCompleted[0].overallScore;
  }

  const streak = calculateLongestStreak(sessions);
  defaultAnalytics.currentStreak = streak.currentStreak;
  defaultAnalytics.longestStreak = streak.longestStreak;

  return defaultAnalytics;
};

export const getPerformanceTrend = (sessions: InterviewSession[]): PerformanceTrend => {
  const completed = sessions.filter(s => s.state === 'COMPLETED' && s.overallScore !== undefined);
  
  const sorted = [...completed].sort((a, b) => {
    const timeA = new Date(a.completedAt || a.createdAt).getTime();
    const timeB = new Date(b.completedAt || b.createdAt).getTime();
    return timeA - timeB; // Ascending
  });

  return sorted.map(s => ({
    date: formatShortDate(s.completedAt || s.createdAt),
    overallScore: s.overallScore!
  }));
};

export const getSkillTrend = (sessions: InterviewSession[]): SkillTrend => {
  const completed = sessions.filter(s => s.state === 'COMPLETED' && s.skillScores && s.skillScores.length > 0);
  
  if (completed.length === 0) return [];
  
  const skillMap = new Map<string, { date: string, score: number }[]>();
  
  const sorted = [...completed].sort((a, b) => {
    const timeA = new Date(a.completedAt || a.createdAt).getTime();
    const timeB = new Date(b.completedAt || b.createdAt).getTime();
    return timeA - timeB;
  });

  sorted.forEach(session => {
    const date = formatShortDate(session.completedAt || session.createdAt);
    session.skillScores!.forEach(skillScore => {
      if (!skillMap.has(skillScore.skill)) {
        skillMap.set(skillScore.skill, []);
      }
      skillMap.get(skillScore.skill)!.push({
        date,
        score: skillScore.score
      });
    });
  });

  const result: SkillTrend = [];
  skillMap.forEach((history, skill) => {
    result.push({ skill, history });
  });

  return result;
};

export const getCategoryTrend = (sessions: InterviewSession[]): CategoryTrend => {
  const completed = sessions.filter(s => s.state === 'COMPLETED');
  
  const sorted = [...completed].sort((a, b) => {
    const timeA = new Date(a.completedAt || a.createdAt).getTime();
    const timeB = new Date(b.completedAt || b.createdAt).getTime();
    return timeA - timeB; // Ascending
  });

  return sorted.map(s => ({
    date: formatShortDate(s.completedAt || s.createdAt),
    technical: s.technicalScore || 0,
    communication: s.communicationScore || 0,
    behavioral: s.behavioralScore || 0,
    confidence: s.confidenceScore || 0,
    problemSolving: s.problemSolvingScore || 0,
    timeManagement: s.timeManagementScore || 0
  }));
};

export const getDifficultyAnalytics = (sessions: InterviewSession[]): DifficultyAnalytics => {
  const completed = sessions.filter(s => s.state === 'COMPLETED');
  
  if (completed.length === 0) return [];
  
  const difficulties: ("Easy" | "Medium" | "Hard" | "Mixed")[] = ["Easy", "Medium", "Hard", "Mixed"];
  const result: DifficultyAnalytics = [];
  
  difficulties.forEach(diff => {
    const group = completed.filter(s => s.difficulty?.toLowerCase() === diff.toLowerCase());
    if (group.length > 0) {
      let totalScore = 0;
      let scoredCount = 0;
      let successCount = 0;
      
      group.forEach(s => {
        if (s.overallScore !== undefined) {
          totalScore += s.overallScore;
          scoredCount++;
          if (s.overallScore >= 70) successCount++;
        }
      });
      
      result.push({
        difficulty: diff,
        averageScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0,
        interviewCount: group.length,
        successRate: Math.round((successCount / group.length) * 100)
      });
    }
  });
  
  return result;
};

export const getActivityHeatmap = (sessions: InterviewSession[]): ActivityHeatmap => {
  const completed = sessions.filter(s => s.state === 'COMPLETED');
  
  const dateMap = new Map<string, number>();
  
  completed.forEach(s => {
    const date = new Date(s.completedAt || s.createdAt).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  
  const result: ActivityHeatmap = [];
  dateMap.forEach((count, date) => {
    result.push({ date, completedCount: count });
  });
  
  return result;
};

export const getSpeechAnalytics = (sessions: InterviewSession[]): SpeechAnalytics => {
  const completedWithSpeech = sessions.filter(s => s.state === 'COMPLETED' && s.speechMetrics);
  
  const result: SpeechAnalytics = {
    averageFillerWords: 0,
    averageFillerRatio: 0,
    averageSilenceDuration: 0,
    averageSilenceRatio: 0,
    averageSpeakingSpeed: 0
  };
  
  if (completedWithSpeech.length === 0) return result;
  
  let confidenceCount = 0;
  let totalConfidence = 0;

  completedWithSpeech.forEach(s => {
    const metrics = s.speechMetrics!;
    result.averageFillerWords += metrics.fillerWords;
    result.averageFillerRatio += metrics.fillerRatio;
    result.averageSilenceDuration += metrics.silenceDuration;
    result.averageSilenceRatio += metrics.silenceRatio;
    result.averageSpeakingSpeed += metrics.speakingSpeed;

    if (s.confidenceScore !== undefined) {
      totalConfidence += s.confidenceScore;
      confidenceCount++;
    }
  });
  
  const count = completedWithSpeech.length;
  result.averageFillerWords = Math.round(result.averageFillerWords / count);
  result.averageFillerRatio = Math.round(result.averageFillerRatio / count);
  result.averageSilenceDuration = Math.round(result.averageSilenceDuration / count);
  result.averageSilenceRatio = Math.round(result.averageSilenceRatio / count);
  result.averageSpeakingSpeed = Math.round(result.averageSpeakingSpeed / count);
  
  if (confidenceCount > 0) {
    result.averageConfidence = Math.round(totalConfidence / confidenceCount);
  }
  
  return result;
};

export const getResumeAnalytics = async (userId: string): Promise<ResumeAnalytics | null> => {
  const snapshot = await db.collection('resumes').where('userId', '==', userId).get();
  
  if (snapshot.empty) {
    return null;
  }

  const resumes = snapshot.docs.map(doc => doc.data());
  const sortedResumes = resumes.sort((a, b) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });
  
  const latestResume = sortedResumes[0];
  
  const result: ResumeAnalytics = {
    atsScore: latestResume.analysis?.atsScore ?? latestResume.analysis?.aiAnalysis?.atsScore ?? null,
    resumeScore: latestResume.analysis?.resumeScore ?? latestResume.analysis?.aiAnalysis?.overallScore ?? null,
    technicalScore: latestResume.analysis?.aiAnalysis?.technicalScore ?? null,
    communicationScore: latestResume.analysis?.aiAnalysis?.communicationScore ?? null,
    completionScore: 0,
    skillsCount: 0,
    projectsCount: 0,
    experienceCount: 0
  };
  
  // Calculate counts safely
  if (latestResume.analysis?.structuredResume?.skills) {
    const srSkills = latestResume.analysis.structuredResume.skills;
    result.skillsCount = 
      (srSkills.languages?.length || 0) + 
      (srSkills.frameworks?.length || 0) + 
      (srSkills.databases?.length || 0) + 
      (srSkills.cloud?.length || 0) + 
      (srSkills.tools?.length || 0) + 
      (srSkills.concepts?.length || 0);
  } else if (latestResume.analysis?.skills) {
    result.skillsCount = latestResume.analysis.skills.length;
  }
  
  if (latestResume.analysis?.structuredResume?.projects) {
    result.projectsCount = latestResume.analysis.structuredResume.projects.length;
  } else if (latestResume.analysis?.projects) {
    result.projectsCount = latestResume.analysis.projects.length;
  }
  
  if (latestResume.analysis?.structuredResume?.experience) {
    result.experienceCount = latestResume.analysis.structuredResume.experience.length;
  } else if (latestResume.analysis?.experience) {
    result.experienceCount = latestResume.analysis.experience.length;
  }

  // Mathematical fallback for completionScore
  let sectionsFound = 0;
  const totalSections = 5; 
  
  const sr = latestResume.analysis?.structuredResume;
  if (sr) {
    if (sr.candidate?.headline || sr.candidate?.summary) sectionsFound++;
    if (sr.experience && sr.experience.length > 0) sectionsFound++;
    if (sr.education && sr.education.length > 0) sectionsFound++;
    if (result.skillsCount > 0) sectionsFound++;
    if (result.projectsCount > 0) sectionsFound++;
  }
  result.completionScore = Math.round((sectionsFound / totalSections) * 100);
  
  return result;
};
