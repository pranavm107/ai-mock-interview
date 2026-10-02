export const buildSchemaPrompt = (title: string, duration: number, interviewType?: string): string => {
  const isMcq = interviewType === 'MCQ';

  const baseQuestionSchema = `
      "section": "RESUME" | "ROLE" | "COMPANY" | "BEHAVIORAL",
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

  return `
--- JSON SCHEMA STRICT REQUIREMENT ---
You must output a JSON object EXACTLY matching this structure:
{
  "title": "${title}",
  "estimatedDuration": ${duration},
  "questions": [
    {
${questionSchema}
    }
  ]
}
Do NOT include Markdown formatting like \`\`\`json. Return pure JSON.
--------------------------------------
`;
};
