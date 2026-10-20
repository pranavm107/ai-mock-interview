import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import http from 'http';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import {
  extractPathname,
  handleUpgradeRouting,
  attachWebSocketUpgradeHandler,
  abortUpgrade,
} from '../../src/websocket/upgradeHandler';
import { setupVoiceSocket } from '../../src/websocket/voiceSocketHandler';
import { setupDeepgramSocket } from '../../src/websocket/deepgramSocket';
import { createShutdownManager } from '../../src/lifecycle/shutdown';

// Mock logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock Deepgram service so no network or real API key is required
const mockDeepgramLive = new EventEmitter() as any;
mockDeepgramLive.getReadyState = vi.fn(() => 1);
mockDeepgramLive.send = vi.fn();
mockDeepgramLive.keepAlive = vi.fn();
mockDeepgramLive.requestClose = vi.fn();

vi.mock('../../src/services/deepgramService', () => ({
  setupDeepgramService: vi.fn(() => mockDeepgramLive),
}));

// Mock voiceController
class MockVoiceSessionService extends EventEmitter {
  processAudioChunk = vi.fn();
}
const mockActiveSessions = new Map<string, MockVoiceSessionService>();

vi.mock('../../src/controllers/voiceController', () => ({
  getActiveVoiceSession: vi.fn((id: string) => mockActiveSessions.get(id)),
}));

/**
 * Helper: Awaits successful WebSocket handshake with bounded timeout,
 * explicit listener cleanup, and single-settlement guard.
 */
function waitForHandshake(ws: WebSocket, timeoutMs = 2500): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer: NodeJS.Timeout;

    const cleanup = () => {
      clearTimeout(timer);
      ws.removeListener('open', onOpen);
      ws.removeListener('unexpected-response', onUnexpected);
      ws.removeListener('error', onError);
      ws.on('error', () => {});
    };

    const onOpen = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve();
      }
    };

    const onUnexpected = (_req: any, res: any) => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(new Error(`WebSocket handshake unexpectedly rejected with HTTP ${res.statusCode}`));
      }
    };

    const onError = (err: Error) => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(err);
      }
    };

    timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(new Error(`WebSocket handshake timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    ws.on('open', onOpen);
    ws.on('unexpected-response', onUnexpected);
    ws.on('error', onError);
  });
}

/**
 * Helper: Awaits WebSocket closure with bounded timeout,
 * explicit listener cleanup, and returns close code and reason.
 */
function waitForClose(ws: WebSocket, timeoutMs = 2500): Promise<{ code: number; reason: string }> {
  return new Promise((resolve, reject) => {
    if (ws.readyState === WebSocket.CLOSED) {
      return resolve({ code: 1000, reason: '' });
    }
    let settled = false;
    let timer: NodeJS.Timeout;

    const cleanup = () => {
      clearTimeout(timer);
      ws.removeListener('close', onClose);
      ws.removeListener('error', onError);
      ws.on('error', () => {});
    };

    const onClose = (code: number, reason: Buffer) => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve({ code, reason: reason.toString() });
      }
    };

    const onError = (err: Error) => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(err);
      }
    };

    timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(new Error(`WebSocket close timed out after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    ws.on('close', onClose);
    ws.on('error', onError);
  });
}

/**
 * Helper: Awaits single JSON message from WebSocket with bounded timeout
 * and explicit listener cleanup.
 */
function waitForJsonMessage(ws: WebSocket, timeoutMs = 2500): Promise<any> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer: NodeJS.Timeout;

    const cleanup = () => {
      clearTimeout(timer);
      ws.removeListener('message', onMessage);
      ws.removeListener('error', onError);
      ws.on('error', () => {});
    };

    const onMessage = (data: WebSocket.RawData) => {
      if (!settled) {
        settled = true;
        cleanup();
        try {
          resolve(JSON.parse(data.toString()));
        } catch (err) {
          reject(err);
        }
      }
    };

    const onError = (err: Error) => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(err);
      }
    };

    timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(new Error(`Timed out waiting for JSON message after ${timeoutMs}ms`));
      }
    }, timeoutMs);

    ws.on('message', onMessage);
    ws.on('error', onError);
  });
}

