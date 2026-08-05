import React from 'react';
import { ColorThemeId } from '../../types';
import { Check, X, Moon, Sun, Palette } from 'lucide-react';

export interface ThemeOption {
  id: ColorThemeId;
  name: string;
  subname: string;
  swatch: string;
}

export const MONOCHROME_THEMES: ThemeOption[] = [
  { id: 'indigo', name: 'Indigo,', subname: 'single-tone', swatch: '#5d6be8' },
  { id: 'teal', name: 'Teal,', subname: 'single-tone', swatch: '#188b9a' },
  { id: 'emerald', name: 'Emerald,', subname: 'single-tone', swatch: '#2d8659' },
  { id: 'coral', name: 'Coral,', subname: 'single-tone', swatch: '#e66743' },
  { id: 'plum', name: 'Plum,', subname: 'single-tone', swatch: '#8b5597' },
  { id: 'slate', name: 'Slate,', subname: 'single-tone', swatch: '#557088' },
  { id: 'amber', name: 'Amber,', subname: 'single-tone', swatch: '#c8841a' },
  { id: 'rose', name: 'Rose,', subname: 'single-tone', swatch: '#be4f69' },
  { id: 'graphite', name: 'Graphite,', subname: 'single-tone', swatch: '#424855' },
];

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColorTheme: ColorThemeId;
  onSelectColorTheme: (themeId: ColorThemeId) => void;
  themeMode: 'dark' | 'light';
  onToggleThemeMode: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentColorTheme,
  onSelectColorTheme,
  themeMode,
  onToggleThemeMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: themeMode === 'light' ? '#ffffff' : '#141824',
          borderRadius: '20px',
          border: themeMode === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5), 0 0 24px var(--primary-glow)',
          padding: '24px',
          position: 'relative',
          animation: 'scaleUp 0.2s ease-out',
          color: themeMode === 'light' ? '#0f172a' : '#f8fafc'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: themeMode === 'light' ? '#64748b' : '#94a3b8'
              }}
            >
              THEME
            </span>
            <span style={{ color: themeMode === 'light' ? '#94a3b8' : '#64748b', fontSize: '0.8125rem' }}>•</span>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: themeMode === 'light' ? '#64748b' : '#94a3b8'
              }}
            >
              9
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: themeMode === 'light' ? '#64748b' : '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title="Close theme selector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '18px'
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: themeMode === 'light' ? '#64748b' : '#94a3b8',
              whiteSpace: 'nowrap'
            }}
          >
            MONOCHROME
          </span>
          <div
            style={{
              flex: 1,
              height: '1px',
              background: themeMode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)'
            }}
          />
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: themeMode === 'light' ? '#94a3b8' : '#64748b'
            }}
          >
            9
          </span>
        </div>

        {/* 2-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          {MONOCHROME_THEMES.map((theme) => {
            const isSelected = currentColorTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectColorTheme(theme.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  border: isSelected
                    ? `1.5px solid ${theme.swatch}`
                    : themeMode === 'light'
                    ? '1px solid #e2e8f0'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected
                    ? themeMode === 'light'
                      ? `${theme.swatch}12`
                      : `${theme.swatch}24`
                    : themeMode === 'light'
                    ? '#ffffff'
                    : 'rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  outline: 'none',
                  boxShadow: isSelected
                    ? `0 4px 12px ${theme.swatch}33`
                    : '0 1px 3px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = theme.swatch;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = themeMode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'none';
                  }
                }}
              >
                {/* Color Swatch Box */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: theme.swatch,
                    flexShrink: 0,
                    boxShadow: `0 2px 8px ${theme.swatch}66`
                  }}
                />

                {/* Text Label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: themeMode === 'light' ? '#0f172a' : '#f1f5f9',
                      lineHeight: 1.2
                    }}
                  >
                    {theme.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: themeMode === 'light' ? '#475569' : '#94a3b8',
                      lineHeight: 1.2
                    }}
                  >
                    {theme.subname}
                  </div>
                </div>

                {/* Selected Checkmark */}
                {isSelected && (
                  <div
                    style={{
                      color: theme.swatch,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Check size={16} strokeWidth={2.8} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Light/Dark Mode Selector & Confirmation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: themeMode === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: themeMode === 'light' ? '#64748b' : '#94a3b8' }}>
              Base Mode:
            </span>
            <button
              onClick={onToggleThemeMode}
              className="btn btn-sm btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                fontSize: '0.75rem',
                borderRadius: '8px'
              }}
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun size={13} color="#fbbf24" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Moon size={13} color="#6366f1" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="btn btn-sm btn-primary"
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '0.8125rem'
            }}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
