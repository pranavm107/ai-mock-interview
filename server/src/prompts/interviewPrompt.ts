export interface PromptInput {
  company: string;
  role: string;
  experience: string;
  difficulty: string;
  skills?: string;
  questionCount: number;
}

export const buildInterviewPrompt = (input: PromptInput): string => {
  return `
Generate ${input.questionCount} interview questions for

Company:
${input.company}

Role:
${input.role}

Experience:
${input.experience}

Difficulty:
${input.difficulty}

Skills:
${input.skills || 'Not specified'}

Return ONLY JSON. 

The JSON response MUST be an array of objects, where each object has the following structure:
[
  {
    "question": "The interview question text",
    "difficulty": "Easy, Medium, or Hard",
    "category": "e.g., Technical, System Design, Behavioral, Algorithmic",
    "expectedAnswer": "A concise summary of what a good answer should include",
    "followUps": ["Optional follow-up question 1", "Optional follow-up question 2"]
  }
]
`;
};
