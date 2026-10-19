import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import cors from 'cors';
import {
  parseAllowedOrigins,
  createCorsOptions,
  checkAndWarnProductionCors,
  resetProductionCorsWarningState,
  DEFAULT_ALLOWED_ORIGINS,
} from '../../src/config/cors';
import { logger } from '../../src/utils/logger';

describe('CORS Configuration', () => {
  const originalAllowedOrigins = process.env.ALLOWED_ORIGINS;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    resetProductionCorsWarningState();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    if (originalAllowedOrigins !== undefined) {
      process.env.ALLOWED_ORIGINS = originalAllowedOrigins;
    } else {
      delete process.env.ALLOWED_ORIGINS;
    }

    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  });

  describe('parseAllowedOrigins - Strict Validation', () => {
    it('returns default allowed origins when configuration is undefined', () => {
      const origins = parseAllowedOrigins(undefined);
      expect(origins).toEqual([...DEFAULT_ALLOWED_ORIGINS]);
    });

    it('returns default allowed origins when configuration is empty string or only whitespace', () => {
      expect(parseAllowedOrigins('')).toEqual([...DEFAULT_ALLOWED_ORIGINS]);
      expect(parseAllowedOrigins('   ')).toEqual([...DEFAULT_ALLOWED_ORIGINS]);
    });

    it('accepts valid HTTP and HTTPS origins with and without ports', () => {
      const input = 'https://app.example.com, http://localhost:5173, https://example.com:8443';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual([
        'https://app.example.com',
        'http://localhost:5173',
        'https://example.com:8443',
      ]);
    });

    it('normalizes valid root-path trailing slashes without altering the origin', () => {
      const input = 'https://app.example.com/, http://localhost:5173/';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual([
        'https://app.example.com',
        'http://localhost:5173',
      ]);
    });

    it('rejects entries containing non-root paths (e.g. /portal, /api)', () => {
      const input = 'https://app.example.com/portal, http://localhost:5173/dashboard, https://valid.com';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual(['https://valid.com']);
      expect(origins).not.toContain('https://app.example.com');
      expect(origins).not.toContain('http://localhost:5173');
    });

    it('rejects entries containing user credentials (userinfo)', () => {
      const input = 'https://user:password@app.example.com, http://admin:secret@localhost:5173, https://safe.com';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual(['https://safe.com']);
      expect(origins).not.toContain('https://app.example.com');
    });

    it('rejects entries containing query strings or hash fragments', () => {
      const input = 'https://app.example.com?query=param, https://app2.example.com#section, https://safe.com';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual(['https://safe.com']);
    });

    it('rejects wildcard origins ("*" or entries containing "*")', () => {
      const input = '*, https://*.example.com, *.allowed.com, https://safe.com';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual(['https://safe.com']);
      expect(origins).not.toContain('*');
    });

    it('rejects unsupported protocols (ftp, javascript, ws, file, data)', () => {
      const input = 'ftp://files.example.com, javascript:alert(1), ws://sockets.example.com, file:///path, https://safe.com';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual(['https://safe.com']);
    });

    it('rejects malformed URLs safely without crashing', () => {
      const input = 'not-a-url, http://, ://bad, http://[invalid, https://safe.com';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual(['https://safe.com']);
    });

    it('deduplicates identical origins safely', () => {
      const input = 'https://app.example.com, https://app.example.com/, https://app.example.com';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual(['https://app.example.com']);
    });

    it('returns an empty array when custom entries are entirely invalid (fails closed)', () => {
      const input = 'https://bad.com/path, ftp://invalid.com, *';
      const origins = parseAllowedOrigins(input);
      expect(origins).toEqual([]);
    });
  });

  describe('Production Warning for Missing ALLOWED_ORIGINS', () => {
    it('emits a structured warning when NODE_ENV is production and ALLOWED_ORIGINS is missing', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      const result = checkAndWarnProductionCors(undefined, 'production');
      expect(result).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'cors.production_missing_allowed_origins',
          message: expect.stringContaining('ALLOWED_ORIGINS is missing or blank in production'),
        })
      );
    });

    it('emits a structured warning when NODE_ENV is production and ALLOWED_ORIGINS is empty whitespace', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      const result = checkAndWarnProductionCors('   ', 'production');
      expect(result).toBe(true);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('does not emit a warning in production when ALLOWED_ORIGINS is explicitly configured', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      const result = checkAndWarnProductionCors('https://myproductionapp.com', 'production');
      expect(result).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('does not emit a warning in non-production environments (development, test)', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      expect(checkAndWarnProductionCors(undefined, 'development')).toBe(false);
      expect(checkAndWarnProductionCors(undefined, 'test')).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('does not emit duplicate warnings across multiple calls', () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});

      const firstCall = checkAndWarnProductionCors(undefined, 'production');
      const secondCall = checkAndWarnProductionCors(undefined, 'production');

      expect(firstCall).toBe(true);
      expect(secondCall).toBe(false);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('CORS Express Middleware Integration', () => {
    const buildAppWithCors = (allowedOrigins?: string[]) => {
      const app = express();
      app.use(cors(createCorsOptions(allowedOrigins)));
      app.get('/test-cors', (req, res) => res.json({ ok: true }));
      return app;
    };

    it('allows requests from an allowed origin and sets credentials header', async () => {
      const app = buildAppWithCors(['https://allowed.example.com', 'http://localhost:5173']);

      const res = await request(app)
        .get('/test-cors')
        .set('Origin', 'https://allowed.example.com');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('https://allowed.example.com');
      expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('blocks requests from an unauthorized origin by omitting Access-Control-Allow-Origin', async () => {
      const app = buildAppWithCors(['https://allowed.example.com']);

      const res = await request(app)
        .get('/test-cors')
        .set('Origin', 'https://malicious-site.com');

      expect(res.status).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('uses documented defaults when ALLOWED_ORIGINS is not set', async () => {
      delete process.env.ALLOWED_ORIGINS;
      const app = express();
      app.use(cors(createCorsOptions()));
      app.get('/test-cors', (req, res) => res.json({ ok: true }));

      const resAllowed = await request(app)
        .get('/test-cors')
        .set('Origin', 'http://localhost:5173');

      expect(resAllowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(resAllowed.headers['access-control-allow-credentials']).toBe('true');

      const resBlocked = await request(app)
        .get('/test-cors')
        .set('Origin', 'https://unauthorized-domain.com');

      expect(resBlocked.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('preflight OPTIONS request works for allowed origin and is denied for blocked origin', async () => {
      const app = buildAppWithCors(['https://allowed.com']);

      const resAllowed = await request(app)
        .options('/test-cors')
        .set('Origin', 'https://allowed.com')
        .set('Access-Control-Request-Method', 'POST');

      expect(resAllowed.status).toBe(204);
      expect(resAllowed.headers['access-control-allow-origin']).toBe('https://allowed.com');
      expect(resAllowed.headers['access-control-allow-credentials']).toBe('true');

      const resBlocked = await request(app)
        .options('/test-cors')
        .set('Origin', 'https://blocked.com')
        .set('Access-Control-Request-Method', 'POST');

      expect(resBlocked.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('allows non-CORS requests (no Origin header) to succeed without CORS headers', async () => {
      const app = buildAppWithCors(['https://allowed.com']);

      const res = await request(app).get('/test-cors');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
      expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });
  });
});
