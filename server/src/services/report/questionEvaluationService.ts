import { generateJson } from "../ai/geminiClient";
import { QuestionEvaluation } from "../../types/interviewReport";
import { InterviewQuestion } from "../../types/interview";
import { SessionAnswer } from "../../types/interviewSession";

const EVALUATION_PROMPT = `You are a strict, expert technical interviewer at a top-tier tech company.
You are evaluating a candidate's answer to an interview question.

<question>
{question_text}
</question>

<expected_topics>
{expected_topics}
</expected_topics>

<skills_evaluated>
{skills_evaluated}
</skills_evaluated>

<candidate_answer>
{candidate_answer}
</candidate_answer>

Evaluate the candidate's answer based on the following criteria. Score each on a scale of 0 to 100.
Return a valid JSON object matching the following structure exactly:
{
  "correctness": number, // Factual accuracy (0-100)
  "completeness": number, // Did they cover all parts of the question? (0-100)
  "technicalDepth": number, // Depth of technical understanding shown (0-100)
  "clarity": number, // How clearly was it explained? (0-100)
  "confidence": number, // Does the answer sound confident and decisive? (0-100)
  "feedback": string, // 2-3 sentences of direct feedback addressed to the candidate
  "goodPoints": string[], // 1-3 specific things they did well
  "areasForImprovement": string[] // 1-3 specific things to improve
}`;

export const evaluateQuestions = async (
  questions: InterviewQuestion[],
  answers: SessionAnswer[]
): Promise<QuestionEvaluation[]> => {
  const evaluations: QuestionEvaluation[] = [];

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    // Find the matching answer by index or id. The runtime uses the question id.
    const answer = answers.find(a => a.questionId === question.id || a.questionId === `q_${i}`);
    
    if (!answer || !answer.answerText || answer.answerText.trim() === '') {
      // Handled skipped or empty answers
      evaluations.push({
        questionId: question.id || `q_${i}`,
        questionText: question.question,
        userAnswer: answer?.answerText || "[No answer provided]",
        durationMs: answer?.durationMs || 0,
        correctness: 0,
        completeness: 0,
        technicalDepth: 0,
        clarity: 0,
        confidence: 0,
        feedback: "You skipped or did not provide an answer to this question.",
        goodPoints: [],
        areasForImprovement: ["Provide a complete answer instead of skipping."]
      });
      continue;
    }

    const prompt = EVALUATION_PROMPT
      .replace('{question_text}', question.question)
      .replace('{expected_topics}', question.expectedTopics.join(', '))
      .replace('{skills_evaluated}', question.skillsEvaluated.join(', '))
      .replace('{candidate_answer}', answer.answerText);

    try {
      const responseJson = await generateJson(prompt);
      const result = JSON.parse(responseJson);

      evaluations.push({
        questionId: question.id || `q_${i}`,
        questionText: question.question,
        userAnswer: answer.answerText,
        durationMs: answer.durationMs,
        correctness: result.correctness || 0,
        completeness: result.completeness || 0,
        technicalDepth: result.technicalDepth || 0,
        clarity: result.clarity || 0,
        confidence: result.confidence || 0,
        feedback: result.feedback || "Good effort.",
        goodPoints: result.goodPoints || [],
        areasForImprovement: result.areasForImprovement || []
      });
    } catch (error) {
      console.error(`Failed to evaluate question ${question.id}:`, error);
      // Fallback for AI failure
      evaluations.push({
        questionId: question.id || `q_${i}`,
        questionText: question.question,
        userAnswer: answer.answerText,
        durationMs: answer.durationMs,
        correctness: 50,
        completeness: 50,
        technicalDepth: 50,
        clarity: 50,
        confidence: 50,
        feedback: "AI evaluation failed for this question.",
        goodPoints: [],
        areasForImprovement: []
      });
    }
  }

  return evaluations;
};
