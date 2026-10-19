import cors from 'cors';
import { logger } from '../utils/logger';

export const DEFAULT_ALLOWED_ORIGINS: readonly string[] = [
  'https://preppilot-pi-sandy.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

let hasWarnedProductionMissingOrigins = false;

/**
 * Resets the production warning state. Used primarily in unit tests.
 */
export function resetProductionCorsWarningState(): void {
  hasWarnedProductionMissingOrigins = false;
}

/**
 * Emits a structured startup warning if running in production without explicit ALLOWED_ORIGINS.
 * Guarantees no duplicate warnings and never leaks secrets.
 */
export function checkAndWarnProductionCors(
  envValue: string | undefined = process.env.ALLOWED_ORIGINS,
  nodeEnv: string | undefined = process.env.NODE_ENV,
  loggerInstance: typeof logger = logger
): boolean {
  if (nodeEnv === 'production' && (!envValue || envValue.trim() === '')) {
    if (!hasWarnedProductionMissingOrigins) {
      hasWarnedProductionMissingOrigins = true;
      loggerInstance.warn({
        event: 'cors.production_missing_allowed_origins',
        message: 'ALLOWED_ORIGINS is missing or blank in production. Using default fallback allowlist. Production environments should explicitly configure ALLOWED_ORIGINS.',
        defaultOriginsCount: DEFAULT_ALLOWED_ORIGINS.length,
      });
      return true;
    }
  }
  return false;
}

/**
 * Parses and validates an ALLOWED_ORIGINS environment variable value with strict safety rules.
 *
 * Rules:
 * - If undefined or empty/whitespace, returns the default allowlist.
 * - Parses comma-separated origin strings.
 * - Enforces valid HTTP and HTTPS origins only.
 * - Rejects wildcard origins ('*') and entries containing wildcards.
 * - Rejects entries containing:
 *     - Non-root paths (e.g. 'https://example.com/portal')
 *     - Username or password credentials (userinfo)
 *     - Query strings (e.g. '?foo=bar') or fragments (e.g. '#section')
 *     - Unsupported protocols (e.g. 'ftp:', 'javascript:', 'ws:')
 *     - Malformed URLs
 * - Continues accepting valid origins with ports (e.g. 'http://localhost:5173').
 * - Normalizes valid origins to lowercase scheme + host + port (without trailing slashes).
 * - Deduplicates valid entries.
 * - Invalid entries are completely discarded and NEVER expand access to a broader origin.
 * - Never logs credentials or sensitive portions of malformed origin strings.
 */
export function parseAllowedOrigins(envValue?: string): string[] {
  if (envValue === undefined || envValue.trim() === '') {
    return [...DEFAULT_ALLOWED_ORIGINS];
  }

  const rawEntries = envValue.split(',');
  const validOrigins: string[] = [];

  for (const raw of rawEntries) {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.includes('*')) {
      // Disallow empty strings and any wildcard token
      continue;
    }

    try {
      const parsed = new URL(trimmed);

      // 1. Enforce http and https protocols only
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        continue;
      }

      // 2. Reject credentials (userinfo)
      if (parsed.username || parsed.password) {
        continue;
      }

      // 3. Reject non-root paths (e.g. /portal, /api). Only '/' or '' is allowed.
      if (parsed.pathname !== '/' && parsed.pathname !== '') {
        continue;
      }

      // 4. Reject query parameters and hash fragments
      if (parsed.search || parsed.hash) {
        continue;
      }

      const normalizedOrigin = parsed.origin;
      if (normalizedOrigin && normalizedOrigin !== 'null' && !validOrigins.includes(normalizedOrigin)) {
        validOrigins.push(normalizedOrigin);
      }
    } catch {
      // Ignore malformed URL entries safely without logging unverified content
      continue;
    }
  }

  return validOrigins;
}

/**
 * Creates Express CORS middleware options using the configured allowlist.
 *
 * @param allowedOrigins Optional explicit array of allowed origins. Defaults to parsing process.env.ALLOWED_ORIGINS.
 */
export function createCorsOptions(allowedOrigins?: string[]): cors.CorsOptions {
  checkAndWarnProductionCors();
  const origins = allowedOrigins ?? parseAllowedOrigins(process.env.ALLOWED_ORIGINS);

  return {
    origin: origins,
    credentials: true,
  };
}
