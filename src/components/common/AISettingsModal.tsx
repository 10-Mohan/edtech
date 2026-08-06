import React, { useState, useEffect } from 'react';
import { AIConfig, AIProviderId } from '../../types';
import { AIProviderService } from '../../services/aiProvider';
import {
  Sparkles,
  X,
  Key,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Bot
} from 'lucide-react';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AIConfig>(AIProviderService.getConfig());
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(AIProviderService.getConfig());
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderSelect = (provider: AIProviderId) => {
    let defaultModel = config.model;
    if (provider === 'openai') defaultModel = 'gpt-4o-mini';
    else if (provider === 'anthropic') defaultModel = 'claude-3-5-haiku-20241022';
    else if (provider === 'gemini') defaultModel = 'gemini-2.0-flash';

    setConfig(prev => ({
      ...prev,
      provider,
      model: defaultModel
    }));
    setTestResult(null);
  };

  const handleSave = () => {
    AIProviderService.saveConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleTestConnection = async () => {
    if (config.provider === 'simulated') {
      setTestResult({
        success: true,
        message: 'Offline High-Fidelity Pedagogical Simulator active. Zero external API calls required!'
      });
      return;
    }

    if (!config.apiKey.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter an API key before testing connection.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Temporarily test with candidate config
      AIProviderService.saveConfig(config);
      const testReply = await AIProviderService.callChatCompletion(
        'You are a testing assistant. Reply with "OK" in 1 word.',
        [{ role: 'user', content: 'Ping' }],
        { maxTokens: 10 }
      );

      if (testReply) {
        setTestResult({
          success: true,
          message: `Connection Verified! Successfully reached ${config.provider.toUpperCase()} (${config.model}).`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test failed. Verify your key and permissions.'
      });
    } finally {
      setIsTesting(false);
    }
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
          maxWidth: '620px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
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
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 18px rgba(99,102,241,0.3)'
              }}
            >
              <Cpu size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                AI Engine & LLM Configuration
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Connect real OpenAI, Claude, or Gemini models for Socratic dialogues and OCR vision parsing.
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

        {/* Provider Selection Cards */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '10px' }}>
            Select AI Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {/* OpenAI */}
            <div
              onClick={() => handleProviderSelect('openai')}
              className={`glass-card interactive ${config.provider === 'openai' ? 'selected-card' : ''}`}
              style={{
                padding: '14px',
                border: config.provider === 'openai' ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                background: config.provider === 'openai' ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface-elevated)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={20} color="var(--primary-light)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>OpenAI</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>GPT-4o, GPT-4o-mini, o3</div>
                </div>
              </div>
            </div>

            {/* Anthropic */}
            <div
              onClick={() => handleProviderSelect('anthropic')}
              className={`glass-card interactive ${config.provider === 'anthropic' ? 'selected-card' : ''}`}
              style={{
                padding: '14px',
                border: config.provider === 'anthropic' ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
                background: config.provider === 'anthropic' ? 'rgba(56,189,248,0.15)' : 'var(--bg-surface-elevated)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bot size={20} color="#38bdf8" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>Anthropic Claude</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Claude 3.5 Sonnet & Haiku</div>
                </div>
              </div>
            </div>

            {/* Google Gemini */}
            <div
              onClick={() => handleProviderSelect('gemini')}
              className={`glass-card interactive ${config.provider === 'gemini' ? 'selected-card' : ''}`}
              style={{
                padding: '14px',
                border: config.provider === 'gemini' ? '2px solid #34d399' : '1px solid var(--border-subtle)',
                background: config.provider === 'gemini' ? 'rgba(52,211,153,0.15)' : 'var(--bg-surface-elevated)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} color="#34d399" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>Google Gemini</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Gemini 2.0 Flash & Pro</div>
                </div>
              </div>
            </div>

            {/* Simulated Offline */}
            <div
              onClick={() => handleProviderSelect('simulated')}
              className={`glass-card interactive ${config.provider === 'simulated' ? 'selected-card' : ''}`}
              style={{
                padding: '14px',
                border: config.provider === 'simulated' ? '2px solid #a855f7' : '1px solid var(--border-subtle)',
                background: config.provider === 'simulated' ? 'rgba(168,85,247,0.15)' : 'var(--bg-surface-elevated)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cpu size={20} color="#c084fc" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>Simulated Engine</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Offline first principles mode</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Key & Model Configuration */}
        {config.provider !== 'simulated' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                  {config.provider.toUpperCase()} API Key
                </label>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Stored locally in browser session</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                <input
                  type={showKey ? 'text' : 'password'}
                  placeholder={`sk-... (${config.provider} API key)`}
                  value={config.apiKey}
                  onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer'
                  }}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Model ID
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
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
                  Temperature: {config.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.temperature}
                  onChange={e => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  style={{ width: '100%', marginTop: '6px', accentColor: 'var(--primary-main)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Test Result Message */}
        {testResult && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.82rem',
              background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              border: testResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
              color: testResult.success ? '#34d399' : '#fda4af'
            }}
          >
            {testResult.success ? <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <Sliders size={14} />
            <span>{isTesting ? 'Testing Ping...' : 'Test Connection'}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <CheckCircle2 size={14} />
              <span>{savedSuccess ? 'Saved!' : 'Save & Activate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
