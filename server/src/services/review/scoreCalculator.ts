import { AIGeneratedReview } from "../../types/review";

export const validateAndCalculateScores = (aiReview: any): AIGeneratedReview => {
  // Ensure all categorical scores exist and are numbers between 0-100
  const safeNumber = (val: any, defaultVal = 0): number => {
    const num = Number(val);
    if (isNaN(num)) return defaultVal;
    return Math.max(0, Math.min(100, num));
  };

  const technicalScore = safeNumber(aiReview.technicalScore);
  const communicationScore = safeNumber(aiReview.communicationScore);
  const confidenceScore = safeNumber(aiReview.confidenceScore);
  const fluencyScore = safeNumber(aiReview.fluencyScore);
  const relevanceScore = safeNumber(aiReview.relevanceScore);
  const professionalismScore = safeNumber(aiReview.professionalismScore);

  // Recalculate overall score based on equal weighting if it's missing or to enforce consistency
  let overallScore = safeNumber(aiReview.overallScore);
  if (!overallScore || overallScore === 0) {
    overallScore = Math.round(
      (technicalScore + communicationScore + confidenceScore + fluencyScore + relevanceScore + professionalismScore) / 6
    );
  }

  const safeArray = (arr: any[]): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.filter(item => typeof item === 'string');
  };

  return {
    overallScore,
    technicalScore,
    communicationScore,
    confidenceScore,
    fluencyScore,
    relevanceScore,
    professionalismScore,
    summary: aiReview.summary || 'Review completed.',
    strengths: safeArray(aiReview.strengths),
    weaknesses: safeArray(aiReview.weaknesses),
    improvements: safeArray(aiReview.improvements),
    recommendation: aiReview.recommendation || '',
    questionReviews: Array.isArray(aiReview.questionReviews) ? aiReview.questionReviews.map((qr: any) => ({
      questionId: qr.questionId,
      feedback: {
        score: safeNumber(qr.feedback?.score),
        feedback: qr.feedback?.feedback || '',
        strengths: safeArray(qr.feedback?.strengths),
        weaknesses: safeArray(qr.feedback?.weaknesses),
        idealAnswer: qr.feedback?.idealAnswer || ''
      }
    })) : []
  };
};
