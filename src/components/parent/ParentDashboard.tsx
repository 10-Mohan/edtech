import React from 'react';
import { ParentWeeklySummary } from '../../types';
import { mockParentSummary } from '../../data/mockData';
import { MathRenderer } from '../common/MathRenderer';
import {
  HeartHandshake,
  Sparkles,
  Award,
  TrendingUp,
  Clock,
  Flame,
  MessageCircle,
  BookOpenCheck,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface ParentDashboardProps {
  activeParentTab: string;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  activeParentTab
}) => {
  const summary = mockParentSummary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Family Growth Digest & Home Bridge</h1>
              <span className="badge badge-emerald">{summary.weekLabel}</span>
            </div>
            <p style={{ margin: 0 }}>
              Waypoint transforms complex algorithmic learning data into clear, celebration-focused insights and natural dinner table conversation starters.
            </p>
          </div>
        </div>
      </div>

      {/* View 1: Weekly Growth Digest */}
      {(activeParentTab === 'weekly_digest' || activeParentTab === 'focus_recommendations') && (
        <>
          {/* Key Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-light)', marginBottom: '8px' }}>
                <Clock size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Focus Study Time</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{summary.hoursLearned} Hours</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Across 5 active sessions</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#34d399', marginBottom: '8px' }}>
                <TrendingUp size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Mastery Growth</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>+{summary.masteryGainPercent}%</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Net conceptual score gain</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fbbf24', marginBottom: '8px' }}>
                <Flame size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Recall Streak</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>8 Consecutive Days</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Daily flashcard habit active</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22d3ee', marginBottom: '8px' }}>
                <Award size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Cards Mastered</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22d3ee' }}>{summary.cardsMasteredCount} Cards</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Moved to long-term memory</span>
            </div>
          </div>

          {/* Headline Summary & Celebrations */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Sparkles size={20} color="#fbbf24" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Weekly Executive Summary for Parents</h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#f8fafc', lineHeight: 1.6, marginBottom: '20px' }}>
              {summary.headlineSummary}
            </p>

            <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Highlights & Milestone Celebrations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {summary.celebrations.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Home Action Plan */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <BookOpenCheck size={20} color="#6366f1" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Recommended Home Support (No Math Degree Needed!)</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {summary.focusAreas.map((area, idx) => (
                <div key={idx} style={{ padding: '18px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.95rem' }}>{area.topic}</span>
                    <span className="badge badge-indigo">{area.subject}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    <strong>Helpful tip:</strong> {area.homeActionTip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* View 2: Dinner Table Conversation Starters */}
      {activeParentTab === 'dinner_prompts' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <MessageCircle size={24} color="#6366f1" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Dinner Table Conversation Starters</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Instead of asking "How was school today?", try these curated questions connected to Maya's exact learning breakthroughs this week:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {summary.dinnerTablePrompts.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(16, 21, 34, 0.7) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}
              >
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '10px', lineHeight: 1.5 }}>
                  <MathRenderer text={item.prompt} />
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <strong>Background Context:</strong> {item.context}
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', fontSize: '0.8125rem', color: '#67e8f9' }}>
                  <strong>Fun Follow-Up:</strong> <MathRenderer text={item.followUp} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
