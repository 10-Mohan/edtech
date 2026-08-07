import React, { useState } from 'react';
import { CloudBackendConfig, CloudProviderId } from '../../types';
import { SupabaseService, SUPABASE_SQL_SCHEMA } from '../../services/supabaseClient';
import { BackendService } from '../../services/backendService';
import {
  Database,
  X,
  Server,
  Cloud,
  HardDrive,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { ServiceHealthBanner } from './ServiceHealthBanner';

interface BackendSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendSettingsModal: React.FC<BackendSettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<CloudBackendConfig>(SupabaseService.getConfig());
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleProviderSelect = (provider: CloudProviderId) => {
    setConfig(prev => ({
      ...prev,
      provider,
      isConnected: provider === 'local' ? true : prev.isConnected
    }));
    setTestResult(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestConnection = async () => {
    if (config.provider === 'local') {
      setTestResult({
        success: true,
        message: 'Persistent Local Database with Real-time BroadcastChannel active.'
      });
      return;
    }

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      setTestResult({
        success: false,
        message: 'Please provide both your Supabase Project URL and Anon API Key.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const isConnected = await SupabaseService.testSupabaseConnection(
      config.supabaseUrl,
      config.supabaseAnonKey
    );

    setIsTesting(false);
    if (isConnected) {
      const updated = {
        ...config,
        isConnected: true,
        lastSyncedAt: new Date().toLocaleTimeString()
      };
      setConfig(updated);
      SupabaseService.saveConfig(updated);
      setTestResult({
        success: true,
        message: 'Successfully connected to live Supabase Postgres backend!'
      });
    } else {
      setTestResult({
        success: false,
        message: 'Could not reach Supabase endpoint. Check URL and CORS permissions.'
      });
    }
  };

  const handleSave = () => {
    SupabaseService.saveConfig(config);
    BackendService.initSupabaseRealtime();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '640px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 18px rgba(16,185,129,0.3)'
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Database & Backend Architecture
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Live multi-tenant synchronization across Student, Teacher, and Parent portals.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Service Health Banner */}
        <ServiceHealthBanner />

        {/* Backend Provider Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '10px' }}>
            Select Database Infrastructure
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {/* Supabase */}
            <div
              onClick={() => handleProviderSelect('supabase')}
              className={`glass-card interactive ${config.provider === 'supabase' ? 'selected-card' : ''}`}
              style={{
                padding: '14px',
                border: config.provider === 'supabase' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                background: config.provider === 'supabase' ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface-elevated)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Cloud size={20} color="#34d399" />
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>Supabase / Postgres</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Managed cloud DB + RLS</div>
              </div>
            </div>

            {/* Firebase */}
            <div
              onClick={() => handleProviderSelect('firebase')}
              className={`glass-card interactive ${config.provider === 'firebase' ? 'selected-card' : ''}`}
              style={{
                padding: '14px',
                border: config.provider === 'firebase' ? '2px solid #f59e0b' : '1px solid var(--border-subtle)',
                background: config.provider === 'firebase' ? 'rgba(245,158,11,0.15)' : 'var(--bg-surface-elevated)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Server size={20} color="#fbbf24" />
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>Firebase Firestore</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Realtime document store</div>
              </div>
            </div>

            {/* Local Sync */}
            <div
              onClick={() => handleProviderSelect('local')}
              className={`glass-card interactive ${config.provider === 'local' ? 'selected-card' : ''}`}
              style={{
                padding: '14px',
                border: config.provider === 'local' ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                background: config.provider === 'local' ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface-elevated)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <HardDrive size={20} color="var(--primary-light)" />
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>BroadcastChannel Sync</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Zero-config multi-role</div>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Config Inputs */}
        {config.provider === 'supabase' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={config.supabaseUrl || ''}
                onChange={e => setConfig(prev => ({ ...prev, supabaseUrl: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={config.supabaseAnonKey || ''}
                onChange={e => setConfig(prev => ({ ...prev, supabaseAnonKey: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>
        )}

        {/* SQL Schema Preview & Copy */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>
              Database Migration DDL (PostgreSQL Schema)
            </span>
            <button
              onClick={handleCopySql}
              className="btn btn-secondary btn-sm"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {copiedSql ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Schema'}</span>
            </button>
          </div>

          <pre
            style={{
              maxHeight: '120px',
              overflowY: 'auto',
              background: 'rgba(0,0,0,0.5)',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontFamily: 'monospace',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.82rem',
              background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: testResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
              color: testResult.success ? '#34d399' : '#fda4af'
            }}
          >
            {testResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Pinging Cloud...' : 'Verify Cloud Sync'}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <CheckCircle2 size={14} />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
