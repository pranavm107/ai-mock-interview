import { db } from '../../config/firebaseAdmin';
import { InterviewReport } from '../../types/interviewReport';
import { AssessmentAnalytics, getUserAnalytics } from '../assessmentAnalyticsService';
import { 
  ReadinessProfile, 
  ReadinessLevel, 
  ConfidenceLevel, 
  WeaknessCard, 
  StrengthCard, 
  ReadinessScoreComponent, 
  TrendDirection,
  PriorityAction
} from '../../types/readiness';

/**
 * Normalizes a score (e.g. from 1-100 or 1-5 or 0-1) into a 0-100 percentage.
 */
const normalizeScore = (score: number, maxScore: number = 100): number => {
  if (maxScore === 100) return score;
  return Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
};

/**
 * Calculates Trend Direction based on history
 */
const calculateTrend = (history: number[]): TrendDirection => {
  if (history.length < 2) return 'Not Enough Data';
  const recent = history.slice(0, 3);
  const older = history.slice(3, 6);
  
  if (older.length === 0) {
    if (recent[0] > recent[recent.length - 1] + 5) return 'Improving';
    if (recent[0] < recent[recent.length - 1] - 5) return 'Declining';
    return 'Stable';
  }

  const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
  const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;

  if (recentAvg > olderAvg + 5) return 'Improving';
  if (recentAvg < olderAvg - 5) return 'Declining';
  return 'Stable';
};

/**
 * Derives Readiness Intelligence from Historical Interviews and Assessments
 */
