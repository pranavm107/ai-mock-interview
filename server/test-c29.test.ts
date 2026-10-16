import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from './src/config/firebaseAdmin';
import { codingAnalyticsService } from './src/services/coding/codingAnalyticsService';
import { codingDashboardService } from './src/services/coding/codingDashboardService';

// Mock the entire firebaseAdmin module
vi.mock('./src/config/firebaseAdmin', () => {
  return {
    db: {
      collection: vi.fn(),
      runTransaction: vi.fn()
    }
  };
});

describe('C29: Performance & Reliability Audit', () => {
  describe('Analytics Request Deduplication', () => {
    let mockGet: any;

    beforeEach(() => {
      vi.clearAllMocks();
      // Setup mock chain for db.collection().where().select().get()
      mockGet = vi.fn().mockResolvedValue({
        docs: []
      });
      const mockSelect = vi.fn().mockReturnValue({ get: mockGet });
      const mockWhere = vi.fn().mockReturnValue({ select: mockSelect, get: mockGet });
      (db.collection as any).mockReturnValue({ where: mockWhere, get: mockGet });
    });

    it('Test 1 - Concurrent requests share the same in-flight Promise', async () => {
      const userId = 'user_dedup_test';
      
      // Fire 3 requests concurrently
      const p1 = codingAnalyticsService.getUserAnalytics(userId);
      const p2 = codingAnalyticsService.getUserAnalytics(userId);
      const p3 = codingAnalyticsService.getUserAnalytics(userId);
      
      // They should all return the exact same promise object
      expect(p1).toBe(p2);
      expect(p2).toBe(p3);
      
      await Promise.all([p1, p2, p3]);
      
      // The database should only be queried ONCE
      expect(mockGet).toHaveBeenCalledTimes(1);
    });

    it('Test 2 - Cache entry is removed after success, allowing fresh fetches', async () => {
      const userId = 'user_fresh_test';
      
      await codingAnalyticsService.getUserAnalytics(userId);
      expect(mockGet).toHaveBeenCalledTimes(1);
      
      // Second sequential request should trigger a new database call
      await codingAnalyticsService.getUserAnalytics(userId);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('Test 3 - Cache entry is removed after failure, preventing permanent rejections', async () => {
      const userId = 'user_fail_test';
      
      mockGet.mockRejectedValueOnce(new Error('Database timeout'));
      
      await expect(codingAnalyticsService.getUserAnalytics(userId)).rejects.toThrow('Database timeout');
      expect(mockGet).toHaveBeenCalledTimes(1);
      
      // Next request should attempt again instead of instantly rejecting
      mockGet.mockResolvedValueOnce({ docs: [] });
      await expect(codingAnalyticsService.getUserAnalytics(userId)).resolves.toBeDefined();
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dashboard Query Consolidation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('Test 4 - Query optimizations fetch data correctly', async () => {
      // Simulate db for getDashboardData
      const mockAllAssignmentsGet = vi.fn().mockResolvedValue({
        docs: [
          {
            id: 'doc1',
            data: () => ({
              problemId: 'prob_1',
              topic: 'Arrays',
              status: 'COMPLETED',
              difficulty: 'EASY',
              assignedAt: { toDate: () => new Date('2026-10-01T10:00:00Z') }
            })
          }
        ]
      });

      const mockSelect = vi.fn().mockReturnValue({ get: mockAllAssignmentsGet });
      const mockWhere = vi.fn().mockReturnValue({ select: mockSelect, get: mockAllAssignmentsGet });
      
      (db.collection as any).mockImplementation((col: string) => {
        const mockDoc = vi.fn().mockReturnValue({ get: vi.fn().mockResolvedValue({ exists: false }) });
        if (col === 'codingDailyAssignments') {
          return { where: mockWhere, doc: mockDoc };
        }
        return { where: mockWhere, doc: mockDoc };
      });

      // Mock transaction
      (db.runTransaction as any).mockImplementation(async (callback: any) => {
        return {
          id: 'new_assignment',
          problemId: 'prob_2',
          topic: 'Strings',
          status: 'NOT_STARTED',
          difficulty: 'MEDIUM',
          assignedAt: new Date()
        };
      });

      const data = await codingDashboardService.getDashboardData('user_dash', 'UTC');
      
      // Progress should correctly aggregate from the mocked array
      expect(data.progress.problemsAssigned).toBe(2); // 1 history + 1 new
      expect(data.progress.problemsCompleted).toBe(1);
      expect(data.progress.topicsPracticed).toContain('Arrays');
      expect(data.progress.topicsPracticed).toContain('Strings');

      // The new assignment should be appended to the recent tasks array properly
      expect(data.recentTasks.length).toBe(2);
      expect(data.recentTasks[0].problemId).toBe('prob_2'); // Newest first
    });
  });
});
