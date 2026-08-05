import React from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

/**
 * Utility to render inline and block math-formatted strings cleanly
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by math delimiters: $...$ or $$...$$
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$.+?\$)/g);

  return (
    <span className={`math-text-container ${className}`}>
      {parts.map((part, idx) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2).trim();
          return (
            <div
              key={idx}
              className="my-3 py-2 px-4 rounded-lg font-mono text-cyan-300 bg-surface-elevated border border-subtle overflow-x-auto text-center"
              style={{
                background: 'rgba(22, 29, 48, 0.7)',
                color: '#67e8f9',
                fontFamily: 'var(--font-mono)',
                margin: '10px 0',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {math}
            </div>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1).trim();
          return (
            <span
              key={idx}
              className="inline-block px-1.5 py-0.5 rounded font-mono text-cyan-300 bg-opacity-20"
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                color: '#22d3ee',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.92em',
                borderRadius: '4px',
                padding: '1px 6px',
                margin: '0 2px'
              }}
            >
              {math}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
};
