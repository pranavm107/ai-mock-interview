import { Recommendation, ImprovementPlan, SkillAnalysis } from "../../types/interviewReport";
import { aiGateway } from "../ai/aiGateway";

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

export interface RecommendationsResult {
  skillsAnalysis: SkillAnalysis[];
  recommendations: Recommendation[];
  improvementPlan: ImprovementPlan;
}

export const generateRecommendations = async (
  strengths: string[],
  weaknesses: string[],
  role: string,
  experienceLevel: string,
  userId?: string
): Promise<RecommendationsResult> => {
  if (weaknesses.length === 0 && strengths.length === 0) {
    return {
      skillsAnalysis: [],
      recommendations: [],
      improvementPlan: { shortTerm: [], longTerm: [], recommendedPracticeTopics: [] },
    };
  }

  const prompt = RECOMMENDATION_PROMPT
    .replace('{weaknesses}', weaknesses.join('\n') || 'None reported')
    .replace('{strengths}', strengths.join('\n') || 'None reported')
    .replace('{role}', role || 'Software Engineer')
    .replace('{experience_level}', experienceLevel || 'Mid');

  try {
    const response = await aiGateway.executeStructured<RecommendationsResult>({
      task: 'REPORT_RECOMMENDATIONS',
      prompt,
      userId,
      validator: (parsed: any): RecommendationsResult => {
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Recommendations response must be an object');
        }

        const skillsAnalysis: SkillAnalysis[] = Array.isArray(parsed.skillsAnalysis)
          ? parsed.skillsAnalysis.map((s: any) => ({
              skillName: typeof s.skillName === 'string' ? s.skillName : 'Technical Skill',
              proficiencyLevel: ['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(s.proficiencyLevel)
                ? s.proficiencyLevel
                : 'Intermediate',
              evidence: typeof s.evidence === 'string' ? s.evidence : '',
            }))
          : [];

        const recommendations: Recommendation[] = Array.isArray(parsed.recommendations)
          ? parsed.recommendations.map((r: any) => ({
              category: ['Technical', 'Communication', 'Behavioral', 'General'].includes(r.category)
                ? r.category
                : 'General',
              priority: ['High', 'Medium', 'Low'].includes(r.priority) ? r.priority : 'Medium',
              suggestion: typeof r.suggestion === 'string' ? r.suggestion : 'Continue interview practice.',
              resourceLinks: Array.isArray(r.resourceLinks)
                ? r.resourceLinks.filter((l: any) => typeof l === 'string')
                : [],
            }))
          : [];

        const improvementPlan: ImprovementPlan = {
          shortTerm: Array.isArray(parsed.improvementPlan?.shortTerm)
            ? parsed.improvementPlan.shortTerm.filter((x: any) => typeof x === 'string')
            : [],
          longTerm: Array.isArray(parsed.improvementPlan?.longTerm)
            ? parsed.improvementPlan.longTerm.filter((x: any) => typeof x === 'string')
            : [],
          recommendedPracticeTopics: Array.isArray(parsed.improvementPlan?.recommendedPracticeTopics)
            ? parsed.improvementPlan.recommendedPracticeTopics.filter((x: any) => typeof x === 'string')
            : [],
        };

        return {
          skillsAnalysis,
          recommendations,
          improvementPlan,
        };
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Failed to generate recommendations:`, error);
    // Preserved deterministic fallback
    return {
      skillsAnalysis: [],
      recommendations: [{ category: "General", priority: "Medium", suggestion: "Continue practicing your interview skills." }],
      improvementPlan: {
        shortTerm: ["Review the questions you struggled with"],
        longTerm: ["Practice consistently"],
        recommendedPracticeTopics: ["System Design", "Algorithms"],
      },
    };
  }
};
