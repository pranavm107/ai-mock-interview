import { db } from '../../config/firebaseAdmin';
import { CodingDailyAssignment, CodingDashboardData, CodingProblem } from '../../types/coding';
import { FieldValue } from 'firebase-admin/firestore';
import { codingAnalyticsService } from './codingAnalyticsService';

const DAILY_ASSIGNMENT_CONFIG = {
  recentProblemWindowDays: 14,
};

export class CodingDashboardService {
  async getDashboardData(userId: string, timezone: string): Promise<CodingDashboardData> {
    const dateKey = this.getDateKeyForTimezone(timezone);
    
    // 1. Fetch all existing assignments ONCE using .select to minimize payload
    const allAssignmentsSnapshot = await db.collection('codingDailyAssignments')
      .where('userId', '==', userId)
      .select('problemId', 'topic', 'assignedAt', 'status', 'difficulty')
      .get();
    
    const allTasks = allAssignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CodingDailyAssignment));
    
    // 2. Attempt to get or create today's assignment idempotently, passing allTasks
    const dailyAssignment = await this.getOrCreateDailyAssignment(userId, dateKey, timezone, allTasks);
    
    // 3. If a new assignment was created, add it to our in-memory list for metrics
    if (dailyAssignment && !allTasks.find(t => t.id === dailyAssignment.id)) {
      const { problem, ...assignmentData } = dailyAssignment;
      allTasks.push(assignmentData as CodingDailyAssignment);
    }
    
    // 4. Compute recent tasks and progress in-memory
    const recentTasks = await this.getRecentActivityFromList(allTasks);
    const progress = this.getProgressMetricsFromList(allTasks);
    
    return {
      dailyAssignment,
      recentTasks,
      progress
    };
  }

  /**
   * Gets the local date string (YYYY-MM-DD) for a specific timezone.
   */
  private getDateKeyForTimezone(timezone: string): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return formatter.format(new Date()); // Returns YYYY-MM-DD
    } catch (e) {
      // Fallback if invalid timezone provided
      console.warn(`Invalid timezone provided: ${timezone}. Falling back to UTC.`);
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Deterministically assigns or retrieves the daily challenge.
   */
  private async getOrCreateDailyAssignment(userId: string, dateKey: string, timezone: string, allTasks: CodingDailyAssignment[]): Promise<(CodingDailyAssignment & { problem?: CodingProblem }) | null> {
    const assignmentId = `${userId}_${dateKey}`;
    const assignmentRef = db.collection('codingDailyAssignments').doc(assignmentId);

    try {
      return await db.runTransaction(async (transaction) => {
        const assignmentDoc = await transaction.get(assignmentRef);

        if (assignmentDoc.exists) {
          const assignment = { id: assignmentDoc.id, ...assignmentDoc.data() } as CodingDailyAssignment;
          const problem = await this.getProblemDetails(assignment.problemId);
          return { ...assignment, problem };
        }

        // If it doesn't exist, we must generate a new assignment deterministically
        const newAssignmentData = await this.generateNewAssignment(userId, dateKey, timezone, allTasks);
        
        if (!newAssignmentData) {
          // No active problems exist
          return null;
        }

        transaction.set(assignmentRef, {
          userId: newAssignmentData.userId,
          dateKey: newAssignmentData.dateKey,
          problemId: newAssignmentData.problemId,
          topic: newAssignmentData.topic,
          difficulty: newAssignmentData.difficulty,
          reason: newAssignmentData.reason,
          status: newAssignmentData.status,
          assignedAt: newAssignmentData.assignedAt,
          timezone: newAssignmentData.timezone
        });

        const problem = await this.getProblemDetails(newAssignmentData.problemId);
        return { ...newAssignmentData, id: assignmentId, problem };
      });
    } catch (error) {
      console.error('Error getting or creating daily assignment:', error);
      throw new Error('Failed to generate daily assignment');
    }
  }

  /**
   * Generates a new assignment deterministically based on simple rules.
   */
  private async generateNewAssignment(userId: string, dateKey: string, timezone: string, allTasks: CodingDailyAssignment[]): Promise<Omit<CodingDailyAssignment, 'id'> | null> {
    const problemsRef = db.collection('codingProblems').where('isActive', '==', true).select('difficulty', 'topics');
    const problemsSnapshot = await problemsRef.get();
    
    if (problemsSnapshot.empty) {
      return null;
    }

    const allProblems = problemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CodingProblem));
    
    // Fetch user's actual coding analytics (history, solved problems, etc)
    const analytics = await codingAnalyticsService.getUserAnalytics(userId, timezone);
    const solvedProblemIds = new Set(analytics.solvedProblemIds);
    
    // Fetch user's recent assignments to avoid them
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - DAILY_ASSIGNMENT_CONFIG.recentProblemWindowDays);
    
    const recentAssignedProblemIds = new Set<string>();
    const pastAssignedTopics = new Set<string>();
    
    allTasks.forEach(data => {
      pastAssignedTopics.add(data.topic);
      
      const assignedAt = data.assignedAt?.toDate ? data.assignedAt.toDate() : new Date(data.assignedAt);
      if (assignedAt >= recentDate) {
        recentAssignedProblemIds.add(data.problemId);
      }
    });
    
    // Candidate filtering: Exclude solved problems and recently assigned problems
    let candidates = allProblems.filter(p => !solvedProblemIds.has(p.id) && !recentAssignedProblemIds.has(p.id));
    
    if (candidates.length === 0) {
      // Fallback 1: If exhausted because of recent window, allow recently assigned but UNsolved
      candidates = allProblems.filter(p => !solvedProblemIds.has(p.id));
      
      if (candidates.length === 0) {
        // Fallback 2: The user has literally solved everything. Pick a hard problem they solved long ago, or just any problem.
        candidates = allProblems; 
      }
    }

    // Determine target difficulty based on performance
    // Simple progression logic: if they've solved mostly Easy, give Medium. If they've solved mostly Medium, give Hard.
    const easyCount = analytics.difficultyBreakdown['EASY'] || 0;
    const medCount = analytics.difficultyBreakdown['MEDIUM'] || 0;
    
    let targetDifficulty: "EASY" | "MEDIUM" | "HARD" = "EASY";
    if (easyCount >= 5 && medCount < 10) {
      targetDifficulty = "MEDIUM";
    } else if (medCount >= 10) {
      targetDifficulty = "HARD";
    }

    // New user check: No solved problems yet?
    const isNewUser = analytics.totalSolved === 0;

    let selectedProblem: CodingProblem;
    let reason = "A daily challenge selected based on your recent activity.";

    if (isNewUser) {
      // Prefer EASY foundational topics for new users
      const easyFoundational = candidates.filter(p => p.difficulty === 'EASY' && (p.topics?.includes('Arrays') || p.topics?.includes('Strings') || p.topics?.includes('Hash Maps')));
      if (easyFoundational.length > 0) {
        selectedProblem = this.pickRandomDeterministic(easyFoundational, userId, dateKey);
        reason = "A beginner-friendly starting challenge to build your foundational problem-solving skills.";
      } else {
        selectedProblem = this.pickRandomDeterministic(candidates, userId, dateKey);
        reason = "Your next daily coding challenge to practice your skills.";
      }
    } else {
      // First try to match target difficulty AND unpracticed topics
      const allPastTopics = new Set([...Object.keys(analytics.topicBreakdown), ...pastAssignedTopics]);
      const targetCandidates = candidates.filter(p => p.difficulty === targetDifficulty);
      const unpracticedTarget = targetCandidates.filter(p => (p.topics || []).some(t => !allPastTopics.has(t)));
      
      if (unpracticedTarget.length > 0) {
        selectedProblem = this.pickRandomDeterministic(unpracticedTarget, userId, dateKey);
        reason = `Recommended because ${(selectedProblem.topics || [])[0] || 'this'} is a topic you haven't mastered at the ${targetDifficulty.toLowerCase()} level.`;
      } else if (targetCandidates.length > 0) {
        selectedProblem = this.pickRandomDeterministic(targetCandidates, userId, dateKey);
        reason = `Recommended to strengthen your understanding of ${(selectedProblem.topics || [])[0] || 'core concepts'} at your current skill level.`;
      } else {
        // Fallback: any candidate
        selectedProblem = this.pickRandomDeterministic(candidates, userId, dateKey);
        reason = "A daily challenge to keep your skills sharp.";
      }
    }

    return {
      userId,
      dateKey,
      problemId: selectedProblem.id,
      topic: (selectedProblem.topics || [])[0] || "General",
      difficulty: selectedProblem.difficulty,
      reason,
      status: "NOT_STARTED",
      assignedAt: FieldValue.serverTimestamp(),
      timezone
    };
  }

  /**
   * Picks a random item deterministically using a seed string.
   * This ensures the same user + same date picks the same fallback problem.
   */
  private pickRandomDeterministic<T>(items: T[], userId: string, dateKey: string): T {
    // Simple hash function for seed
    const seedString = `${userId}-${dateKey}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (Math.imul(31, hash) + seedString.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % items.length;
    return items[index];
  }

  /**
   * Helper to fetch full problem details.
   */
  private async getProblemDetails(problemId: string): Promise<CodingProblem | undefined> {
    const doc = await db.collection('codingProblems').doc(problemId).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as CodingProblem;
    }
    return undefined;
  }

  /**
   * Retrieves the most recent activity (up to 5 items) from the in-memory list.
   */
  private async getRecentActivityFromList(allTasks: CodingDailyAssignment[]): Promise<(CodingDailyAssignment & { problem?: CodingProblem })[]> {
    // Sort descending by assignedAt
    const sortedTasks = [...allTasks].sort((a, b) => {
      const dateA = a.assignedAt?.toDate ? a.assignedAt.toDate().getTime() : new Date(a.assignedAt).getTime();
      const dateB = b.assignedAt?.toDate ? b.assignedAt.toDate().getTime() : new Date(b.assignedAt).getTime();
      return dateB - dateA;
    });

    const recentTasksData = sortedTasks.slice(0, 5);

    const tasks = await Promise.all(recentTasksData.map(async data => {
      const problem = await this.getProblemDetails(data.problemId);
      return { ...data, problem };
    }));
    
    return tasks;
  }

  /**
   * Aggregates basic progress metrics from the in-memory list.
   */
  private getProgressMetricsFromList(allTasks: CodingDailyAssignment[]) {
    let problemsAssigned = 0;
    let problemsCompleted = 0;
    const topicsPracticed = new Set<string>();
    
    allTasks.forEach(data => {
      problemsAssigned++;
      if (data.status === 'COMPLETED') {
        problemsCompleted++;
      }
      if (data.topic) {
        topicsPracticed.add(data.topic);
      }
    });

    return {
      problemsAssigned,
      problemsCompleted,
      topicsPracticed: Array.from(topicsPracticed)
    };
  }
}

export const codingDashboardService = new CodingDashboardService();
