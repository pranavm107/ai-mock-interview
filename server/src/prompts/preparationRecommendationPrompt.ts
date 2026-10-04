import { AssessmentAnalytics } from '../services/assessmentAnalyticsService';

export const buildPreparationRecommendationPrompt = (analytics: AssessmentAnalytics): string => {
  return `You are an expert career placement and technical interview coach.
Your task is to analyze the user's verified performance data and generate a personalized preparation recommendation and study plan.

CRITICAL INSTRUCTIONS:
1. DO NOT invent, recalculate, or modify any scores, accuracy percentages, or assessment counts. Treat the provided analytics as absolute facts.
2. Only recommend topics the user actually needs to work on based on their performance, prioritizing weak areas (Needs Improvement).
3. If the user is strong everywhere (e.g., >= 80% accuracy), recommend harder difficulty, mixed practice, or timed tests.
4. Output MUST be valid JSON matching the exact schema requested. No markdown blocks outside the JSON, just the JSON string.

VERIFIED PERFORMANCE DATA (Do NOT alter these numbers in your analysis):
- Total Assessments Completed: ${analytics.overall.totalCompleted}
- Average Accuracy: ${analytics.overall.averageAccuracy}%
- Overall Correct Answers: ${analytics.overall.totalCorrect}/${analytics.overall.totalQuestions}
- Best Score (Percentage): ${analytics.overall.bestScore}%

Category Performance:
${analytics.categories.map(c => `- ${c.category}: ${c.averageAccuracy}% accuracy across ${c.assessments} assessments`).join('\n')}

Topic Performance:
${analytics.topics.map(t => `- ${t.topic}: ${t.averageAccuracy}% accuracy (${t.status}) across ${t.assessments} assessments`).join('\n')}

Based on the above factual data, generate a structured JSON response exactly matching this schema:
{
  "summary": "A short 1-2 sentence personalized summary of their current progress.",
  "strengths": [
    { "topic": "string", "accuracy": number, "reason": "string (Why this is a strength based on data)" }
  ],
  "focusAreas": [
    { "topic": "string", "accuracy": number, "reason": "string (Why this needs work)", "priority": "HIGH" | "MEDIUM" | "LOW" }
  ],
  "recommendedTopics": [
    { "topic": "string", "priority": "HIGH" | "MEDIUM" | "LOW", "reason": "string" }
  ],
  "studyPlan": [
    { "day": number (1-7), "focus": "string", "topics": ["string"], "activity": "string" }
  ],
  "nextAssessment": {
    "category": "string (Aptitude, Technical MCQs, Verbal Ability, Logical Reasoning, Resume Based)",
    "topic": "string",
    "difficulty": "EASY" | "MEDIUM" | "HARD",
    "questionCount": number (e.g., 10, 15),
    "reason": "string"
  }
}

Ensure valid JSON output format!`;
};
