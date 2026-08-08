import React, { useState, useEffect, useMemo } from 'react';
import { ParentWeeklySummary, StudentComprehensiveReport, StudentClassroomMetric } from '../../types';
import { MathRenderer } from '../common/MathRenderer';
import { BackendService } from '../../services/backendService';
import {
  CalendarCheck,
  Sparkles,
  TrendingUp,
  Clock,
  Flame,
  Award,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Users,
  GraduationCap,
  Mail,
  Send,
  ExternalLink,
  X,
  Search,
  ChevronDown
} from 'lucide-react';

interface ParentDashboardProps {
  activeParentTab: string;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  activeParentTab
}) => {
  const [allStudents, setAllStudents] = useState<StudentClassroomMetric[]>(() => BackendService.getClassroomMetrics());
  const [selectedChildId, setSelectedChildId] = useState<string>('st_01');
  const [parentEmailInput, setParentEmailInput] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    delivered?: boolean;
    previewHtml?: string;
  } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Subscribe to live multi-device / cross-tab updates
  useEffect(() => {
    const unsubscribe = BackendService.subscribe(msg => {
      if (
        msg.type === 'STUDENT_METRIC_UPDATED' ||
        msg.type === 'COHORT_DATA_IMPORTED' ||
        msg.type === 'REMOTE_DB_SYNC'
      ) {
        setAllStudents(BackendService.getClassroomMetrics());
      }
    });
    return () => unsubscribe();
  }, []);

  // Dynamically resolve comprehensive report and parent summary for selected child
  const studentReport: StudentComprehensiveReport = useMemo(() => {
    return BackendService.getStudentReport(selectedChildId);
  }, [selectedChildId, allStudents]);

  const summary: ParentWeeklySummary = useMemo(() => {
    return BackendService.getParentWeeklySummary(selectedChildId);
  }, [selectedChildId, allStudents]);

  // Sync parent email when child changes
  useEffect(() => {
    if (studentReport.parentEmail) {
      setParentEmailInput(studentReport.parentEmail);
    }
  }, [studentReport]);

  const handleSendDigestEmail = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await BackendService.sendParentWeeklyDigestEmail({
        studentId: selectedChildId,
        parentEmail: parentEmailInput
      });

      if (res.success) {
        setEmailStatus({
          type: 'success',
          message: res.delivered
            ? `Weekly digest email dispatched live to ${parentEmailInput} via Resend / SendGrid!`
            : `Digest rendered successfully for ${studentReport.studentName} in preview mode (Set RESEND_API_KEY for live email delivery).`,
          delivered: res.delivered,
          previewHtml: res.previewHtml
        });
      } else {
        setEmailStatus({
          type: 'error',
          message: `Email dispatch failed: ${res.error || 'Unknown error'}`
        });
      }
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: `Error sending email: ${err?.message || 'Network error'}`
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Linked Child Selector & Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={studentReport.avatar}
              alt={studentReport.studentName}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                border: '2px solid var(--primary-light)',
                objectFit: 'cover'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {studentReport.studentName}
                </h1>
                <span className="badge badge-emerald">Live Synchronized</span>
                <span className="badge badge-indigo">{studentReport.grade}</span>
                <span className="badge badge-cyan">{studentReport.studentId}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {studentReport.school} • {studentReport.academicYear} • Parent: <strong>{studentReport.parentName}</strong>
              </p>
            </div>
          </div>

          {/* Child Switcher: Quick Selector + 40-Student Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Select Student:</label>
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: '220px'
                }}
              >
                {allStudents.map(st => (
                  <option key={st.studentId} value={st.studentId}>
                    {st.studentName} ({st.grade || '11th Grade'} • {st.overallMastery}%)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />

            <div style={{ textAlign: 'right' }}>
              <div className="theme-stat-val" style={{ fontSize: '1.35rem', color: '#10b981' }}>
                {studentReport.attendance.overallRate}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Term Attendance</div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: Multi-Subject Academic Report & Strengths */}
      {(activeParentTab === 'academic_report' || activeParentTab === 'student_overview') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>Subject-by-Subject Mastery & Strengths</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Comprehensive evaluation across all current enrolled courses and teacher assessments for {studentReport.studentName}.
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
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '2px', color: 'var(--text-main)' }}>{item.subject}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Instructor: {item.teacherName}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge badge-emerald" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                          {item.gradeLetter} ({item.score}%)
                        </span>
                      </div>
                      <span className="theme-text-primary" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{item.rankInClass}</span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div style={{ marginBottom: '12px' }}>
                    <div className="theme-text-heading" style={{ marginBottom: '6px' }}>
                      Key Strengths & Mastery Highlights
                    </div>
                    <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {item.strengths.map((str, sIdx) => (
                        <li key={sIdx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Weak Sections */}
                  {item.weakSections.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div className="theme-text-subtle" style={{ marginBottom: '6px' }}>
                        Sections Requiring Reinforcement
                      </div>
                      <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {item.weakSections.map((wk, wIdx) => (
                          <li key={wIdx}>
                            <MathRenderer text={wk} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', marginBottom: '6px' }}>
                <CalendarCheck size={18} />
                <span className="theme-text-heading">Attendance Rate</span>
              </div>
              <div className="theme-stat-val" style={{ fontSize: '1.8rem', color: '#10b981' }}>
                {studentReport.attendance.overallRate}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Target: 95%+ required</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', marginBottom: '6px' }}>
                <UserCheck size={18} />
                <span className="theme-text-heading">Days Present</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {studentReport.attendance.presentDays} / {studentReport.attendance.totalDays}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Academic school days</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', marginBottom: '6px' }}>
                <Clock size={18} />
                <span className="theme-text-heading">Tardies Logged</span>
              </div>
              <div className="theme-stat-val" style={{ fontSize: '1.8rem' }}>
                {studentReport.attendance.tardies} Day{studentReport.attendance.tardies !== 1 ? 's' : ''}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Excused on file</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', marginBottom: '6px' }}>
                <ShieldCheck size={18} />
                <span className="theme-text-heading">Excused Absences</span>
              </div>
              <div className="theme-stat-val" style={{ fontSize: '1.8rem' }}>
                {studentReport.attendance.excusedAbsences} Days
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Medical documentation verified</span>
            </div>
          </div>

          {/* Recent Attendance Timeline Log */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)' }}>Recent Attendance & Class Period Log</h3>

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
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>{log.date}</td>
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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>Weak Areas & Remediation Radar</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              Identifies exact conceptual gaps across subjects with actionable home guidance (no advanced STEM degree needed!).
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {studentReport.weakAreasRadar.map((radar, rIdx) => (
              <div
                key={rIdx}
                className="glass-panel"
                style={{
                  padding: '22px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--primary-surface)',
                  border: '1px solid var(--primary-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={18} color="var(--primary-light)" />
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{radar.topic}</span>
                    <span className="badge badge-indigo">{radar.subject}</span>
                  </div>
                  <span className={`badge ${radar.severity === 'critical' ? 'badge-rose' : 'badge-amber'}`}>
                    {radar.severity === 'critical' ? 'High Priority Gap' : 'Moderate Blocker'}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '12px' }}>
                  <strong>Root Cause Misconception:</strong> <MathRenderer text={radar.misconceptionSummary} />
                </div>

                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} color="var(--primary-light)" />
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
                <span className="theme-text-heading">Focus Study Time</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {studentReport.studyHabits.weeklyFocusHours} Hours
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Across active learning sessions</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-light)', marginBottom: '8px' }}>
                <TrendingUp size={18} />
                <span className="theme-text-heading">Mastery Growth</span>
              </div>
              <div className="theme-stat-val" style={{ fontSize: '1.8rem' }}>+{summary.masteryGainPercent}%</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Net conceptual score gain</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-light)', marginBottom: '8px' }}>
                <Flame size={18} />
                <span className="theme-text-heading">Recall Streak</span>
              </div>
              <div className="theme-stat-val" style={{ fontSize: '1.8rem' }}>
                {studentReport.studyHabits.activeRecallStreakDays} Consecutive Days
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Daily flashcard habit active</span>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-light)', marginBottom: '8px' }}>
                <Award size={18} />
                <span className="theme-text-heading">Cards Mastered</span>
              </div>
              <div className="theme-stat-val" style={{ fontSize: '1.8rem' }}>
                {studentReport.studyHabits.masteredCardsCount} Cards
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Moved to long-term memory</span>
            </div>
          </div>

          {/* Headline Summary & Celebrations */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Sparkles size={20} color="var(--primary-light)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Weekly Executive Summary for {studentReport.parentName}
              </h3>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '20px' }}>
              {summary.headlineSummary}
            </p>

            <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Highlights & Milestone Celebrations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {summary.celebrations.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    background: 'var(--primary-surface)',
                    border: '1px solid var(--primary-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    color: 'var(--text-main)'
                  }}
                >
                  <CheckCircle2 size={16} color="var(--primary-light)" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Email Dispatch Control Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} color="var(--primary-light)" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Email Weekly Progress Digest to Parent
                  </span>
                </div>
                <span className="badge badge-indigo">Automated Every Sunday 18:00 UTC</span>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  value={parentEmailInput}
                  onChange={e => setParentEmailInput(e.target.value)}
                  placeholder="parent@example.com"
                  style={{
                    flex: '1 1 250px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  onClick={handleSendDigestEmail}
                  disabled={isSendingEmail || !parentEmailInput.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  <span>{isSendingEmail ? 'Dispatching...' : 'Send Weekly Email'}</span>
                </button>
                {emailStatus?.previewHtml && (
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ExternalLink size={14} />
                    <span>Preview HTML Template</span>
                  </button>
                )}
              </div>

              {emailStatus && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: emailStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: emailStatus.type === 'success' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    color: emailStatus.type === 'success' ? '#10b981' : '#ef4444'
                  }}
                >
                  {emailStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{emailStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HTML Email Preview Modal */}
      {showPreviewModal && emailStatus?.previewHtml && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="var(--primary-light)" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Weekly Digest HTML Email Preview ({studentReport.studentName})
                </h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#0b0f19' }}>
              <iframe
                title="Email Preview"
                srcDoc={emailStatus.previewHtml}
                style={{
                  width: '100%',
                  height: '560px',
                  border: 'none',
                  borderRadius: '12px'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Dinner Table Conversation Starters */}
      {activeParentTab === 'dinner_prompts' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <MessageCircle size={24} color="var(--primary-light)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Dinner Table Conversation Starters</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Instead of asking generic questions like "How was school today?", try these curated questions connected to {studentReport.studentName}'s exact STEM breakthroughs this week:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {summary.dinnerTablePrompts.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--primary-surface)',
                  border: '1px solid var(--primary-border)'
                }}
              >
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px', lineHeight: 1.5 }}>
                  <MathRenderer text={item.prompt} />
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <strong>Background Context:</strong> {item.context}
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                  <strong style={{ color: 'var(--primary-light)' }}>Fun Follow-Up:</strong> <MathRenderer text={item.followUp} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
