import React, { useState } from 'react';
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
  BookOpen,
  CalendarCheck,
  Layers,
  HeartHandshake,
  CheckCircle2,
  Lock,
  Mail,
  Palette,
  Sun,
  Moon,
  UserPlus,
  Bot,
  Database
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

  const isLiveAI = AIProviderService.isLiveProviderActive();
  const isCloudDB = SupabaseService.isCloudConfigured();

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'student') {
      setEmail('maya.lin@student.waypoint.edu');
    } else if (role === 'parent') {
      setEmail('elena.lin@parent.waypoint.edu');
    } else {
      setEmail('dr.vance@faculty.waypoint.edu');
    }
    setPassword('demo123');
  };

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

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
    const users = BackendService.getUsers();
    const user = users.find(u => u.role === role) || mockAuthUsers.find(u => u.role === role);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient glow shapes */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Floating Controls */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 100,
          background: 'var(--bg-surface-glass)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px'
        }}
      >
        {onOpenAISettings && (
          <button
            onClick={onOpenAISettings}
            className="btn btn-secondary btn-icon"
            title={`AI Engine Config • ${isLiveAI ? 'Live LLM Active' : 'Offline Mode'}`}
            style={{ width: '32px', height: '32px', borderColor: isLiveAI ? '#10b981' : undefined }}
          >
            <Bot size={15} color={isLiveAI ? '#10b981' : 'var(--text-dim)'} />
          </button>
        )}

        {onOpenBackendSettings && (
          <button
            onClick={onOpenBackendSettings}
            className="btn btn-secondary btn-icon"
            title={`Database Config • ${isCloudDB ? 'Supabase Connected' : 'Local Sync'}`}
            style={{ width: '32px', height: '32px', borderColor: isCloudDB ? '#06b6d4' : undefined }}
          >
            <Database size={15} color={isCloudDB ? '#06b6d4' : 'var(--text-dim)'} />
          </button>
        )}

        {onOpenGovernanceMonitor && (
          <button
            onClick={onOpenGovernanceMonitor}
            className="btn btn-secondary btn-icon"
            title="AI Governance & Safety Monitor"
            style={{ width: '32px', height: '32px', borderColor: 'rgba(14, 165, 233, 0.4)' }}
          >
            <ShieldCheck size={15} color="#0ea5e9" />
          </button>
        )}


        <button
          onClick={onOpenThemeModal}
          className="btn btn-secondary btn-icon"
          title="Customize Theme (9 Monochrome Single-Tone Palettes)"
          style={{ width: '32px', height: '32px' }}
        >
          <Palette size={15} color="var(--primary-light)" />
        </button>

        <button
          onClick={onToggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{ width: '32px', height: '32px' }}
        >
          {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#6366f1" />}
        </button>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '1080px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: '32px',
          alignItems: 'stretch'
        }}
      >
        {/* Left Column: Brand & Role Selector */}
        <div
          className="glass-panel"
          style={{
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 8px 20px rgba(99, 102, 241, 0.35)'
                }}
              >
                <Sparkles size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Waypoint AI
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                  Intelligent Learning Architecture
                </div>
              </div>
            </div>

            <h1 style={{ fontSize: '1.95rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '12px' }}>
              Choose your portal gateway to get started
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '28px' }}>
              Curriculum-grounded cognitive learning, live parent-student synchronization, and automated teacher orchestration in one unified ecosystem.
            </p>

            {/* 3 Role Selection Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Student Role Card */}
              <div
                onClick={() => handleRoleChange('student')}
                className={`glass-card interactive ${selectedRole === 'student' ? 'selected-card' : ''}`}
                style={{
                  padding: '18px 20px',
                  border: selectedRole === 'student' ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                  background: selectedRole === 'student' ? 'rgba(99, 102, 241, 0.14)' : 'var(--bg-surface-elevated)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(99, 102, 241, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-light)'
                    }}
                  >
                    <GraduationCap size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>Student Portal</span>
                      <span className="badge badge-indigo">Maya Lin</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Knowledge Graph, Socratic AI Tutor, SM-2 Recall Decks & Career Sims.
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent Role Card */}
              <div
                onClick={() => handleRoleChange('parent')}
                className={`glass-card interactive ${selectedRole === 'parent' ? 'selected-card' : ''}`}
                style={{
                  padding: '18px 20px',
                  border: selectedRole === 'parent' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                  background: selectedRole === 'parent' ? 'rgba(16, 185, 129, 0.14)' : 'var(--bg-surface-elevated)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#34d399'
                    }}
                  >
                    <Users size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>Parent Portal</span>
                      <span className="badge badge-emerald">Linked to Maya & Leo</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Live Attendance (96.8%), multi-subject grade cards, weak areas radar & dinner prompts.
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Role Card */}
              <div
                onClick={() => handleRoleChange('teacher')}
                className={`glass-card interactive ${selectedRole === 'teacher' ? 'selected-card' : ''}`}
                style={{
                  padding: '18px 20px',
                  border: selectedRole === 'teacher' ? '2px solid #06b6d4' : '1px solid var(--border-subtle)',
                  background: selectedRole === 'teacher' ? 'rgba(6, 182, 212, 0.14)' : 'var(--bg-surface-elevated)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(6, 182, 212, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#22d3ee'
                    }}
                  >
                    <Briefcase size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#f8fafc' }}>Teacher Portal</span>
                      <span className="badge badge-cyan">Dr. Eleanor Vance</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      Classroom mastery heatmap, 3-tier differentiated worksheet studio & misconception radar.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security / Trust Notice */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: '24px' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>FERPA & COPPA Compliant • Real-time parent-student grade synchronization</span>
          </div>
        </div>

        {/* Right Column: Interactive Login Form & 1-Click Fast Auth */}
        <div
          className="glass-panel"
          style={{
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ marginBottom: '24px' }}>
            <span
              className={`badge ${
                selectedRole === 'student'
                  ? 'badge-indigo'
                  : selectedRole === 'parent'
                  ? 'badge-emerald'
                  : 'badge-cyan'
              }`}
              style={{ marginBottom: '8px' }}
            >
              Logging in as {selectedRole.toUpperCase()}
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome to Waypoint</h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {selectedRole === 'parent'
                ? 'Sign in to access Maya and Leo\'s full academic profiles, attendance, and weekly recommendations.'
                : selectedRole === 'student'
                ? 'Sign in to continue your calculus mastery path and daily recall streak.'
                : 'Sign in to orchestrate classroom instruction and generate differentiated materials.'}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Account Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                marginTop: '6px',
                fontSize: '0.95rem'
              }}
            >
              <span>Sign In to {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* 1-Click Quick Demo Switcher */}
          <div style={{ margin: '24px 0 16px', textAlign: 'center', position: 'relative' }}>
            <div style={{ height: '1px', background: 'var(--border-subtle)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
            <span style={{ position: 'relative', background: 'var(--bg-glass-card)', padding: '0 12px', fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Instant Demo Access
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin('student')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.8125rem' }}
            >
              <GraduationCap size={15} color="#818cf8" />
              <span>1-Click Login as <strong>Student (Maya Lin)</strong></span>
            </button>

            <button
              type="button"
              onClick={() => handleDirectDemoLogin('parent')}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start', fontSize: '0.8125rem' }}
            >
              <Users size={15} color="#34d399" />
              <span>1-Click Login as <strong>Parent (Elena Lin - Multi-Student)</strong></span>
            </button>

            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'center', marginTop: '4px', borderStyle: 'dashed' }}
            >
              <UserPlus size={15} />
              <span>New to Waypoint? <strong>Create Custom Account</strong></span>
            </button>
          </div>
        </div>
      </div>

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={user => {
          onLogin(user);
        }}
      />
    </div>
  );
};
