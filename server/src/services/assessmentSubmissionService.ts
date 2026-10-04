import { db } from '../config/firebaseAdmin';
import { Assessment, AssessmentQuestion, AssessmentSubmissionRequest, AssessmentResult, SkillPerformance, QuestionResult } from '../types/assessment';

const ASSESSMENTS_COLLECTION = 'assessments';

export const submitAssessment = async (
  userId: string,
  assessmentId: string,
  submission: AssessmentSubmissionRequest
): Promise<AssessmentResult> => {
  return await db.runTransaction(async (transaction) => {
    const assessmentRef = db.collection(ASSESSMENTS_COLLECTION).doc(assessmentId);
    const assessmentDoc = await transaction.get(assessmentRef);

    if (!assessmentDoc.exists) {
      throw new Error('Assessment not found');
    }

    const assessment = assessmentDoc.data() as Assessment;

    if (assessment.userId !== userId) {
      throw new Error('Forbidden: Assessment does not belong to the user');
    }

    if (assessment.status === 'COMPLETED') {
      // Already completed, just fetch and return the result
      const resultDoc = await transaction.get(assessmentRef.collection('results').doc('final'));
      if (resultDoc.exists) {
        return resultDoc.data() as AssessmentResult;
      }
    }

    if (assessment.status === 'GENERATING' || assessment.status === 'FAILED') {
      throw new Error('Assessment is not ready for submission');
    }

    // Check timer enforcement
    let isLateSubmission = false;
    if (assessment.mode === 'TIMED' && assessment.startedAt) {
      const startedAtTime = new Date(assessment.startedAt).getTime();
      const now = Date.now();
      const durationMs = (assessment.questionCount * 1.5) * 60 * 1000;
      const gracePeriodMs = 30 * 1000; // 30 seconds
      if (now > startedAtTime + durationMs + gracePeriodMs) {
        // Late submission! Discard all answers.
        isLateSubmission = true;
      }
    }

    const questionsSnapshot = await transaction.get(assessmentRef.collection('questions'));
    const backendQuestions = questionsSnapshot.docs.map(doc => doc.data() as AssessmentQuestion);

    const answerMap = new Map<string, string>();
    submission.answers.forEach(ans => answerMap.set(ans.questionId, ans.selectedOptionId));

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const questionResults: QuestionResult[] = [];
    const skillStats = new Map<string, { total: number, correct: number }>();

    for (const q of backendQuestions) {
      // Validate selectedOptionId - ensure it actually exists on the question
      let selectedOptionId = isLateSubmission ? null : (answerMap.get(q.id) || null);
      if (selectedOptionId) {
        const optionExists = q.options.some(opt => opt.id === selectedOptionId);
        if (!optionExists) {
          selectedOptionId = null; // Discard invalid option ID
        }
      }

      const isCorrect = selectedOptionId === q.correctOptionId;

      if (!selectedOptionId) {
        unansweredCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      if (q.skill) {
        const stats = skillStats.get(q.skill) || { total: 0, correct: 0 };
        stats.total++;
        if (isCorrect) stats.correct++;
        skillStats.set(q.skill, stats);
      }

      questionResults.push({
        questionId: q.id,
        question: q.question,
        options: q.options,
        selectedOptionId,
        correctOptionId: q.correctOptionId,
        isCorrect,
        explanation: q.explanation,
        skill: q.skill,
        difficulty: q.difficulty
      });
    }

    const totalQuestions = backendQuestions.length;
    const answeredQuestions = correctCount + incorrectCount;
    const score = correctCount; // simple 1 point per correct answer
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    const skillPerformance: SkillPerformance[] = Array.from(skillStats.entries()).map(([skill, stats]) => ({
      skill,
      totalQuestions: stats.total,
      correctAnswers: stats.correct,
      score: stats.correct,
      percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
    }));

    const result: AssessmentResult = {
      assessmentId,
      userId,
      totalQuestions,
      answeredQuestions,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      score,
      percentage,
      skillPerformance,
      questionResults,
      completedAt: new Date().toISOString()
    };

    const resultRef = assessmentRef.collection('results').doc('final');
    transaction.set(resultRef, result);

    transaction.update(assessmentRef, {
      status: 'COMPLETED',
      completedAt: result.completedAt,
      updatedAt: result.completedAt,
      answeredCount: answeredQuestions
    });

    return result;
  });
};
