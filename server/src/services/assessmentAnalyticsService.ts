import { db } from '../config/firebaseAdmin';
import { Assessment, AssessmentResult } from '../types/assessment';

export interface AssessmentAnalytics {
  overall: {
    totalCompleted: number;
    averageScore: number; // Stored as a percentage (0-100)
    bestScore: number;    // Stored as a percentage (0-100)
    averageAccuracy: number; // Same as average percentage
    totalQuestions: number;
    totalCorrect: number;
    totalIncorrect: number;
    totalUnanswered: number;
  };
  categories: CategoryPerformance[];
  topics: TopicPerformance[];
  trend: AssessmentTrendPoint[];
}

export interface CategoryPerformance {
  category: string;
  assessments: number;
  averageScore: number;
  averageAccuracy: number;
  bestScore: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
}

export interface TopicPerformance {
  topic: string;
  assessments: number;
  averageScore: number;
  averageAccuracy: number;
  bestScore: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  status: 'Strong' | 'Developing' | 'Needs Improvement' | 'Insufficient Data';
}

export interface AssessmentTrendPoint {
  assessmentId: string;
  title: string;
  category: string;
  topic?: string;
  completedAt: string;
  score: number;
  accuracy: number;
}

export const getUserAnalytics = async (userId: string): Promise<AssessmentAnalytics> => {
  // Query all assessments for the user
  // Sorting chronologically in memory instead of Firebase to avoid composite index requirements
  const assessmentsQuery = db.collection('assessments')
    .where('userId', '==', userId)
    .where('status', '==', 'COMPLETED')
    .limit(100);

  const snapshot = await assessmentsQuery.get();
  
  if (snapshot.empty) {
    return getEmptyAnalytics();
  }

  // Sort in memory by createdAt descending
  let assessments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assessment));
  assessments = assessments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const resultRefs = assessments.map(a => db.collection('assessments').doc(a.id).collection('results').doc('final'));
  
  // Fetch all results in parallel using getAll (batches up to 100 docs per call)
  const resultDocs = await db.getAll(...resultRefs);
  const results = resultDocs.map(doc => doc.data() as AssessmentResult);

  return calculateAnalytics(assessments, results);
};

const getEmptyAnalytics = (): AssessmentAnalytics => ({
  overall: {
    totalCompleted: 0,
    averageScore: 0,
    bestScore: 0,
    averageAccuracy: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    totalUnanswered: 0,
  },
  categories: [],
  topics: [],
  trend: []
});

const calculateAnalytics = (assessments: Assessment[], results: AssessmentResult[]): AssessmentAnalytics => {
  const analytics = getEmptyAnalytics();
  
  const categoryMap = new Map<string, CategoryPerformance>();
  const topicMap = new Map<string, TopicPerformance>();
  
  let totalPercentageSum = 0;

  for (let i = 0; i < assessments.length; i++) {
    const assessment = assessments[i];
    const result = results[i];
    if (!result) continue; // Safety check if result doc is missing

    // Overall
    analytics.overall.totalCompleted++;
    analytics.overall.totalQuestions += result.totalQuestions;
    analytics.overall.totalCorrect += result.correctAnswers;
    analytics.overall.totalIncorrect += result.incorrectAnswers;
    analytics.overall.totalUnanswered += result.unansweredQuestions;
    
    // bestScore is now based on percentage rather than raw correct count
    if (result.percentage > analytics.overall.bestScore) {
      analytics.overall.bestScore = result.percentage;
    }
    
    totalPercentageSum += result.percentage;

    // Trend (take up to 20 most recent)
    if (analytics.trend.length < 20) {
      analytics.trend.push({
        assessmentId: assessment.id,
        title: assessment.title || 'Assessment',
        category: getCategoryName(assessment),
        topic: assessment.topic,
        completedAt: result.completedAt || assessment.createdAt,
        score: result.score,
        accuracy: result.percentage
      });
    }

    // Category aggregation
    const catName = getCategoryName(assessment);
    const catPerf = categoryMap.get(catName) || {
      category: catName,
      assessments: 0,
      averageScore: 0,
      averageAccuracy: 0,
      bestScore: 0,
      totalQuestions: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0
    };
    catPerf.assessments++;
    catPerf.totalQuestions += result.totalQuestions;
    catPerf.correct += result.correctAnswers;
    catPerf.incorrect += result.incorrectAnswers;
    catPerf.unanswered += result.unansweredQuestions;
    catPerf.averageScore += result.percentage; // Aggregate percentages for averageScore
    catPerf.averageAccuracy += result.percentage;
    if (result.percentage > catPerf.bestScore) catPerf.bestScore = result.percentage;
    categoryMap.set(catName, catPerf);

    // Topic aggregation
    if (assessment.topic) {
      const topPerf = topicMap.get(assessment.topic) || {
        topic: assessment.topic,
        assessments: 0,
        averageScore: 0,
        averageAccuracy: 0,
        bestScore: 0,
        totalQuestions: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        status: 'Insufficient Data'
      };
      topPerf.assessments++;
      topPerf.totalQuestions += result.totalQuestions;
      topPerf.correct += result.correctAnswers;
      topPerf.incorrect += result.incorrectAnswers;
      topPerf.unanswered += result.unansweredQuestions;
      topPerf.averageScore += result.percentage; // Aggregate percentages
      topPerf.averageAccuracy += result.percentage;
      if (result.percentage > topPerf.bestScore) topPerf.bestScore = result.percentage;
      topicMap.set(assessment.topic, topPerf);
    }
  }

  // Finalize averages
  if (analytics.overall.totalCompleted > 0) {
    const avgPercentage = parseFloat((totalPercentageSum / analytics.overall.totalCompleted).toFixed(1));
    // averageScore is calculated as an average percentage based on the user's feedback
    analytics.overall.averageScore = avgPercentage;
    analytics.overall.averageAccuracy = avgPercentage;
  }

  analytics.categories = Array.from(categoryMap.values()).map(cat => ({
    ...cat,
    averageScore: parseFloat((cat.averageScore / cat.assessments).toFixed(1)),
    averageAccuracy: parseFloat((cat.averageAccuracy / cat.assessments).toFixed(1))
  }));

  analytics.topics = Array.from(topicMap.values()).map(top => {
    const avgAccuracy = parseFloat((top.averageAccuracy / top.assessments).toFixed(1));
    return {
      ...top,
      averageScore: parseFloat((top.averageScore / top.assessments).toFixed(1)),
      averageAccuracy: avgAccuracy,
      status: determineTopicStatus(avgAccuracy, top.assessments)
    };
  });

  // Sort trend chronologically (oldest to newest for charts)
  // They were pushed in desc order, so reverse them
  analytics.trend = analytics.trend.reverse();

  return analytics;
};

const getCategoryName = (assessment: Assessment): string => {
  if (assessment.type === 'RESUME_MCQ') return 'Resume Based';
  if (assessment.type === 'TECHNICAL_MCQ') return 'Technical MCQs';
  if (assessment.type === 'APTITUDE') {
    if (assessment.category === 'VERBAL') return 'Verbal Ability';
    if (assessment.category === 'LOGICAL_REASONING') return 'Logical Reasoning';
    return 'Aptitude';
  }
  return 'Other';
};

const determineTopicStatus = (accuracy: number, attempts: number): 'Strong' | 'Developing' | 'Needs Improvement' | 'Insufficient Data' => {
  if (attempts < 1) return 'Insufficient Data';
  if (accuracy >= 80) return 'Strong';
  if (accuracy >= 60) return 'Developing';
  return 'Needs Improvement';
};
