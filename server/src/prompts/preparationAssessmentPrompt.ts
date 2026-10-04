export const buildPreparationAssessmentPrompt = (
  category: string,
  topic: string,
  questionCount: number = 10,
  difficulty: string = 'MEDIUM'
): string => {
  return `
You are an expert technical and aptitude assessor.
Generate a Multiple Choice Question (MCQ) assessment for a candidate preparing for a placement test.

Requirements:
- Category: ${category}
- Topic: ${topic}
- Generate EXACTLY ${questionCount} multiple choice questions.
- Difficulty should be targeted at ${difficulty} level.
- Avoid duplicate questions.
- Avoid subjective questions; ensure there is one objectively correct answer.
- Generate EXACTLY 4 options for each question (ids: "A", "B", "C", "D").
- Generate exactly one correct answer matching one of the option IDs.
- Include a brief explanation for why the correct answer is right.
- DO NOT hallucinate. Provide accurate factual and logical questions based on the topic.

Return the output in pure JSON format matching exactly this schema:
{
  "questions": [
    {
      "question": "Sample question text?",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" },
        { "id": "C", "text": "Option C" },
        { "id": "D", "text": "Option D" }
      ],
      "correctOptionId": "B",
      "explanation": "Explanation for why option B is correct.",
      "skill": "Specific sub-topic or skill",
      "difficulty": "${difficulty}"
    }
  ]
}

Ensure the output is raw valid JSON without markdown wrapping (e.g. no \`\`\`json).
`;
};
