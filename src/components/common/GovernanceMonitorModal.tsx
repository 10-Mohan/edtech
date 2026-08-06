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
  Activity
} from 'lucide-react';

interface GovernanceMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GovernanceMonitorModal: React.FC<GovernanceMonitorModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AIAuditLogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'pii' | 'rag'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AIAuditLogEntry | null>(null);
  const [isReindexing, setIsReindexing] = useState<boolean>(false);
  const [indexMessage, setIndexMessage] = useState<string | null>(null);

  const stats = AuditLogService.getStats();
  const vectorConfig = VectorService.getConfig();
  const guardrailConfig = GuardrailService.getConfig();

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
          maxWidth: '920px',
          padding: '28px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
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
                  Enterprise AI Governance & Guardrails Monitor
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
                Real-time safety guardrail telemetry, PII masking logs, and Qdrant semantic vector index
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '34px', height: '34px' }}
          >
            <X size={16} />
          </button>
        </div>

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
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
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.3)'
          }}
        >
          {filteredLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No audit log entries matching filter. Interact with Socratic Tutor or Homework Scanner to stream telemetry.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Sanitized Prompt</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Violations / PII</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600 }}>Latency</th>
                  <th style={{ padding: '10px 12px', color: 'var(--text-dim)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  const isBlocked = log.guardrailStatus === 'blocked';
                  const isFlagged = log.guardrailStatus === 'flagged';
                  return (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isBlocked ? 'rgba(244, 63, 94, 0.05)' : isFlagged ? 'rgba(245, 158, 11, 0.05)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '8px 12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '8px 12px', textTransform: 'capitalize', fontWeight: 600 }}>
                        {log.userRole}
                      </td>
                      <td style={{ padding: '8px 12px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.promptSanitized}
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: isBlocked ? 'rgba(244, 63, 94, 0.15)' : isFlagged ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: isBlocked ? '#fda4af' : isFlagged ? '#fbbf24' : '#34d399'
                          }}
                        >
                          {log.guardrailStatus.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {log.violations.map(v => (
                            <span key={v} style={{ fontSize: '0.65rem', background: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', padding: '1px 5px', borderRadius: '4px' }}>
                              {v}
                            </span>
                          ))}
                          {log.redactedFields?.map(p => (
                            <span key={p} style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', padding: '1px 5px', borderRadius: '4px' }}>
                              PII: {p}
                            </span>
                          ))}
                          {log.violations.length === 0 && (!log.redactedFields || log.redactedFields.length === 0) && (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.7rem' }}>None</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                        {log.latencyMs}ms
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Log Inspector Modal Drawer */}
        {selectedLog && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Audit Log Inspection: {selectedLog.id}</span>
              <button onClick={() => setSelectedLog(null)} className="btn btn-secondary btn-sm" style={{ padding: '2px 6px' }}>Close</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <strong style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>ORIGINAL USER PROMPT:</strong>
                <pre style={{ margin: 0, padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', whiteSpace: 'pre-wrap', maxHeight: '70px', overflowY: 'auto' }}>
                  {selectedLog.promptOriginal}
                </pre>
              </div>
              <div>
                <strong style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.72rem' }}>SANITIZED & REDACTED PROMPT:</strong>
                <pre style={{ margin: 0, padding: '8px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', whiteSpace: 'pre-wrap', maxHeight: '70px', overflowY: 'auto' }}>
                  {selectedLog.promptSanitized}
                </pre>
              </div>
            </div>
            {selectedLog.ragCitations && selectedLog.ragCitations.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>
                <strong>Qdrant RAG Citations:</strong> {selectedLog.ragCitations.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
