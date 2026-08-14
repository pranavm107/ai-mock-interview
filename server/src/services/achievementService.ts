import { db } from '../config/firebaseAdmin';
import { UserAchievement, AchievementDefinition } from '../types/achievement';

export class AchievementService {
  /**
   * Retrieves all achievement definitions.
   */
  async getAchievementDefinitions(): Promise<AchievementDefinition[]> {
    const snapshot = await db.collection('achievementDefinitions').where('isActive', '==', true).get();
    
    if (snapshot.empty) {
      return [];
    }

    const definitions: AchievementDefinition[] = [];
    snapshot.forEach((doc) => {
      definitions.push({ id: doc.id, ...doc.data() } as AchievementDefinition);
    });

    return definitions;
  }

  /**
   * Retrieves the achievement progress for a specific user.
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const snapshot = await db.collection('userAchievements')
      .where('userId', '==', userId)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const achievements: UserAchievement[] = [];
    snapshot.forEach((doc) => {
      achievements.push({ id: doc.id, ...doc.data() } as UserAchievement);
    });

    return achievements;
  }

  /**
   * Generates the aggregated Phase B3 API response for the user's achievements.
   */
  async getAchievementsForUser(userId: string): Promise<{ summary: import('../types/achievement').AchievementSummary, achievements: import('../types/achievement').AchievementWithProgress[] }> {
    const definitions = await this.getAchievementDefinitions();
    const userAchievements = await this.getUserAchievements(userId);

    const userAchMap = new Map(userAchievements.map(ua => [ua.achievementId, ua]));
    let unlockedCount = 0;

    const achievements: import('../types/achievement').AchievementWithProgress[] = definitions.map(def => {
      const ua = userAchMap.get(def.key);
      const progress = ua ? ua.progress : 0;
      const target = def.requirementValue;
      const unlocked = ua ? ua.unlocked : false;
      const unlockedAt = ua ? ua.unlockedAt : null;
      
      let progressPercentage = 0;
      if (unlocked) {
        progressPercentage = 100;
      } else if (target > 0) {
        progressPercentage = Math.min(100, Math.round((progress / target) * 100));
      } else {
        progressPercentage = 0;
      }

      if (unlocked) unlockedCount++;

      return {
        ...def,
        progress,
        progressPercentage,
        unlocked,
        unlockedAt
      };
    });

    const total = achievements.length;
    const locked = total - unlockedCount;
    const completionPercentage = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

    return {
      summary: {
        total,
        unlocked: unlockedCount,
        locked,
        completionPercentage
      },
      achievements
    };
  }
}

export const achievementService = new AchievementService();
