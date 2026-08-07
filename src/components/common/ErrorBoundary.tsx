import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--bg-main, #0a0d14)',
            color: 'var(--text-main, #f8fafc)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: 'var(--font-body, system-ui, sans-serif)'
          }}
        >
          <div
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'rgba(16, 21, 34, 0.85)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f43f5e'
                }}
              >
                <AlertOctagon size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Something went wrong
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Waypoint encountered an unexpected runtime exception.
                </span>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '0.8rem',
                color: '#fda4af',
                fontFamily: 'monospace',
                marginBottom: '20px',
                maxHeight: '160px',
                overflowY: 'auto'
              }}
            >
              {this.state.error?.message || 'Unknown error occurred'}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={this.handleReset}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={16} />
                <span>Reload Application</span>
              </button>

              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
                title="Clears local cache and resets to default demo state"
              >
                <Home size={16} />
                <span>Reset State</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
