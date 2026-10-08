import { db } from '../../config/firebaseAdmin';
import { CodingDailyAssignment, CodingDashboardData, CodingProblem } from '../../types/coding';
import { FieldValue } from 'firebase-admin/firestore';

const DAILY_ASSIGNMENT_CONFIG = {
  recentProblemWindowDays: 14,
};

export class CodingDashboardService {
  /**
   * Retrieves the full dashboard data.
   */
  async getDashboardData(userId: string, timezone: string): Promise<CodingDashboardData> {
    const dateKey = this.getDateKeyForTimezone(timezone);
    
    // Attempt to get or create today's assignment idempotently
    const dailyAssignment = await this.getOrCreateDailyAssignment(userId, dateKey, timezone);
    
    // Fetch recent activity
    const recentTasks = await this.getRecentActivity(userId);
    
    // Fetch progress metrics
    const progress = await this.getProgressMetrics(userId);
    
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
  private async getOrCreateDailyAssignment(userId: string, dateKey: string, timezone: string): Promise<(CodingDailyAssignment & { problem?: CodingProblem }) | null> {
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
        const newAssignmentData = await this.generateNewAssignment(userId, dateKey, timezone);
        
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
  private async generateNewAssignment(userId: string, dateKey: string, timezone: string): Promise<Omit<CodingDailyAssignment, 'id'> | null> {
    const problemsRef = db.collection('codingProblems').where('isActive', '==', true);
    const problemsSnapshot = await problemsRef.get();
    
    if (problemsSnapshot.empty) {
      return null;
    }

    const allProblems = problemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CodingProblem));
    
    // Fetch user's recent assignments to avoid them
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - DAILY_ASSIGNMENT_CONFIG.recentProblemWindowDays);
    
    const allAssignmentsSnapshot = await db.collection('codingDailyAssignments')
      .where('userId', '==', userId)
      .get();

    const recentProblemIds = new Set<string>();
    const pastTopics = new Set<string>();
    
    allAssignmentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      pastTopics.add(data.topic);
      
      const assignedAt = data.assignedAt?.toDate ? data.assignedAt.toDate() : new Date(data.assignedAt);
      if (assignedAt >= recentDate) {
        recentProblemIds.add(data.problemId);
      }
    });
    
    // Candidate filtering
    let candidates = allProblems.filter(p => !recentProblemIds.has(p.id));
    
    if (candidates.length === 0) {
      // Fallback: pick any active problem if all were done recently
      candidates = allProblems;
    }

    // New user check: fewer than 5 assignments total?
    const isNewUser = allAssignmentsSnapshot.size < 5;

    let selectedProblem: CodingProblem;
    let reason = "A daily challenge selected based on your recent activity.";

    if (isNewUser) {
      // Prefer EASY foundational topics for new users
      const easyFoundational = candidates.filter(p => p.difficulty === 'EASY' && (p.topics.includes('Arrays') || p.topics.includes('Strings') || p.topics.includes('Hash Maps')));
      if (easyFoundational.length > 0) {
        selectedProblem = this.pickRandomDeterministic(easyFoundational, userId, dateKey);
        reason = "A beginner-friendly starting challenge to build your foundational problem-solving skills.";
      } else {
        selectedProblem = this.pickRandomDeterministic(candidates, userId, dateKey);
        reason = "Your next daily coding challenge to practice your skills.";
      }
    } else {
      // Find weak or unpracticed topics by analyzing past assignments
      const pastTopics = new Set<string>();
      allAssignmentsSnapshot.docs.forEach(doc => {
        pastTopics.add(doc.data().topic);
      });

      const unpracticedCandidates = candidates.filter(p => p.topics.some(t => !pastTopics.has(t)));
      
      if (unpracticedCandidates.length > 0) {
        selectedProblem = this.pickRandomDeterministic(unpracticedCandidates, userId, dateKey);
        reason = `Recommended because ${selectedProblem.topics[0]} is a topic you haven't practiced recently.`;
      } else {
        selectedProblem = this.pickRandomDeterministic(candidates, userId, dateKey);
        reason = `Recommended to strengthen your understanding of ${selectedProblem.topics[0] || 'core concepts'}.`;
      }
    }

    return {
      userId,
      dateKey,
      problemId: selectedProblem.id,
      topic: selectedProblem.topics[0] || "General",
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
   * Retrieves the most recent activity (up to 5 items).
   */
  private async getRecentActivity(userId: string): Promise<(CodingDailyAssignment & { problem?: CodingProblem })[]> {
    const snapshot = await db.collection('codingDailyAssignments')
      .where('userId', '==', userId)
      .get();

    const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CodingDailyAssignment));
    
    // Sort descending by assignedAt
    allTasks.sort((a, b) => {
      const dateA = a.assignedAt?.toDate ? a.assignedAt.toDate().getTime() : new Date(a.assignedAt).getTime();
      const dateB = b.assignedAt?.toDate ? b.assignedAt.toDate().getTime() : new Date(b.assignedAt).getTime();
      return dateB - dateA;
    });

    const recentTasksData = allTasks.slice(0, 5);

    const tasks = await Promise.all(recentTasksData.map(async data => {
      const problem = await this.getProblemDetails(data.problemId);
      return { ...data, problem };
    }));
    
    return tasks;
  }

  /**
   * Aggregates basic progress metrics.
   */
  private async getProgressMetrics(userId: string) {
    const snapshot = await db.collection('codingDailyAssignments')
      .where('userId', '==', userId)
      .get();
      
    let problemsAssigned = 0;
    let problemsCompleted = 0;
    const topicsPracticed = new Set<string>();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
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
