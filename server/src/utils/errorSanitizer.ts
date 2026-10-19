/**
 * Sanitizes exception messages before server-side logging by redacting
 * known credential and secret patterns while preserving useful debugging context.
 *
 * Supported redaction patterns:
 * - Common AI and provider API keys (e.g. gsk_..., sk_..., pk_..., dg_...)
 * - Bearer authorization tokens
 * - Passwords embedded in URI connection strings (e.g. postgres://user:pass@host)
 * - Key-value sensitive parameters (password=..., token=..., secret=..., api_key=...)
 *
 * Rules:
 * - Never throws; handles non-Error objects and malformed values safely.
 * - Bounds maximum message length.
 * - Preserves standard application and framework error messages.
 */
export function sanitizeErrorMessage(error: unknown, maxLength: number = 500): string {
  try {
    if (error === null || error === undefined) {
      return 'Unknown error';
    }

    let rawMessage: string;
    if (typeof error === 'string') {
      rawMessage = error;
    } else if (error instanceof Error) {
      rawMessage = error.message || 'Error with no message';
    } else if (typeof error === 'object') {
      try {
        rawMessage = JSON.stringify(error);
      } catch {
        rawMessage = String(error);
      }
    } else {
      rawMessage = String(error);
    }

    if (!rawMessage || rawMessage.trim() === '') {
      return 'Empty error message';
    }

    let sanitized = rawMessage;

    // 1. Redact standard AI/API key prefixes: gsk_..., sk_..., pk_..., dg_..., sk-...
    sanitized = sanitized.replace(/\b(gsk|sk|pk|dg)_[a-zA-Z0-9_\-]{6,}\b/g, '[REDACTED_API_KEY]');
    sanitized = sanitized.replace(/\bsk-[a-zA-Z0-9_\-]{16,}\b/g, '[REDACTED_API_KEY]');

    // 2. Redact Bearer tokens (e.g. Bearer eyJhbGciOi...)
    sanitized = sanitized.replace(/\b(Bearer\s+)[a-zA-Z0-9_\-\.]{8,}\b/gi, '$1[REDACTED_TOKEN]');

    // 3. Redact passwords in connection strings / URLs (e.g. postgres://user:password@host:5432/db)
    sanitized = sanitized.replace(/(:\/\/[^:\s\/]+):([^@\s\/]+)@/g, '$1:[REDACTED_PASSWORD]@');

    // 4. Redact common sensitive query/key-value assignments: password=..., token=..., api_key=..., secret=...
    sanitized = sanitized.replace(
      /\b(password|passwd|pwd|token|auth_token|secret|api_key|apiKey|client_secret)\s*[:=]\s*([^\s,;&"']+)/gi,
      '$1=[REDACTED]'
    );

    // 5. Bound the message length to prevent log bloating or memory pressure
    if (sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength) + '... [truncated]';
    }

    return sanitized;
  } catch {
    // Failsafe: never throw from the sanitizer
    return '[Unparseable error message]';
  }
}
