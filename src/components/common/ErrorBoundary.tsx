import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home, Copy, Check, ChevronDown, ChevronUp, LifeBuoy, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  isSection?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false, showDetails: false });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  private handleCopyDiagnostics = async () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorMessage: this.state.error?.message || 'Unknown error',
      errorStack: this.state.error?.stack || 'No stack trace available',
      componentStack: this.state.errorInfo?.componentStack || 'No component stack available',
      storageKeys: Object.keys(localStorage)
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    } catch (e) {
      console.warn('Failed to copy error report to clipboard:', e);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isSection = this.props.isSection;

      return (
        <div
          style={{
            minHeight: isSection ? '280px' : '100vh',
            background: isSection ? 'transparent' : 'var(--bg-main, #0a0d14)',
            color: 'var(--text-main, #f8fafc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isSection ? '16px' : '24px',
            fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)'
          }}
        >
          <div
            className="glass-panel animate-scale-up"
            style={{
              maxWidth: isSection ? '100%' : '620px',
              width: '100%',
              background: 'rgba(16, 21, 34, 0.92)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              borderRadius: 'var(--radius-xl, 16px)',
              padding: isSection ? '20px' : '32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(16px)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f43f5e',
                  flexShrink: 0
                }}
              >
                <AlertOctagon size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {isSection ? 'Component Rendering Error' : 'Unexpected Application Exception'}
                </h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dim, #94a3b8)' }}>
                  Waypoint caught a runtime issue. Your session data is safely preserved.
                </span>
              </div>
            </div>

            {/* Error Message Box */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '0.82rem',
                color: '#fda4af',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                marginBottom: '16px',
                lineHeight: 1.4
              }}
            >
              {this.state.error?.message || 'An unknown runtime error occurred in this view.'}
            </div>

            {/* Expandable Technical Details */}
            <div style={{ marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim, #94a3b8)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{this.state.showDetails ? 'Hide' : 'Show'} Technical Stack Trace</span>
              </button>

              {this.state.showDetails && (
                <div
                  className="animate-fade-in"
                  style={{
                    marginTop: '8px',
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    maxHeight: '160px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {this.state.error?.stack || 'No stack trace available'}
                  {this.state.errorInfo?.componentStack}
                </div>
              )}
            </div>

            {/* Actionable Buttons Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              <button
                type="button"
                onClick={this.handleRetry}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  fontSize: '0.84rem'
                }}
              >
                <RefreshCw size={15} />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  fontSize: '0.84rem'
                }}
              >
                <RotateCcw size={15} />
                <span>Reload App</span>
              </button>

              <button
                type="button"
                onClick={this.handleCopyDiagnostics}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  fontSize: '0.84rem',
                  color: this.state.copied ? '#10b981' : undefined
                }}
                title="Copy error details for developers or support"
              >
                {this.state.copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
                <span>{this.state.copied ? 'Copied!' : 'Copy Info'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="btn btn-ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  fontSize: '0.84rem',
                  color: '#94a3b8'
                }}
                title="Clears local cache and resets application state"
              >
                <Home size={15} />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
