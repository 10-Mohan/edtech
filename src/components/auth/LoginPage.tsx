import React, { useState, useEffect, useRef } from 'react';
import { AuthUser, ColorThemeId, UserRole } from '../../types';
import { mockAuthUsers } from '../../data/mockData';
import { BackendService } from '../../services/backendService';
import { RegisterModal } from './RegisterModal';
import { Palette, Sun, Moon, AlertCircle, CheckCircle2 } from 'lucide-react';

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
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [email, setEmail] = useState<string>('maya.lin@student.waypoint.edu');
  const [password, setPassword] = useState<string>('demo123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [linesRevealed, setLinesRevealed] = useState<number>(0);
  const bookRef = useRef<HTMLDivElement>(null);

  const handwritingLines = [
    'So optimization is really just...',
    '...finding where the derivative',
    'goes flat. The peak of the hill.'
  ];

  useEffect(() => {
    setLinesRevealed(0);
    const timers = [
      setTimeout(() => setLinesRevealed(1), 600),
      setTimeout(() => setLinesRevealed(2), 1150),
      setTimeout(() => setLinesRevealed(3), 1700)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleRoleToggle = (targetRole: 'student' | 'faculty') => {
    if (targetRole === role) return;
    setLoginError(null);

    if (bookRef.current) {
      bookRef.current.style.transition = 'transform .55s cubic-bezier(.65,0,.35,1)';
      bookRef.current.style.transformOrigin = 'center center';
      bookRef.current.style.transform = 'rotateY(6deg) scale(0.985)';
    }

    setTimeout(() => {
      setRole(targetRole);
      if (targetRole === 'faculty') {
        setEmail('dr.vance@faculty.waypoint.edu');
      } else {
        setEmail('maya.lin@student.waypoint.edu');
      }
      setPassword('demo123');

      if (bookRef.current) {
        bookRef.current.style.transform = 'rotateY(0deg) scale(1)';
      }
    }, 260);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const targetUserRole: UserRole = role === 'faculty' ? 'teacher' : 'student';
      const user = await BackendService.authenticateWithPassword(email.trim(), password, targetUserRole);
      onLogin(user);
    } catch (err: any) {
      console.warn('Login validation failed:', err.message);
      setLoginError(err?.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickLogin = async (targetRole: 'student' | 'teacher' | 'parent') => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const demoEmail =
        targetRole === 'teacher'
          ? 'dr.vance@faculty.waypoint.edu'
          : targetRole === 'parent'
          ? 'elena.lin@parent.waypoint.edu'
          : 'maya.lin@student.waypoint.edu';
      
      setEmail(demoEmail);
      setPassword('demo123');
      if (targetRole === 'teacher') {
        setRole('faculty');
      } else {
        setRole('student');
      }

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
          perspective: 2400px;
          overflow: hidden;
          position: relative;
        }

        .waypoint-notebook-wrapper.dark-mode {
          --paper: #121824;
          --paper2: #0b0f17;
          --ink: #f1f5f9;
          --ink-soft: #94a3b8;
          --rule: #222d42;
          --teal: #38bdf8;
          --coral: #fb7185;
          --gold: #fbbf24;
        }

        .waypoint-notebook-wrapper::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image: radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 3px 3px;
          pointer-events: none;
        }

        .waypoint-notebook-wrapper.dark-mode::before {
          background-image: radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px);
        }

        /* Utility buttons floating top-right */
        .nb-controls {
          position: absolute;
          top: 18px;
          right: 22px;
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 50;
        }
        .nb-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid var(--rule);
          background: var(--paper);
          color: var(--ink-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nb-icon-btn:hover {
          color: var(--ink);
          border-color: var(--ink-soft);
          transform: translateY(-1px);
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
        }
        .faculty .brand-mark {
          background: var(--teal);
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
          color: var(--teal);
          font-weight: 600;
          margin-bottom: 16px;
        }

        .handwrite {
          font-family: 'Caveat', cursive;
          font-size: 32px;
          line-height: 1.5;
          color: var(--ink);
          max-width: 420px;
        }
        .hw-line {
          display: block;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity .6s ease, transform .6s cubic-bezier(.2,.8,.3,1);
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
          background: rgba(176,138,46,0.28);
          transform: rotate(-4deg);
          box-shadow: 0 1px 2px rgba(0,0,0,0.08);
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
          margin-bottom: 30px;
          border-bottom: 2px solid var(--ink);
          position: relative;
        }
        .toggle button {
          flex: 1;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Source Serif 4', serif;
          font-size: 15px;
          font-weight: 500;
          padding: 10px 4px 12px;
          color: var(--ink-soft);
          transition: color .3s ease;
          position: relative;
        }
        .toggle button.active {
          color: var(--ink);
          font-weight: 600;
        }
        .underline {
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 50%;
          height: 2px;
          background: var(--coral);
          transition: transform .5s cubic-bezier(.65,0,.35,1);
        }
        .toggle.faculty .underline {
          transform: translateX(100%);
          background: var(--teal);
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
          margin-bottom: 26px;
          font-style: italic;
        }

        .field {
          margin-bottom: 20px;
        }
        .field label {
          display: block;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-soft);
          margin-bottom: 8px;
          font-weight: 600;
        }
        .field input {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid var(--rule);
          padding: 8px 2px 10px;
          color: var(--ink);
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .3s ease;
        }
        .field input:focus {
          border-color: var(--coral);
        }
        .faculty .field input:focus {
          border-color: var(--teal);
        }

        .go {
          width: 100%;
          margin-top: 12px;
          padding: 13px 0;
          border: none;
          border-radius: 3px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          color: var(--paper);
          background: var(--ink);
          transition: background .4s ease, transform .15s ease;
        }
        .go:hover {
          background: var(--coral);
        }
        .faculty .go:hover {
          background: var(--teal);
        }
        .go:active {
          transform: scale(0.98);
        }

        .demo-bar {
          margin-top: 16px;
          padding-top: 12px;
          border-top: 1px dashed var(--rule);
        }
        .demo-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-soft);
          font-weight: 600;
          margin-bottom: 6px;
        }
        .demo-pills {
          display: flex;
          gap: 6px;
        }
        .demo-pill {
          flex: 1;
          padding: 5px 6px;
          font-size: 11px;
          font-weight: 500;
          border-radius: 3px;
          border: 1px solid var(--rule);
          background: transparent;
          color: var(--ink);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .demo-pill:hover {
          border-color: var(--ink);
          background: rgba(35,40,31,0.05);
        }

        .foot {
          text-align: center;
          margin-top: 18px;
          font-size: 12px;
          color: var(--ink-soft);
        }
        .foot a, .foot button {
          background: none;
          border: none;
          padding: 0;
          font-size: 12px;
          font-family: inherit;
          color: var(--ink);
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .stamp {
          position: absolute;
          bottom: 24px;
          right: 28px;
          font-family: 'Source Serif 4', serif;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--rule);
          border: 1px solid var(--rule);
          border-radius: 50%;
          width: 76px;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          transform: rotate(-8deg);
          opacity: 0.7;
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
      <div className={`book ${role === 'faculty' ? 'faculty' : ''}`} ref={bookRef} id="book">
        {/* Left Page */}
        <div className="page-left">
          <div className="tape"></div>
          <div className="brand">
            <div className="brand-mark"></div>
            <div className="brand-word">Waypoint <span>AI</span></div>
          </div>
          <div className="prompt-label">Teach it back to me</div>
          <div className="handwrite" id="hw">
            {handwritingLines.map((l, i) => (
              <span key={i} className={`hw-line ${linesRevealed > i ? 'revealed' : ''}`}>
                {l}
              </span>
            ))}
          </div>
          <div className="margin-note">
            The <b>Feynman check</b>: if you can't explain optimization without the jargon, the graph shows exactly where the gap is — not just that one exists.
          </div>
        </div>

        {/* Right Page */}
        <div className={`page-right ${role === 'faculty' ? 'faculty' : ''}`}>
          <div className="page-right-inner">
            <div className={`toggle ${role === 'faculty' ? 'faculty' : ''}`} id="toggle">
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
              <div className="underline"></div>
            </div>

            <div className="card-title" id="ctitle">
              {role === 'faculty' ? 'Pick up the roll book' : 'Pick up your notebook'}
            </div>
            <div className="card-hint" id="chint">
              {role === 'faculty' ? "Your cohort's mastery, at a glance." : 'Where you left off, exactly.'}
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
                {isLoggingIn ? 'Verifying credentials...' : role === 'faculty' ? 'Open roll book →' : 'Open notebook →'}
              </button>
            </form>

            {/* Quick Demo Logins */}
            <div className="demo-bar">
              <div className="demo-label">Demo Credentials:</div>
              <div className="demo-pills">
                <button type="button" className="demo-pill" onClick={() => handleQuickLogin('student')} title="maya.lin@student.waypoint.edu / demo123">
                  Maya (Student)
                </button>
                <button type="button" className="demo-pill" onClick={() => handleQuickLogin('teacher')} title="dr.vance@faculty.waypoint.edu / demo123">
                  Dr. Eleanor (Faculty)
                </button>
                <button type="button" className="demo-pill" onClick={() => handleQuickLogin('parent')} title="elena.lin@parent.waypoint.edu / demo123">
                  Elena (Parent)
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
            {role === 'faculty' ? 'Faculty · Verified' : 'Waypoint · Est. session'}
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
