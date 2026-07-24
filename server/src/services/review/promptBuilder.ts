import { ReplaySession, ReplayQuestion } from '../../types/replay';

export const buildReviewPrompt = (session: ReplaySession): string => {
  let transcriptData = '';

  session.questions.forEach((q: ReplayQuestion, index: number) => {
    transcriptData += `\n--- Question ${index + 1} ---\n`;
    transcriptData += `Type: ${q.type} | Difficulty: ${q.difficulty}\n`;
    transcriptData += `Question: ${q.text}\n`;
    
    if (q.answer && q.answer.transcript) {
      transcriptData += `\nCandidate Transcript:\n`;
      q.answer.transcript.filter(t => t.speaker === 'Candidate').forEach(t => {
        transcriptData += `- "${t.text}"\n`;
      });
    } else {
      transcriptData += `\nCandidate Transcript: (No answer provided)\n`;
    }
  });

  return `You are an expert technical interviewer and AI Career Coach. You are reviewing a completed interview.

Below is the transcript of the interview questions and the candidate's answers.

${transcriptData}

Evaluate the candidate's performance based on the following criteria:
1. Technical Correctness & Depth
2. Communication & Clarity
3. Confidence
4. Fluency (Speech delivery, lack of fillers)
5. Relevance (Answering the actual question)
6. Professionalism

You must return a JSON object containing the evaluation. DO NOT return markdown or any text outside of the JSON block.

The JSON object MUST follow this schema:
{
  "overallScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "communicationScore": <number 0-100>,
  "confidenceScore": <number 0-100>,
  "fluencyScore": <number 0-100>,
  "relevanceScore": <number 0-100>,
  "professionalismScore": <number 0-100>,
  "summary": "<string: A 2-3 sentence overall summary of the candidate's performance>",
  "strengths": ["<string>", "<string>"],
  "weaknesses": ["<string>", "<string>"],
  "improvements": ["<string: actionable improvement step>"],
  "recommendation": "<string: final recommendation e.g. 'Practice system design and be more concise'>",
  "questionReviews": [
    {
      "questionId": "<string: use the exact question id from the input, or an index if not available>",
      "feedback": {
        "score": <number 0-100>,
        "feedback": "<string: specific feedback on this answer>",
        "strengths": ["<string>"],
        "weaknesses": ["<string>"],
        "idealAnswer": "<string: How the candidate should have answered ideally>"
      }
    }
  ]
}

Please generate the JSON now.`;
};
