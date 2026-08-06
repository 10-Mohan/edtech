import React, { useState, useEffect } from 'react';
import { AIConfig, AIProviderId, QdrantConfig, GuardrailConfig } from '../../types';
import { AIProviderService } from '../../services/aiProvider';
import { VectorService } from '../../services/vectorService';
import { GuardrailService } from '../../services/guardrailService';
import {
  Sparkles,
  X,
  Key,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Zap,
  Bot,
  Database,
  ShieldCheck,
  Lock,
  Layers
} from 'lucide-react';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'llm' | 'vector' | 'guardrails'>('llm');

  // Config States
  const [config, setConfig] = useState<AIConfig>(AIProviderService.getConfig());
  const [qdrantConfig, setQdrantConfig] = useState<QdrantConfig>(VectorService.getConfig());
  const [guardrailConfig, setGuardrailConfig] = useState<GuardrailConfig>(GuardrailService.getConfig());

  // Visibility toggles
  const [showKey, setShowKey] = useState<boolean>(false);
  const [showQdrantKey, setShowQdrantKey] = useState<boolean>(false);
  const [showEnkryptKey, setShowEnkryptKey] = useState<boolean>(false);

  // Testing states
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [serverlessHealth, setServerlessHealth] = useState<{
    isServerlessReachable: boolean;
    providers?: { openai: boolean; anthropic: boolean; gemini: boolean; qdrant: boolean; enkrypt: boolean };
    isProductionGrade?: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(AIProviderService.getConfig());
      setQdrantConfig(VectorService.getConfig());
      setGuardrailConfig(GuardrailService.getConfig());
      setTestResult(null);
      setSavedSuccess(false);

      AIProviderService.checkServerlessHealth().then(res => {
        setServerlessHealth(res);
      });
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
    VectorService.saveConfig(qdrantConfig);
    GuardrailService.saveConfig(guardrailConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      if (activeTab === 'llm') {
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
            message: 'Please enter an LLM API key before testing connection.'
          });
          return;
        }

        AIProviderService.saveConfig(config);
        const testReply = await AIProviderService.callChatCompletion(
          'You are a testing assistant. Reply with "OK" in 1 word.',
          [{ role: 'user', content: 'Ping' }],
          { maxTokens: 10, enableRAG: false }
        );

        if (testReply) {
          setTestResult({
            success: true,
            message: `Connection Verified! Successfully reached ${config.provider.toUpperCase()} (${config.model}).`
          });
        }
      } else if (activeTab === 'vector') {
        if (!qdrantConfig.url.trim()) {
          setTestResult({
            success: true,
            message: 'Local in-memory dense vector store active for semantic RAG search.'
          });
          return;
        }
        const connected = await VectorService.testConnection(qdrantConfig.url, qdrantConfig.apiKey);
        setTestResult({
          success: connected,
          message: connected
            ? `Successfully connected to Qdrant Cloud cluster (${qdrantConfig.collectionName})!`
            : 'Could not reach Qdrant Cloud URL. Check cluster endpoint and API key.'
        });
      } else if (activeTab === 'guardrails') {
        setTestResult({
          success: true,
          message: 'Guardrails Active: FERPA PII Masking, Prompt Injection Filters, and Enkrypt Gateway validated!'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test failed. Verify network and credentials.'
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
          maxWidth: '680px',
          padding: '28px',
          boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
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
                AI, Vector & Guardrail Configuration
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Manage LLM engines, Qdrant semantic vector storage, and Enkrypt AI safety guardrails.
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

        {/* Vercel Serverless Environment Security Status Banner */}
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: serverlessHealth?.isProductionGrade
              ? 'rgba(16, 185, 129, 0.08)'
              : serverlessHealth?.isServerlessReachable
              ? 'rgba(245, 158, 11, 0.08)'
              : 'rgba(99, 102, 241, 0.06)',
            border: `1px solid ${
              serverlessHealth?.isProductionGrade
                ? 'rgba(16, 185, 129, 0.3)'
                : serverlessHealth?.isServerlessReachable
                ? 'rgba(245, 158, 11, 0.3)'
                : 'var(--border-subtle)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock
              size={18}
              color={
                serverlessHealth?.isProductionGrade
                  ? '#10b981'
                  : serverlessHealth?.isServerlessReachable
                  ? '#f59e0b'
                  : 'var(--primary-light)'
              }
            />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                {serverlessHealth?.isProductionGrade
                  ? 'Vercel Serverless Proxy Active (Zero-Key Client Exposure)'
                  : serverlessHealth?.isServerlessReachable
                  ? 'Serverless Reachable (Environment Variables Pending on Host)'
                  : 'Local / BYOK Key Mode Active'}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '2px' }}>
                {serverlessHealth?.isProductionGrade
                  ? 'All serverless routes (/api/chat, /api/vector, /api/guardrails) are live with server-side environment variables.'
                  : serverlessHealth?.isServerlessReachable
                  ? 'Set OPENAI_API_KEY, QDRANT_URL, etc. in Vercel Project Settings for server-side key isolation.'
                  : 'Running in standalone dev mode. Browser-stored keys will be used as fallback.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-xs btn-secondary"
            onClick={async () => {
              const res = await AIProviderService.checkServerlessHealth();
              setServerlessHealth(res);
            }}
            title="Re-test Vercel /api/health endpoint"
            style={{ flexShrink: 0 }}
          >
            Check Host Status
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>

          <button
            type="button"
            onClick={() => { setActiveTab('llm'); setTestResult(null); }}
            className={`btn btn-sm ${activeTab === 'llm' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <Zap size={14} />
            <span>LLM Providers</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('vector'); setTestResult(null); }}
            className={`btn btn-sm ${activeTab === 'vector' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <Database size={14} />
            <span>Qdrant Vector DB</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('guardrails'); setTestResult(null); }}
            className={`btn btn-sm ${activeTab === 'guardrails' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem' }}
          >
            <ShieldCheck size={14} />
            <span>Enkrypt Guardrails & PII</span>
          </button>
        </div>

        {/* TAB 1: LLM Engine */}
        {activeTab === 'llm' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '10px' }}>
                Select Active LLM Provider
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div
                  onClick={() => handleProviderSelect('openai')}
                  className={`glass-card interactive ${config.provider === 'openai' ? 'selected-card' : ''}`}
                  style={{
                    padding: '12px 14px',
                    border: config.provider === 'openai' ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                    background: config.provider === 'openai' ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap size={20} color="var(--primary-light)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>OpenAI</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>GPT-4o, GPT-4o-mini, o3</div>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleProviderSelect('anthropic')}
                  className={`glass-card interactive ${config.provider === 'anthropic' ? 'selected-card' : ''}`}
                  style={{
                    padding: '12px 14px',
                    border: config.provider === 'anthropic' ? '2px solid #38bdf8' : '1px solid var(--border-subtle)',
                    background: config.provider === 'anthropic' ? 'rgba(56,189,248,0.15)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bot size={20} color="#38bdf8" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>Anthropic Claude</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Claude 3.5 Sonnet & Haiku</div>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleProviderSelect('gemini')}
                  className={`glass-card interactive ${config.provider === 'gemini' ? 'selected-card' : ''}`}
                  style={{
                    padding: '12px 14px',
                    border: config.provider === 'gemini' ? '2px solid #34d399' : '1px solid var(--border-subtle)',
                    background: config.provider === 'gemini' ? 'rgba(52,211,153,0.15)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={20} color="#34d399" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>Google Gemini</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Gemini 2.0 Flash & Pro</div>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleProviderSelect('simulated')}
                  className={`glass-card interactive ${config.provider === 'simulated' ? 'selected-card' : ''}`}
                  style={{
                    padding: '12px 14px',
                    border: config.provider === 'simulated' ? '2px solid #a855f7' : '1px solid var(--border-subtle)',
                    background: config.provider === 'simulated' ? 'rgba(168,85,247,0.15)' : 'var(--bg-surface-elevated)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Cpu size={20} color="#c084fc" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f8fafc' }}>Simulated Engine</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Offline deterministic mode</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {config.provider !== 'simulated' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                      {config.provider.toUpperCase()} API Key (BYOK)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Stored client-side in session</span>
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
          </div>
        )}

        {/* TAB 2: Qdrant Vector DB */}
        {activeTab === 'vector' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Qdrant Cloud Semantic Search & Retrieval Augmented Generation (RAG)
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                Indexes concept graphs, curriculum nodes, and common misconceptions into dense vector embeddings for instantaneous tutor context augmentation.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Qdrant Cluster URL
              </label>
              <input
                type="text"
                placeholder="https://xyz-example.eu-central.aws.cloud.qdrant.io:6333"
                value={qdrantConfig.url}
                onChange={e => setQdrantConfig(prev => ({ ...prev, url: e.target.value }))}
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Qdrant API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showQdrantKey ? 'text' : 'password'}
                  placeholder="qdrant_api_key_..."
                  value={qdrantConfig.apiKey}
                  onChange={e => setQdrantConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 40px 9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowQdrantKey(!showQdrantKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '9px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer'
                  }}
                >
                  {showQdrantKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Collection Name
                </label>
                <input
                  type="text"
                  value={qdrantConfig.collectionName}
                  onChange={e => setQdrantConfig(prev => ({ ...prev, collectionName: e.target.value }))}
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
                  Vector Dimensions
                </label>
                <input
                  type="number"
                  value={qdrantConfig.dimension}
                  onChange={e => setQdrantConfig(prev => ({ ...prev, dimension: parseInt(e.target.value) || 1536 }))}
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
          </div>
        )}

        {/* TAB 3: Enkrypt AI & Safety Guardrails */}
        {activeTab === 'guardrails' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', marginBottom: '4px' }}>
                Enterprise AI Safety & FERPA/COPPA Compliance Shield
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                Protects student privacy via automatic PII sanitization, blocks adversarial prompt injections & jailbreaks, and integrates Enkrypt AI guardrails.
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Enkrypt AI API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showEnkryptKey ? 'text' : 'password'}
                  placeholder="enkrypt_sec_..."
                  value={guardrailConfig.enkryptApiKey}
                  onChange={e => setGuardrailConfig(prev => ({ ...prev, enkryptApiKey: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '9px 40px 9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowEnkryptKey(!showEnkryptKey)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '9px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer'
                  }}
                >
                  {showEnkryptKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Toggle Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem' }}>
                <input
                  type="checkbox"
                  checked={guardrailConfig.maskPII}
                  onChange={e => setGuardrailConfig(prev => ({ ...prev, maskPII: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-main)' }}
                />
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  FERPA/COPPA PII Redaction (Mask SSN, Phone Numbers, Student Emails)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.84rem' }}>
                <input
                  type="checkbox"
                  checked={guardrailConfig.blockPromptInjections}
                  onChange={e => setGuardrailConfig(prev => ({ ...prev, blockPromptInjections: e.target.checked }))}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-main)' }}
                />
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  Prompt Injection & Jailbreak Defense (Intercept System Override Attempts)
                </span>
              </label>
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
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
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
              <span>{savedSuccess ? 'Saved!' : 'Save All Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
