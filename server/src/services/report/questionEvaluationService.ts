import { QuestionEvaluation } from "../../types/interviewReport";
import { InterviewQuestion } from "../../types/interview";
import { SessionAnswer } from "../../types/interviewSession";
import { aiGateway } from "../ai/aiGateway";

const BATCH_CHUNK_SIZE = 8;

interface RawBatchEvaluationItem {
  questionId: string;
  correctness?: number;
  completeness?: number;
  technicalDepth?: number;
  clarity?: number;
  confidence?: number;
  feedback?: string;
  goodPoints?: string[];
  areasForImprovement?: string[];
}

const buildBatchPrompt = (
  items: Array<{
    stableId: string;
    questionText: string;
    expectedTopics: string[];
    skillsEvaluated: string[];
    candidateAnswer: string;
  }>
): string => {
  const questionsFormatted = items
    .map(
      (item, idx) => `
### Question ${idx + 1}
Question ID: ${item.stableId}
Question Text: ${item.questionText}
Expected Topics: ${item.expectedTopics.length ? item.expectedTopics.join(', ') : 'Not specified'}
Skills Evaluated: ${item.skillsEvaluated.length ? item.skillsEvaluated.join(', ') : 'Not specified'}
Candidate Answer: ${item.candidateAnswer}
`
    )
    .join('\n---\n');

  return `You are a strict, expert technical interviewer at a top-tier tech company.
You are evaluating a candidate's answers to multiple interview questions from an interview session.

Evaluate each candidate answer thoroughly. For each question, score the candidate on a scale of 0 to 100 for each metric:
- correctness: Factual accuracy (0-100)
- completeness: Did they cover all parts of the question? (0-100)
- technicalDepth: Depth of technical understanding shown (0-100)
- clarity: How clearly was it explained? (0-100)
- confidence: Does the answer sound confident and decisive? (0-100)
- feedback: 2-3 sentences of direct feedback addressed to the candidate
- goodPoints: 1-3 specific things they did well (array of strings)
- areasForImprovement: 1-3 specific things to improve (array of strings)

QUESTIONS TO EVALUATE:
${questionsFormatted}

You MUST return a valid JSON array containing exactly ${items.length} evaluation objects, one for each question, matching this structure:
[
  {
    "questionId": "string (MUST match the Question ID exactly)",
    "correctness": number,
    "completeness": number,
    "technicalDepth": number,
    "clarity": number,
    "confidence": number,
    "feedback": "string",
    "goodPoints": ["string"],
    "areasForImprovement": ["string"]
  }
]
`;
};

const clampScore = (value: any, fallback = 50): number => {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }
  return fallback;
};

const sanitizeEvaluationItem = (
  raw: any,
  stableId: string
): Omit<QuestionEvaluation, 'questionId' | 'questionText' | 'userAnswer' | 'durationMs'> => {
  return {
    correctness: clampScore(raw?.correctness),
    completeness: clampScore(raw?.completeness),
    technicalDepth: clampScore(raw?.technicalDepth),
    clarity: clampScore(raw?.clarity),
    confidence: clampScore(raw?.confidence),
    feedback: typeof raw?.feedback === 'string' && raw.feedback.trim() ? raw.feedback.trim() : "Good effort.",
    goodPoints: Array.isArray(raw?.goodPoints)
      ? raw.goodPoints.filter((p: any) => typeof p === 'string' && p.trim()).map((p: string) => p.trim())
      : [],
    areasForImprovement: Array.isArray(raw?.areasForImprovement)
      ? raw.areasForImprovement.filter((a: any) => typeof a === 'string' && a.trim()).map((a: string) => a.trim())
      : [],
  };
};

const getFallbackEvaluation = (
  questionId: string,
  questionText: string,
  userAnswer: string,
  durationMs: number
): QuestionEvaluation => ({
  questionId,
  questionText,
  userAnswer,
  durationMs,
  correctness: 50,
  completeness: 50,
  technicalDepth: 50,
  clarity: 50,
  confidence: 50,
  feedback: "AI evaluation failed for this question.",
  goodPoints: [],
  areasForImprovement: [],
});

