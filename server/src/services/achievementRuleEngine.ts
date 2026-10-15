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
  
  public async syncAllForUser(userId: string): Promise<AchievementEvaluationResult> {
    const allDefinitions = await achievementService.getAchievementDefinitions();
    return this.evaluateDefinitionsForUser(userId, allDefinitions);
  }

  public async evaluateAchievementEvent(
    userId: string,
    event: AchievementEvent
  ): Promise<AchievementEvaluationResult> {
    const allDefinitions = await achievementService.getAchievementDefinitions();
    const relevantDefinitions = this.filterDefinitionsByEvent(allDefinitions, event);
    return this.evaluateDefinitionsForUser(userId, relevantDefinitions);
  }

  private async evaluateDefinitionsForUser(
    userId: string,
    definitions: AchievementDefinition[]
  ): Promise<AchievementEvaluationResult> {
    const result: AchievementEvaluationResult = {
      evaluated: 0,
      updated: 0,
      unlocked: []
    };

    if (definitions.length === 0) return result;

    try {
      const requiredReqTypes = new Set(definitions.map(d => d.requirementType));
      const evaluationContext = await this.buildEvaluationContext(userId, requiredReqTypes);

      result.evaluated = definitions.length;

      await db.runTransaction(async (transaction) => {
        for (const definition of definitions) {
          const docId = `${userId}_${definition.key}`;
          const achievementRef = db.collection('userAchievements').doc(docId);
          
          const docSnapshot = await transaction.get(achievementRef);
          
          let currentProgress = 0;
          let isUnlocked = false;
          let createdAt = new Date().toISOString();
          let existingUnlockedAt: string | null = null;
          
          if (docSnapshot.exists) {
            const data = docSnapshot.data() as UserAchievement;
            currentProgress = data.progress;
            isUnlocked = data.unlocked;
            createdAt = data.createdAt;
            existingUnlockedAt = data.unlockedAt;
          }

          // If already unlocked, skip evaluation to preserve original unlockedAt
          if (isUnlocked) continue;

          // Calculate new progress based on rule
          const newProgress = this.calculateProgress(definition, evaluationContext);
          
          // If progress hasn't changed, skip
          if (newProgress === currentProgress && docSnapshot.exists) continue;

          const target = definition.requirementValue;
          const newlyUnlocked = newProgress >= target;
          const newUnlockedAt = newlyUnlocked ? (existingUnlockedAt || new Date().toISOString()) : null;

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
      console.error(`[AchievementRuleEngine] Error evaluating achievements for user ${userId}:`, error);
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
        context.longestStreak = streakData.longestStreak;
      }
    }

    if (reqTypes.has(RequirementType.SCORE_THRESHOLD)) {
      let maxScore = 0;

      // 1. Check sessions
      const sessions = context.sessions || await listSessionsByUser(userId);
      context.sessions = sessions;
      for (const session of sessions) {
        const sScore = (session as any).overallScore ?? (session as any).score;
        if (typeof sScore === 'number' && sScore > maxScore) {
          maxScore = sScore;
        }
      }

      // 2. Check interview reports
      try {
        const reportsSnapshot = await db.collection('interviewReports').where('userId', '==', userId).get();
        reportsSnapshot.forEach(doc => {
          const r = doc.data();
          const rScore = r.overallEvaluation?.overallScore;
          if (typeof rScore === 'number' && rScore > maxScore) {
            maxScore = rScore;
          }
        });
      } catch (err) {
        console.warn('Error reading reports for score achievements:', err);
      }

      // 3. Check legacy reviews
      try {
        const reviews = await listInterviewReviewsByUser(userId);
        for (const review of reviews) {
          if (review.overallScore && review.overallScore > maxScore) {
            maxScore = review.overallScore;
          }
        }
      } catch (err) {
        // Fallback
      }

      context.highestScore = maxScore;
    }

    if (reqTypes.has(RequirementType.PROFILE_COMPLETION) || reqTypes.has(RequirementType.RESUME_ADDED) || reqTypes.has(RequirementType.ATS_SCORE)) {
      const snapshot = await db.collection('resumes').where('userId', '==', userId).get();
      context.hasResume = !snapshot.empty;
      
      let maxAts = 0;
      let isProfileComplete = false;

      snapshot.forEach(doc => {
        const data = doc.data();
        const ats = data.analysis?.aiAnalysis?.atsScore || data.analysis?.atsScore || 0;
        if (ats > maxAts) {
          maxAts = ats;
        }

        const sr = data.analysis?.structuredResume;
        if (sr && (sr.candidate?.headline || sr.candidate?.summary || (sr.experience && sr.experience.length > 0) || (sr.education && sr.education.length > 0))) {
          isProfileComplete = true;
        }
      });

      if (!isProfileComplete) {
        try {
          const userDoc = await db.collection('users').doc(userId).get();
          if (userDoc.exists) {
            const uData = userDoc.data();
            if (uData?.profileCompleted || (uData?.name && uData?.email && uData?.targetRole)) {
              isProfileComplete = true;
            }
          }
        } catch {
          // ignore
        }
      }

      context.highestAtsScore = maxAts;
      context.isProfileComplete = isProfileComplete;
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
        return context.isProfileComplete ? 1 : 0;
        
      default:
        return 0;
    }
  }
}

export const achievementRuleEngine = new AchievementRuleEngine();
