export const buildSchemaPrompt = (title: string, duration: number): string => {
  return `
--- JSON SCHEMA STRICT REQUIREMENT ---
You must output a JSON object EXACTLY matching this structure:
{
  "title": "${title}",
  "estimatedDuration": ${duration},
  "questions": [
    {
      "section": "RESUME" | "ROLE" | "COMPANY" | "BEHAVIORAL",
      "type": "TECHNICAL" | "BEHAVIORAL" | "SYSTEM_DESIGN" | "CODING" | "HR",
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "question": "The actual question text",
      "expectedTopics": ["topic1", "topic2"],
      "skillsEvaluated": ["skill1", "skill2"],
      "followUps": ["follow up 1", "follow up 2"]
    }
  ]
}
Do NOT include Markdown formatting like \`\`\`json. Return pure JSON.
--------------------------------------
`;
};
