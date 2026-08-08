import React from 'react';
import { AuthUser, ColorThemeId, StudentClassroomMetric, UserProfile, UserRole } from '../../types';
import { BackendService } from '../../services/backendService';
import {
  Compass,
  Flame,
  Moon,
  Sun,
  Award,
  Zap,
  GraduationCap,
  Users,
  Briefcase,
  LogOut,
  Palette,
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  profile: UserProfile;
  currentUser: AuthUser | null;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  colorTheme: ColorThemeId;
  onOpenThemeModal: () => void;
  onOpenDiagnostic: () => void;
  onOpenAISettings?: () => void;
  currentStudentId?: string;
  onSwitchStudent?: (studentId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  profile,
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
  colorTheme,
  onOpenThemeModal,
  onOpenDiagnostic,
  onOpenAISettings,
  currentStudentId,
  onSwitchStudent
}) => {
  const allStudents = BackendService.getClassroomMetrics();

  return (
    <header
      style={{
        height: '72px',
        background: 'var(--bg-surface-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Platform Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px var(--primary-glow)',
            color: 'white'
          }}
        >
          <Compass size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em' }}>
              Waypoint
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              AI 2.0
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
            Adaptive Diagnostic & Mastery Platform
          </p>
        </div>
      </div>

      {/* Center Portal / Student Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {currentRole === 'student' && onSwitchStudent && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--border-highlight)'
            }}
          >
            <GraduationCap size={16} color="var(--primary-light)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Active Student:
            </span>
            <select
              value={currentStudentId || 'st_01'}
              onChange={e => onSwitchStudent(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary-light)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {allStudents.map(st => (
                <option key={st.studentId} value={st.studentId} style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                  {st.studentName} ({st.grade || '11th Grade'})
                </option>
              ))}
            </select>
          </div>
        )}

        {currentRole === 'parent' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--border-highlight)'
            }}
          >
            <Users size={16} color="var(--primary-light)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Parent Guardian Portal ({allStudents.length} Students Synchronized)
            </span>
          </div>
        )}

        {currentRole === 'teacher' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-subtle)',
              border: '1px solid var(--border-highlight)'
            }}
          >
            <Briefcase size={16} color="var(--primary-light)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Teacher Orchestration Cockpit • AP STEM ({allStudents.length} Enrolled)
            </span>
          </div>
        )}
      </div>

      {/* User Stats & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Diagnostic Launch (Student only) */}
        {currentRole === 'student' && (
          <button
            onClick={onOpenDiagnostic}
            className="btn btn-sm btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Zap size={14} />
            <span>Gap Diagnostic</span>
          </button>
        )}

        {/* Streak Counter (Student only) */}
        {currentRole === 'student' && (
          <div
            className="badge badge-amber"
            style={{
              padding: '6px 12px',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Daily Active Streak"
          >
            <Flame size={16} color="var(--primary-light)" fill="var(--primary-light)" />
            <span>{profile.streakDays} Days</span>
          </div>
        )}

        {/* XP & Level Pill (Student only) */}
        {currentRole === 'student' && (
          <div
            style={{
              background: 'var(--primary-surface)',
              border: '1px solid var(--primary-border)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Award size={16} color="var(--primary-light)" />
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--primary-light)' }}>Lvl {profile.level}</span>
              <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>•</span>
              <span>{profile.xp} XP</span>
            </div>
          </div>
        )}

        {/* AI Engine & API Key Settings */}
        {onOpenAISettings && (
          <button
            onClick={onOpenAISettings}
            className="btn btn-secondary btn-sm"
            title="Configure AI Engine & API Keys (Gemini, GPT-4o, Claude, Qdrant, Enkrypt)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderColor: 'var(--border-highlight)',
              background: 'var(--primary-subtle)',
              color: 'var(--primary-light)'
            }}
          >
            <Sparkles size={14} />
            <span>AI Settings</span>
          </button>
        )}

        {/* 9-Color Theme Palette Picker */}
        <button
          onClick={onOpenThemeModal}
          className="btn btn-secondary btn-icon"
          title="Customize Theme • 9 Monochrome Single-Tone Palettes"
          style={{
            width: '38px',
            height: '38px',
            position: 'relative',
            borderColor: 'var(--border-highlight)'
          }}
        >
          <Palette size={17} color="var(--primary-light)" />
          <span
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: '0 0 6px var(--primary-glow)'
            }}
          />
        </button>

        {/* Dark / Light Base Mode Toggle */}
        <button
          onClick={onToggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{ width: '38px', height: '38px' }}
        >
          {theme === 'dark' ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#6366f1" />}
        </button>

        {/* User Badge & Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-surface-elevated)',
            padding: '4px 12px 4px 6px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-medium)'
          }}
        >
          <img
            src={currentUser?.avatar || profile.avatar}
            alt={currentUser?.name || profile.name}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {currentUser?.name || profile.name || (currentRole === 'student' ? 'Maya Lin' : currentRole === 'parent' ? 'Elena Lin' : 'Dr. Vance')}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              {currentRole === 'parent' ? 'Parent Account' : currentRole === 'student' ? 'Student Account' : 'Faculty Account'}
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={onLogout}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            color: '#fda4af'
          }}
          title="Sign out to switch account or portal"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
