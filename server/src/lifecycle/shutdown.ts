import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { logger } from '../utils/logger';

export interface ShutdownOptions {
  server: HttpServer;
  wsServers?: WebSocketServer[];
  timeoutMs?: number;
  onShutdown?: () => Promise<void> | void;
  processExit?: (code: number) => void;
  loggerInstance?: typeof logger;
}

export interface ShutdownManager {
  shutdown: (signal: string) => Promise<void>;
  isShuttingDown: () => boolean;
}

export interface GracefulShutdownController extends ShutdownManager {
  removeSignalHandlers: () => void;
}

/**
 * Creates an idempotent Graceful Shutdown Manager.
 */
export function createShutdownManager(options: ShutdownOptions): ShutdownManager {
  const {
    server,
    wsServers = [],
    timeoutMs = 10000,
    onShutdown,
    processExit = process.exit,
    loggerInstance = logger,
  } = options;

  let shuttingDown = false;
  let shutdownPromise: Promise<void> | null = null;

  const isShuttingDown = (): boolean => shuttingDown;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) {
      loggerInstance.warn({
        event: 'server.shutdown.duplicate_signal',
        signal,
        message: `Shutdown is already in progress. Ignoring duplicate signal: ${signal}`,
      });
      return shutdownPromise || Promise.resolve();
    }

    shuttingDown = true;
    loggerInstance.info({
      event: 'server.shutdown.initiated',
      signal,
      timeoutMs,
      message: `Received ${signal}. Initiating bounded graceful shutdown...`,
    });

    shutdownPromise = (async () => {
      // 1. Set a bounded shutdown deadline
      const forceExitTimer = setTimeout(() => {
        loggerInstance.error({
          event: 'server.shutdown.timeout',
          timeoutMs,
          signal,
          message: `Graceful shutdown deadline of ${timeoutMs}ms exceeded. Forcing process exit.`,
        });
        processExit(1);
      }, timeoutMs);

      // Unref timer so it doesn't prevent Node from exiting naturally if resources close earlier
      if (typeof forceExitTimer.unref === 'function') {
        forceExitTimer.unref();
      }

      try {
        // 2. Explicitly close WebSocket servers and notify connected clients
        if (wsServers.length > 0) {
          const wsClosePromises = wsServers.map((wss) => {
            return new Promise<void>((resolve) => {
              let resolved = false;
              const safeResolve = () => {
                if (!resolved) {
                  resolved = true;
                  resolve();
                }
              };

              // Failsafe per-server timer so a stalled WS connection never blocks shutdown
              const wsFailsafeTimer = setTimeout(() => {
                loggerInstance.warn({
                  event: 'server.shutdown.wss_close_timeout',
                  message: 'WebSocket server closure timed out waiting for clients; terminating remaining connections and proceeding',
                });
                if (wss.clients) {
                  for (const client of wss.clients) {
                    try {
                      if (typeof (client as any).terminate === 'function') {
                        (client as any).terminate();
                      }
                    } catch {
                      // ignore
                    }
                  }
                }
                safeResolve();
              }, Math.min(3000, Math.max(500, Math.floor(timeoutMs / 2))));

              if (typeof wsFailsafeTimer.unref === 'function') {
                wsFailsafeTimer.unref();
              }

              try {
                // Notify active clients with WebSocket status code 1001 (Going Away)
                if (wss.clients) {
                  for (const client of wss.clients) {
                    try {
                      if (client.readyState === WebSocket.OPEN) {
                        client.close(1001, 'Server is shutting down');
                      }
                    } catch {
                      // ignore client-specific close errors
                    }
                  }
                }

                // Stop listening for new WebSocket connections and drain
                wss.close((err) => {
                  clearTimeout(wsFailsafeTimer);
                  if (err) {
                    loggerInstance.error({
                      event: 'server.shutdown.wss_close_error',
                      error: err.message,
                    });
                  } else {
                    loggerInstance.info({
                      event: 'server.shutdown.wss_closed',
                      message: 'WebSocket server closed cleanly.',
                    });
                  }
                  safeResolve();
                });
              } catch (err: any) {
                clearTimeout(wsFailsafeTimer);
                loggerInstance.error({
                  event: 'server.shutdown.wss_error',
                  error: err?.message,
                });
                safeResolve();
              }
            });
          });

          await Promise.all(wsClosePromises);
        }

        // 3. Stop accepting new HTTP requests and close idle keep-alive connections
        if (typeof (server as any).closeIdleConnections === 'function') {
          (server as any).closeIdleConnections();
        }

        await new Promise<void>((resolve) => {
          server.close((err) => {
            if (err) {
              loggerInstance.error({
                event: 'server.shutdown.http_close_error',
                error: err.message,
              });
            } else {
              loggerInstance.info({
                event: 'server.shutdown.http_closed',
                message: 'HTTP server closed to new connections and existing requests completed.',
              });
            }
            resolve();
          });
        });

        // 4. Run any custom cleanup handlers (e.g. database/external resource cleanup)
        if (onShutdown) {
          try {
            await onShutdown();
          } catch (err: any) {
            loggerInstance.error({
              event: 'server.shutdown.custom_cleanup_error',
              error: err?.message,
            });
          }
        }

        // 5. Cancel deadline timer and complete cleanly
        clearTimeout(forceExitTimer);

        loggerInstance.info({
          event: 'server.shutdown.completed',
          signal,
          message: 'Graceful shutdown completed cleanly.',
        });

        processExit(0);
      } catch (err: any) {
        clearTimeout(forceExitTimer);
        loggerInstance.error({
          event: 'server.shutdown.failed',
          signal,
          error: err?.message,
        });
        processExit(1);
      }
    })();

    return shutdownPromise;
  };

  return {
    shutdown,
    isShuttingDown,
  };
}

/**
 * Registers SIGTERM and SIGINT handlers for the given server and returns the controller.
 */
export function setupGracefulShutdown(options: ShutdownOptions): GracefulShutdownController {
  const manager = createShutdownManager(options);

  const sigtermHandler = () => {
    manager.shutdown('SIGTERM').catch(() => {});
  };

  const sigintHandler = () => {
    manager.shutdown('SIGINT').catch(() => {});
  };

  process.once('SIGTERM', sigtermHandler);
  process.once('SIGINT', sigintHandler);

  return {
    ...manager,
    removeSignalHandlers: () => {
      process.removeListener('SIGTERM', sigtermHandler);
      process.removeListener('SIGINT', sigintHandler);
    },
  };
}
