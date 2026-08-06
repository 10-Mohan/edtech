import { GuardrailCheckResult, GuardrailConfig, SafetyViolationType, UserRole } from '../types';

const GUARDRAIL_CONFIG_KEY = 'waypoint_guardrail_config';

export const DEFAULT_GUARDRAIL_CONFIG: GuardrailConfig = {
  provider: 'hybrid',
  enkryptApiKey: (import.meta as any).env?.VITE_ENKRYPT_API_KEY || '',
  enkryptEndpoint: 'https://api.enkryptai.com/v1/guardrails',
  maskPII: true,
  blockPromptInjections: true,
  contentSafetyThreshold: 'strict'
};

// Known Prompt Injection & Jailbreak Heuristics
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?(previous|prior)\s+(instructions|directives)/i,
  /system\s+override/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /\b(dan\s+mode|jailbreak|jailbroken)\b/i,
  /reveal\s+(the\s+|your\s+)?(system\s+prompt|initial\s+prompt|hidden\s+rules)/i,
  /what\s+(is|are)\s+your\s+(exact\s+)?(system\s+instructions|system\s+prompt)/i,
  /bypass\s+(the\s+)?(guardrails|safety\s+filters|moderation)/i,
  /act\s+as\s+an\s+unfiltered\s+ai/i,
  /pretend\s+you\s+have\s+no\s+(rules|restrictions|ethics)/i
];

