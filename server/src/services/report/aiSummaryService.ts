import { HiringRecommendation } from "../../types/interviewReport";
import { generateJson } from "../ai/geminiClient";

const SUMMARY_PROMPT = `You are a Senior Engineering Manager and expert Recruiter.
Analyze the following interview scores, strengths, and weaknesses for a candidate applying for a {role} role at the {experience_level} level.

<scores>
Overall: {overall_score}/100
Technical: {technical_score}/100
Communication: {communication_score}/100
Behavioral: {behavioral_score}/100
Problem Solving: {problem_solving_score}/100
</scores>

<strengths>
{strengths}
</strengths>

<weaknesses>
{weaknesses}
</weaknesses>

Based on this data, provide two things:
1. A top-level 'Report Summary' paragraph (3-4 sentences). It should be written directly to the candidate (e.g., "You demonstrated solid..."). Be encouraging but brutally honest. Mention specific technical areas they did well in and areas they struggled with. State whether they are interview-ready for the target role.
2. A 'Hiring Recommendation' representing your internal recruiter verdict.

Return a valid JSON object matching this structure EXACTLY:
{
  "summary": string,
  "hiringRecommendation": {
    "verdict": "Recommended" | "Hold" | "Not Ready",
    "rating": number,
    "reasons": string[] 
  }
}`;

export const generateReportSummaryAndVerdict = async (
  overallScore: number,
  technicalScore: number,
  communicationScore: number,
  behavioralScore: number,
  problemSolvingScore: number,
  strengths: string[],
  weaknesses: string[],
  role: string,
  experienceLevel: string
): Promise<{ summary: string; hiringRecommendation: HiringRecommendation }> => {

  const prompt = SUMMARY_PROMPT
    .replace('{role}', role)
    .replace('{experience_level}', experienceLevel)
    .replace('{overall_score}', overallScore.toString())
    .replace('{technical_score}', technicalScore.toString())
    .replace('{communication_score}', communicationScore.toString())
    .replace('{behavioral_score}', behavioralScore.toString())
    .replace('{problem_solving_score}', problemSolvingScore.toString())
    .replace('{strengths}', strengths.join('\n') || 'None')
    .replace('{weaknesses}', weaknesses.join('\n') || 'None');

  try {
    const responseJson = await generateJson(prompt);
    const result = JSON.parse(responseJson);

    return {
      summary: result.summary || "No summary available.",
      hiringRecommendation: result.hiringRecommendation || {
        verdict: "Hold",
        rating: 3,
        reasons: ["Insufficient data to determine a verdict."]
      }
    };
  } catch (error) {
    console.error(`Failed to generate summary and verdict:`, error);
    return {
      summary: `Your overall score is ${overallScore}/100. Please review the detailed feedback below to improve.`,
      hiringRecommendation: {
        verdict: overallScore >= 80 ? 'Recommended' : overallScore >= 60 ? 'Hold' : 'Not Ready',
        rating: Math.round(overallScore / 20),
        reasons: ["Fallback verdict due to generation error."]
      }
    };
  }
};
