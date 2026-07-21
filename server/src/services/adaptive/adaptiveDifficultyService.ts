import { DifficultyLevel } from '../../types/adaptive';

const DIFFICULTY_ORDER: DifficultyLevel[] = [
  'Beginner',
  'Easy',
  'Medium',
  'Advanced',
  'Senior',
  'Expert'
];

export interface DifficultyAdjustmentInput {
  currentDifficulty: DifficultyLevel;
  answerScore: number; // 0-100
  averageConfidence: number; // 0-100
  consecutiveHighScores: number;
  consecutiveLowScores: number;
}

export const evaluateNextDifficulty = (input: DifficultyAdjustmentInput): DifficultyLevel => {
  const currentIndex = DIFFICULTY_ORDER.indexOf(input.currentDifficulty);
  if (currentIndex === -1) return 'Medium'; // Default fallback

  let nextIndex = currentIndex;

  // Logic to increase difficulty
  if (input.answerScore >= 85 && input.averageConfidence >= 80 && input.consecutiveHighScores >= 2) {
    nextIndex = Math.min(currentIndex + 1, DIFFICULTY_ORDER.length - 1);
  } 
  // Logic to decrease difficulty
  else if (input.answerScore <= 40 || (input.answerScore <= 50 && input.consecutiveLowScores >= 2)) {
    nextIndex = Math.max(currentIndex - 1, 0);
  }

  return DIFFICULTY_ORDER[nextIndex];
};

export const mapLevelToInstruction = (level: DifficultyLevel): string => {
  switch (level) {
    case 'Beginner': return 'Ask very fundamental questions. Provide clear context. Avoid complex scenarios.';
    case 'Easy': return 'Ask basic concepts and straightforward application questions.';
    case 'Medium': return 'Ask standard interview questions involving trade-offs and moderate complexity.';
    case 'Advanced': return 'Ask in-depth technical questions, expecting nuanced answers and edge-case handling.';
    case 'Senior': return 'Focus on architecture, scale, cross-functional impact, and complex problem solving.';
    case 'Expert': return 'Ask extremely difficult, open-ended questions targeting deep domain expertise and system design at massive scale.';
    default: return 'Ask standard questions.';
  }
};
