import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit } from '../../api/rateLimiter';
import { AIProviderService } from '../services/aiProvider';
import { SupabaseService, SUPABASE_SQL_SCHEMA } from '../services/supabaseClient';

describe('Security, Rate-Limiting & AI Gate Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Serverless In-Memory Rate Limiter', () => {
    it('allows requests within the configured threshold and sets headers', () => {
      const mockReq = {
        headers: { 'x-forwarded-for': '192.168.1.10' },
        socket: { remoteAddress: '192.168.1.10' }
      };
      const headers: Record<string, string> = {};
      const mockRes = {
        setHeader: (k: string, v: string) => { headers[k] = v; },
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      const allowed = checkRateLimit(mockReq, mockRes, {
        maxRequests: 5,
        windowMs: 10000,
        endpointName: 'TestEndpoint'
      });

      expect(allowed).toBe(true);
      expect(headers['X-RateLimit-Limit']).toBe('5');
      expect(headers['X-RateLimit-Remaining']).toBe('4');
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('blocks excessive requests with HTTP 429 when quota exceeded', () => {
      const mockReq = {
        headers: { 'x-user-id': 'user_test_throttled' },
        socket: { remoteAddress: '10.0.0.1' }
      };
      const headers: Record<string, string> = {};
      let responseBody: any = null;
      let statusCode: number = 200;

      const mockRes = {
        setHeader: (k: string, v: string) => { headers[k] = v; },
        status: (code: number) => {
          statusCode = code;
          return {
            json: (body: any) => { responseBody = body; }
          };
        }
      };

      // Send 3 requests with a cap of 2
      const first = checkRateLimit(mockReq, mockRes, { maxRequests: 2, windowMs: 60000, endpointName: 'TestChat' });
      const second = checkRateLimit(mockReq, mockRes, { maxRequests: 2, windowMs: 60000, endpointName: 'TestChat' });
      const third = checkRateLimit(mockReq, mockRes, { maxRequests: 2, windowMs: 60000, endpointName: 'TestChat' });

      expect(first).toBe(true);
      expect(second).toBe(true);
      expect(third).toBe(false);
      expect(statusCode).toBe(429);
      expect(responseBody.error).toContain('Rate limit exceeded');
      expect(headers['Retry-After']).toBeDefined();
    });
  });

  describe('AI Provider Gate (isLiveProviderActive)', () => {
    it('returns false when provider is set to simulated offline mode', () => {
      AIProviderService.saveConfig({
        provider: 'simulated',
        apiKey: '',
        model: 'gpt-4o-mini',
        temperature: 0.7
      });

      expect(AIProviderService.isLiveProviderActive()).toBe(false);
      expect(AIProviderService.getActiveProviderName()).toBe('Deterministic Offline Engine');
    });

    it('returns true when client provides a valid BYOK key', () => {
      AIProviderService.saveConfig({
        provider: 'openai',
        apiKey: 'sk-proj-valid-client-key-1234567890',
        model: 'gpt-4o-mini',
        temperature: 0.7
      });

      expect(AIProviderService.isLiveProviderActive()).toBe(true);
      expect(AIProviderService.getActiveProviderName()).toContain('OpenAI');
    });
  });

  describe('PostgreSQL Row Level Security (RLS) Schema Integrity', () => {
    it('verifies RLS is strictly enabled across all core tables in schema definition', () => {
      expect(SUPABASE_SQL_SCHEMA).toContain('ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;');
      expect(SUPABASE_SQL_SCHEMA).toContain('ALTER TABLE public.concept_nodes ENABLE ROW LEVEL SECURITY;');
      expect(SUPABASE_SQL_SCHEMA).toContain('ALTER TABLE public.recall_cards ENABLE ROW LEVEL SECURITY;');
      expect(SUPABASE_SQL_SCHEMA).toContain('ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;');
      expect(SUPABASE_SQL_SCHEMA).toContain('ALTER TABLE public.student_reports ENABLE ROW LEVEL SECURITY;');
      expect(SUPABASE_SQL_SCHEMA).toContain('ALTER TABLE public.classroom_metrics ENABLE ROW LEVEL SECURITY;');
    });

    it('verifies granular tenant isolation policies exist in schema definition', () => {
      expect(SUPABASE_SQL_SCHEMA).toContain('CREATE POLICY "Users can read own profile"');
      expect(SUPABASE_SQL_SCHEMA).toContain('CREATE POLICY "Students can access own recall cards"');
      expect(SUPABASE_SQL_SCHEMA).toContain('CREATE POLICY "Teachers can modify concept nodes"');
      expect(SUPABASE_SQL_SCHEMA).toContain('CREATE POLICY "Student and Parent report access"');
      expect(SUPABASE_SQL_SCHEMA).toContain('CREATE POLICY "Teachers manage classroom metrics"');
    });
  });
});
