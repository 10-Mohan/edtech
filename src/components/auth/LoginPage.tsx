import React, { useState, useEffect, useRef } from 'react';
import { AuthUser, ColorThemeId, UserRole } from '../../types';
import { BackendService } from '../../services/backendService';
import { RegisterModal } from './RegisterModal';
import { Palette, Sun, Moon, AlertCircle } from 'lucide-react';

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
  onOpenThemeModal
}) => {
  const [role, setRole] = useState<'student' | 'faculty' | 'parent'>('student');
  const [email, setEmail] = useState<string>('maya.lin@student.waypoint.edu');
  const [password, setPassword] = useState<string>('demo123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [linesRevealed, setLinesRevealed] = useState<number>(0);
  const bookRef = useRef<HTMLDivElement>(null);

  const getHandwritingLines = () => {
    if (role === 'faculty') {
      return [
        'Chain Rule internal derivatives...',
        '...flagged for 3 students today.',
        'Tier 1 scaffolded worksheets ready.'
      ];
    }
    if (role === 'parent') {
      return [
        'Maya mastered Limits & Derivatives...',
        '...and is bridging to Optimization.',
        'Attendance: 96.8% · 3h 45m active recall.'
      ];
    }
    return [
      'So optimization is really just...',
      '...finding where the derivative',
      'goes flat. The peak of the hill.'
    ];
  };

  const handwritingLines = getHandwritingLines();

  useEffect(() => {
    setLinesRevealed(0);
    const timers = [
      setTimeout(() => setLinesRevealed(1), 300),
      setTimeout(() => setLinesRevealed(2), 700),
      setTimeout(() => setLinesRevealed(3), 1100)
    ];
    return () => timers.forEach(clearTimeout);
  }, [role]);

  const handleRoleToggle = (targetRole: 'student' | 'faculty' | 'parent') => {
    if (targetRole === role) return;
    setLoginError(null);

    if (bookRef.current) {
      bookRef.current.style.transition = 'transform .45s cubic-bezier(.65,0,.35,1)';
      bookRef.current.style.transformOrigin = 'center center';
      bookRef.current.style.transform = 'rotateY(4deg) scale(0.99)';
    }

    setTimeout(() => {
      setRole(targetRole);
      if (targetRole === 'faculty') {
        setEmail('dr.vance@faculty.waypoint.edu');
      } else if (targetRole === 'parent') {
        setEmail('elena.lin@parent.waypoint.edu');
      } else {
        setEmail('maya.lin@student.waypoint.edu');
      }
      setPassword('demo123');

      if (bookRef.current) {
        bookRef.current.style.transform = 'rotateY(0deg) scale(1)';
      }
    }, 200);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const targetUserRole: UserRole =
        role === 'faculty' ? 'teacher' : role === 'parent' ? 'parent' : 'student';
      const user = await BackendService.authenticateWithPassword(email.trim(), password, targetUserRole);
      onLogin(user);
    } catch (err: any) {
      console.warn('Login validation failed:', err.message);
      setLoginError(err?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickLogin = async (target: 'student_maya' | 'parent_elena' | 'student_leo' | 'parent_david' | 'teacher_vance') => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      let demoEmail = 'maya.lin@student.waypoint.edu';
      if (target === 'teacher_vance') {
        demoEmail = 'dr.vance@faculty.waypoint.edu';
        setRole('faculty');
      } else if (target === 'parent_elena') {
        demoEmail = 'elena.lin@parent.waypoint.edu';
        setRole('parent');
      } else if (target === 'parent_david') {
        demoEmail = 'david.chen@parent.waypoint.edu';
        setRole('parent');
      } else if (target === 'student_leo') {
        demoEmail = 'leo.chen@student.waypoint.edu';
        setRole('student');
      } else {
        demoEmail = 'maya.lin@student.waypoint.edu';
        setRole('student');
      }
      
      setEmail(demoEmail);
      setPassword('demo123');

      const user = await BackendService.authenticateWithPassword(demoEmail, 'demo123');
      onLogin(user);
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={`waypoint-notebook-wrapper ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <style>{`
        .waypoint-notebook-wrapper {
          --paper: #F3EEE2;
          --paper2: #ECE5D4;
          --ink: #23281F;
          --ink-soft: #5B5F52;
          --rule: #D8CFB8;
          --teal: #2F6F63;
          --coral: #C4562F;
          --gold: #B08A2E;

          box-sizing: border-box;
          margin: 0;
          padding: 24px 16px;
          min-height: 100vh;
          width: 100vw;
          background: var(--paper2);
          font-family: 'Inter', sans-serif;
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: background-color 0.4s ease, color 0.4s ease;
        }

        .waypoint-notebook-wrapper.dark-mode {
          --paper: #1c1f1a;
          --paper2: #141712;
          --ink: #ECE5D4;
          --ink-soft: #9da394;
          --rule: #2f362a;
          --teal: #459a8b;
          --coral: #e06f48;
          --gold: #d4aa43;
        }

        .waypoint-notebook-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(35,40,31,0.06) 1px, transparent 1px);
          background-size: 16px 16px;
          pointer-events: none;
        }
        .waypoint-notebook-wrapper.dark-mode::before {
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
        }

        .nb-controls {
          position: fixed;
          top: 20px;
          right: 24px;
          display: flex;
          gap: 10px;
          z-index: 50;
        }
        .nb-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--paper);
          border: 1px solid var(--rule);
          color: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .nb-icon-btn:hover {
          transform: translateY(-2px);
          border-color: var(--ink-soft);
        }

        .book {
          width: min(1080px, 92vw);
          min-height: min(640px, 88vh);
          display: flex;
          background: var(--paper);
          border-radius: 6px;
          box-shadow: 0 40px 90px -30px rgba(35,40,31,0.45), 0 0 0 1px rgba(35,40,31,0.06);
          overflow: hidden;
          animation: settle 1s cubic-bezier(.16,1,.3,1) both;
          position: relative;
        }
        .dark-mode .book {
          box-shadow: 0 40px 100px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07);
        }

        @keyframes settle {
          from { opacity: 0; transform: translateY(24px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .page-left {
          flex: 1.15;
          background: var(--paper);
          border-right: 1px solid var(--rule);
          padding: 48px 46px;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .page-left::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          right: -1px;
          width: 24px;
          background: linear-gradient(90deg, transparent, rgba(35,40,31,0.05));
          pointer-events: none;
        }
        .dark-mode .page-left::after {
          background: linear-gradient(90deg, transparent, rgba(0,0,0,0.3));
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 40px;
        }
        .brand-mark {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--coral);
          transition: background 0.3s ease;
        }
        .faculty .brand-mark {
          background: var(--teal);
        }
        .parent .brand-mark {
          background: var(--gold);
        }

        .brand-word {
          font-family: 'Source Serif 4', serif;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: var(--ink);
        }
        .brand-word span {
          color: var(--ink-soft);
          font-weight: 400;
          font-style: italic;
        }

        .prompt-label {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--coral);
          font-weight: 600;
          margin-bottom: 16px;
          transition: color 0.3s ease;
        }
        .faculty .prompt-label {
          color: var(--teal);
        }
        .parent .prompt-label {
          color: var(--gold);
        }

        .handwrite {
          font-family: 'Caveat', cursive;
          font-size: 30px;
          line-height: 1.45;
          color: var(--ink);
          max-width: 420px;
          min-height: 140px;
        }
        .hw-line {
          display: block;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity .5s ease, transform .5s cubic-bezier(.2,.8,.3,1);
        }
        .hw-line.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .margin-note {
          margin-top: auto;
          padding-top: 26px;
          border-top: 1px dashed var(--rule);
          font-size: 13px;
          color: var(--ink-soft);
          line-height: 1.6;
          max-width: 380px;
        }
        .margin-note b {
          color: var(--ink);
          font-weight: 600;
        }

        .tape {
          position: absolute;
          top: 34px;
          right: 60px;
          width: 70px;
          height: 24px;
          background: rgba(196,86,47,0.22);
          transform: rotate(-4deg);
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          transition: background 0.3s ease;
        }
        .faculty .tape {
          background: rgba(47,111,99,0.25);
        }
        .parent .tape {
          background: rgba(176,138,46,0.25);
        }

        /* right page = auth card */
        .page-right {
          flex: 1;
          padding: 48px 46px;
          display: flex;
          flex-direction: column;
          background: repeating-linear-gradient(var(--paper) 0px, var(--paper) 37px, var(--rule) 38px);
          position: relative;
        }
        .page-right-inner {
          background: var(--paper);
          padding: 8px 12px;
          border-radius: 4px;
        }

        .toggle {
          display: flex;
          gap: 0;
          margin-bottom: 28px;
          border-bottom: 2px solid var(--ink);
          position: relative;
        }
        .toggle button {
          flex: 1;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Source Serif 4', serif;
          font-size: 14.5px;
          font-weight: 500;
          padding: 10px 4px 12px;
          color: var(--ink-soft);
          transition: color .3s ease;
          position: relative;
        }
        .toggle button.active {
          color: var(--ink);
          font-weight: 700;
        }
        .underline {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 33.333%;
          height: 2.5px;
          background: var(--coral);
          transition: transform .45s cubic-bezier(.65,0,.35,1), background .4s ease;
        }
        .toggle.student .underline {
          transform: translateX(0%);
          background: var(--coral);
        }
        .toggle.faculty .underline {
          transform: translateX(100%);
          background: var(--teal);
        }
        .toggle.parent .underline {
          transform: translateX(200%);
          background: var(--gold);
        }

        .card-title {
          font-family: 'Source Serif 4', serif;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--ink);
        }
        .card-hint {
          font-size: 13px;
          color: var(--ink-soft);
          margin-bottom: 24px;
          font-style: italic;
        }

        .field {
          margin-bottom: 18px;
        }
        .field label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-soft);
          margin-bottom: 6px;
          font-weight: 600;
        }
        .field input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--ink);
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          color: var(--ink);
          padding: 7px 0 9px;
          outline: none;
          transition: border-color .2s ease;
        }
        .field input:focus {
          border-bottom-color: var(--coral);
        }
        .faculty .field input:focus {
          border-bottom-color: var(--teal);
        }
        .parent .field input:focus {
          border-bottom-color: var(--gold);
        }

        .go {
          margin-top: 14px;
          width: 100%;
          background: var(--ink);
          color: var(--paper);
          border: none;
          padding: 14px 20px;
          font-family: 'Source Serif 4', serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background .2s ease, transform .15s ease, opacity .2s ease;
          border-radius: 4px;
        }
        .go:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .go:active:not(:disabled) {
          transform: translateY(0);
        }
        .go:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .demo-bar {
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px dashed var(--rule);
        }
        .demo-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-soft);
          margin-bottom: 8px;
          font-weight: 700;
        }
        .demo-pills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .demo-pill {
          font-size: 11px;
          padding: 5px 10px;
          background: var(--paper2);
          border: 1px solid var(--rule);
          border-radius: 4px;
          color: var(--ink);
          cursor: pointer;
          transition: all .15s ease;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
        }
        .demo-pill:hover {
          border-color: var(--ink-soft);
          background: var(--paper);
        }

        .foot {
          margin-top: 16px;
          font-size: 12px;
          color: var(--ink-soft);
          text-align: center;
        }
        .foot button {
          background: none;
          border: none;
          color: var(--ink);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          font-family: inherit;
        }

        .stamp {
          position: absolute;
          bottom: 20px;
          right: 24px;
          font-family: 'Source Serif 4', serif;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--rule);
          border: 1px solid var(--rule);
          border-radius: 50%;
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          transform: rotate(-8deg);
          opacity: 0.75;
          pointer-events: none;
          line-height: 1.2;
          padding: 4px;
        }

        @media (max-width: 760px) {
          .book {
            flex-direction: column;
            min-height: auto;
            overflow: auto;
          }
          .page-left {
            border-right: none;
            border-bottom: 1px solid var(--rule);
            padding: 32px 24px;
          }
          .page-right {
            padding: 32px 24px;
          }
        }
      `}</style>

      {/* Top Floating Controls */}
      <div className="nb-controls">
        <button type="button" onClick={onOpenThemeModal} className="nb-icon-btn" title="Color Theme Palette">
          <Palette size={15} />
        </button>
        <button type="button" onClick={onToggleTheme} className="nb-icon-btn" title="Toggle Dark/Light Mode">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Open Notebook */}
      <div className={`book ${role}`} ref={bookRef} id="book">
        {/* Left Page */}
        <div className="page-left">
          <div className="tape"></div>
          <div className="brand">
            <div className="brand-mark"></div>
            <div className="brand-word">Waypoint <span>AI</span></div>
          </div>
          <div className="prompt-label">
            {role === 'faculty'
              ? 'Cohort Mastery & Intervention'
              : role === 'parent'
              ? 'Family & Learning Bridge'
              : 'Teach it back to me'}
          </div>
          <div className="handwrite" id="hw">
            {handwritingLines.map((l, i) => (
              <span key={`${role}-${i}`} className={`hw-line ${linesRevealed > i ? 'revealed' : ''}`}>
                {l}
              </span>
            ))}
          </div>
          <div className="margin-note">
            {role === 'faculty' ? (
              <>The <b>Teacher Radar</b>: live cohort diagnostics and instant 3-tier worksheet differentiation to eliminate 10+ hours of manual lesson planning.</>
            ) : role === 'parent' ? (
              <>The <b>Family Bridge</b>: plain-language weekly digests and dinner table conversation starters to connect classroom STEM to real-world curiosity.</>
            ) : (
              <>The <b>Feynman check</b>: if you can't explain optimization without the jargon, the graph shows exactly where the gap is — not just that one exists.</>
            )}
          </div>
        </div>

        {/* Right Page */}
        <div className={`page-right ${role}`}>
          <div className="page-right-inner">
            {/* 3-Role Tab Bar */}
            <div className={`toggle ${role}`} id="toggle">
              <button
                className={role === 'student' ? 'active' : ''}
                onClick={() => handleRoleToggle('student')}
                data-role="student"
                type="button"
              >
                Student
              </button>
              <button
                className={role === 'faculty' ? 'active' : ''}
                onClick={() => handleRoleToggle('faculty')}
                data-role="faculty"
                type="button"
              >
                Faculty
              </button>
              <button
                className={role === 'parent' ? 'active' : ''}
                onClick={() => handleRoleToggle('parent')}
                data-role="parent"
                type="button"
              >
                Parent
              </button>
              <div className="underline"></div>
            </div>

            <div className="card-title" id="ctitle">
              {role === 'faculty'
                ? 'Pick up the roll book'
                : role === 'parent'
                ? "Maya's Family Bridge"
                : 'Pick up your notebook'}
            </div>
            <div className="card-hint" id="chint">
              {role === 'faculty'
                ? "Your cohort's mastery, at a glance."
                : role === 'parent'
                ? 'Weekly progress, attendance & conversation starters.'
                : 'Where you left off, exactly.'}
            </div>

            {loginError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'rgba(196, 86, 47, 0.12)',
                  border: '1.5px solid var(--coral)',
                  color: 'var(--coral)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  lineHeight: 1.4,
                  margin: '12px 0'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="you@school.edu"
                  required
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button className="go" id="gobtn" type="submit" disabled={isLoggingIn}>
                {isLoggingIn
                  ? 'Verifying credentials...'
                  : role === 'faculty'
                  ? 'Open roll book →'
                  : role === 'parent'
                  ? 'Open family portal →'
                  : 'Open notebook →'}
              </button>
            </form>

            {/* Quick Demo Logins */}
            <div className="demo-bar">
              <div className="demo-label">Demo Single-Click Logins:</div>
              <div className="demo-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => handleQuickLogin('student_maya')}
                  title="maya.lin@student.waypoint.edu / demo123"
                >
                  Maya (Student)
                </button>
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => handleQuickLogin('parent_elena')}
                  title="elena.lin@parent.waypoint.edu / demo123 (Maya's Parent)"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }}
                >
                  Elena (Maya's Parent)
                </button>
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => handleQuickLogin('student_leo')}
                  title="leo.chen@student.waypoint.edu / demo123"
                >
                  Leo (Student)
                </button>
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => handleQuickLogin('parent_david')}
                  title="david.chen@parent.waypoint.edu / demo123 (Leo's Parent)"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }}
                >
                  David (Leo's Parent)
                </button>
                <button
                  type="button"
                  className="demo-pill"
                  onClick={() => handleQuickLogin('teacher_vance')}
                  title="dr.vance@faculty.waypoint.edu / demo123 (40 Students)"
                >
                  Dr. Vance (Faculty • 40 Cohort)
                </button>
              </div>
            </div>

            <div className="foot">
              New here?{' '}
              <button type="button" onClick={() => setIsRegisterOpen(true)}>
                Register new account
              </button>
            </div>
          </div>

          <div className="stamp" id="stamp">
            {role === 'faculty'
              ? 'Faculty · Verified'
              : role === 'parent'
              ? 'Guardian · Linked'
              : 'Waypoint · Est. session'}
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
