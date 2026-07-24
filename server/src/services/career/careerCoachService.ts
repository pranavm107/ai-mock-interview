import { callGemini } from '../geminiService';
import { buildCareerPrompt } from './careerPromptBuilder';
import { AICareerResponse } from '../../types/career.types';
import {
  saveCareerProfile,
  saveCareerScore,
  saveWeeklyCoaching,
  saveMonthlyCoaching,
  saveLearningRoadmap,
  saveDailyGoals
} from './careerRepository';
import { AICareerResponseSchema } from './careerSchema';
import { CareerGenerationError, CareerValidationError } from '../../types/careerErrors';
import { CareerContext } from './careerAggregationService';
import { calculateScoreFromContext } from './careerScoreService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateCareerCoaching = async (
  userId: string,
  context: CareerContext
): Promise<AICareerResponse> => {
  const prompt = buildCareerPrompt(userId, context);
  
  let attempts = 0;
  const maxAttempts = 3;
  let lastError: Error | null = null;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const aiText = await callGemini(prompt);

      // Parse JSON response. Strip out markdown if present
      let jsonString = aiText.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.slice(7, -3).trim();
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.slice(3, -3).trim();
      }

      const parsedJson = JSON.parse(jsonString);
      
      // Zod Validation
      const result = AICareerResponseSchema.safeParse(parsedJson);
      
      if (!result.success) {
        throw new CareerValidationError(`AI Response failed schema validation: ${result.error.message}`);
      }

      const aiResponse = result.data as AICareerResponse;

      // Save all generated parts to Firestore
      await Promise.all([
        saveCareerProfile({
          userId,
          careerScore: aiResponse.careerScore,
          careerReadiness: aiResponse.careerReadiness,
          careerSummary: aiResponse.careerSummary,
          recommendedSkills: aiResponse.recommendedSkills,
          priorityTopics: aiResponse.priorityTopics,
          estimatedHiringReadiness: aiResponse.estimatedHiringReadiness,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        saveCareerScore({
          userId,
          careerScore: aiResponse.careerScore,
          ...calculateScoreFromContext(context),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        saveWeeklyCoaching({
          userId,
          ...aiResponse.weeklyCoaching,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        saveMonthlyCoaching({
          userId,
          ...aiResponse.monthlyCoaching,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        saveLearningRoadmap({
          userId,
          ...aiResponse.learningRoadmap,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        saveDailyGoals({
          userId,
          tasks: aiResponse.dailyGoals.tasks.map(t => ({
            ...t,
            id: Math.random().toString(36).substring(7),
            status: 'Pending'
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      ]);

      return aiResponse;
    } catch (error: any) {
      lastError = error;
      console.warn(`Career Coach generation attempt ${attempts} failed:`, error.message);
      
      if (attempts < maxAttempts) {
        // Exponential backoff
        await delay(1000 * Math.pow(2, attempts));
      }
    }
  }

  throw new CareerGenerationError(`Failed to generate career coaching after ${maxAttempts} attempts. Last error: ${lastError?.message}`);
};
