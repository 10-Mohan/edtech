import React from 'react';
import { ParentWeeklySummary, StudentComprehensiveReport } from '../../types';
import { mockParentSummary, mockStudentComprehensiveReport } from '../../data/mockData';
import { MathRenderer } from '../common/MathRenderer';
import {
  CalendarCheck,
  BookOpen,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Clock,
  Flame,
  Award,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface ParentDashboardProps {
  activeParentTab: string;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  activeParentTab
}) => {
  const summary: ParentWeeklySummary = mockParentSummary;
  const studentReport: StudentComprehensiveReport = mockStudentComprehensiveReport;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Linked Child Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={studentReport.avatar}
              alt={studentReport.studentName}
              style={{ width: '56px', height: '56px', borderRadius: '16px', border: '2px solid var(--primary-light)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{studentReport.studentName}</h1>
                <span className="badge badge-emerald">Live Student Sync</span>
                <span className="badge badge-indigo">{studentReport.grade}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {studentReport.school} • {studentReport.academicYear} • Parent: <strong>{studentReport.parentName}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {studentReport.attendance.overallRate}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Term Attendance</div>
            </div>
            <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#67e8f9' }}>
                +{summary.masteryGainPercent}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Mastery Gain</div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: Multi-Subject Academic Report & Strengths */}
      {(activeParentTab === 'academic_report' || activeParentTab === 'student_overview') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Subject-by-Subject Mastery & Strengths</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Comprehensive evaluation across all current enrolled courses and teacher assessments.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
            {studentReport.subjectBreakdown.map((item, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px' }}>{item.subject}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Instructor: {item.teacherName}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                          {item.gradeLetter} ({item.score}%)
                        </span>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#67e8f9', fontWeight: 600 }}>{item.rankInClass}</span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#34d399', marginBottom: '6px' }}>
                      Key Strengths & Mastery Highlights
                    </div>
                    <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.8125rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      {item.strengths.map((str, sIdx) => (
                        <li key={sIdx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Weak Sections */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#fda4af', marginBottom: '6px' }}>
                      Sections Requiring Reinforcement
                    </div>
                    <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {item.weakSections.map((wk, wIdx) => (
                        <li key={wIdx}>
                          <MathRenderer text={wk} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Teacher Remark Quote */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginTop: '10px'
                  }}
                >
                  "{item.teacherRemarks}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Live Attendance Tracking & Log */}
      {activeParentTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Attendance Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', marginBottom: '6px' }}>
                <CalendarCheck size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Attendance Rate</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>
                {studentReport.attendance.overallRate}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Target: 95%+ required</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', marginBottom: '6px' }}>
                <UserCheck size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Days Present</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
                {studentReport.attendance.presentDays} / {studentReport.attendance.totalDays}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Academic school days</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', marginBottom: '6px' }}>
                <Clock size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Tardies Logged</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
                {studentReport.attendance.tardies} Day
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Transit delay excused</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#67e8f9', marginBottom: '6px' }}>
                <ShieldCheck size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Excused Absences</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#67e8f9' }}>
                {studentReport.attendance.excusedAbsences} Days
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Medical documentation on file</span>
            </div>
          </div>

          {/* Recent Attendance Timeline Log */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Recent Attendance & Class Period Log</h3>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>Date</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>Subject / Period</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>Status</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-dim)' }}>Classroom Notes</th>
                </tr>
              </thead>
              <tbody>
                {studentReport.attendance.recentLog.map((log, lIdx) => (
                  <tr key={lIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f8fafc' }}>{log.date}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>{log.subject}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {log.status === 'present' && <span className="badge badge-emerald">Present</span>}
                      {log.status === 'tardy' && <span className="badge badge-amber">Tardy (5m)</span>}
                      {log.status === 'excused' && <span className="badge badge-cyan">Excused Absence</span>}
                      {log.status === 'absent' && <span className="badge badge-rose">Unexcused</span>}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {log.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Weak Sections & Intervention Radar */}
      {activeParentTab === 'weak_sections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Weak Areas & Remediation Radar</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Identifies exact conceptual gaps across subjects with actionable home guidance (no advanced math degree needed!).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {studentReport.weakAreasRadar.map((radar, rIdx) => (
              <div
                key={rIdx}
                style={{
                  padding: '22px',
                  borderRadius: 'var(--radius-lg)',
                  background: radar.severity === 'critical' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: radar.severity === 'critical' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={18} color={radar.severity === 'critical' ? '#f43f5e' : '#f59e0b'} />
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>{radar.topic}</span>
                    <span className="badge badge-indigo">{radar.subject}</span>
                  </div>
                  <span className={`badge ${radar.severity === 'critical' ? 'badge-rose' : 'badge-amber'}`}>
                    {radar.severity === 'critical' ? 'High Priority Gap' : 'Moderate Blocker'}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: '#e2e8f0', marginBottom: '12px' }}>
                  <strong>Root Cause Misconception:</strong> <MathRenderer text={radar.misconceptionSummary} />
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    color: '#67e8f9',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} color="#67e8f9" />
                  <span><strong>Recommended Home Action:</strong> {radar.recommendedHomeAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: Weekly Cognitive Digest & Habits */}
      {activeParentTab === 'weekly_digest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Key Metric Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-light)', marginBottom: '8px' }}>
                <Clock size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Focus Study Time</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>{studentReport.studyHabits.weeklyFocusHours} Hours</div>
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
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>{studentReport.studyHabits.activeRecallStreakDays} Consecutive Days</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Daily flashcard habit active</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#22d3ee', marginBottom: '8px' }}>
                <Award size={18} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase' }}>Cards Mastered</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22d3ee' }}>{studentReport.studyHabits.masteredCardsCount} Cards</div>
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
        </div>
      )}

      {/* VIEW 5: Dinner Table Conversation Starters */}
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
