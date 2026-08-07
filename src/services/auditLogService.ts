import { AIAuditLogEntry, SafetyViolationType, UserRole } from '../types';

const AUDIT_LOG_KEY = 'waypoint_ai_audit_logs';
const MAX_STORED_LOGS = 500;

// Blended token rates per 1,000 tokens (USD) based on official API pricing
export const MODEL_PRICING: Record<string, { name: string; costPer1kTokens: number }> = {
  'gpt-4o-mini': { name: 'OpenAI GPT-4o Mini', costPer1kTokens: 0.0003 },
  'gpt-4o': { name: 'OpenAI GPT-4o', costPer1kTokens: 0.0075 },
  'claude-3-5-haiku-20241022': { name: 'Anthropic Claude 3.5 Haiku', costPer1kTokens: 0.0015 },
  'claude-3-5-sonnet-20241022': { name: 'Anthropic Claude 3.5 Sonnet', costPer1kTokens: 0.009 },
  'gemini-2.0-flash': { name: 'Google Gemini 2.0 Flash', costPer1kTokens: 0.0002 },
  'gemini-1.5-pro': { name: 'Google Gemini 1.5 Pro', costPer1kTokens: 0.0025 },
  'default': { name: 'Standard LLM', costPer1kTokens: 0.0005 }
};

export interface ModelSpendSummary {
  modelKey: string;
  modelName: string;
  requestCount: number;
  tokens: number;
  costUsd: number;
}

export interface UserSpendSummary {
  userId: string;
  role: UserRole;
  requestCount: number;
  tokens: number;
  costUsd: number;
}

export interface DailySpendEntry {
  date: string;
  requests: number;
  tokens: number;
  costUsd: number;
}

export interface CostAnalytics {
  totalRequests: number;
  totalTokens: number;
  totalEstimatedCostUsd: number;
  costByModel: ModelSpendSummary[];
  costByUser: UserSpendSummary[];
  dailySpend: DailySpendEntry[];
  projectedMonthlySpendUsd: number;
  budgetCapUsd: number;
}

