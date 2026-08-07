import React, { useState, useEffect } from 'react';
import { AuthUser, ColorThemeId, UserRole } from '../../types';
import { mockAuthUsers } from '../../data/mockData';
import { BackendService } from '../../services/backendService';
import { AIProviderService } from '../../services/aiProvider';
import { SupabaseService } from '../../services/supabaseClient';
import { RegisterModal } from './RegisterModal';
import {
  GraduationCap,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  Palette,
  Sun,
  Moon,
  Bot,
  Database,
  CheckCircle2,
  Check
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  colorTheme: ColorThemeId;
  onOpenThemeModal: () => void;
  onOpenAISettings?: () => void;
  onOpenBackendSettings?: () => void;
  onOpenGovernanceMonitor?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  theme,
  onToggleTheme,
  colorTheme,
  onOpenThemeModal,
  onOpenAISettings,
  onOpenBackendSettings,
  onOpenGovernanceMonitor
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState<string>('maya.lin@student.waypoint.edu');
  const [password, setPassword] = useState<string>('demo123');
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);

  // Animated handwriting state
  const [revealedLines, setRevealedLines] = useState<number>(0);

  const handwritingContent: Record<UserRole, string[]> = {
    student: [
      'So optimization is really just...',
      '...finding where the derivative',
      'goes flat. The peak of the hill.'
    ],
    teacher: [
      '3 students hit a roadblock on...',
      '...the chain rule inner derivative.',
      'Auto-generating Tier 1 scaffolding now.'
    ],
    parent: [
      'Maya completed 14 recall reviews today...',
      '...mastery in Limits reached 92%.',
      'Sunday weekly email digest scheduled.'
    ]
  };

  useEffect(() => {
    setRevealedLines(0);
    const timers = [
      setTimeout(() => setRevealedLines(1), 300),
      setTimeout(() => setRevealedLines(2), 850),
      setTimeout(() => setRevealedLines(3), 1400)
    ];
    return () => timers.forEach(clearTimeout);
  }, [selectedRole]);

  const handleRoleSelect = (role: UserRole) => {
    if (role === selectedRole) return;
    setIsFlipping(true);
    setTimeout(() => {
      setSelectedRole(role);
      if (role === 'student') {
        setEmail('maya.lin@student.waypoint.edu');
      } else if (role === 'parent') {
        setEmail('elena.lin@parent.waypoint.edu');
      } else {
        setEmail('dr.vance@faculty.waypoint.edu');
      }
      setPassword('demo123');
      setIsFlipping(false);
    }, 240);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      let user = await BackendService.authenticateWithPassword(email.trim(), password);
      if (!user) {
        const users = BackendService.getUsers();
        user = users.find(u => u.role === selectedRole) || mockAuthUsers.find(u => u.role === selectedRole) || null;
      }
      if (user) {
        onLogin(user);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDirectDemoLogin = async (role: UserRole) => {
    setIsLoggingIn(true);
    const users = BackendService.getUsers();
    const user = users.find(u => u.role === role) || mockAuthUsers.find(u => u.role === role);
    if (user) {
      setTimeout(() => onLogin(user), 200);
    } else {
      setIsLoggingIn(false);
    }
  };

  const roleMeta = {
    student: {
      title: 'Pick up your notebook',
      hint: 'Where you left off, exactly.',
      btn: 'Open notebook →',
      stamp: 'Waypoint · Est. session',
      tag: 'TEACH IT BACK TO ME',
      color: '#C4562F',
      feynmanNote: (
        <>
          The <b>Feynman check</b>: if you can't explain optimization without the jargon, the graph shows exactly where the gap is — not just that one exists.
        </>
      )
    },
    teacher: {
      title: 'Pick up the roll book',
      hint: "Your cohort's mastery, at a glance.",
      btn: 'Open roll book →',
      stamp: 'Faculty · Verified',
      tag: 'LIVE COHORT REASONING',
      color: '#2F6F63',
      feynmanNote: (
        <>
          The <b>Classroom diagnostic</b>: real-time topological heatmaps reveal prerequisite gaps across your students before Friday's quiz.
        </>
      )
    },
    parent: {
      title: 'Open the family ledger',
      hint: "Your child's academic milestones & digest.",
      btn: 'Open family ledger →',
      stamp: 'Parent · Guardian',
      tag: 'WEEKLY PROGRESS DIGEST',
      color: '#B08A2E',
      feynmanNote: (
        <>
          The <b>Guardian digest</b>: celebrate genuine conceptual breakthroughs and get dinner-table conversation prompts tailored to weekly lessons.
        </>
      )
    }
  };

  const currentMeta = roleMeta[selectedRole];
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? 'radial-gradient(ellipse at 50% 30%, #171d2d 0%, #0a0d14 100%)'
          : '#ECE5D4',
        fontFamily: "'Inter', sans-serif",
        color: isDark ? '#f8fafc' : '#23281F',
        perspective: '2400px',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Dot Texture */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: isDark
            ? 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)'
            : 'radial-gradient(rgba(35,40,31,0.035) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
          pointerEvents: 'none'
        }}
      />

      {/* Floating Top-Right Utility Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 50
        }}
      >
        {onOpenAISettings && (
          <button
            type="button"
            onClick={onOpenAISettings}
            className="btn btn-ghost btn-icon"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(35,40,31,0.06)',
              color: isDark ? '#94a3b8' : '#5B5F52',
              borderRadius: '8px'
            }}
            title="AI LLM Gateway"
          >
            <Bot size={16} />
          </button>
        )}

        {onOpenBackendSettings && (
          <button
            type="button"
            onClick={onOpenBackendSettings}
            className="btn btn-ghost btn-icon"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(35,40,31,0.06)',
              color: isDark ? '#94a3b8' : '#5B5F52',
              borderRadius: '8px'
            }}
            title="Database & Cloud Sync"
          >
            <Database size={16} />
          </button>
        )}

        {onOpenGovernanceMonitor && (
          <button
            type="button"
            onClick={onOpenGovernanceMonitor}
            className="btn btn-ghost btn-icon"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(35,40,31,0.06)',
              color: isDark ? '#94a3b8' : '#5B5F52',
              borderRadius: '8px'
            }}
            title="AI Governance & Safety Monitor"
          >
            <ShieldCheck size={16} />
          </button>
        )}

        <button
          type="button"
          onClick={onOpenThemeModal}
          className="btn btn-ghost btn-icon"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(35,40,31,0.06)',
            color: isDark ? '#94a3b8' : '#5B5F52',
            borderRadius: '8px'
          }}
          title="Monochrome Theme Palette"
        >
          <Palette size={16} />
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="btn btn-ghost btn-icon"
          style={{
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(35,40,31,0.06)',
            color: isDark ? '#94a3b8' : '#5B5F52',
            borderRadius: '8px'
          }}
          title="Toggle Light / Dark Mode"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* The Open Editorial Notebook */}
      <div
        style={{
          width: 'min(1080px, 94vw)',
          minHeight: 'min(640px, 88vh)',
          display: 'flex',
          flexWrap: 'wrap',
          background: isDark ? '#101522' : '#F3EEE2',
          borderRadius: '8px',
          boxShadow: isDark
            ? '0 40px 100px -20px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)'
            : '0 40px 90px -30px rgba(35,40,31,0.45), 0 0 0 1px rgba(35,40,31,0.06)',
          overflow: 'hidden',
          position: 'relative',
          transition: 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1)',
          transform: isFlipping ? 'rotateY(6deg) scale(0.985)' : 'rotateY(0deg) scale(1)',
          transformOrigin: 'center center'
        }}
      >
        {/* Left Page (Pedagogical Notebook / Feynman Check) */}
        <div
          style={{
            flex: '1.15',
            minWidth: '320px',
            background: isDark ? '#101522' : '#F3EEE2',
            borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #D8CFB8',
            padding: '48px 46px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Masking Tape Accent */}
          <div
            style={{
              position: 'absolute',
              top: '32px',
              right: '50px',
              width: '74px',
              height: '24px',
              background: 'rgba(176,138,46,0.28)',
              transform: 'rotate(-4deg)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          />

          {/* Brand Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '36px' }}>
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: currentMeta.color
              }}
            />
            <div
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: '1.25rem',
                fontWeight: 600,
                letterSpacing: '0.01em',
                color: isDark ? '#f8fafc' : '#23281F'
              }}
            >
              Waypoint <span style={{ color: isDark ? '#94a3b8' : '#5B5F52', fontWeight: 400, fontStyle: 'italic' }}>AI 2.0</span>
            </div>
          </div>

          {/* Pedagogical Prompt Label */}
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: currentMeta.color,
              fontWeight: 700,
              marginBottom: '16px'
            }}
          >
            {currentMeta.tag}
          </div>

          {/* Dynamic Handwritten Reasoning Text */}
          <div
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '32px',
              lineHeight: 1.45,
              color: isDark ? '#f1f5f9' : '#23281F',
              maxWidth: '430px',
              minHeight: '140px'
            }}
          >
            {handwritingContent[selectedRole].map((line, idx) => (
              <div
                key={idx}
                style={{
                  opacity: revealedLines > idx ? 1 : 0,
                  transform: revealedLines > idx ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.3, 1)'
                }}
              >
                {line}
              </div>
            ))}
          </div>

          {/* Bottom Margin Note (Feynman Philosophy) */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '24px',
              borderTop: isDark ? '1px dashed rgba(255,255,255,0.1)' : '1px dashed #D8CFB8',
              fontSize: '13px',
              color: isDark ? '#94a3b8' : '#5B5F52',
              lineHeight: 1.6,
              maxWidth: '400px'
            }}
          >
            {currentMeta.feynmanNote}
          </div>
        </div>

        {/* Right Page (Auth Form & Roll Book) */}
        <div
          style={{
            flex: '1',
            minWidth: '320px',
            padding: '48px 46px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            background: isDark
              ? 'repeating-linear-gradient(#0e1320 0px, #0e1320 37px, rgba(255,255,255,0.04) 38px)'
              : 'repeating-linear-gradient(#F3EEE2 0px, #F3EEE2 37px, #D8CFB8 38px)'
          }}
        >
          {/* Inner Card Container */}
          <div
            style={{
              background: isDark ? '#101522' : '#F3EEE2',
              padding: '12px 16px',
              borderRadius: '6px'
            }}
          >
            {/* 3-Role Notebook Tabs Switcher */}
            <div
              style={{
                display: 'flex',
                borderBottom: isDark ? '2px solid #334155' : '2px solid #23281F',
                position: 'relative',
                marginBottom: '26px'
              }}
            >
              <button
                type="button"
                onClick={() => handleRoleSelect('student')}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: '15px',
                  fontWeight: selectedRole === 'student' ? 700 : 500,
                  padding: '10px 4px 12px',
                  color: selectedRole === 'student' ? (isDark ? '#fff' : '#23281F') : (isDark ? '#64748b' : '#5B5F52'),
                  transition: 'color 0.3s ease'
                }}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('teacher')}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: '15px',
                  fontWeight: selectedRole === 'teacher' ? 700 : 500,
                  padding: '10px 4px 12px',
                  color: selectedRole === 'teacher' ? (isDark ? '#fff' : '#23281F') : (isDark ? '#64748b' : '#5B5F52'),
                  transition: 'color 0.3s ease'
                }}
              >
                Faculty
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('parent')}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Source Serif 4', serif",
                  fontSize: '15px',
                  fontWeight: selectedRole === 'parent' ? 700 : 500,
                  padding: '10px 4px 12px',
                  color: selectedRole === 'parent' ? (isDark ? '#fff' : '#23281F') : (isDark ? '#64748b' : '#5B5F52'),
                  transition: 'color 0.3s ease'
                }}
              >
                Guardian
              </button>

              {/* Animated Sliding Underline */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: 0,
                  width: '33.33%',
                  height: '2px',
                  background: currentMeta.color,
                  transform:
                    selectedRole === 'student'
                      ? 'translateX(0%)'
                      : selectedRole === 'teacher'
                      ? 'translateX(100%)'
                      : 'translateX(200%)',
                  transition: 'transform 0.45s cubic-bezier(0.65, 0, 0.35, 1), background 0.3s ease'
                }}
              />
            </div>

            {/* Title & Hint */}
            <div
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: '24px',
                fontWeight: 600,
                marginBottom: '4px',
                color: isDark ? '#f8fafc' : '#23281F'
              }}
            >
              {currentMeta.title}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: isDark ? '#94a3b8' : '#5B5F52',
                marginBottom: '24px',
                fontStyle: 'italic'
              }}
            >
              {currentMeta.hint}
            </div>

            {/* Login Form */}
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isDark ? '#94a3b8' : '#5B5F52',
                    marginBottom: '6px',
                    fontWeight: 600
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isDark ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid #D8CFB8',
                    padding: '8px 2px 10px',
                    color: isDark ? '#f8fafc' : '#23281F',
                    fontSize: '15px',
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = currentMeta.color)}
                  onBlur={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#D8CFB8')}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: isDark ? '#94a3b8' : '#5B5F52',
                    marginBottom: '6px',
                    fontWeight: 600
                  }}
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: isDark ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid #D8CFB8',
                    padding: '8px 2px 10px',
                    color: isDark ? '#f8fafc' : '#23281F',
                    fontSize: '15px',
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = currentMeta.color)}
                  onBlur={e => (e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.15)' : '#D8CFB8')}
                />
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '13px 0',
                  border: 'none',
                  borderRadius: '4px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: isDark ? '#0a0d14' : '#F3EEE2',
                  background: isDark ? '#f8fafc' : '#23281F',
                  transition: 'background 0.4s ease, transform 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = currentMeta.color)}
                onMouseLeave={e => (e.currentTarget.style.background = isDark ? '#f8fafc' : '#23281F')}
              >
                {isLoggingIn ? 'Verifying credentials...' : currentMeta.btn}
              </button>
            </form>

            {/* Quick Demo Logins Bar */}
            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: isDark ? '1px dashed rgba(255,255,255,0.1)' : '1px dashed #D8CFB8' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.06em', textTransform: 'uppercase', color: isDark ? '#94a3b8' : '#5B5F52', fontWeight: 600, marginBottom: '8px' }}>
                Quick Demo Accounts:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('student')}
                  style={{
                    flex: 1,
                    minWidth: '80px',
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #D8CFB8',
                    background: selectedRole === 'student' ? 'rgba(196,86,47,0.15)' : 'transparent',
                    color: isDark ? '#f8fafc' : '#23281F',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Maya (Student)
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('teacher')}
                  style={{
                    flex: 1,
                    minWidth: '80px',
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #D8CFB8',
                    background: selectedRole === 'teacher' ? 'rgba(47,111,99,0.15)' : 'transparent',
                    color: isDark ? '#f8fafc' : '#23281F',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Dr. Sarah (Faculty)
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectDemoLogin('parent')}
                  style={{
                    flex: 1,
                    minWidth: '80px',
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    borderRadius: '4px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #D8CFB8',
                    background: selectedRole === 'parent' ? 'rgba(176,138,46,0.15)' : 'transparent',
                    color: isDark ? '#f8fafc' : '#23281F',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Eleanor (Guardian)
                </button>
              </div>
            </div>

            {/* Footer Registration Link */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '16px',
                fontSize: '12px',
                color: isDark ? '#94a3b8' : '#5B5F52'
              }}
            >
              New here?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: isDark ? '#f8fafc' : '#23281F',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Request access / Create account
              </button>
            </div>
          </div>

          {/* Rotated Vintage Session Stamp */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '24px',
              fontFamily: "'Source Serif 4', serif",
              fontSize: '10px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: isDark ? 'rgba(255,255,255,0.2)' : '#B8AD94',
              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #D8CFB8',
              borderRadius: '50%',
              width: '74px',
              height: '74px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              transform: 'rotate(-8deg)',
              pointerEvents: 'none',
              opacity: 0.75,
              padding: '6px'
            }}
          >
            {currentMeta.stamp}
          </div>
        </div>
      </div>

      {/* Account Registration Modal */}
      {isRegisterOpen && (
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onRegistered={(newUser: AuthUser) => {
            setIsRegisterOpen(false);
            onLogin(newUser);
          }}
        />
      )}
    </div>
  );
};
