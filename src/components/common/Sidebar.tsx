import React, { useMemo } from 'react';
import { AuthUser, UserRole } from '../../types';
import { BackendService } from '../../services/backendService';
import {
  Network,
  Layers,
  MessageSquareCode,
  ScanLine,
  Compass,
  LayoutDashboard,
  FileSpreadsheet,
  AlertTriangle,
  HeartHandshake,
  Sparkles,
  BookOpen,
  CalendarCheck,
  Award
} from 'lucide-react';

export type StudentTab = 'knowledge_graph' | 'active_recall' | 'socratic_tutor' | 'homework_scanner' | 'career_roadmap';
export type TeacherTab = 'class_overview' | 'tiered_worksheets' | 'misconception_alerts';
export type ParentTab = 'academic_report' | 'attendance' | 'weak_sections' | 'weekly_digest' | 'dinner_prompts';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  dueCardsCount: number;
  currentUser?: AuthUser | null;
  currentStudentId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  dueCardsCount,
  currentUser,
  currentStudentId
}) => {
  // Resolve active child's name and metrics for parent portal dynamically
  const linkedChildReport = useMemo(() => {
    if (currentRole !== 'parent') return null;
    const childId = currentUser?.linkedStudentId || currentStudentId || 'st_01';
    return BackendService.getStudentReport(childId);
  }, [currentRole, currentUser, currentStudentId]);

  const childFirstName = linkedChildReport?.studentName?.split(' ')[0] || 'Student';

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'fixed',
        top: '72px',
        bottom: 0,
        left: 0,
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        overflowY: 'auto'
      }}
    >
      <div>
        {/* Navigation Group Title */}
        <div style={{ padding: '0 12px 12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
          {currentRole === 'student' && 'Student Hub'}
          {currentRole === 'teacher' && 'Instructor Tools'}
          {currentRole === 'parent' && `${childFirstName}'s Family Portal`}
        </div>

        {/* Student Navigation Items */}
        {currentRole === 'student' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <NavItem
              icon={<Network size={18} />}
              label="Knowledge Graph"
              active={activeTab === 'knowledge_graph'}
              onClick={() => onSelectTab('knowledge_graph')}
              badge="Dynamic"
              badgeColor="badge-indigo"
            />
            <NavItem
              icon={<Layers size={18} />}
              label="Active Recall Deck"
              active={activeTab === 'active_recall'}
              onClick={() => onSelectTab('active_recall')}
              badge={dueCardsCount > 0 ? `${dueCardsCount} Due` : undefined}
              badgeColor="badge-amber"
            />
            <NavItem
              icon={<MessageSquareCode size={18} />}
              label="Socratic & Feynman AI"
              active={activeTab === 'socratic_tutor'}
              onClick={() => onSelectTab('socratic_tutor')}
              badge="Dual Mode"
              badgeColor="badge-cyan"
            />
            <NavItem
              icon={<ScanLine size={18} />}
              label="AI Homework Scanner"
              active={activeTab === 'homework_scanner'}
              onClick={() => onSelectTab('homework_scanner')}
            />
            <NavItem
              icon={<Compass size={18} />}
              label="Career Roadmaps"
              active={activeTab === 'career_roadmap'}
              onClick={() => onSelectTab('career_roadmap')}
              badge="Simulations"
              badgeColor="badge-emerald"
            />
          </div>
        )}

        {/* Teacher Navigation Items */}
        {currentRole === 'teacher' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <NavItem
              icon={<LayoutDashboard size={18} />}
              label="Class Mastery Heatmap"
              active={activeTab === 'class_overview'}
              onClick={() => onSelectTab('class_overview')}
              badge="Live"
              badgeColor="badge-emerald"
            />
            <NavItem
              icon={<FileSpreadsheet size={18} />}
              label="3-Tier Worksheets"
              active={activeTab === 'tiered_worksheets'}
              onClick={() => onSelectTab('tiered_worksheets')}
              badge="Auto-Diff"
              badgeColor="badge-cyan"
            />
            <NavItem
              icon={<AlertTriangle size={18} />}
              label="Misconception Radar"
              active={activeTab === 'misconception_alerts'}
              onClick={() => onSelectTab('misconception_alerts')}
              badge="2 at Risk"
              badgeColor="badge-rose"
            />
          </div>
        )}

        {/* Parent Navigation Items */}
        {currentRole === 'parent' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <NavItem
              icon={<BookOpen size={18} />}
              label="Subject Report & Strengths"
              active={activeTab === 'academic_report'}
              onClick={() => onSelectTab('academic_report')}
              badge={linkedChildReport?.subjectBreakdown ? `${linkedChildReport.subjectBreakdown.length} Courses` : '5 Courses'}
              badgeColor="badge-indigo"
            />
            <NavItem
              icon={<CalendarCheck size={18} />}
              label="Live Attendance Log"
              active={activeTab === 'attendance'}
              onClick={() => onSelectTab('attendance')}
              badge={linkedChildReport?.attendance?.overallRate ? `${linkedChildReport.attendance.overallRate}%` : '96.8%'}
              badgeColor="badge-emerald"
            />
            <NavItem
              icon={<AlertTriangle size={18} />}
              label="Weak Sections Radar"
              active={activeTab === 'weak_sections'}
              onClick={() => onSelectTab('weak_sections')}
              badge="Action Tips"
              badgeColor="badge-amber"
            />
            <NavItem
              icon={<HeartHandshake size={18} />}
              label="Weekly Growth Digest"
              active={activeTab === 'weekly_digest'}
              onClick={() => onSelectTab('weekly_digest')}
              badge="Aug W1"
              badgeColor="badge-cyan"
            />
            <NavItem
              icon={<Sparkles size={18} />}
              label="Dinner Table Starters"
              active={activeTab === 'dinner_prompts'}
              onClick={() => onSelectTab('dinner_prompts')}
              badge="2 Prompts"
              badgeColor="badge-indigo"
            />
          </div>
        )}
      </div>

      {/* Bottom Info Card */}
      <div
        className="glass-card"
        style={{
          padding: '16px',
          background: 'var(--primary-surface)',
          border: '1px solid var(--primary-border)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div className="pulse-beacon" style={{ background: 'var(--primary)' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Knowledge Engine Online
          </span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
          {currentRole === 'parent'
            ? `Synchronized with ${childFirstName}'s faculty & curriculum logs.`
            : currentRole === 'teacher'
            ? 'Real-time telemetry from student Socratic drill sessions.'
            : 'Feynman technique + active recall spaced repetition active.'}
        </p>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active,
  onClick,
  badge,
  badgeColor = 'badge-indigo'
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        border: active ? '1px solid var(--primary)' : '1px solid transparent',
        background: active ? 'var(--primary-surface)' : 'transparent',
        color: active ? 'var(--primary-light)' : 'var(--text-dim)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontWeight: active ? 600 : 500,
        fontSize: '0.875rem',
        textAlign: 'left'
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-surface-elevated)';
          e.currentTarget.style.color = 'var(--text-main)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-dim)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: active ? 'var(--primary)' : 'inherit' }}>{icon}</span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`badge ${badgeColor}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
          {badge}
        </span>
      )}
    </button>
  );
};