export const AuditLogService = {
  getLogs(limit: number = 100): AIAuditLogEntry[] {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) return [];
    try {
      const logs: AIAuditLogEntry[] = JSON.parse(raw);
      return logs.slice(0, limit);
    } catch (e) {
      return [];
    }
  },

  recordLog(params: {
    userId: string;
    userRole: UserRole;
    promptOriginal: string;
    promptSanitized: string;
    ragCitations?: string[];
    guardrailStatus: 'passed' | 'flagged' | 'blocked';
    violations: SafetyViolationType[];
    redactedFields: string[];
    riskScore: number;
    latencyMs: number;
    tokensEstimate: number;
    model: string;
    provider: string;
    responseSnippet?: string;
  }): AIAuditLogEntry {
    const entry: AIAuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...params
    };

    const currentLogs = this.getLogs(MAX_STORED_LOGS);
    const updated = [entry, ...currentLogs].slice(0, MAX_STORED_LOGS);
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(updated));

    return entry;
  },

  clearLogs(): void {
    localStorage.removeItem(AUDIT_LOG_KEY);
  },

  estimateCost(tokens: number, model: string): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING.default;
    return (tokens / 1000) * pricing.costPer1kTokens;
  },

  getStats(): {
    totalRequests: number;
    passedCount: number;
    flaggedCount: number;
    blockedCount: number;
    piiRedactionsCount: number;
    avgLatencyMs: number;
  } {
    const logs = this.getLogs(MAX_STORED_LOGS);
    if (logs.length === 0) {
      return {
        totalRequests: 0,
        passedCount: 0,
        flaggedCount: 0,
        blockedCount: 0,
        piiRedactionsCount: 0,
        avgLatencyMs: 0
      };
    }

    let passed = 0;
    let flagged = 0;
    let blocked = 0;
    let piiCount = 0;
    let totalLatency = 0;

    logs.forEach(l => {
      if (l.guardrailStatus === 'passed') passed++;
      else if (l.guardrailStatus === 'flagged') flagged++;
      else if (l.guardrailStatus === 'blocked') blocked++;

      if (l.redactedFields && l.redactedFields.length > 0) {
        piiCount += l.redactedFields.length;
      }
      totalLatency += l.latencyMs;
    });

    return {
      totalRequests: logs.length,
      passedCount: passed,
      flaggedCount: flagged,
      blockedCount: blocked,
      piiRedactionsCount: piiCount,
      avgLatencyMs: Math.round(totalLatency / logs.length)
    };
  },

  getCostAnalytics(): CostAnalytics {
    const logs = this.getLogs(MAX_STORED_LOGS);

    let totalTokens = 0;
    let totalEstimatedCostUsd = 0;

    const modelMap: Record<string, { requestCount: number; tokens: number; costUsd: number }> = {};
    const userMap: Record<string, { role: UserRole; requestCount: number; tokens: number; costUsd: number }> = {};
    const dateMap: Record<string, { requests: number; tokens: number; costUsd: number }> = {};

    logs.forEach(log => {
      const tokens = log.tokensEstimate || 150;
      const model = log.model || 'gpt-4o-mini';
      const cost = this.estimateCost(tokens, model);

      totalTokens += tokens;
      totalEstimatedCostUsd += cost;

      // Model breakdown
      if (!modelMap[model]) {
        modelMap[model] = { requestCount: 0, tokens: 0, costUsd: 0 };
      }
      modelMap[model].requestCount += 1;
      modelMap[model].tokens += tokens;
      modelMap[model].costUsd += cost;

      // User breakdown
      const uid = log.userId || 'student_demo';
      if (!userMap[uid]) {
        userMap[uid] = { role: log.userRole, requestCount: 0, tokens: 0, costUsd: 0 };
      }
      userMap[uid].requestCount += 1;
      userMap[uid].tokens += tokens;
      userMap[uid].costUsd += cost;

      // Daily breakdown
      const dateKey = log.timestamp ? log.timestamp.substring(0, 10) : new Date().toISOString().substring(0, 10);
      if (!dateMap[dateKey]) {
        dateMap[dateKey] = { requests: 0, tokens: 0, costUsd: 0 };
      }
      dateMap[dateKey].requests += 1;
      dateMap[dateKey].tokens += tokens;
      dateMap[dateKey].costUsd += cost;
    });

    const costByModel: ModelSpendSummary[] = Object.entries(modelMap).map(([modelKey, val]) => ({
      modelKey,
      modelName: MODEL_PRICING[modelKey]?.name || modelKey,
      requestCount: val.requestCount,
      tokens: val.tokens,
      costUsd: Number(val.costUsd.toFixed(4))
    }));

    const costByUser: UserSpendSummary[] = Object.entries(userMap).map(([userId, val]) => ({
      userId,
      role: val.role,
      requestCount: val.requestCount,
      tokens: val.tokens,
      costUsd: Number(val.costUsd.toFixed(4))
    }));

    const dailySpend: DailySpendEntry[] = Object.entries(dateMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, val]) => ({
        date,
        requests: val.requests,
        tokens: val.tokens,
        costUsd: Number(val.costUsd.toFixed(4))
      }));

    // If no daily logs exist yet, provide a baseline estimate
    const daysCount = Math.max(1, dailySpend.length);
    const avgDailyCost = totalEstimatedCostUsd / daysCount;
    const projectedMonthlySpendUsd = Number((avgDailyCost * 30).toFixed(2));

    return {
      totalRequests: logs.length,
      totalTokens,
      totalEstimatedCostUsd: Number(totalEstimatedCostUsd.toFixed(4)),
      costByModel,
      costByUser,
      dailySpend,
      projectedMonthlySpendUsd,
      budgetCapUsd: 50.0 // Default $50/mo safety threshold
    };
  },

  exportCSV(): string {
    const logs = this.getLogs(MAX_STORED_LOGS);
    const headers = ['Timestamp', 'User Role', 'Status', 'Risk Score', 'Violations', 'PII Redacted', 'Latency (ms)', 'Model', 'Tokens', 'Cost USD', 'Sanitized Prompt'];
    const rows = logs.map(l => {
      const tokens = l.tokensEstimate || 150;
      const cost = this.estimateCost(tokens, l.model).toFixed(5);
      return [
        l.timestamp,
        l.userRole,
        l.guardrailStatus,
        l.riskScore.toFixed(2),
        `"${l.violations.join(', ')}"`,
        `"${l.redactedFields.join(', ')}"`,
        l.latencyMs,
        l.model,
        tokens,
        cost,
        `"${l.promptSanitized.replace(/"/g, '""').substring(0, 80)}"`
      ];
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