export const evaluateQuestions = async (
  questions: InterviewQuestion[],
  answers: SessionAnswer[],
  userId?: string
): Promise<QuestionEvaluation[]> => {
  // 1. Correlate questions with answers, identifying skipped vs answered questions
  interface PreparedItem {
    index: number;
    question: InterviewQuestion;
    stableId: string;
    answerText: string;
    durationMs: number;
    isSkipped: boolean;
  }

  const preparedItems: PreparedItem[] = questions.map((question, i) => {
    const stableId = question.id || `q_${i}`;
    // Prioritize exact question.id match; only fallback to q_${i} if not found
    const answer =
      (question.id ? answers.find(a => a.questionId === question.id) : undefined) ||
      answers.find(a => a.questionId === `q_${i}`) ||
      (answers[i] && !questions.some(q => q.id === answers[i].questionId) ? answers[i] : undefined);

    const answerText = answer?.answerText?.trim() || '';
    const durationMs = answer?.durationMs || 0;
    const isSkipped = answerText.length === 0;

    return {
      index: i,
      question,
      stableId,
      answerText: answerText || "[No answer provided]",
      durationMs,
      isSkipped,
    };
  });

  // Map to hold evaluations keyed by question stableId
  const evaluationMap = new Map<string, QuestionEvaluation>();

  // 2. Deterministically evaluate skipped questions (0 score, no AI call needed)
  const eligibleAnsweredItems: PreparedItem[] = [];
  for (const item of preparedItems) {
    if (item.isSkipped) {
      evaluationMap.set(item.stableId, {
        questionId: item.stableId,
        questionText: item.question.question,
        userAnswer: item.answerText,
        durationMs: item.durationMs,
        correctness: 0,
        completeness: 0,
        technicalDepth: 0,
        clarity: 0,
        confidence: 0,
        feedback: "You skipped or did not provide an answer to this question.",
        goodPoints: [],
        areasForImprovement: ["Provide a complete answer instead of skipping."],
      });
    } else {
      eligibleAnsweredItems.push(item);
    }
  }

  // 3. Batch evaluation for answered questions (chunked if > BATCH_CHUNK_SIZE)
  if (eligibleAnsweredItems.length > 0) {
    for (let c = 0; c < eligibleAnsweredItems.length; c += BATCH_CHUNK_SIZE) {
      const chunk = eligibleAnsweredItems.slice(c, c + BATCH_CHUNK_SIZE);
      const prompt = buildBatchPrompt(
        chunk.map(item => ({
          stableId: item.stableId,
          questionText: item.question.question,
          expectedTopics: Array.isArray(item.question.expectedTopics) ? item.question.expectedTopics : [],
          skillsEvaluated: Array.isArray(item.question.skillsEvaluated) ? item.question.skillsEvaluated : [],
          candidateAnswer: item.answerText,
        }))
      );

      try {
        const response = await aiGateway.executeStructured<RawBatchEvaluationItem[]>({
          task: 'REPORT_QUESTION_EVALUATION',
          prompt,
          userId,
          validator: (parsed: any): RawBatchEvaluationItem[] => {
            let items = parsed;
            if (!Array.isArray(items) && items && typeof items === 'object') {
              if (Array.isArray(items.evaluations)) items = items.evaluations;
              else if (Array.isArray(items.questions)) items = items.questions;
            }

            if (!Array.isArray(items)) {
              throw new Error('Batch evaluation response must be a JSON array');
            }

            return items as RawBatchEvaluationItem[];
          },
        });

        const rawResults = response.data;

        // Map evaluations back to questions by stableId (or fallback to index order if stableId missing)
        for (let i = 0; i < chunk.length; i++) {
          const item = chunk[i];
          const matchedRaw =
            rawResults.find(r => r && r.questionId === item.stableId) ||
            rawResults[i]; // Fallback to index position if ID mismatch

          if (matchedRaw) {
            const sanitized = sanitizeEvaluationItem(matchedRaw, item.stableId);
            evaluationMap.set(item.stableId, {
              questionId: item.stableId,
              questionText: item.question.question,
              userAnswer: item.answerText,
              durationMs: item.durationMs,
              ...sanitized,
            });
          } else {
            // Partial missing item fallback
            evaluationMap.set(
              item.stableId,
              getFallbackEvaluation(item.stableId, item.question.question, item.answerText, item.durationMs)
            );
          }
        }
      } catch (chunkError) {
        console.error(`Batch question evaluation failed for chunk [${c} - ${c + chunk.length}]:`, chunkError);
        // Deterministic fallback for all questions in this failed chunk
        for (const item of chunk) {
          evaluationMap.set(
            item.stableId,
            getFallbackEvaluation(item.stableId, item.question.question, item.answerText, item.durationMs)
          );
        }
      }
    }
  }

  // 4. Assemble evaluations strictly in the original question order
  return preparedItems.map(item => {
    const evaluation = evaluationMap.get(item.stableId);
    if (evaluation) {
      return evaluation;
    }
    return getFallbackEvaluation(item.stableId, item.question.question, item.answerText, item.durationMs);
  });
};
