import { db } from '../config/firebaseAdmin';
import { z } from 'zod';
import { getUserAnalytics } from './assessmentAnalyticsService';
import { buildPreparationRecommendationPrompt } from '../prompts/preparationRecommendationPrompt';
import { callGroq } from './groqService';

export const PreparationRecommendationSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.object({
    topic: z.string(),
    accuracy: z.number().min(0).max(100),
    reason: z.string()
  })),
  focusAreas: z.array(z.object({
    topic: z.string(),
    accuracy: z.number().min(0).max(100),
    reason: z.string(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })),
  recommendedTopics: z.array(z.object({
    topic: z.string(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    reason: z.string()
  })),
  studyPlan: z.array(z.object({
    day: z.number().min(1).max(7),
    focus: z.string(),
    topics: z.array(z.string()),
    activity: z.string()
  })),
  nextAssessment: z.object({
    category: z.string(),
    topic: z.string(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    questionCount: z.number().min(1),
    reason: z.string()
  })
});

export type PreparationRecommendation = z.infer<typeof PreparationRecommendationSchema>;

export interface RecommendationResponse {
  hasEnoughData: boolean;
  recommendation: PreparationRecommendation | null;
}

export const getPreparationRecommendations = async (userId: string): Promise<RecommendationResponse> => {
  const analytics = await getUserAnalytics(userId);

  // Requirement: Minimum data threshold (1 completed assessment)
  if (analytics.overall.totalCompleted < 1) {
    return {
      hasEnoughData: false,
      recommendation: null
    };
  }

  // Check cache
  const cacheRef = db.collection('users').doc(userId).collection('preparationRecommendations').doc('latest');
  const cacheDoc = await cacheRef.get();
  
  if (cacheDoc.exists) {
    const cachedData = cacheDoc.data();
    // Invalidate if the user has completed more assessments since the last generation
    if (cachedData && cachedData.assessmentsCompletedAtGeneration === analytics.overall.totalCompleted) {
      return {
        hasEnoughData: true,
        recommendation: cachedData.recommendation as PreparationRecommendation
      };
    }
  }

  // Generate new recommendation using Groq
  const prompt = buildPreparationRecommendationPrompt(analytics);
  let recommendation: PreparationRecommendation | null = null;
  let attempts = 0;

  while (attempts < 2 && !recommendation) {
    attempts++;
    try {
      const rawText = await callGroq(prompt);
      let jsonText = rawText.trim();
      if (jsonText.startsWith('```json')) jsonText = jsonText.substring(7);
      if (jsonText.startsWith('```')) jsonText = jsonText.substring(3);
      if (jsonText.endsWith('```')) jsonText = jsonText.slice(0, -3);
      
      const parsed = JSON.parse(jsonText.trim());
      recommendation = PreparationRecommendationSchema.parse(parsed);
    } catch (error) {
      console.warn(`Groq recommendation attempt ${attempts} failed:`, error);
      if (attempts >= 2) {
        throw new Error('Failed to generate valid recommendation from AI provider');
      }
    }
  }

  if (!recommendation) {
    throw new Error('Recommendation generation failed.');
  }

  // Cache the result
  await cacheRef.set({
    assessmentsCompletedAtGeneration: analytics.overall.totalCompleted,
    generatedAt: new Date().toISOString(),
    recommendation
  });

  return {
    hasEnoughData: true,
    recommendation
  };
};
