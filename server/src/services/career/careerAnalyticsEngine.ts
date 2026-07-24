import { InterviewSession, CareerMetrics } from './careerMetricsService';

export interface CareerScoreDetails {
  performance: number;
  consistency: number;
  completionRate: number;
  improvementTrend: number;
  communicationQuality: number;
  totalScore: number;
}

export interface CareerReadiness {
  level: string;
  reason: string;
}

export interface TrendMetrics {
  current30DaysScore: number;
  previous30DaysScore: number;
  delta: number;
  trend: 'Improving' | 'Stable' | 'Declining';
}

export const computeCareerScore = (metrics: CareerMetrics): CareerScoreDetails => {
  if (metrics.completedInterviews === 0) {
    return { performance: 0, consistency: 0, completionRate: 0, improvementTrend: 0, communicationQuality: 0, totalScore: 0 };
  }

  const completed = metrics.sessions.filter(s => s.status === 'Completed' && s.score !== null);
  
  // 1. Performance (40%)
  const avgScore = metrics.averageScore || 0;
  
  // 2. Consistency (20%) - derived from standard deviation
  let consistency = 0;
  if (completed.length > 1) {
    const variance = completed.reduce((sum, s) => sum + Math.pow((s.score || 0) - avgScore, 2), 0) / completed.length;
    const stdDev = Math.sqrt(variance);
    consistency = Math.max(0, 100 - (stdDev * 2));
  } else if (completed.length === 1) {
    consistency = 100;
  }

  // 3. Completion Rate (15%)
  const completionRate = metrics.completionRate;

  // 4. Improvement Trend (15%)
  const trends = computeTrends(metrics.sessions);
  const trendScore = Math.min(100, Math.max(0, 50 + (trends.delta * 2.5)));

  // 5. Communication Quality (10%)
  const behavioral = completed.filter(s => s.interviewType === 'Behavioral' || s.interviewType === 'HR');
  const communicationQuality = behavioral.length > 0 
    ? behavioral.reduce((sum, s) => sum + (s.score || 0), 0) / behavioral.length
    : avgScore;

  // Weighted Total
  const totalScore = Math.round(
    (avgScore * 0.40) +
    (consistency * 0.20) +
    (completionRate * 0.15) +
    (trendScore * 0.15) +
    (communicationQuality * 0.10)
  );

  return {
    performance: Math.round(avgScore),
    consistency: Math.round(consistency),
    completionRate: Math.round(completionRate),
    improvementTrend: Math.round(trendScore),
    communicationQuality: Math.round(communicationQuality),
    totalScore
  };
};

export const computeCareerReadiness = (score: number, metrics: CareerMetrics): CareerReadiness => {
  let level = 'Beginner';
  if (score >= 86) level = 'Highly Ready';
  else if (score >= 76) level = 'Interview Ready';
  else if (score >= 61) level = 'Developing';
  else if (score >= 41) level = 'Learning';

  const completedCount = metrics.completedInterviews;
  
  let reason = `Because: Completed ${completedCount} interviews. `;
  if (completedCount === 0) {
    reason += "Complete your first mock interview to get a baseline.";
  } else {
    reason += `Average score is tracking at ${Math.round(score)}. `;
    if (score > 75) reason += "Strong technical and behavioral fundamentals.";
    else reason += "Needs more practice on weak areas.";
  }

  return { level, reason };
};

export const computeTrends = (sessions: InterviewSession[]): TrendMetrics => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

  const completed = sessions.filter(s => s.status === 'Completed' && s.score !== null);
  
  const current30 = completed.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
  const previous30 = completed.filter(s => {
    const d = new Date(s.createdAt);
    return d >= sixtyDaysAgo && d < thirtyDaysAgo;
  });

  const avgCurrent = current30.length > 0 
    ? current30.reduce((sum, s) => sum + (s.score || 0), 0) / current30.length 
    : 0;
    
  const avgPrev = previous30.length > 0 
    ? previous30.reduce((sum, s) => sum + (s.score || 0), 0) / previous30.length 
    : avgCurrent; // if no previous data, assume stable

  const delta = avgCurrent - avgPrev;
  
  let trend: 'Improving' | 'Stable' | 'Declining' = 'Stable';
  if (delta >= 3) trend = 'Improving';
  else if (delta <= -3) trend = 'Declining';

  return {
    current30DaysScore: Math.round(avgCurrent),
    previous30DaysScore: Math.round(avgPrev),
    delta: Math.round(delta),
    trend
  };
};

export const aggregateSkills = (metrics: CareerMetrics): Record<string, number> => {
  const skills: Record<string, { total: number; count: number }> = {};

  metrics.sessions.filter(s => s.status === 'Completed' && s.score !== null).forEach(s => {
    const score = s.score || 0;
    const type = s.interviewType || 'Mixed';
    
    // Distribute score to primary skills based on interview type
    if (type === 'Technical' || type === 'Mixed') {
      skills['Problem Solving'] = { total: (skills['Problem Solving']?.total || 0) + score, count: (skills['Problem Solving']?.count || 0) + 1 };
      skills['System Design'] = { total: (skills['System Design']?.total || 0) + score, count: (skills['System Design']?.count || 0) + 1 };
      skills['Algorithms'] = { total: (skills['Algorithms']?.total || 0) + score, count: (skills['Algorithms']?.count || 0) + 1 };
    }
    
    if (type === 'Behavioral' || type === 'HR' || type === 'Mixed') {
      skills['Communication'] = { total: (skills['Communication']?.total || 0) + score, count: (skills['Communication']?.count || 0) + 1 };
      skills['Leadership'] = { total: (skills['Leadership']?.total || 0) + score, count: (skills['Leadership']?.count || 0) + 1 };
    }
  });

  const result: Record<string, number> = {};
  for (const [skill, data] of Object.entries(skills)) {
    result[skill] = Math.round(data.total / data.count);
  }

  return result;
};
