import { AIAuditLogEntry, SafetyViolationType, UserRole } from '../types';

const AUDIT_LOG_KEY = 'waypoint_ai_audit_logs';
const MAX_STORED_LOGS = 200;

export const AuditLogService = {
  getLogs(limit: number = 50): AIAuditLogEntry[] {
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

  exportCSV(): string {
    const logs = this.getLogs(MAX_STORED_LOGS);
    const headers = ['Timestamp', 'User Role', 'Status', 'Risk Score', 'Violations', 'PII Redacted', 'Latency (ms)', 'Model', 'Sanitized Prompt'];
    const rows = logs.map(l => [
      l.timestamp,
      l.userRole,
      l.guardrailStatus,
      l.riskScore.toFixed(2),
      `"${l.violations.join(', ')}"`,
      `"${l.redactedFields.join(', ')}"`,
      l.latencyMs,
      l.model,
      `"${l.promptSanitized.replace(/"/g, '""').substring(0, 80)}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
};