// PII Regex Patterns for FERPA & COPPA Compliance
const PII_PATTERNS = [
  { name: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[REDACTED_SSN]' },
  { name: 'PHONE', regex: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, replacement: '[REDACTED_PHONE]' },
  { name: 'CREDIT_CARD', regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g, replacement: '[REDACTED_FINANCIAL_CARD]' },
  { name: 'PERSONAL_EMAIL', regex: /\b[A-Za-z0-9._%+-]+@(?!waypoint\.edu)[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replacement: '[REDACTED_PERSONAL_EMAIL]' }
];

export const GuardrailService = {
  getConfig(): GuardrailConfig {
    const data = localStorage.getItem(GUARDRAIL_CONFIG_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_GUARDRAIL_CONFIG,
          ...parsed,
          enkryptApiKey: parsed.enkryptApiKey || DEFAULT_GUARDRAIL_CONFIG.enkryptApiKey
        };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_GUARDRAIL_CONFIG;
  },

  saveConfig(config: GuardrailConfig): void {
    localStorage.setItem(GUARDRAIL_CONFIG_KEY, JSON.stringify(config));
  },

  isEnkryptConfigured(): boolean {
    const cfg = this.getConfig();
    return !!(cfg.enkryptApiKey && cfg.enkryptApiKey.trim());
  },

  // -------------------------------------------------------------
  // PII Detection & FERPA/COPPA Redaction
  // -------------------------------------------------------------
  sanitizePII(text: string): { sanitized: string; redactedFields: string[] } {
    let sanitized = text;
    const redactedFields: string[] = [];

    PII_PATTERNS.forEach(({ name, regex, replacement }) => {
      if (regex.test(sanitized)) {
        redactedFields.push(name);
        sanitized = sanitized.replace(regex, replacement);
      }
    });

    return { sanitized, redactedFields };
  },

  // -------------------------------------------------------------
  // Prompt Injection & Jailbreak Defense
  // -------------------------------------------------------------
  detectPromptInjection(text: string): { isInjected: boolean; violation?: SafetyViolationType; score: number } {
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        return {
          isInjected: true,
          violation: 'PROMPT_INJECTION',
          score: 0.95
        };
      }
    }

    // Check for system prompt extraction attempt
    if (/repeat\s+(everything\s+)?above/i.test(text) || /print\s+system\s+message/i.test(text)) {
      return {
        isInjected: true,
        violation: 'SYSTEM_PROMPT_EXTRACTION',
        score: 0.88
      };
    }

    return { isInjected: false, score: 0.0 };
  },

  // -------------------------------------------------------------
  // Enkrypt AI Remote Pre-flight Validation
  // -------------------------------------------------------------
  async callEnkryptCheck(text: string, stage: 'pre_flight' | 'post_generation'): Promise<Partial<GuardrailCheckResult> | null> {
    const cfg = this.getConfig();
    if (!this.isEnkryptConfigured() && cfg.provider !== 'enkrypt') return null;

    try {
      // 1. Try serverless backend proxy (/api/guardrails)
      const res = await fetch('/api/guardrails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          stage,
          apiKey: cfg.enkryptApiKey,
          endpoint: cfg.enkryptEndpoint
        })
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Continue to local verification
    }

    return null;
  },

  // -------------------------------------------------------------
  // Comprehensive Pre-flight Input Gatekeeper
  // -------------------------------------------------------------
  async validateAndSanitizeInput(
    text: string,
    userRole: UserRole = 'student'
  ): Promise<GuardrailCheckResult> {
    const config = this.getConfig();
    const violations: SafetyViolationType[] = [];
    const redactedFields: string[] = [];
    let sanitizedText = text;
    let riskScore = 0.0;

    // 1. PII Scanning
    if (config.maskPII) {
      const piiRes = this.sanitizePII(text);
      sanitizedText = piiRes.sanitized;
      if (piiRes.redactedFields.length > 0) {
        violations.push('PII_DETECTED');
        redactedFields.push(...piiRes.redactedFields);
        riskScore = Math.max(riskScore, 0.45);
      }
    }

    // 2. Prompt Injection Scanning
    if (config.blockPromptInjections) {
      const injectionRes = this.detectPromptInjection(text);
      if (injectionRes.isInjected && injectionRes.violation) {
        violations.push(injectionRes.violation);
        riskScore = Math.max(riskScore, injectionRes.score);
      }
    }

    // 3. Remote Enkrypt AI check if configured
    const enkryptRes = await this.callEnkryptCheck(sanitizedText, 'pre_flight');
    if (enkryptRes) {
      if (enkryptRes.violations && enkryptRes.violations.length > 0) {
        violations.push(...enkryptRes.violations);
      }
      if (enkryptRes.riskScore) {
        riskScore = Math.max(riskScore, enkryptRes.riskScore);
      }
    }

    const isBlocked = violations.includes('PROMPT_INJECTION') ||
      violations.includes('SYSTEM_PROMPT_EXTRACTION') ||
      violations.includes('JAILBREAK_ATTEMPT') ||
      riskScore >= 0.85;

    return {
      passed: violations.length === 0,
      blocked: isBlocked,
      sanitizedText: isBlocked
        ? 'I am unable to fulfill requests that attempt to bypass pedagogical safety boundaries or extract system instructions. How can I help you master your current STEM topic?'
        : sanitizedText,
      violations,
      redactedFields,
      riskScore,
      reason: isBlocked ? 'Safety guardrail triggered (Prompt injection or system rule extraction attempt).' : undefined,
      enkryptScanId: `enk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
  },

  // -------------------------------------------------------------
  // Post-generation Output Gatekeeper
  // -------------------------------------------------------------
  async validateOutput(responseText: string): Promise<GuardrailCheckResult> {
    const config = this.getConfig();
    const violations: SafetyViolationType[] = [];
    const redactedFields: string[] = [];
    let sanitizedText = responseText;
    let riskScore = 0.0;

    // Mask any PII that might have been mirrored
    if (config.maskPII) {
      const piiRes = this.sanitizePII(responseText);
      sanitizedText = piiRes.sanitized;
      if (piiRes.redactedFields.length > 0) {
        redactedFields.push(...piiRes.redactedFields);
      }
    }

    return {
      passed: violations.length === 0,
      blocked: false,
      sanitizedText,
      violations,
      redactedFields,
      riskScore,
      enkryptScanId: `enk_out_${Date.now()}`
    };
  }
};
