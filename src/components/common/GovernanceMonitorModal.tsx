import React, { useState, useEffect } from 'react';
import { AIAuditLogEntry } from '../../types';
import { AuditLogService } from '../../services/auditLogService';
import { VectorService } from '../../services/vectorService';
import { GuardrailService } from '../../services/guardrailService';
import { mockMathConceptNodes, mockPhysicsConceptNodes } from '../../data/mockData';
import {
  ShieldCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Download,
  Trash2,
  RefreshCw,
  Database,
  Search,
  Eye,
  FileText,
  Activity,
  DollarSign,
  Coins,
  TrendingUp,
  BarChart3,
  Users,
  Wallet
} from 'lucide-react';

interface GovernanceMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GovernanceMonitorModal: React.FC<GovernanceMonitorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'cost'>('security');
  const [logs, setLogs] = useState<AIAuditLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pii' | 'rag'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AIAuditLogEntry | null>(null);
  const [isReindexing, setIsReindexing] = useState<boolean>(false);
  const [indexMessage, setIndexMessage] = useState<string | null>(null);

  const stats = AuditLogService.getStats();
  const costAnalytics = AuditLogService.getCostAnalytics();
  const vectorConfig = VectorService.getConfig();

  const refreshLogs = () => {
    setLogs(AuditLogService.getLogs(100));
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (filter === 'flagged' && log.guardrailStatus === 'passed') return false;
    if (filter === 'pii' && (!log.redactedFields || log.redactedFields.length === 0)) return false;
    if (filter === 'rag' && (!log.ragCitations || log.ragCitations.length === 0)) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        log.promptSanitized.toLowerCase().includes(q) ||
        log.userRole.toLowerCase().includes(q) ||
        log.violations.some(v => v.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleClearLogs = () => {
    if (window.confirm('Clear all local AI Governance audit logs?')) {
      AuditLogService.clearLogs();
      refreshLogs();
    }
  };

  const handleExportCSV = () => {
    const csv = AuditLogService.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ai_governance_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReindexVectors = async () => {
    setIsReindexing(true);
    setIndexMessage(null);
    try {
      const allNodes = [...mockMathConceptNodes, ...mockPhysicsConceptNodes];
      const count = await VectorService.indexConceptNodes(allNodes);
      setIndexMessage(`Successfully indexed ${count} concept nodes into Qdrant vector database!`);
      setTimeout(() => setIndexMessage(null), 3000);
    } catch (err: any) {
      setIndexMessage(`Indexing notice: ${err?.message || 'Indexed in local memory'}`);
    } finally {
      setIsReindexing(false);
    }
  };

  const budgetUsagePercent = Math.min(100, Math.round((costAnalytics.projectedMonthlySpendUsd / costAnalytics.budgetCapUsd) * 100));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '960px',
          padding: '28px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 20px rgba(14,165,233,0.35)'
              }}
            >
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Enterprise AI Governance & Cost Monitor
                </h2>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}
                >
                  FERPA & COPPA Shield Active
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Real-time safety guardrail telemetry, token spend analytics, and Qdrant semantic vector index
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* View Switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setActiveTab('security')}
                className="btn btn-sm"
                style={{
                  background: activeTab === 'security' ? 'var(--primary-gradient)' : 'transparent',
                  color: activeTab === 'security' ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  padding: '4px 10px'
                }}
              >
                <ShieldCheck size={14} />
                <span>Security & Telemetry</span>
              </button>
              <button
                onClick={() => setActiveTab('cost')}
                className="btn btn-sm"
                style={{
                  background: activeTab === 'cost' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                  color: activeTab === 'cost' ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  padding: '4px 10px'
                }}
              >
                <DollarSign size={14} />
                <span>Token Spend & Costs</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-icon"
              style={{ width: '34px', height: '34px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* TAB 1: Security & Guardrails Telemetry */}
        {activeTab === 'security' && (
          <>
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={24} color="var(--primary-light)" />
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>{stats.totalRequests}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Audited AI Prompts</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{stats.passedCount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Passed Guardrails</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lock size={24} color="#06b6d4" />
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#22d3ee' }}>{stats.piiRedactionsCount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>PII Fields Redacted</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={24} color="#f43f5e" />
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fda4af' }}>{stats.flaggedCount + stats.blockedCount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Flagged / Blocked</div>
                </div>
              </div>
            </div>

            {/* Vector Index Banner */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={18} color="var(--primary-light)" />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Qdrant Semantic Vector Index: <span style={{ color: 'var(--primary-light)' }}>{vectorConfig.collectionName}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    {vectorConfig.indexedPointsCount || 10} concept nodes indexed • 1536-dim embeddings • RAG Context Injection Active
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReindexVectors}
                disabled={isReindexing}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 12px', fontSize: '0.76rem' }}
              >
                <RefreshCw size={13} className={isReindexing ? 'animate-spin' : ''} />
                <span>{isReindexing ? 'Indexing Vectors...' : 'Sync Qdrant Index'}</span>
              </button>
            </div>

            {indexMessage && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  fontSize: '0.78rem',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                {indexMessage}
              </div>
            )}

            {/* Filters & Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilter('all')}
                  className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  All Logs ({logs.length})
                </button>
                <button
                  onClick={() => setFilter('flagged')}
                  className={`btn btn-sm ${filter === 'flagged' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  Flagged/Blocked ({stats.flaggedCount + stats.blockedCount})
                </button>
                <button
                  onClick={() => setFilter('pii')}
                  className={`btn btn-sm ${filter === 'pii' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  PII Redactions
                </button>
                <button
                  onClick={() => setFilter('rag')}
                  className={`btn btn-sm ${filter === 'rag' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                >
                  RAG Citations
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    placeholder="Search audit trail..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      padding: '6px 10px 6px 30px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      color: 'var(--text-main)',
                      fontSize: '0.78rem',
                      width: '180px'
                    }}
                  />
                </div>

                <button
                  onClick={handleExportCSV}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                  title="Export CSV Audit Trail"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={handleClearLogs}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#f43f5e' }}
                  title="Clear Logs"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Audit Log Table */}
            <div
              style={{
                flex: 1,
                minHeight: '220px',
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface)'
              }}
            >
              {filteredLogs.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <ShieldCheck size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No AI audit logs matching current filter</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Role</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Sanitized Prompt</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Model</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>PII / Violations</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Latency</th>
                      <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600, textAlign: 'center' }}>Inspect</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(entry => (
                      <tr
                        key={entry.id}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background 0.15s ease'
                        }}
                        className="hover-row"
                      >
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            className={`badge ${
                              entry.guardrailStatus === 'passed'
                                ? 'badge-emerald'
                                : entry.guardrailStatus === 'flagged'
                                ? 'badge-amber'
                                : 'badge-rose'
                            }`}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {entry.guardrailStatus}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                          {entry.userRole}
                        </td>
                        <td style={{ padding: '10px 12px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>
                          {entry.promptSanitized}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                          {entry.model}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {entry.redactedFields && entry.redactedFields.length > 0 ? (
                            <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                              PII: {entry.redactedFields.join(', ')}
                            </span>
                          ) : entry.violations && entry.violations.length > 0 ? (
                            <span className="badge badge-rose" style={{ fontSize: '0.68rem' }}>
                              {entry.violations[0]}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>None</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-dim)', fontSize: '0.72rem' }}>
                          {entry.latencyMs}ms
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedLog(entry)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px' }}
                            title="View Full Telemetry Details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* TAB 2: Token Spend & Cost Analytics */}
        {activeTab === 'cost' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', maxHeight: '580px', paddingRight: '4px' }}>
            {/* Top Spend Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Coins size={26} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {costAnalytics.totalTokens.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Total Tokens Consumed</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <DollarSign size={26} color="#34d399" />
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34d399' }}>
                    ${costAnalytics.totalEstimatedCostUsd.toFixed(4)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Total Realized Spend</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingUp size={26} color="#a855f7" />
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#c084fc' }}>
                    ${costAnalytics.projectedMonthlySpendUsd.toFixed(2)}/mo
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Projected Monthly Burn</div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Wallet size={26} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24' }}>
                    ${costAnalytics.budgetCapUsd.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Safety Budget Cap</div>
                </div>
              </div>
            </div>

            {/* Budget Utilization Progress Bar */}
            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Monthly Budget Utilization
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: budgetUsagePercent > 80 ? '#f43f5e' : '#34d399' }}>
                  {budgetUsagePercent}% of ${costAnalytics.budgetCapUsd} Cap
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${budgetUsagePercent}%`,
                    height: '100%',
                    background: budgetUsagePercent > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #06b6d4)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>

            {/* Model & User Spend Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {/* Spend by Model */}
              <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <BarChart3 size={16} color="var(--primary-light)" />
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Spend by Model Architecture</h4>
                </div>

                {costAnalytics.costByModel.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>No model traffic recorded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {costAnalytics.costByModel.map(m => (
                      <div key={m.modelKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.modelName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{m.requestCount} calls • {m.tokens.toLocaleString()} tokens</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#34d399' }}>
                          ${m.costUsd.toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Spend by User / Role */}
              <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Users size={16} color="#38bdf8" />
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Spend by User Account</h4>
                </div>

                {costAnalytics.costByUser.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>No user accounts recorded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {costAnalytics.costByUser.map(u => (
                      <div key={u.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.8rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{u.userId}</span>
                            <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{u.role}</span>
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{u.requestCount} queries • {u.tokens.toLocaleString()} tokens</div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#38bdf8' }}>
                          ${u.costUsd.toFixed(4)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Daily Spend Audit Table */}
            <div className="glass-panel" style={{ padding: '18px', borderRadius: 'var(--radius-lg)' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Daily Spend Log</h4>
              {costAnalytics.dailySpend.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>No daily logs available.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Date</th>
                      <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Queries</th>
                      <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Tokens</th>
                      <th style={{ padding: '8px 12px', color: 'var(--text-dim)' }}>Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costAnalytics.dailySpend.map(d => (
                      <tr key={d.date} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--text-main)', fontWeight: 600 }}>{d.date}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{d.requests}</td>
                        <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{d.tokens.toLocaleString()}</td>
                        <td style={{ padding: '8px 12px', color: '#34d399', fontWeight: 700 }}>${d.costUsd.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Modal: Full Log Detail View */}
        {selectedLog && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              zIndex: 2100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setSelectedLog(null)}
          >
            <div
              className="glass-panel"
              style={{
                width: '100%',
                maxWidth: '640px',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                border: '1px solid var(--border-medium)'
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="var(--primary-light)" />
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Prompt & Safety Trace</h3>
                </div>
                <button onClick={() => setSelectedLog(null)} className="btn btn-ghost btn-sm">
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-dim)' }}>Log ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedLog.id}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-dim)' }}>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong style={{ color: 'var(--text-dim)' }}>User Role / Model:</strong> {selectedLog.userRole} • {selectedLog.model} ({selectedLog.tokensEstimate || 150} tokens, ~${AuditLogService.estimateCost(selectedLog.tokensEstimate || 150, selectedLog.model).toFixed(5)})
                </div>
                <div>
                  <strong style={{ color: 'var(--text-dim)' }}>Original Prompt:</strong>
                  <pre style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', whiteSpace: 'pre-wrap', marginTop: '4px' }}>
                    {selectedLog.promptOriginal}
                  </pre>
                </div>
                <div>
                  <strong style={{ color: 'var(--text-dim)' }}>Sanitized Output Prompt:</strong>
                  <pre style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: '6px', fontSize: '0.78rem', whiteSpace: 'pre-wrap', marginTop: '4px' }}>
                    {selectedLog.promptSanitized}
                  </pre>
                </div>
                {selectedLog.ragCitations && selectedLog.ragCitations.length > 0 && (
                  <div>
                    <strong style={{ color: 'var(--text-dim)' }}>RAG Knowledge Citations:</strong>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      {selectedLog.ragCitations.map((c, i) => (
                        <span key={i} className="badge badge-indigo">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
