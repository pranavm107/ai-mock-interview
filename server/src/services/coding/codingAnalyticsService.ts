import { db } from '../../config/firebaseAdmin';
import { CodingProblem } from '../../types/coding';

export interface CodingAnalyticsData {
  totalAttempts: number;
  totalSolved: number;
  uniqueProblemsAttempted: number;
  acceptanceRate: number; // (ACCEPTED attempts / totalAttempts) * 100
  difficultyBreakdown: { [difficulty: string]: number }; // Count of unique solved problems by difficulty
  topicBreakdown: { [topic: string]: number }; // Count of unique solved problems by topic
  languageBreakdown: { [language: string]: number }; // Count of ALL attempts by language
  recentActivity: { date: string; attempts: number; solved: number }[];
  solvedProblemIds: string[];
  attemptedProblemIds: string[];
}

export class CodingAnalyticsService {
  private activeRequests = new Map<string, Promise<CodingAnalyticsData>>();

  public getUserAnalytics(userId: string, timezone: string = 'UTC'): Promise<CodingAnalyticsData> {
    const key = `${userId}-${timezone}`;
    if (this.activeRequests.has(key)) {
      return this.activeRequests.get(key)!;
    }
    const promise = this._getUserAnalytics(userId, timezone).finally(() => {
      this.activeRequests.delete(key);
    });
    this.activeRequests.set(key, promise);
    return promise;
  }

  private async _getUserAnalytics(userId: string, timezone: string): Promise<CodingAnalyticsData> {
    // 1. Fetch all submissions for the user
    // Submissions are only created for SUBMIT, not RUN_TESTS.
    // OPTIMIZATION: Use .select() to reduce network payload and memory.
    const submissionsSnapshot = await db.collection('codingSubmissions')
      .where('userId', '==', userId)
      .select('problemId', 'status', 'language', 'submittedAt')
      .get();

    const submissions = submissionsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        problemId: data.problemId,
        status: data.status,
        language: data.language,
        submittedAt: data.submittedAt ? data.submittedAt.toDate() : new Date()
      };
    }).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());

    const totalAttempts = submissions.length;
    
    if (totalAttempts === 0) {
      return {
        totalAttempts: 0,
        totalSolved: 0,
        uniqueProblemsAttempted: 0,
        acceptanceRate: 0,
        difficultyBreakdown: {},
        topicBreakdown: {},
        languageBreakdown: {},
        recentActivity: [],
        solvedProblemIds: [],
        attemptedProblemIds: []
      };
    }

    const acceptedSubmissions = submissions.filter(s => s.status === 'ACCEPTED');
    const acceptanceRate = Math.round((acceptedSubmissions.length / totalAttempts) * 100);

    const attemptedProblemIds = new Set<string>();
    const solvedProblemIds = new Set<string>();
    const languageBreakdown: { [language: string]: number } = {};

    // Group for recent activity (last 30 days)
    const recentActivityMap: { [dateKey: string]: { attempts: number; solved: number } } = {};
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    submissions.forEach(sub => {
      attemptedProblemIds.add(sub.problemId);
      if (sub.status === 'ACCEPTED') {
        solvedProblemIds.add(sub.problemId);
      }

      languageBreakdown[sub.language] = (languageBreakdown[sub.language] || 0) + 1;

      if (sub.submittedAt >= thirtyDaysAgo) {
        // Format date strictly using the user's timezone if possible, fallback to ISO date string part
        let dateKey = sub.submittedAt.toISOString().split('T')[0];
        try {
          // A robust way to get YYYY-MM-DD in a specific timezone
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
          const parts = formatter.formatToParts(sub.submittedAt);
          const y = parts.find(p => p.type === 'year')?.value;
          const m = parts.find(p => p.type === 'month')?.value;
          const d = parts.find(p => p.type === 'day')?.value;
          if (y && m && d) dateKey = `${y}-${m}-${d}`;
        } catch (e) {
          // ignore timezone error
        }

        if (!recentActivityMap[dateKey]) {
          recentActivityMap[dateKey] = { attempts: 0, solved: 0 };
        }
        recentActivityMap[dateKey].attempts += 1;
        if (sub.status === 'ACCEPTED') {
          recentActivityMap[dateKey].solved += 1;
        }
      }
    });

    const recentActivity = Object.entries(recentActivityMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date)); // chronological

    const difficultyBreakdown: { [difficulty: string]: number } = { EASY: 0, MEDIUM: 0, HARD: 0 };
    const topicBreakdown: { [topic: string]: number } = {};

    // Only fetch problem data if they solved at least one
    if (solvedProblemIds.size > 0) {
      // Chunk the problemIds because Firestore 'in' queries max out at 10 items.
      const solvedIdsArray = Array.from(solvedProblemIds);
      
      // Batch fetch problem documents
      for (let i = 0; i < solvedIdsArray.length; i += 10) {
        const chunk = solvedIdsArray.slice(i, i + 10);
        const problemsSnapshot = await db.collection('codingProblems')
          .where('id', 'in', chunk)
          .select('difficulty', 'topics')
          .get();
        
        problemsSnapshot.docs.forEach(doc => {
          const p = doc.data() as CodingProblem;
          
          if (p.difficulty) {
            difficultyBreakdown[p.difficulty] = (difficultyBreakdown[p.difficulty] || 0) + 1;
          }
          
          if (p.topics && Array.isArray(p.topics)) {
            p.topics.forEach(t => {
              topicBreakdown[t] = (topicBreakdown[t] || 0) + 1;
            });
          }
        });
      }
    }

    return {
      totalAttempts,
      totalSolved: solvedProblemIds.size,
      uniqueProblemsAttempted: attemptedProblemIds.size,
      acceptanceRate,
      difficultyBreakdown,
      topicBreakdown,
      languageBreakdown,
      recentActivity,
      solvedProblemIds: Array.from(solvedProblemIds),
      attemptedProblemIds: Array.from(attemptedProblemIds)
    };
  }
}

export const codingAnalyticsService = new CodingAnalyticsService();
