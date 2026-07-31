import { v4 as uuidv4 } from 'uuid';
import { generateReplayPayload } from '../replay/replayEngine';
import { getInterviewReviewBySessionId, saveInterviewReview } from './reviewRepository';
import { buildReviewPrompt } from './promptBuilder';
import { generateJson } from '../ai/geminiClient';
import { validateAndCalculateScores } from './scoreCalculator';
import { InterviewReview, QuestionReview } from '../../types/review';

export const generateInterviewReview = async (sessionId: string, userId: string): Promise<{ review: InterviewReview, questionReviews: QuestionReview[] }> => {
  // Idempotency check: if review already exists, return it
  const existingReview = await getInterviewReviewBySessionId(sessionId);
  if (existingReview) {
    return existingReview;
  }

  // 1. Fetch replay payload (includes transcript, metadata, questions)
  const replaySession = await generateReplayPayload(sessionId);

  // Validate ownership just in case (though it should be validated at the controller level)
  if (replaySession.metadata.userId !== userId) {
    throw new Error('Unauthorized');
  }

  // 2. Build Prompt
  const prompt = buildReviewPrompt(replaySession);

  // 3. Call AI
  const aiJsonString = await generateJson(prompt);
  let aiOutput;
  try {
    aiOutput = JSON.parse(aiJsonString);
  } catch (e) {
    throw new Error('Failed to parse AI review output as JSON.');
  }

  // 4. Validate and calculate scores
  const safeReviewData = validateAndCalculateScores(aiOutput);

  // 5. Construct Database Objects
  const reviewId = uuidv4();
  
  const interviewReview: InterviewReview = {
    id: reviewId,
    sessionId: sessionId,
    userId: userId,
    overallScore: safeReviewData.overallScore,
    technicalScore: safeReviewData.technicalScore,
    communicationScore: safeReviewData.communicationScore,
    confidenceScore: safeReviewData.confidenceScore,
    fluencyScore: safeReviewData.fluencyScore,
    relevanceScore: safeReviewData.relevanceScore,
    professionalismScore: safeReviewData.professionalismScore,
    summary: safeReviewData.summary,
    strengths: safeReviewData.strengths,
    weaknesses: safeReviewData.weaknesses,
    improvements: safeReviewData.improvements,
    recommendation: safeReviewData.recommendation,
    createdAt: new Date().toISOString()
  };

  const questionReviews: QuestionReview[] = [];

  replaySession.questions.forEach((q) => {
    // Find the corresponding AI feedback for this question
    const aiQr = safeReviewData.questionReviews.find(qr => qr.questionId === q.id) 
                 || safeReviewData.questionReviews.find(qr => qr.questionId === q.index?.toString())
                 || { feedback: { score: 0, feedback: 'No feedback provided.', strengths: [], weaknesses: [], idealAnswer: '' } };

    questionReviews.push({
      id: uuidv4(),
      reviewId: reviewId,
      questionId: q.id,
      question: q.text,
      candidateAnswer: q.answer?.transcript?.filter(t => t.speaker === 'Candidate').map(t => t.text).join(' ') || '',
      score: aiQr.feedback.score,
      feedback: aiQr.feedback.feedback,
      strengths: aiQr.feedback.strengths,
      weaknesses: aiQr.feedback.weaknesses,
      idealAnswer: aiQr.feedback.idealAnswer,
      createdAt: new Date().toISOString()
    });
  });

  // 6. Save to Database
  await saveInterviewReview(interviewReview, questionReviews);

  return { review: interviewReview, questionReviews };
};
