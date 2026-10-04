
export const buildBatchValidationPrompt = (
  questions: any[],
  role: string,
  company: string,
  interviewType: string
): string => {
  const isMcq = interviewType === 'MCQ';

  return `You are an expert technical interviewer and question quality auditor.
Your job is to evaluate the following generated interview questions for clarity, logical soundness, answerability, and relevance.

CONTEXT:
Role: ${role}
Company: ${company}
Interview Type: ${interviewType}

QUESTIONS TO VALIDATE:
${JSON.stringify(questions.map((q, i) => ({ 
  index: i, 
  section: q.section,
  type: q.type, 
  difficulty: q.difficulty,
  question: q.question, 
  options: q.options, 
  correctOptionId: q.correctOptionId 
})), null, 2)}

INSTRUCTIONS:
For each question, determine if it is:
1. Clear and unambiguous.
2. Logically sound (no contradictory premises).
3. Answerable and evaluable (open-ended questions are fine, as long as they are answerable).
4. Relevant to the role, interview type, and difficulty.
${isMcq ? "5. For MCQ questions, ensure there is exactly ONE defensible correct option and distractors are not ambiguous." : ""}

Do NOT reject legitimate open-ended design or conceptual questions just because there are multiple correct approaches. The question is valid if it is a reasonable interview question.

CRITICAL SEVERITY GUIDELINES:
- NONE: The question is high quality. (valid: true)
- LOW: Minor wording issues or typos that DO NOT affect logic, clarity, or answerability. The question is still fundamentally sound. (valid: true)
- MEDIUM: Meaningful ambiguity, missing context, or relevance problems. (valid: false)
- HIGH: Logically flawed, contradictory premises, no defensible answer, or technically incorrect. (valid: false)
Return ONLY a strict JSON response matching this schema:
{
  "questions": [
    {
      "index": 0,
      "valid": true,
      "severity": "NONE",
      "issues": []
    }
  ],
  "overallValid": true
}
Do NOT wrap in markdown \`\`\`json. Return pure JSON.
`;
};

export const buildRegenerationPrompt = (
  invalidQuestions: any[],
  role: string,
  company: string,
  interviewType: string,
  isMcq: boolean
): string => {
  const baseQuestionSchema = `      "section": "RESUME" | "ROLE" | "COMPANY" | "BEHAVIORAL",
      "type": "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CODING" | "HR",
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "question": "The actual question text",
      "expectedTopics": ["topic1", "topic2"],
      "skillsEvaluated": ["skill1", "skill2"],
      "followUps": ["follow up 1", "follow up 2"]`;

  const mcqAdditions = `,
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "A",
      "explanation": "Explanation for why this is correct"`;

  const questionSchema = isMcq ? baseQuestionSchema + mcqAdditions : baseQuestionSchema;

  return `You are an expert technical interviewer. Some previously generated interview questions were rejected for poor quality.
Please generate replacement questions for the rejected ones.

CONTEXT:
Role: ${role}
Company: ${company}
Interview Type: ${interviewType}

REJECTED QUESTIONS TO REPLACE:
${JSON.stringify(invalidQuestions.map(q => ({
  index: q.index,
  section: q.original.section,
  type: q.original.type,
  difficulty: q.original.difficulty,
  rejectionReason: q.issues.join(", ")
})), null, 2)}

INSTRUCTIONS:
For each rejected question above, generate exactly ONE replacement question that matches its 'section', 'type', and 'difficulty'.
Ensure the new question does NOT suffer from the rejection reason provided.

Return ONLY a strict JSON response matching this schema:
{
  "replacements": [
    {
      "index": 0,
      "questionData": {
${questionSchema}
      }
    }
  ]
}
Do NOT wrap in markdown \`\`\`json. Return pure JSON.
`;
};
