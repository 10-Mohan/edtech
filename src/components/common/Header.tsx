import React from 'react';
import { AuthUser, UserProfile, UserRole } from '../../types';
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
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  profile: UserProfile;
  currentUser: AuthUser | null;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenDiagnostic: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  profile,
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
  onOpenDiagnostic
}) => {
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

      {/* Role Switcher Pill */}
      <div
        style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '4px',
          display: 'flex',
          gap: '4px'
        }}
      >
        <button
          onClick={() => onRoleChange('student')}
          className="btn btn-sm"
          style={{
            background: currentRole === 'student' ? 'var(--primary-gradient)' : 'transparent',
            color: currentRole === 'student' ? '#fff' : 'var(--text-muted)',
            boxShadow: currentRole === 'student' ? '0 2px 10px var(--primary-glow)' : 'none',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px'
          }}
        >
          <GraduationCap size={15} />
          <span>Student</span>
        </button>

        <button
          onClick={() => onRoleChange('parent')}
          className="btn btn-sm"
          style={{
            background: currentRole === 'parent' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
            color: currentRole === 'parent' ? '#fff' : 'var(--text-muted)',
            boxShadow: currentRole === 'parent' ? '0 2px 10px var(--accent-emerald-glow)' : 'none',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px'
          }}
        >
          <Users size={15} />
          <span>Parent (Maya Lin)</span>
        </button>

        <button
          onClick={() => onRoleChange('teacher')}
          className="btn btn-sm"
          style={{
            background: currentRole === 'teacher' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'transparent',
            color: currentRole === 'teacher' ? '#fff' : 'var(--text-muted)',
            boxShadow: currentRole === 'teacher' ? '0 2px 10px var(--secondary-glow)' : 'none',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px'
          }}
        >
          <Briefcase size={15} />
          <span>Teacher</span>
        </button>
      </div>

      {/* User Stats & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
            <Flame size={16} color="#f59e0b" fill="#f59e0b" />
            <span>{profile.streakDays} Days</span>
          </div>
        )}

        {/* XP & Level Pill (Student only) */}
        {currentRole === 'student' && (
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Award size={16} color="#818cf8" />
            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--primary-light)' }}>Lvl {profile.level}</span>
              <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>•</span>
              <span>{profile.xp} XP</span>
            </div>
          </div>
        )}

        {/* Theme Toggle */}
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
              {currentUser?.name || (currentRole === 'student' ? 'Maya Lin' : currentRole === 'parent' ? 'Elena Lin' : 'Dr. Vance')}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
              {currentRole === 'parent' ? 'Parent of Maya' : currentRole === 'student' ? 'Grade 11 AP' : 'STEM Faculty'}
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
          title="Sign out and return to role selection"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
