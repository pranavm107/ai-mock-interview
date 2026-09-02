import { Assessment, AssessmentQuestion, AssessmentSubmissionRequest, AssessmentResult, QuestionResult, SkillPerformance } from '../types/assessment';

export const evaluateSubmission = (
  assessment: Assessment,
  backendQuestions: AssessmentQuestion[],
  submission: AssessmentSubmissionRequest
): AssessmentResult => {
  const { answers } = submission;
  
  const questionResults: QuestionResult[] = [];
  const skillMap: Record<string, { total: number; correct: number }> = {};
  
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  // Build a map of submissions for O(1) lookup
  const submissionMap = new Map(answers.map(a => [a.questionId, a.selectedOptionId]));

  for (const bq of backendQuestions) {
    const selectedOptionId = submissionMap.get(bq.id) || null;
    const isCorrect = selectedOptionId === bq.correctOptionId;

    if (selectedOptionId) {
      if (isCorrect) correctCount++;
      else incorrectCount++;
    } else {
      unansweredCount++;
    }

    questionResults.push({
      questionId: bq.id,
      question: bq.question,
      options: bq.options,
      selectedOptionId,
      correctOptionId: bq.correctOptionId,
      isCorrect,
      explanation: bq.explanation,
      skill: bq.skill,
      difficulty: bq.difficulty,
    });

    if (bq.skill) {
      if (!skillMap[bq.skill]) {
        skillMap[bq.skill] = { total: 0, correct: 0 };
      }
      skillMap[bq.skill].total++;
      if (isCorrect) {
        skillMap[bq.skill].correct++;
      }
    }
  }

  const skillPerformance: SkillPerformance[] = Object.keys(skillMap).map(skill => {
    const metrics = skillMap[skill];
    const percentage = metrics.total > 0 ? Math.round((metrics.correct / metrics.total) * 100) : 0;
    return {
      skill,
      totalQuestions: metrics.total,
      correctAnswers: metrics.correct,
      score: percentage, // Score can simply mirror percentage for skills
      percentage
    };
  });

  const totalQuestions = backendQuestions.length;
  const answeredQuestions = correctCount + incorrectCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    assessmentId: assessment.id,
    userId: assessment.userId,
    totalQuestions,
    answeredQuestions,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unansweredQuestions: unansweredCount,
    score: percentage, // Overall score is percentage out of 100
    percentage,
    skillPerformance,
    questionResults,
    completedAt: new Date().toISOString()
  };
};
