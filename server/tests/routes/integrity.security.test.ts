import request from 'supertest';
import express from 'express';
import codingRoutes from '../../src/routes/codingRoutes';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { integrityService } from '../../src/services/coding/integrityService';

// Mock Clerk Auth Middleware
vi.mock('@clerk/express', () => {
  return {
    requireAuth: () => (req: any, res: any, next: any) => {
      // Simulate clerk middleware behavior based on mock headers
      if (req.headers.authorization === 'Bearer VALID_TOKEN') {
        req.auth = { userId: 'trusted_user' };
        next();
      } else if (req.headers.authorization === 'Bearer ATTACKER_TOKEN') {
        req.auth = { userId: 'attacker_user' };
        next();
      } else {
        res.status(401).json({ success: false, error: 'Unauthorized' });
      }
    },
    getAuth: (req: any) => req.auth
  };
});

// Mock Integrity Service
vi.mock('../../src/services/coding/integrityService', () => ({
  integrityService: {
    createSession: vi.fn(),
    getSession: vi.fn(),
    processSignal: vi.fn(),
    endSession: vi.fn(),
    heartbeatSession: vi.fn()
  }
}));

const app = express();
app.use(express.json());
app.use('/api/coding', codingRoutes);

describe('Integrity Routes Security Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Bypass Attempts', () => {
    it('rejects unauthenticated requests to create session', async () => {
      const res = await request(app).post('/api/coding/integrity/session').send({
        problemId: 'test-1',
        language: 'python',
        mode: 'INTEGRITY'
      });
      expect(res.status).toBe(401);
    });

    it('rejects unauthenticated requests to process signals', async () => {
      const res = await request(app).post('/api/coding/integrity/session/123/signal').send({
        signalId: 'sig-1',
        type: 'TAB_SWITCH'
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Authorization and Cross-User Data Access', () => {
    it('prevents attacker from accessing another user\'s active session', async () => {
      // The controller passes the authenticated userId to the service.
      // We simulate the service throwing an access denied error.
      vi.mocked(integrityService.getSession).mockRejectedValue(new Error('SESSION_ACCESS_DENIED'));

      const res = await request(app)
        .get('/api/coding/integrity/session/target_session_123')
        .set('Authorization', 'Bearer ATTACKER_TOKEN');

      expect(res.status).toBe(403);
      expect(integrityService.getSession).toHaveBeenCalledWith('target_session_123', 'attacker_user');
    });

    it('prevents attacker from processing signals on another user\'s session', async () => {
      vi.mocked(integrityService.processSignal).mockRejectedValue(new Error('SESSION_ACCESS_DENIED'));

      const res = await request(app)
        .post('/api/coding/integrity/session/target_session_123/signal')
        .set('Authorization', 'Bearer ATTACKER_TOKEN')
        .send({
          signalId: 'fake-sig',
          type: 'TAB_SWITCH'
        });

      expect(res.status).toBe(400); // The controller maps SESSION_ACCESS_DENIED to 400 for processSignal
      expect(res.body.error).toBe('SESSION_ACCESS_DENIED');
      expect(integrityService.processSignal).toHaveBeenCalledWith('target_session_123', 'attacker_user', 'fake-sig', 'TAB_SWITCH', undefined, undefined);
    });
  });

  describe('Input Validation and Safe Boundaries', () => {
    it('rejects session creation with missing fields', async () => {
      const res = await request(app)
        .post('/api/coding/integrity/session')
        .set('Authorization', 'Bearer VALID_TOKEN')
        .send({
          // missing problemId
          language: 'python',
          mode: 'INTEGRITY'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_SESSION');
    });

    it('rejects signal processing with missing fields', async () => {
      const res = await request(app)
        .post('/api/coding/integrity/session/session-123/signal')
        .set('Authorization', 'Bearer VALID_TOKEN')
        .send({
          // missing signalId and type
          metadata: { fake: 'data' }
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_SIGNAL');
    });

    it('gracefully handles service errors for invalid signals', async () => {
      vi.mocked(integrityService.processSignal).mockRejectedValue(new Error('INVALID_SIGNAL'));
      
      const res = await request(app)
        .post('/api/coding/integrity/session/session-123/signal')
        .set('Authorization', 'Bearer VALID_TOKEN')
        .send({
          signalId: 'sig-1',
          type: 'HACK_ATTEMPT'
        });
        
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_SIGNAL');
    });
  });
});