/**
 * Helper: Asserts that an upgrade handshake is explicitly rejected with the expected HTTP status code.
 * Fails if the connection opens or if it fails before receiving the expected status.
 */
function expectHandshakeRejected(url: string, expectedStatusCode = 404, timeoutMs = 2500): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false;
    let timer: NodeJS.Timeout;
    const ws = new WebSocket(url);

    const cleanup = () => {
      clearTimeout(timer);
      ws.removeListener('unexpected-response', onUnexpected);
      ws.removeListener('open', onOpen);
      ws.removeListener('error', onError);
      ws.on('error', () => {});
    };

    const onUnexpected = (_req: any, res: any) => {
      if (!settled) {
        settled = true;
        cleanup();
        const actualStatus = res.statusCode;
        try { ws.terminate(); } catch {}
        if (actualStatus === expectedStatusCode) {
          resolve();
        } else {
          reject(new Error(`Expected HTTP status ${expectedStatusCode} on ${url}, but got ${actualStatus}`));
        }
      }
    };

    const onOpen = () => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.close(); } catch {}
        reject(new Error(`Expected handshake to be rejected on ${url}, but WebSocket opened successfully`));
      }
    };

    const onError = (err: Error) => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(new Error(`Connection failed before receiving expected HTTP ${expectedStatusCode}: ${err.message}`));
      }
    };

    timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        try { ws.terminate(); } catch {}
        reject(new Error(`Timed out after ${timeoutMs}ms waiting for handshake rejection on ${url}`));
      }
    }, timeoutMs);

    ws.on('unexpected-response', onUnexpected);
    ws.on('open', onOpen);
    ws.on('error', onError);
  });
}