export const getReadinessProfile = async (userId: string): Promise<ReadinessProfile> => {
  
  // 1. Fetch Interview Reports
  const reportsSnapshot = await db.collection('interviewReports').where('userId', '==', userId).get();
  const reports = reportsSnapshot.docs.map(d => d.data() as InterviewReport);
  
  // Sort reports newest first
  reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  
  // 2. Fetch Assessment Analytics (This uses parallel reading of COMPLETED assessments)
  const assessmentAnalytics = await getUserAnalytics(userId);

  // 3. Evaluate Insufficient Data
  // We want at least 2 interviews or 2 assessments or a mix of both.
  const totalInterviews = reports.length;
  const totalAssessments = assessmentAnalytics.overall.totalCompleted;
  let totalEvaluatedResponses = 0;
  
  reports.forEach(r => {
    totalEvaluatedResponses += r.questionEvaluations?.length || 0;
  });
  totalEvaluatedResponses += assessmentAnalytics.overall.totalQuestions;

  const hasInsufficientData = totalInterviews + totalAssessments < 2;

  // Confidence Level
  let confidence: ConfidenceLevel = 'Low';
  if (totalInterviews + totalAssessments >= 5 && totalEvaluatedResponses >= 20) {
    confidence = 'High';
  } else if (totalInterviews + totalAssessments >= 2) {
    confidence = 'Medium';
  }

  // 4. Extract Historical Trend (Interviews + Assessments mixed chronologically)
  const trendHistoryMap: { date: string, score: number, type: 'Interview' | 'Assessment' }[] = [];
  
  reports.forEach(r => {
    trendHistoryMap.push({
      date: new Date(r.generatedAt).toISOString(),
      score: r.overallEvaluation.overallScore,
      type: 'Interview'
    });
  });

  assessmentAnalytics.trend.forEach(t => {
    // Assuming trend points have scores (We need to pull them if they do, wait trend points don't have scores directly in assessmentAnalytics.trend)
    // Actually assessmentAnalytics doesn't expose the score per trend point right now, but we'll use Interview trends primarily.
  });

  trendHistoryMap.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const trendHistory = trendHistoryMap.map((t, idx) => ({
    date: t.date,
    score: t.score,
    label: `${t.type} ${idx + 1}`
  }));

  // 5. Calculate Component Readiness (Technical, Communication, Behavioral, Problem Solving)
  let sumTechnical = 0, sumCommunication = 0, sumBehavioral = 0, sumProblemSolving = 0;
  let countTechnical = 0, countCommunication = 0, countBehavioral = 0, countProblemSolving = 0;

  reports.forEach(r => {
    if (r.overallEvaluation.technicalScore > 0) {
      sumTechnical += r.overallEvaluation.technicalScore;
      countTechnical++;
    }
    if (r.overallEvaluation.communicationScore > 0) {
      sumCommunication += r.overallEvaluation.communicationScore;
      countCommunication++;
    }
    if (r.overallEvaluation.behavioralScore > 0) {
      sumBehavioral += r.overallEvaluation.behavioralScore;
      countBehavioral++;
    }
    if (r.overallEvaluation.problemSolvingScore > 0) {
      sumProblemSolving += r.overallEvaluation.problemSolvingScore;
      countProblemSolving++;
    }
  });

  // Combine with Assessments Technical
  let technicalComponentScore = countTechnical > 0 ? sumTechnical / countTechnical : 0;
  if (assessmentAnalytics.overall.totalCompleted > 0) {
    // Weight interviews and assessments equally for technical if both exist
    technicalComponentScore = countTechnical > 0 ? 
      (technicalComponentScore + assessmentAnalytics.overall.averageScore) / 2 : 
      assessmentAnalytics.overall.averageScore;
    
    // Add the assessment to technical evidence count
    countTechnical += assessmentAnalytics.overall.totalCompleted;
  }

  const components: ReadinessScoreComponent[] = [];
  
  if (countTechnical >= 2) {
    components.push({ label: 'Technical Readiness', score: Math.round(technicalComponentScore) });
  }
  if (countCommunication >= 2) {
    components.push({ label: 'Communication', score: Math.round(sumCommunication / countCommunication) });
  }
  if (countBehavioral >= 2) {
    components.push({ label: 'Behavioral Readiness', score: Math.round(sumBehavioral / countBehavioral) });
  }
  if (countProblemSolving >= 2) {
    components.push({ label: 'Problem Solving', score: Math.round(sumProblemSolving / countProblemSolving) });
  }

  // 6. Readiness Score Calculation
  let readinessScore = 0;
  if (components.length > 0) {
    readinessScore = components.reduce((sum, c) => sum + c.score, 0) / components.length;
    // Apply recency weighting: if the most recent 2 interactions are much better/worse, pull score 20% in that direction
    const recentScores = trendHistoryMap.slice(-2).map(t => t.score);
    if (recentScores.length > 0) {
      const recentAvg = recentScores.reduce((sum, v) => sum + v, 0) / recentScores.length;
      readinessScore = (readinessScore * 0.7) + (recentAvg * 0.3); 
    }
  }
  readinessScore = Math.round(readinessScore);

  let readinessState: ReadinessLevel = 'Needs Significant Preparation';
  if (readinessScore >= 90) readinessState = 'Highly Ready';
  else if (readinessScore >= 75) readinessState = 'Interview Ready';
  else if (readinessScore >= 60) readinessState = 'Good Progress';
  else if (readinessScore >= 40) readinessState = 'Developing';

  // 7. Aggregate Topic Performance for Strengths & Weaknesses
  const topicMap = new Map<string, { scores: number[], interviews: number, assessments: number, questions: number }>();
  
  // From Assessments
  assessmentAnalytics.topics.forEach(t => {
    if (!topicMap.has(t.topic)) {
      topicMap.set(t.topic, { scores: [], interviews: 0, assessments: 0, questions: 0 });
    }
    const rec = topicMap.get(t.topic)!;
    rec.assessments += t.assessments;
    rec.questions += t.totalQuestions;
    // Add the average score multiple times to simulate weight
    for(let i=0; i<t.assessments; i++) rec.scores.push(t.averageScore);
  });

  // From Interviews
  reports.forEach(r => {
    r.questionEvaluations.forEach(q => {
      // Very basic normalization using expected topics or skills if available
      // Assuming skillsEvaluated or similar could be extracted. For now, rely on standard topics or general text classification.
      // We will look at r.skillsAnalysis for now.
    });
    r.skillsAnalysis.forEach(s => {
      if (!topicMap.has(s.skillName)) {
        topicMap.set(s.skillName, { scores: [], interviews: 0, assessments: 0, questions: 0 });
      }
      const rec = topicMap.get(s.skillName)!;
      rec.interviews += 1;
      const scoreMap = { "Beginner": 25, "Intermediate": 50, "Advanced": 75, "Expert": 95 };
      rec.scores.push(scoreMap[s.proficiencyLevel] || 50);
    });
  });

  const weaknesses: WeaknessCard[] = [];
  const strengths: StrengthCard[] = [];

  topicMap.forEach((data, topic) => {
    const avgScore = Math.round(data.scores.reduce((a,b)=>a+b, 0) / data.scores.length);
    const trend = calculateTrend(data.scores); // In real app, sort by date. Here we approximate.
    
    // Minimum evidence to be considered a strength or weakness
    if (data.interviews + data.assessments >= 2 || data.questions >= 5) {
      if (avgScore < 65) {
        weaknesses.push({
          topic,
          performance: avgScore,
          evidenceCount: { interviews: data.interviews, assessments: data.assessments, questions: data.questions },
          trend
        });
      } else if (avgScore >= 80) {
        strengths.push({
          topic,
          performance: avgScore,
          evidenceCount: { interviews: data.interviews, assessments: data.assessments, questions: data.questions },
          trend
        });
      }
    }
  });

  weaknesses.sort((a, b) => a.performance - b.performance);
  strengths.sort((a, b) => b.performance - a.performance);

  // 8. Generate Priorities
  const priorities: PriorityAction[] = weaknesses.slice(0, 3).map((w, idx) => ({
    priority: idx + 1,
    title: `Improve ${w.topic} concepts`,
    topic: w.topic
  }));

  if (priorities.length === 0 && strengths.length > 0) {
    priorities.push({
      priority: 1,
      title: `Maintain strength in ${strengths[0].topic}`,
      topic: strengths[0].topic
    });
  }

  return {
    readinessScore,
    readinessState,
    confidence,
    evidence: {
      interviews: totalInterviews,
      assessments: totalAssessments,
      evaluatedResponses: totalEvaluatedResponses
    },
    components,
    weaknesses,
    strengths,
    priorities,
    trendHistory,
    lastUpdated: new Date().toISOString(),
    hasInsufficientData
  };
};
