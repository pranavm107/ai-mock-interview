import { SkillScore, SkillHistory, SkillHistoryEntry } from '../../types/evaluation';

export const updateSkillMatrix = (
  currentMatrix: SkillScore[],
  currentHistory: SkillHistory[],
  newSkills: string[],
  score: number,
  questionId: string
): { matrix: SkillScore[], history: SkillHistory[] } => {
  
  const matrix = [...currentMatrix];
  const history = [...currentHistory];
  const timestamp = new Date().toISOString();

  for (const skill of newSkills) {
    const normalizedSkill = skill.trim();
    if (!normalizedSkill) continue;

    // Update Matrix
    const matrixIdx = matrix.findIndex(s => s.name.toLowerCase() === normalizedSkill.toLowerCase());
    if (matrixIdx >= 0) {
      // Exponential moving average for skill score
      matrix[matrixIdx].score = Math.round((matrix[matrixIdx].score * 0.7) + (score * 0.3));
    } else {
      matrix.push({ name: normalizedSkill, score });
    }

    // Update History
    const historyIdx = history.findIndex(h => h.name.toLowerCase() === normalizedSkill.toLowerCase());
    const newEntry: SkillHistoryEntry = { timestamp, score, questionId };
    
    if (historyIdx >= 0) {
      history[historyIdx].history.push(newEntry);
    } else {
      history.push({ name: normalizedSkill, history: [newEntry] });
    }
  }

  // Ensure overall "Communication" and "Problem Solving" are tracked as virtual skills if not present
  const trackVirtualSkill = (skillName: string, virtualScore: number) => {
    const idx = matrix.findIndex(s => s.name === skillName);
    if (idx >= 0) {
      matrix[idx].score = Math.round((matrix[idx].score * 0.8) + (virtualScore * 0.2));
    } else {
      matrix.push({ name: skillName, score: virtualScore });
    }
  };

  trackVirtualSkill('Communication', score);
  trackVirtualSkill('Problem Solving', score);

  return { matrix, history };
};
