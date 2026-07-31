import { InterviewBlueprint } from "../../../types/interviewBlueprint";

export const buildBlueprintPrompt = (blueprint: InterviewBlueprint): string => {
  const sections = blueprint.sections.map(s => `- ${s.category}: exactly ${s.questions} questions`).join('\n');
  
  return `
--- REQUIRED BLUEPRINT ---
You MUST generate EXACTLY ${blueprint.totalQuestions} questions in total.

Section Distribution (STRICT):
${sections}

Difficulty Distribution (STRICT):
- EASY: exactly ${blueprint.difficulty.easy} questions
- MEDIUM: exactly ${blueprint.difficulty.medium} questions
- HARD: exactly ${blueprint.difficulty.hard} questions

Resume Target Focus:
- Emphasize these projects: ${blueprint.resumeCoverage.targetProjects.join(", ")}
- Emphasize this experience: ${blueprint.resumeCoverage.targetExperience.join(", ")}

Skill Coverage Requirements:
Ensure you cover these priority skills across the technical questions: ${blueprint.skillCoverage.prioritySkills.join(", ")}
--------------------------
`;
};
