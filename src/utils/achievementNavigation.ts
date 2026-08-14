import type { AchievementWithProgress } from '../types/achievement';

export interface AchievementAction {
  label: string;
  route: string;
}

export const getAchievementAction = (achievement: AchievementWithProgress): AchievementAction | null => {
  if (achievement.unlocked) {
    return null;
  }

  switch (achievement.category) {
    case 'INTERVIEW':
    case 'PERFORMANCE':
    case 'CONSISTENCY':
      return {
        label: 'Start Interview',
        route: '/generate'
      };
    case 'RESUME':
      return {
        label: 'Improve Resume',
        route: '/resume'
      };
    default:
      return {
        label: 'Start Practice',
        route: '/generate'
      };
  }
};
