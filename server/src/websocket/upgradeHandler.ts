import { Server as HttpServer, IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { WebSocketServer } from 'ws';
import { logger } from '../utils/logger';

export interface WebSocketUpgradeRoutes {
  voiceWs: WebSocketServer;
  deepgramWs: WebSocketServer;
}

/**
 * Safely extracts and normalizes the URL pathname for routing WebSocket upgrade requests.
 * Strips query parameters and hash fragments.
 * Handles relative paths, absolute URLs, and malformed strings safely without throwing.
 */
export function extractPathname(urlStr?: string): string | null {
  if (!urlStr || typeof urlStr !== 'string') {
    return null;
  }

  try {
    // If it's a relative path like /api/voice/socket?sessionId=123
    const questionIndex = urlStr.indexOf('?');
    const hashIndex = urlStr.indexOf('#');
    let endIndex = urlStr.length;

    if (questionIndex !== -1 && questionIndex < endIndex) {
      endIndex = questionIndex;
    }
    if (hashIndex !== -1 && hashIndex < endIndex) {
      endIndex = hashIndex;
    }

    const pathPart = urlStr.slice(0, endIndex);
    let pathname: string;
    if (pathPart.startsWith('/')) {
      pathname = pathPart;
    } else {
      // If it's a full URL like http://localhost:3001/api/voice/socket
      const parsed = new URL(urlStr, 'http://localhost');
      pathname = parsed.pathname;
    }

    // Trailing slash normalization:
    // Strip trailing slashes, but ensure root '/' is not converted to ''
    if (pathname.length > 1 && pathname.endsWith('/')) {
      const trimmed = pathname.replace(/\/+$/, '');
      pathname = trimmed === '' ? '/' : trimmed;
    }

    return pathname;
  } catch {
    return null;
  }
}

/**
 * Aborts an incoming upgrade request by sending an HTTP error response and destroying the socket.
 */
export function abortUpgrade(socket: Duplex, statusCode: number, statusText: string): void {
  try {
    if (!socket.writable) {
      socket.destroy();
      return;
    }

    const message = statusText;
    const headers = [
      `HTTP/1.1 ${statusCode} ${statusText}`,
      'Connection: close',
      'Content-Type: text/plain',
      `Content-Length: ${Buffer.byteLength(message)}`,
    ];

    socket.once('finish', () => {
      try {
        socket.destroy();
      } catch {
        // ignore
      }
    });

    socket.end(`${headers.join('\r\n')}\r\n\r\n${message}`);
  } catch {
    try {
      socket.destroy();
    } catch {
      // ignore destruction errors
    }
  }
}

/**
 * Centralized HTTP upgrade handler for routing WebSocket traffic.
 * Dispatches:
 *   - /api/voice/socket    -> voiceWs
 *   - /api/deepgram/socket -> deepgramWs
 * Rejects all unknown paths with HTTP 404.
 * Rejects malformed or invalid upgrade requests safely without crashing.
 */
export function handleUpgradeRouting(
  routes: WebSocketUpgradeRoutes,
  request: IncomingMessage,
  socket: Duplex,
  head: Buffer
): void {
  // Prevent socket errors during upgrade handshake from becoming uncaught exceptions
  const onSocketError = (err: Error) => {
    logger.warn({
      event: 'websocket.upgrade.socket_error',
      error: err.message,
    });
  };
  socket.on('error', onSocketError);

  const pathname = extractPathname(request.url);

  if (pathname === '/api/voice/socket') {
    socket.removeListener('error', onSocketError);
    routes.voiceWs.handleUpgrade(request, socket, head, (ws) => {
      routes.voiceWs.emit('connection', ws, request);
    });
  } else if (pathname === '/api/deepgram/socket') {
    socket.removeListener('error', onSocketError);
    routes.deepgramWs.handleUpgrade(request, socket, head, (ws) => {
      routes.deepgramWs.emit('connection', ws, request);
    });
  } else if (!pathname) {
    socket.removeListener('error', onSocketError);
    abortUpgrade(socket, 400, 'Bad Request');
  } else {
    socket.removeListener('error', onSocketError);
    abortUpgrade(socket, 404, 'Not Found');
  }
}

/**
 * WeakSet of servers that have already been attached to prevent duplicate listeners.
 */
const attachedServers = new WeakSet<HttpServer>();

/**
 * Creates the upgrade listener function for the provided WebSocket routes.
 */
export function createWebSocketUpgradeListener(
  routes: WebSocketUpgradeRoutes
): (request: IncomingMessage, socket: Duplex, head: Buffer) => void {
  return (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    try {
      handleUpgradeRouting(routes, request, socket, head);
    } catch (err: any) {
      logger.error({
        event: 'websocket.upgrade.handler_error',
        error: err?.message,
      });
      abortUpgrade(socket, 500, 'Internal Server Error');
    }
  };
}

/**
 * Attaches the centralized upgrade listener to an HTTP server.
 * Guarantees that at most one upgrade listener is attached per HttpServer instance.
 * Returns a teardown function to remove the listener if needed (e.g. in tests).
 */
export function attachWebSocketUpgradeHandler(
  server: HttpServer,
  routes: WebSocketUpgradeRoutes
): () => void {
  if (attachedServers.has(server)) {
    return () => {};
  }
  attachedServers.add(server);

  const listener = createWebSocketUpgradeListener(routes);
  server.on('upgrade', listener);

  return () => {
    server.removeListener('upgrade', listener);
    attachedServers.delete(server);
  };
}
