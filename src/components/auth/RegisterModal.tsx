import React, { useState } from 'react';
import { AuthUser, UserRole } from '../../types';
import { BackendService } from '../../services/backendService';
import {
  UserPlus,
  X,
  Mail,
  User,
  GraduationCap,
  Users,
  Briefcase,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (user: AuthUser) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegistered
}) => {
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [studentCode, setStudentCode] = useState<string>('STU-MAYA-99');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Please fill in your full name and email.');
      return;
    }

    try {
      const newUser = BackendService.registerUser(
        email.trim(),
        name.trim(),
        role,
        role === 'parent' ? studentCode : undefined
      );
      onRegistered(newUser);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Try a different email.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '540px',
          padding: '30px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <UserPlus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Create New Account
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', margin: 0 }}>
                Join Waypoint with role-specific permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Role Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px' }}>
              Select Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`glass-card interactive ${role === 'student' ? 'selected-card' : ''}`}
                style={{
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  border: role === 'student' ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                  background: role === 'student' ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface-elevated)'
                }}
              >
                <GraduationCap size={18} color="var(--primary-light)" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`glass-card interactive ${role === 'parent' ? 'selected-card' : ''}`}
                style={{
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  border: role === 'parent' ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                  background: role === 'parent' ? 'rgba(16,185,129,0.15)' : 'var(--bg-surface-elevated)'
                }}
              >
                <Users size={18} color="#34d399" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Parent</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`glass-card interactive ${role === 'teacher' ? 'selected-card' : ''}`}
                style={{
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  border: role === 'teacher' ? '2px solid #06b6d4' : '1px solid var(--border-subtle)',
                  background: role === 'teacher' ? 'rgba(6,182,212,0.15)' : 'var(--bg-surface-elevated)'
                }}
              >
                <Briefcase size={18} color="#22d3ee" />
                <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Teacher</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder={role === 'student' ? 'e.g. Leo Lin' : role === 'parent' ? 'e.g. Elena Lin' : 'e.g. Prof. Alan Turing'}
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
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

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
              <input
                type="email"
                placeholder="name@domain.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
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

          {/* Parent Student Code Link */}
          {role === 'parent' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)' }}>
                  Student Link Invitation Code
                </label>
                <span style={{ fontSize: '0.7rem', color: '#34d399' }}>Auto-links to Maya & Leo Lin</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="e.g. STU-MAYA-99"
                  value={studentCode}
                  onChange={e => setStudentCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>FERPA / COPPA Secure • Persistent multi-role sync</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              <CheckCircle2 size={14} />
              <span>Complete Registration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
