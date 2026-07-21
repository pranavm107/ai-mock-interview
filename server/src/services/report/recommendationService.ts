import { Recommendation, ImprovementPlan, SkillAnalysis } from "../../types/interviewReport";
import { generateJson } from "../ai/geminiClient";

const RECOMMENDATION_PROMPT = `You are an expert career coach and technical interviewer.
Analyze the following interview performance and provide a structured improvement plan.

<weaknesses>
{weaknesses}
</weaknesses>

<strengths>
{strengths}
</strengths>

<role>
{role}
</role>

<experience_level>
{experience_level}
</experience_level>

Return a valid JSON object matching this structure EXACTLY:
{
  "skillsAnalysis": [
    {
      "skillName": string,
      "proficiencyLevel": "Beginner" | "Intermediate" | "Advanced" | "Expert",
      "evidence": string
    }
  ],
  "recommendations": [
    {
      "category": "Technical" | "Communication" | "Behavioral" | "General",
      "priority": "High" | "Medium" | "Low",
      "suggestion": string,
      "resourceLinks": string[] // Optional, URLs to docs or learning materials
    }
  ],
  "improvementPlan": {
    "shortTerm": string[], // 1-3 actionable items for next 7 days
    "longTerm": string[], // 1-3 actionable items for next 30 days
    "recommendedPracticeTopics": string[] // 2-4 topics to practice
  }
}`;

export const generateRecommendations = async (
  strengths: string[],
  weaknesses: string[],
  role: string,
  experienceLevel: string
): Promise<{ skillsAnalysis: SkillAnalysis[], recommendations: Recommendation[], improvementPlan: ImprovementPlan }> => {
  
  if (weaknesses.length === 0 && strengths.length === 0) {
    return {
      skillsAnalysis: [],
      recommendations: [],
      improvementPlan: { shortTerm: [], longTerm: [], recommendedPracticeTopics: [] }
    };
  }

  const prompt = RECOMMENDATION_PROMPT
    .replace('{weaknesses}', weaknesses.join('\n'))
    .replace('{strengths}', strengths.join('\n'))
    .replace('{role}', role)
    .replace('{experience_level}', experienceLevel);

  try {
    const responseJson = await generateJson(prompt);
    const result = JSON.parse(responseJson);

    return {
      skillsAnalysis: result.skillsAnalysis || [],
      recommendations: result.recommendations || [],
      improvementPlan: result.improvementPlan || { shortTerm: [], longTerm: [], recommendedPracticeTopics: [] }
    };
  } catch (error) {
    console.error(`Failed to generate recommendations:`, error);
    return {
      skillsAnalysis: [],
      recommendations: [{ category: "General", priority: "Medium", suggestion: "Continue practicing your interview skills." }],
      improvementPlan: {
        shortTerm: ["Review the questions you struggled with"],
        longTerm: ["Practice consistently"],
        recommendedPracticeTopics: ["System Design", "Algorithms"]
      }
    };
  }
};
