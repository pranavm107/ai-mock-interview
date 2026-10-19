import { HiringRecommendation } from "../../types/interviewReport";
import { aiGateway } from "../ai/aiGateway";

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

export interface ReportSummaryResult {
  summary: string;
  hiringRecommendation: HiringRecommendation;
}

const getDeterministicVerdict = (overallScore: number): 'Recommended' | 'Hold' | 'Not Ready' => {
  if (overallScore >= 80) return 'Recommended';
  if (overallScore >= 60) return 'Hold';
  return 'Not Ready';
};

const getDeterministicRating = (overallScore: number): number => {
  return Math.max(1, Math.min(5, Math.round(overallScore / 20)));
};

export const generateReportSummaryAndVerdict = async (
  overallScore: number,
  technicalScore: number,
  communicationScore: number,
  behavioralScore: number,
  problemSolvingScore: number,
  strengths: string[],
  weaknesses: string[],
  role: string,
  experienceLevel: string,
  userId?: string
): Promise<ReportSummaryResult> => {
  const prompt = SUMMARY_PROMPT
    .replace('{role}', role || 'Software Engineer')
    .replace('{experience_level}', experienceLevel || 'Mid')
    .replace('{overall_score}', overallScore.toString())
    .replace('{technical_score}', technicalScore.toString())
    .replace('{communication_score}', communicationScore.toString())
    .replace('{behavioral_score}', behavioralScore.toString())
    .replace('{problem_solving_score}', problemSolvingScore.toString())
    .replace('{strengths}', strengths.length ? strengths.join('\n') : 'None reported')
    .replace('{weaknesses}', weaknesses.length ? weaknesses.join('\n') : 'None reported');

  try {
    const response = await aiGateway.executeStructured<ReportSummaryResult>({
      task: 'REPORT_SUMMARY',
      prompt,
      userId,
      validator: (parsed: any): ReportSummaryResult => {
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Summary response must be a JSON object');
        }

        const summaryText =
          typeof parsed.summary === 'string' && parsed.summary.trim()
            ? parsed.summary.trim()
            : `Your overall score is ${overallScore}/100. Please review the detailed feedback below to improve.`;

        // Deterministic verdict protection: do not let a missing or invalid AI verdict overwrite a valid verdict
        const rawVerdict = parsed.hiringRecommendation?.verdict;
        const validVerdict: 'Recommended' | 'Hold' | 'Not Ready' = ['Recommended', 'Hold', 'Not Ready'].includes(
          rawVerdict
        )
          ? rawVerdict
          : getDeterministicVerdict(overallScore);

        const rawRating = parsed.hiringRecommendation?.rating;
        const validRating =
          typeof rawRating === 'number' && !isNaN(rawRating) && rawRating >= 1 && rawRating <= 5
            ? Math.round(rawRating)
            : getDeterministicRating(overallScore);

        const validReasons: string[] = Array.isArray(parsed.hiringRecommendation?.reasons)
          ? parsed.hiringRecommendation.reasons.filter((r: any) => typeof r === 'string' && r.trim())
          : ["Based on candidate technical and communication assessment."];

        return {
          summary: summaryText,
          hiringRecommendation: {
            verdict: validVerdict,
            rating: validRating,
            reasons: validReasons.length ? validReasons : ["Based on candidate technical and communication assessment."],
          },
        };
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Failed to generate summary and verdict:`, error);
    // Preserved deterministic fallback
    return {
      summary: `Your overall score is ${overallScore}/100. Please review the detailed feedback below to improve.`,
      hiringRecommendation: {
        verdict: getDeterministicVerdict(overallScore),
        rating: getDeterministicRating(overallScore),
        reasons: ["Fallback verdict due to generation error."],
      },
    };
  }
};
