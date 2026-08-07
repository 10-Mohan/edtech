import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  minHeight?: string;
  fullscreen?: boolean;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = 'Loading workspace module...',
  minHeight = '300px',
  fullscreen = false
}) => {
  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--bg-main, #0a0d14)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--primary-gradient, linear-gradient(135deg, #6366f1, #a855f7))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Loader2 size={24} className="animate-spin" />
        </div>
        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main, #f8fafc)' }}>
          {message}
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        borderRadius: 'var(--radius-lg, 16px)',
        gap: '14px',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.06))'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(99, 102, 241, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-light, #818cf8)'
        }}
      >
        <Loader2 size={20} className="animate-spin" />
      </div>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim, #94a3b8)', fontWeight: 500 }}>
        {message}
      </span>
    </div>
  );
};
