import { db } from '../config/firebaseAdmin';
import { 
  AchievementEvent, 
  AchievementEventType, 
  AchievementEvaluationResult,
  RequirementType,
  AchievementDefinition,
  UserAchievement
} from '../types/achievement';
import { listSessionsByUser } from './runtime/sessionStorageService';
import { listInterviewReviewsByUser } from './review/reviewRepository';
import { calculateLongestStreak } from './analytics/streakService';
import { achievementService } from './achievementService';

/**
 * Handles all achievement rules and updates UserAchievement documents within a transaction.
 */
export class AchievementRuleEngine {
  
  public async evaluateAchievementEvent(
    userId: string,
    event: AchievementEvent
  ): Promise<AchievementEvaluationResult> {
    const result: AchievementEvaluationResult = {
      evaluated: 0,
      updated: 0,
      unlocked: []
    };

    try {
      // 1. Fetch all active achievement definitions
      const allDefinitions = await achievementService.getAchievementDefinitions();
      
      // 2. Filter definitions based on event type
      const relevantDefinitions = this.filterDefinitionsByEvent(allDefinitions, event);
      if (relevantDefinitions.length === 0) return result;

      // 3. Pre-fetch required user data to avoid N+1 queries
      // We only fetch what is needed based on the relevant definitions
      const requiredReqTypes = new Set(relevantDefinitions.map(d => d.requirementType));
      
      const evaluationContext = await this.buildEvaluationContext(userId, requiredReqTypes);

      result.evaluated = relevantDefinitions.length;

      // 4. Process each relevant definition in a batch/transaction approach
      // To ensure idempotency and prevent race conditions, we use Firestore transactions
      // Since a transaction limits to 500 writes, and we are updating at most a few achievements, it's safe.
      
      await db.runTransaction(async (transaction) => {
        for (const definition of relevantDefinitions) {
          const docId = `${userId}_${definition.key}`;
          const achievementRef = db.collection('userAchievements').doc(docId);
          
          const docSnapshot = await transaction.get(achievementRef);
          
          let currentProgress = 0;
          let isUnlocked = false;
          let createdAt = new Date().toISOString();
          
          if (docSnapshot.exists) {
            const data = docSnapshot.data() as UserAchievement;
            currentProgress = data.progress;
            isUnlocked = data.unlocked;
            createdAt = data.createdAt;
          }

          // If already unlocked, skip evaluation
          if (isUnlocked) continue;

          // 5. Calculate new progress based on rule
          const newProgress = this.calculateProgress(definition, evaluationContext);
          
          // If progress hasn't changed, skip
          if (newProgress === currentProgress && docSnapshot.exists) continue;

          const target = definition.requirementValue;
          const newlyUnlocked = newProgress >= target;
          const newUnlockedAt = newlyUnlocked ? new Date().toISOString() : null;

          const updateData: UserAchievement = {
            userId,
            achievementId: definition.key,
            progress: newProgress,
            target,
            unlocked: newlyUnlocked,
            unlockedAt: newUnlockedAt,
            createdAt: createdAt,
            updatedAt: new Date().toISOString()
          };

          transaction.set(achievementRef, updateData, { merge: true });
          
          result.updated++;
          if (newlyUnlocked) {
            result.unlocked.push(definition.key);
          }
        }
      });

    } catch (error) {
      console.error(`[AchievementRuleEngine] Error evaluating event ${event.type} for user ${userId}:`, error);
      // We don't rethrow to avoid breaking the primary workflow
    }

    return result;
  }

  private filterDefinitionsByEvent(
    definitions: AchievementDefinition[],
    event: AchievementEvent
  ): AchievementDefinition[] {
    switch (event.type) {
      case AchievementEventType.INTERVIEW_COMPLETED:
        return definitions.filter(d => 
          d.requirementType === RequirementType.INTERVIEW_COUNT ||
          d.requirementType === RequirementType.STREAK_DAYS
        );
      case AchievementEventType.INTERVIEW_SCORED:
        return definitions.filter(d => d.requirementType === RequirementType.SCORE_THRESHOLD);
      case AchievementEventType.RESUME_ADDED:
        return definitions.filter(d => d.requirementType === RequirementType.RESUME_ADDED);
      case AchievementEventType.RESUME_ATS_SCORED:
        return definitions.filter(d => d.requirementType === RequirementType.ATS_SCORE);
      case AchievementEventType.PROFILE_COMPLETED:
        return definitions.filter(d => d.requirementType === RequirementType.PROFILE_COMPLETION);
      default:
        return [];
    }
  }

  private async buildEvaluationContext(userId: string, reqTypes: Set<RequirementType>): Promise<any> {
    const context: any = {};

    if (reqTypes.has(RequirementType.INTERVIEW_COUNT) || reqTypes.has(RequirementType.STREAK_DAYS)) {
      const sessions = await listSessionsByUser(userId);
      context.sessions = sessions;
      context.completedInterviewsCount = sessions.filter(s => s.state === 'COMPLETED').length;
      
      if (reqTypes.has(RequirementType.STREAK_DAYS)) {
        const streakData = calculateLongestStreak(sessions);
        // Depending on design, streak achievements might want longest streak
        context.longestStreak = streakData.longestStreak;
      }
    }

    if (reqTypes.has(RequirementType.SCORE_THRESHOLD)) {
      const reviews = await listInterviewReviewsByUser(userId);
      let maxScore = 0;
      for (const review of reviews) {
        if (review.overallScore && review.overallScore > maxScore) {
          maxScore = review.overallScore;
        }
      }
      context.highestScore = maxScore;
    }

    if (reqTypes.has(RequirementType.RESUME_ADDED) || reqTypes.has(RequirementType.ATS_SCORE)) {
      const snapshot = await db.collection('resumes').where('userId', '==', userId).get();
      context.hasResume = !snapshot.empty;
      
      let maxAts = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        const ats = data.analysis?.aiAnalysis?.atsScore || data.analysis?.atsScore || 0;
        if (ats > maxAts) {
          maxAts = ats;
        }
      });
      context.highestAtsScore = maxAts;
    }

    return context;
  }

  private calculateProgress(definition: AchievementDefinition, context: any): number {
    switch (definition.requirementType) {
      case RequirementType.INTERVIEW_COUNT:
        return context.completedInterviewsCount || 0;
      
      case RequirementType.SCORE_THRESHOLD:
        return context.highestScore || 0;
      
      case RequirementType.STREAK_DAYS:
        return context.longestStreak || 0;
      
      case RequirementType.RESUME_ADDED:
        return context.hasResume ? 1 : 0;
      
      case RequirementType.ATS_SCORE:
        return context.highestAtsScore || 0;
      
      case RequirementType.PROFILE_COMPLETION:
        // Not explicitly implemented in the codebase yet.
        return 0;
        
      default:
        return 0;
    }
  }
}

export const achievementRuleEngine = new AchievementRuleEngine();
