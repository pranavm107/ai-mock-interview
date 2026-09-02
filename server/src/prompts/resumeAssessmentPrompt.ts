import { ResumeAssessmentContext } from '../services/resumeAssessmentContextService';

export const buildResumeAssessmentPrompt = (
  context: ResumeAssessmentContext, 
  questionCount: number = 10, 
  difficulty: string = 'MEDIUM'
): string => {
  return `
You are an expert technical assessor.
Generate a Multiple Choice Question (MCQ) assessment based on the candidate's resume context.

Requirements:
- Generate EXACTLY ${questionCount} multiple choice questions.
- Difficulty should be targeted at ${difficulty} level.
- Use the candidate's known skills. Prioritize testing their weaknesses and missing skills where appropriate to help them grow.
- Avoid duplicate questions.
- Avoid subjective questions; ensure there is one objectively correct technical answer.
- Generate EXACTLY 4 options for each question (ids: "A", "B", "C", "D").
- Generate exactly one correct answer matching one of the option IDs.
- Include a brief explanation for why the correct answer is right.
- DO NOT hallucinate technologies not present in the candidate's context (unless it is a fundamental CS concept related to their stack).

Resume Context:
Skills: ${context.skills.join(', ') || 'None specified'}
Experience: ${context.experience.join(', ') || 'None specified'}
Projects: ${context.projects.join(', ') || 'None specified'}
Weaknesses: ${context.weaknesses.join(', ') || 'None specified'}
Missing Skills: ${context.missingSkills.join(', ') || 'None specified'}

Return the output in pure JSON format matching exactly this schema:
{
  "questions": [
    {
      "question": "Which React hook is used for side effects?",
      "options": [
        { "id": "A", "text": "useState" },
        { "id": "B", "text": "useEffect" },
        { "id": "C", "text": "useContext" },
        { "id": "D", "text": "useMemo" }
      ],
      "correctOptionId": "B",
      "explanation": "useEffect is used for side effects.",
      "skill": "React",
      "difficulty": "MEDIUM"
    }
  ]
}

Ensure the output is raw valid JSON without markdown wrapping (e.g. no \`\`\`json).
`;
};