describe('Phase 8.9.2: Centralized WebSocket Upgrade Routing & Reliability', () => {
  describe('1. extractPathname unit tests & trailing slash normalization', () => {
    it('extracts pathname from relative URL without query string', () => {
      expect(extractPathname('/api/voice/socket')).toBe('/api/voice/socket');
      expect(extractPathname('/api/deepgram/socket')).toBe('/api/deepgram/socket');
    });

    it('strips query strings correctly', () => {
      expect(extractPathname('/api/voice/socket?sessionId=test-123&token=abc')).toBe('/api/voice/socket');
      expect(extractPathname('/api/deepgram/socket?model=nova-3')).toBe('/api/deepgram/socket');
    });

    it('strips hash fragments correctly', () => {
      expect(extractPathname('/api/voice/socket#fragment')).toBe('/api/voice/socket');
      expect(extractPathname('/api/deepgram/socket?query=1#frag')).toBe('/api/deepgram/socket');
    });

    it('handles absolute URLs correctly', () => {
      expect(extractPathname('http://localhost:3001/api/voice/socket?sessionId=456')).toBe('/api/voice/socket');
      expect(extractPathname('https://example.com/api/deepgram/socket')).toBe('/api/deepgram/socket');
    });

    it('normalizes single and multiple trailing slashes on routes', () => {
      expect(extractPathname('/api/voice/socket/')).toBe('/api/voice/socket');
      expect(extractPathname('/api/voice/socket///')).toBe('/api/voice/socket');
      expect(extractPathname('/api/deepgram/socket/')).toBe('/api/deepgram/socket');
      expect(extractPathname('/api/deepgram/socket///')).toBe('/api/deepgram/socket');
      expect(extractPathname('/api/voice/socket/?sessionId=789')).toBe('/api/voice/socket');
    });

    it('preserves root path / and normalizes multi-slash root /// to /', () => {
      expect(extractPathname('/')).toBe('/');
      expect(extractPathname('///')).toBe('/');
      expect(extractPathname('/?foo=bar')).toBe('/');
    });

    it('handles null, undefined, empty, and malformed inputs safely', () => {
      expect(extractPathname(undefined)).toBeNull();
      expect(extractPathname('')).toBeNull();
      expect(extractPathname(null as any)).toBeNull();
      expect(extractPathname(123 as any)).toBeNull();
      expect(extractPathname('http://[invalid-ipv6')).toBeNull();
    });
  });

  describe('2. Dual WebSocket Routing on Shared HTTP Server', () => {
    let server: http.Server;
    let voiceWs: ReturnType<typeof setupVoiceSocket>;
    let deepgramWs: ReturnType<typeof setupDeepgramSocket>;
    let serverPort: number;
    let detachHandler: () => void;

    beforeEach(async () => {
      server = http.createServer();
      voiceWs = setupVoiceSocket(server);
      deepgramWs = setupDeepgramSocket(server);
      detachHandler = attachWebSocketUpgradeHandler(server, { voiceWs, deepgramWs });

      await new Promise<void>((resolve) => server.listen(0, resolve));
      serverPort = (server.address() as any).port;
    });

    afterEach(async () => {
      detachHandler();
      try { voiceWs.close(); } catch {}
      try { deepgramWs.close(); } catch {}
      await new Promise<void>((resolve) => server.close(() => resolve()));
    });

    it('Voice endpoint successfully completes a WebSocket handshake with valid sessionId', async () => {
      const activeSession = new MockVoiceSessionService();
      mockActiveSessions.set('valid-session-1', activeSession);

      const ws = new WebSocket(`ws://127.0.0.1:${serverPort}/api/voice/socket?sessionId=valid-session-1`);
      let hasOpened = false;
      ws.on('open', () => { hasOpened = true; });

      await waitForHandshake(ws);
      expect(hasOpened).toBe(true);
      expect(ws.readyState).toBe(WebSocket.OPEN);

      ws.close(1000);
      const closeResult = await waitForClose(ws);
      expect(closeResult.code).toBe(1000);
    });

    it('Deepgram endpoint successfully completes a WebSocket handshake without HTTP 400', async () => {
      const ws = new WebSocket(`ws://127.0.0.1:${serverPort}/api/deepgram/socket`);
      let hasOpened = false;
      ws.on('open', () => { hasOpened = true; });

      await waitForHandshake(ws);
      expect(hasOpened).toBe(true);
      expect(ws.readyState).toBe(WebSocket.OPEN);

      ws.close(1000);
      const closeResult = await waitForClose(ws);
      expect([1000, 1001, 1005]).toContain(closeResult.code);
    });

    it('Deepgram endpoint preserves query strings without breaking routing', async () => {
      const ws = new WebSocket(`ws://127.0.0.1:${serverPort}/api/deepgram/socket?model=nova-3&encoding=linear16`);
      let hasOpened = false;
      ws.on('open', () => { hasOpened = true; });

      await waitForHandshake(ws);
      expect(hasOpened).toBe(true);
      expect(ws.readyState).toBe(WebSocket.OPEN);

      ws.close(1000);
      await waitForClose(ws);
    });

    it('Normalizes trailing slashes on voice and deepgram endpoints during handshake', async () => {
      const activeSession = new MockVoiceSessionService();
      mockActiveSessions.set('valid-session-trailing', activeSession);

      // Voice with trailing slash
      const voiceWsClient = new WebSocket(`ws://127.0.0.1:${serverPort}/api/voice/socket/?sessionId=valid-session-trailing`);
      let voiceHasOpened = false;
      voiceWsClient.on('open', () => { voiceHasOpened = true; });
      await waitForHandshake(voiceWsClient);
      expect(voiceHasOpened).toBe(true);
      expect(voiceWsClient.readyState).toBe(WebSocket.OPEN);
      voiceWsClient.close(1000);
      await waitForClose(voiceWsClient);

      // Deepgram with multiple trailing slashes
      const dgWsClient = new WebSocket(`ws://127.0.0.1:${serverPort}/api/deepgram/socket///`);
      let dgHasOpened = false;
      dgWsClient.on('open', () => { dgHasOpened = true; });
      await waitForHandshake(dgWsClient);
      expect(dgHasOpened).toBe(true);
      expect(dgWsClient.readyState).toBe(WebSocket.OPEN);
      dgWsClient.close(1000);
      await waitForClose(dgWsClient);
    });

    it('Missing voice sessionId receives Error payload and closes connection', async () => {
      const ws = new WebSocket(`ws://127.0.0.1:${serverPort}/api/voice/socket`);
      let hasOpened = false;
      ws.on('open', () => { hasOpened = true; });

      const messagePromise = waitForJsonMessage(ws);
      const closePromise = waitForClose(ws);

      await waitForHandshake(ws);
      expect(hasOpened).toBe(true);

      const [msg, closeResult] = await Promise.all([
        messagePromise,
        closePromise,
      ]);

      expect(msg).toEqual({ type: 'Error', message: 'Missing sessionId' });
      expect([1000, 1005]).toContain(closeResult.code);
    });

    it('Inactive voice sessionId receives Voice session not active payload and closes connection', async () => {
      mockActiveSessions.delete('non-existent-session');
      const ws = new WebSocket(`ws://127.0.0.1:${serverPort}/api/voice/socket?sessionId=non-existent-session`);
      let hasOpened = false;
      ws.on('open', () => { hasOpened = true; });

      const messagePromise = waitForJsonMessage(ws);
      const closePromise = waitForClose(ws);

      await waitForHandshake(ws);
      expect(hasOpened).toBe(true);

      const [msg, closeResult] = await Promise.all([
        messagePromise,
        closePromise,
      ]);

      expect(msg).toEqual({ type: 'Error', message: 'Voice session not active' });
      expect([1000, 1005]).toContain(closeResult.code);
    });

    it('Rejects unknown WebSocket paths with HTTP 404', async () => {
      await expectHandshakeRejected(`ws://127.0.0.1:${serverPort}/unknown/path`, 404);
      await expectHandshakeRejected(`ws://127.0.0.1:${serverPort}/api/other/socket`, 404);
      await expectHandshakeRejected(`ws://127.0.0.1:${serverPort}/unknown/path/`, 404);
      await expectHandshakeRejected(`ws://127.0.0.1:${serverPort}/`, 404);
    });

    it('Fails with explicit rejection error if connection drops or fails before expected response', async () => {
      // Connect to an unused port to simulate immediate connection failure
      await expect(expectHandshakeRejected('ws://127.0.0.1:1', 404, 1000)).rejects.toThrow(
        /Connection failed before receiving expected HTTP 404/
      );
    });

    it('Closing voice WebSocket server does not break the Deepgram WebSocket server', async () => {
      // Close voiceWs explicitly
      await new Promise<void>((resolve) => voiceWs.close(() => resolve()));

      // Deepgram WebSocket should still accept and complete handshake
      const ws = new WebSocket(`ws://127.0.0.1:${serverPort}/api/deepgram/socket`);
      let hasOpened = false;
      ws.on('open', () => { hasOpened = true; });

      await waitForHandshake(ws);
      expect(hasOpened).toBe(true);
      expect(ws.readyState).toBe(WebSocket.OPEN);

      ws.close(1000);
      await waitForClose(ws);
    });

    it('Guarantees attachWebSocketUpgradeHandler is idempotent and does not attach duplicate listeners', () => {
      const listenerCountBefore = server.listenerCount('upgrade');
      // Calling attach a second time on the same server instance must be a no-op
      attachWebSocketUpgradeHandler(server, { voiceWs, deepgramWs });
      const listenerCountAfter = server.listenerCount('upgrade');
      expect(listenerCountAfter).toBe(listenerCountBefore);
    });

    it('Graceful shutdown cleanly terminates active connections on both endpoints', async () => {
      const activeSession = new MockVoiceSessionService();
      mockActiveSessions.set('active-shutdown-sess', activeSession);

      // Connect client 1 (voice)
      const voiceClient = new WebSocket(`ws://127.0.0.1:${serverPort}/api/voice/socket?sessionId=active-shutdown-sess`);
      let voiceHasOpened = false;
      voiceClient.on('open', () => { voiceHasOpened = true; });
      await waitForHandshake(voiceClient);
      expect(voiceHasOpened).toBe(true);
      expect(voiceClient.readyState).toBe(WebSocket.OPEN);

      // Connect client 2 (deepgram)
      const deepgramClient = new WebSocket(`ws://127.0.0.1:${serverPort}/api/deepgram/socket`);
      let deepgramHasOpened = false;
      deepgramClient.on('open', () => { deepgramHasOpened = true; });
      await waitForHandshake(deepgramClient);
      expect(deepgramHasOpened).toBe(true);
      expect(deepgramClient.readyState).toBe(WebSocket.OPEN);

      // Setup close listeners before triggering shutdown
      const voiceClosePromise = waitForClose(voiceClient, 3000);
      const deepgramClosePromise = waitForClose(deepgramClient, 3000);

      // Trigger graceful shutdown
      const shutdownManager = createShutdownManager({
        server,
        wsServers: [voiceWs, deepgramWs],
        timeoutMs: 3000,
        processExit: vi.fn(),
      });

      await shutdownManager.shutdown('SIGTERM');

      // Both clients must settle and receive status 1001 (Going Away)
      const [voiceClose, deepgramClose] = await Promise.all([voiceClosePromise, deepgramClosePromise]);
      expect(voiceClose.code).toBe(1001);
      expect(deepgramClose.code).toBe(1001);
    });
  });

  describe('3. Edge cases and error resilience in upgrade routing', () => {
    it('abortUpgrade safely handles non-writable or already destroyed sockets', () => {
      const mockSocket = {
        writable: false,
        write: vi.fn(),
        end: vi.fn(),
        destroy: vi.fn(),
      };
      expect(() => abortUpgrade(mockSocket as any, 404, 'Not Found')).not.toThrow();
      expect(mockSocket.destroy).toHaveBeenCalled();
      expect(mockSocket.end).not.toHaveBeenCalled();
    });

    it('handleUpgradeRouting catches malformed request URL and returns 400', () => {
      const mockSocket = {
        writable: true,
        write: vi.fn(),
        end: vi.fn(),
        destroy: vi.fn(),
        on: vi.fn(),
        once: vi.fn((event, cb) => { if (event === 'finish') cb(); }),
        removeListener: vi.fn(),
      };
      const mockReq = {
        url: undefined,
      };
      const mockRoutes = {
        voiceWs: { handleUpgrade: vi.fn() },
        deepgramWs: { handleUpgrade: vi.fn() },
      };

      handleUpgradeRouting(mockRoutes as any, mockReq as any, mockSocket as any, Buffer.alloc(0));

      expect(mockSocket.end).toHaveBeenCalledWith(expect.stringContaining('400 Bad Request'));
      expect(mockSocket.destroy).toHaveBeenCalled();
    });

    it('handleUpgradeRouting catches invalid URL strings and returns 400', () => {
      const mockSocket = {
        writable: true,
        write: vi.fn(),
        end: vi.fn(),
        destroy: vi.fn(),
        on: vi.fn(),
        once: vi.fn((event, cb) => { if (event === 'finish') cb(); }),
        removeListener: vi.fn(),
      };
      const mockReq = {
        url: 'http://[invalid-ipv6',
      };
      const mockRoutes = {
        voiceWs: { handleUpgrade: vi.fn() },
        deepgramWs: { handleUpgrade: vi.fn() },
      };

      handleUpgradeRouting(mockRoutes as any, mockReq as any, mockSocket as any, Buffer.alloc(0));

      expect(mockSocket.end).toHaveBeenCalledWith(expect.stringContaining('400 Bad Request'));
      expect(mockSocket.destroy).toHaveBeenCalled();
    });
  });
});
