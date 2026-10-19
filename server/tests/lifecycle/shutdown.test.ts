import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createShutdownManager, setupGracefulShutdown } from '../../src/lifecycle/shutdown';
import { logger } from '../../src/utils/logger';

describe('Graceful Shutdown Manager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockHttpServer = () => {
    const server = {
      close: vi.fn((cb?: (err?: Error) => void) => {
        if (cb) cb();
        return server;
      }),
      closeIdleConnections: vi.fn(),
    } as unknown as HttpServer;
    return server;
  };

  const createMockWsServer = (clients: any[] = []) => {
    const wss = {
      close: vi.fn((cb?: (err?: Error) => void) => {
        if (cb) cb();
        return wss;
      }),
      clients: new Set(clients),
    } as unknown as WebSocketServer;
    return wss;
  };

  it('executes clean shutdown sequence and exits with code 0', async () => {
    const server = createMockHttpServer();
    const mockClient = {
      readyState: WebSocket.OPEN,
      close: vi.fn(),
    };
    const wss = createMockWsServer([mockClient]);
    const onShutdown = vi.fn().mockResolvedValue(undefined);
    const processExit = vi.fn();
    const loggerInfo = vi.spyOn(logger, 'info').mockImplementation(() => {});

    const manager = createShutdownManager({
      server,
      wsServers: [wss],
      timeoutMs: 5000,
      onShutdown,
      processExit,
      loggerInstance: logger,
    });

    expect(manager.isShuttingDown()).toBe(false);

    const shutdownPromise = manager.shutdown('SIGTERM');
    expect(manager.isShuttingDown()).toBe(true);

    await shutdownPromise;

    // Verify WebSocket clients closed gracefully
    expect(mockClient.close).toHaveBeenCalledWith(1001, 'Server is shutting down');
    expect(wss.close).toHaveBeenCalled();

    // Verify HTTP server idle connections and close called
    expect((server as any).closeIdleConnections).toHaveBeenCalled();
    expect(server.close).toHaveBeenCalled();

    // Verify custom shutdown cleanup hook called
    expect(onShutdown).toHaveBeenCalled();

    // Verify exit with code 0
    expect(processExit).toHaveBeenCalledWith(0);
    expect(loggerInfo).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'server.shutdown.completed', signal: 'SIGTERM' })
    );
  });

  it('continues HTTP server closure and exits with 0 even if WebSocket close reports an error', async () => {
    const server = createMockHttpServer();
    const failingWss = {
      close: vi.fn((cb?: (err?: Error) => void) => {
        if (cb) cb(new Error('Failed to close WebSocket listener'));
        return failingWss;
      }),
      clients: new Set([]),
    } as unknown as WebSocketServer;

    const processExit = vi.fn();
    const loggerError = vi.spyOn(logger, 'error').mockImplementation(() => {});

    const manager = createShutdownManager({
      server,
      wsServers: [failingWss],
      timeoutMs: 5000,
      processExit,
      loggerInstance: logger,
    });

    await manager.shutdown('SIGTERM');

    // Error was logged
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'server.shutdown.wss_close_error',
        error: 'Failed to close WebSocket listener',
      })
    );

    // HTTP server was still closed
    expect(server.close).toHaveBeenCalled();
    // Exited cleanly
    expect(processExit).toHaveBeenCalledWith(0);
  });

  it('handles stalled WebSocket client by triggering failsafe timeout and terminating client', async () => {
    const server = createMockHttpServer();
    const stubbornClient = {
      readyState: WebSocket.OPEN,
      close: vi.fn(), // refuses to close
      terminate: vi.fn(),
    };

    // wss never invokes callback
    const hangingWss = {
      close: vi.fn(),
      clients: new Set([stubbornClient]),
    } as unknown as WebSocketServer;

    const processExit = vi.fn();
    const loggerWarn = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const manager = createShutdownManager({
      server,
      wsServers: [hangingWss],
      timeoutMs: 4000,
      processExit,
      loggerInstance: logger,
    });

    const shutdownPromise = manager.shutdown('SIGTERM');

    // Advance time past the per-WS failsafe timeout (Math.min(3000, timeoutMs / 2) = 2000ms)
    vi.advanceTimersByTime(2100);

    await shutdownPromise;

    expect(stubbornClient.terminate).toHaveBeenCalled();
    expect(loggerWarn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'server.shutdown.wss_close_timeout',
      })
    );
    expect(server.close).toHaveBeenCalled();
    expect(processExit).toHaveBeenCalledWith(0);
  });

  it('is idempotent and ignores duplicate shutdown signals', async () => {
    const server = createMockHttpServer();
    const processExit = vi.fn();
    const loggerWarn = vi.spyOn(logger, 'warn').mockImplementation(() => {});

    const manager = createShutdownManager({
      server,
      timeoutMs: 5000,
      processExit,
      loggerInstance: logger,
    });

    const p1 = manager.shutdown('SIGTERM');
    const p2 = manager.shutdown('SIGINT');

    await Promise.all([p1, p2]);

    // Server close should only be invoked once
    expect(server.close).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenCalledTimes(1);
    expect(processExit).toHaveBeenCalledWith(0);

    // Duplicate signal logged a warning
    expect(loggerWarn).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'server.shutdown.duplicate_signal',
        signal: 'SIGINT',
      })
    );
  });

  it('forces process exit with code 1 when shutdown deadline is exceeded', async () => {
    // Mock server that hangs and never invokes close callback
    const hangingServer = {
      close: vi.fn((cb?: (err?: Error) => void) => {
        // intentionally never invoke cb() to simulate in-flight hung requests
        return hangingServer;
      }),
      closeIdleConnections: vi.fn(),
    } as unknown as HttpServer;

    const processExit = vi.fn();
    const loggerError = vi.spyOn(logger, 'error').mockImplementation(() => {});

    const manager = createShutdownManager({
      server: hangingServer,
      timeoutMs: 3000,
      processExit,
      loggerInstance: logger,
    });

    const shutdownPromise = manager.shutdown('SIGTERM');

    // Advance time beyond timeoutMs
    vi.advanceTimersByTime(3001);

    expect(processExit).toHaveBeenCalledWith(1);
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'server.shutdown.timeout',
        timeoutMs: 3000,
      })
    );
  });

  it('registers and removes process signal listeners cleanly', () => {
    const server = createMockHttpServer();
    const processOnceSpy = vi.spyOn(process, 'once');
    const processRemoveListenerSpy = vi.spyOn(process, 'removeListener');

    const controller = setupGracefulShutdown({
      server,
      timeoutMs: 5000,
      loggerInstance: logger,
    });

    expect(processOnceSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    expect(processOnceSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));

    controller.removeSignalHandlers();

    expect(processRemoveListenerSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));
    expect(processRemoveListenerSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
  });
});
