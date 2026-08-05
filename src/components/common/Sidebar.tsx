import React from 'react';
import { UserRole } from '../../types';
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
  BookOpenCheck
} from 'lucide-react';

export type StudentTab = 'knowledge_graph' | 'active_recall' | 'socratic_tutor' | 'homework_scanner' | 'career_roadmap';
export type TeacherTab = 'class_overview' | 'tiered_worksheets' | 'misconception_alerts';
export type ParentTab = 'weekly_digest' | 'dinner_prompts' | 'focus_recommendations';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  dueCardsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  dueCardsCount
}) => {
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
          {currentRole === 'student' && 'Learning Hub'}
          {currentRole === 'teacher' && 'Instructor Tools'}
          {currentRole === 'parent' && 'Family Insights'}
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
              icon={<HeartHandshake size={18} />}
              label="Weekly Growth Digest"
              active={activeTab === 'weekly_digest'}
              onClick={() => onSelectTab('weekly_digest')}
              badge="Aug W1"
              badgeColor="badge-emerald"
            />
            <NavItem
              icon={<Sparkles size={18} />}
              label="Dinner Table Starters"
              active={activeTab === 'dinner_prompts'}
              onClick={() => onSelectTab('dinner_prompts')}
              badge="2 Prompts"
              badgeColor="badge-indigo"
            />
            <NavItem
              icon={<BookOpenCheck size={18} />}
              label="Home Action Plan"
              active={activeTab === 'focus_recommendations'}
              onClick={() => onSelectTab('focus_recommendations')}
            />
          </div>
        )}
      </div>

      {/* Bottom Info Card */}
      <div
        className="glass-card"
        style={{
          padding: '16px',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 21, 34, 0.6) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div className="pulse-beacon" style={{ background: '#10b981' }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Knowledge Engine Online
          </span>
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', margin: 0, lineHeight: 1.4 }}>
          Graph node tracking & spaced recall intervals active.
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
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        background: active ? 'rgba(99, 102, 241, 0.14)' : 'transparent',
        border: active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
        color: active ? 'var(--text-main)' : 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-glass-hover)';
          e.currentTarget.style.color = 'var(--text-main)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ color: active ? 'var(--primary-light)' : 'var(--text-dim)' }}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {badge && (
        <span className={`badge ${badgeColor}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
          {badge}
        </span>
      )}
    </button>
  );
};
