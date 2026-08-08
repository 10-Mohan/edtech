import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, ParentWeeklySummary, StudentComprehensiveReport } from '../../types';
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
  ShieldCheck,
  Users,
  Mail,
  Send,
  X,
  Heart,
  Lightbulb,
  BookOpen,
  Check,
  Coffee,
  HelpCircle,
  FileText,
  UserCheck,
  ChevronRight
} from 'lucide-react';

interface ParentDashboardProps {
  activeParentTab: string;
  currentUser?: AuthUser | null;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  activeParentTab,
  currentUser
}) => {
  // Determine child ID strictly linked to this parent account
  const linkedChildIds = useMemo(() => {
    if (currentUser?.linkedStudentIds && currentUser.linkedStudentIds.length > 0) {
      return currentUser.linkedStudentIds;
    }
    if (currentUser?.linkedStudentId) {
      return [currentUser.linkedStudentId];
    }
    return ['st_01'];
  }, [currentUser]);

  const [selectedChildId, setSelectedChildId] = useState<string>(linkedChildIds[0]);
  const [parentEmailInput, setParentEmailInput] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    delivered?: boolean;
    previewHtml?: string;
  } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Parent Encouragement Nudge modal state
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState<boolean>(false);
  const [nudgeMessage, setNudgeMessage] = useState<string>('');
  const [nudgeSuccess, setNudgeSuccess] = useState<string | null>(null);

  // Attendance filter state
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'tardy' | 'absent' | 'excused'>('all');

  // Dinner discussion marked state
  const [discussedPrompts, setDiscussedPrompts] = useState<Record<number, boolean>>({});

  // Refresh trigger on real-time event updates
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = BackendService.subscribe(msg => {
      if (
        msg.type === 'STUDENT_METRIC_UPDATED' ||
        msg.type === 'REMOTE_DB_SYNC' ||
        msg.type === 'PARENT_NUDGE_SENT' ||
        msg.type === 'NODE_MASTERY_UPDATED'
      ) {
        setRefreshKey(k => k + 1);
      }
    });
    return () => unsubscribe();
  }, []);

  // Dynamically resolve comprehensive report and parent summary for the parent's linked child
  const studentReport: StudentComprehensiveReport = useMemo(() => {
    return BackendService.getStudentReport(selectedChildId);
  }, [selectedChildId, refreshKey]);

  const summary: ParentWeeklySummary = useMemo(() => {
    return BackendService.getParentWeeklySummary(selectedChildId);
  }, [selectedChildId, refreshKey]);

  // Sync parent email when child changes
  useEffect(() => {
    if (currentUser?.email) {
      setParentEmailInput(currentUser.email);
    } else if (studentReport.parentEmail) {
      setParentEmailInput(studentReport.parentEmail);
    }
  }, [studentReport, currentUser]);

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

  const handleSendNudge = (presetText?: string) => {
    const textToSend = presetText || nudgeMessage;
    if (!textToSend.trim()) return;

    BackendService.sendParentEncouragementNudge(
      selectedChildId,
      textToSend.trim(),
      currentUser?.name || studentReport.parentName || 'Parent'
    );

    setNudgeSuccess(`Encouragement sent to ${studentReport.studentName}! It is now visible on their student dashboard.`);
    setNudgeMessage('');
    setTimeout(() => {
      setNudgeSuccess(null);
      setIsNudgeModalOpen(false);
    }, 2200);
  };

  const togglePromptDiscussed = (idx: number) => {
    setDiscussedPrompts(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const presetNudges = [
    `Proud of your hard work! Take 10 minutes to review the Chain Rule practice before tomorrow's class.`,
    `You're doing great in Calculus! Don't hesitate to ask the AI Socratic Tutor if you get stuck on any step.`,
    `Cheering for you! Let's celebrate after you finish your physics active recall cards tonight!`,
    `Remember to take your time on multi-step problems. You've got this!`
  ];

  // Filtered attendance log
  const filteredAttendanceLog = useMemo(() => {
    if (!studentReport?.attendance?.recentLog) return [];
    if (attendanceFilter === 'all') return studentReport.attendance.recentLog;
    return studentReport.attendance.recentLog.filter(log => log.status === attendanceFilter);
  }, [studentReport, attendanceFilter]);

  const childFirstName = studentReport.studentName?.split(' ')[0] || 'Child';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Guardian Security & Linked Student Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={studentReport.avatar}
              alt={studentReport.studentName}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary)'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                  {studentReport.studentName}
                </h1>
                <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={13} />
                  Private Family Access
                </span>
                <span className="badge badge-indigo">
                  {studentReport.grade}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                {studentReport.school} • Parent Guardian: <strong style={{ color: 'var(--text-main)' }}>{currentUser?.name || studentReport.parentName}</strong> ({parentEmailInput})
              </p>
            </div>
          </div>

          {/* Sibling Switcher & Nudge CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {linkedChildIds.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-surface-elevated)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)'
                }}
              >
                <Users size={16} color="var(--primary-light)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>My Children:</span>
                <select
                  value={selectedChildId}
                  onChange={e => setSelectedChildId(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {linkedChildIds.map(id => {
                    const rep = BackendService.getStudentReport(id);
                    return (
                      <option key={id} value={id} style={{ background: 'var(--bg-surface)', color: 'var(--text-main)' }}>
                        {rep.studentName} ({rep.grade})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Send Encouragement Nudge Button */}
            <button
              onClick={() => setIsNudgeModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Heart size={14} />
              <span>Send Encouragement Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: SUBJECT REPORT & STRENGTHS */}
      {(activeParentTab === 'academic_report' || !activeParentTab) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Weekly Focus</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{studentReport.studyHabits?.weeklyFocusHours || 8.5}h</div>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>+1.5h vs target</span>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <CalendarCheck size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Attendance Rate</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: studentReport.attendance.overallRate >= 95 ? '#10b981' : '#f59e0b' }}>
                  {studentReport.attendance.overallRate}%
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{studentReport.attendance.presentDays}/{studentReport.attendance.totalDays} Days Present</span>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Clock size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Socratic Sessions</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{studentReport.studyHabits?.socraticSessionsCompleted || 14}</div>
                <span style={{ fontSize: '0.75rem', color: '#10b981' }}>{studentReport.studyHabits?.completionRate || 94}% Completion</span>
              </div>
            </div>

            <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Flame size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Daily Active Streak</span>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>{studentReport.studyHabits?.activeRecallStreakDays || 12} Days</div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{studentReport.studyHabits?.masteredCardsCount || 38} Cards Mastered</span>
              </div>
            </div>
          </div>

          {/* Enrolled Courses Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 2px' }}>Enrolled Courses & Academic Standings</h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Detailed term assessments, faculty remarks, and class percentiles for {studentReport.studentName}.
                </p>
              </div>
              <span className="badge badge-indigo">{studentReport.subjectBreakdown?.length || 5} Active Courses</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {studentReport.subjectBreakdown?.map((sub, idx) => (
                <div key={idx} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px' }}>{sub.subject}</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Instructor: <strong>{sub.teacherName}</strong></span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${sub.gradeLetter.startsWith('A') ? 'badge-emerald' : sub.gradeLetter.startsWith('B') ? 'badge-indigo' : 'badge-amber'}`} style={{ fontSize: '0.95rem', fontWeight: 800 }}>
                          {sub.gradeLetter}
                        </span>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', marginTop: '2px' }}>{sub.score}%</div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', background: 'var(--bg-surface-elevated)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', margin: '0 0 14px', lineHeight: 1.45, fontStyle: 'italic' }}>
                      "{sub.teacherRemarks}"
                    </p>

                    {/* Strengths */}
                    {sub.strengths && sub.strengths.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', display: 'block', marginBottom: '6px' }}>
                          Verified Strengths:
                        </span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {sub.strengths.map((str, sIdx) => (
                            <span key={sIdx} className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                              ✓ {str}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Rank in Cohort: <strong>{sub.rankInClass}</strong></span>
                      <span style={{ fontWeight: 700 }}>{sub.score}% Mastery</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${sub.score}%`, height: '100%', background: 'var(--primary-gradient)', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE ATTENDANCE LOG */}
      {activeParentTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Attendance KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Overall Attendance</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', margin: '4px 0' }}>{studentReport.attendance.overallRate}%</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>School standard: 90%+</span>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Days Present</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, margin: '4px 0' }}>{studentReport.attendance.presentDays} <span style={{ fontSize: '1rem', color: 'var(--text-dim)' }}>/ {studentReport.attendance.totalDays}</span></div>
              <span style={{ fontSize: '0.75rem', color: '#10b981' }}>High Punctuality</span>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Excused Absences</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-light)', margin: '4px 0' }}>{studentReport.attendance.excusedAbsences || 2}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Doctor / Verified</span>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Tardies / Late</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b', margin: '4px 0' }}>{studentReport.attendance.tardies || 1}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Transit delay</span>
            </div>
          </div>

          {/* Attendance Audit Log Table */}
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 2px' }}>
                  Verified Period Attendance Records
                </h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Real-time check-in log reported by teachers and administration for {studentReport.studentName}.
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                {(['all', 'present', 'tardy', 'excused', 'absent'] as const).map(tabKey => (
                  <button
                    key={tabKey}
                    onClick={() => setAttendanceFilter(tabKey)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: 'none',
                      background: attendanceFilter === tabKey ? 'var(--primary)' : 'transparent',
                      color: attendanceFilter === tabKey ? '#ffffff' : 'var(--text-dim)',
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    {tabKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Records Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left', color: 'var(--text-dim)' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Course / Period</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: 600 }}>Instructor Note / Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendanceLog.length > 0 ? (
                    filteredAttendanceLog.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{log.date}</td>
                        <td style={{ padding: '12px 14px' }}>{log.subject}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span
                            className={`badge ${
                              log.status === 'present'
                                ? 'badge-emerald'
                                : log.status === 'tardy'
                                ? 'badge-amber'
                                : log.status === 'excused'
                                ? 'badge-indigo'
                                : 'badge-rose'
                            }`}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', color: 'var(--text-dim)' }}>
                          {log.note || 'Verified on-time arrival'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        No attendance records matching the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WEAK SECTIONS RADAR */}
      {activeParentTab === 'weak_sections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px 28px', borderLeft: '4px solid #f43f5e' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    Identified Areas for Improvement & Action Plan
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-dim)' }}>
                    Synchronized with {childFirstName}'s student portal and Dr. Vance's curriculum tracker.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNudgeModalOpen(true)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageCircle size={14} />
                <span>Send Support Note to {childFirstName}</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {studentReport.weakAreasRadar && studentReport.weakAreasRadar.length > 0 ? (
                studentReport.weakAreasRadar.map((weak, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-md)',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{weak.topic}</span>
                        <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{weak.subject}</span>
                      </div>
                      <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.12)', color: '#f43f5e', fontSize: '0.75rem', fontWeight: 700 }}>
                        {weak.severity.toUpperCase()} PRIORITY GAP
                      </span>
                    </div>

                    {/* What's Going Wrong */}
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', background: 'var(--bg-surface)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#f43f5e', fontWeight: 700, fontSize: '0.82rem' }}>
                        <AlertTriangle size={15} />
                        <span>Where {childFirstName} is going wrong:</span>
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.5 }}>{weak.misconceptionSummary}</p>
                    </div>

                    {/* Parent Home Support Tip */}
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-dim)', background: 'var(--primary-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-highlight)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.82rem' }}>
                        <Lightbulb size={15} />
                        <span>How you can support at home (No advanced math required):</span>
                      </div>
                      <p style={{ margin: 0, lineHeight: 1.5, color: 'var(--text-main)' }}>{weak.recommendedHomeAction}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 10px' }} />
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>All concept modules are currently on track with no critical gaps detected!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WEEKLY GROWTH DIGEST */}
      {activeParentTab === 'weekly_digest' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px' }}>
                  Weekly AI Progress Digest
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Auto-compiled weekly learning recap and growth analysis for {studentReport.studentName}.
                </p>
              </div>
              <span className="badge badge-indigo">{summary.weekLabel || 'Current Academic Week'}</span>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 20px', color: 'var(--text-main)' }}>
              {summary.headlineSummary}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Celebrations */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.875rem', marginBottom: '12px' }}>
                  <Award size={18} />
                  <span>Key Celebrations</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {summary.celebrations.map((cel, idx) => (
                    <li key={idx}>{cel}</li>
                  ))}
                </ul>
              </div>

              {/* Weekly Highlights */}
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '12px' }}>
                  <TrendingUp size={18} />
                  <span>Curriculum Focus Areas</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {summary.focusAreas?.map((fa, idx) => (
                    <div key={idx} style={{ fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '2px' }}>
                        <span>{fa.topic}</span>
                        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{fa.subject}</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.78rem' }}>{fa.homeActionTip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Dispatcher Bar */}
            <div
              style={{
                background: 'var(--bg-surface-glass)',
                border: '1px solid var(--border-highlight)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={20} color="var(--primary-light)" />
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Dispatch Weekly Digest to Guardian Email</span>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Sends a clean HTML report directly to your inbox.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '440px' }}>
                <input
                  type="email"
                  value={parentEmailInput}
                  onChange={e => setParentEmailInput(e.target.value)}
                  placeholder="parent@example.com"
                  className="input"
                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                />
                <button
                  onClick={handleSendDigestEmail}
                  disabled={isSendingEmail || !parentEmailInput}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <Send size={14} />
                  <span>{isSendingEmail ? 'Sending...' : 'Send Email'}</span>
                </button>
              </div>
            </div>

            {/* Email Result Status Banner */}
            {emailStatus && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: emailStatus.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${emailStatus.type === 'success' ? '#10b981' : '#ef4444'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {emailStatus.type === 'success' ? <CheckCircle2 size={16} color="#10b981" /> : <AlertTriangle size={16} color="#ef4444" />}
                  <span style={{ fontSize: '0.8125rem', color: emailStatus.type === 'success' ? '#10b981' : '#ef4444' }}>
                    {emailStatus.message}
                  </span>
                </div>
                {emailStatus.previewHtml && (
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    View HTML Email Preview
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DINNER TABLE STARTERS */}
      {activeParentTab === 'dinner_prompts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                    Family Dinner Table STEM Starters
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                    Thought-provoking conversation hooks tailored to what {childFirstName} is learning this week.
                  </p>
                </div>
              </div>

              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Coffee size={13} />
                Zero Math Test Stress
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {summary.dinnerTablePrompts && summary.dinnerTablePrompts.length > 0 ? (
                summary.dinnerTablePrompts.map((dp, idx) => {
                  const isDone = !!discussedPrompts[idx];
                  return (
                    <div
                      key={idx}
                      className="card"
                      style={{
                        padding: '20px',
                        background: isDone ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-glass)',
                        border: isDone ? '1px solid #10b981' : '1px solid var(--border-medium)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase' }}>
                            Conversation Hook
                          </span>
                        </div>

                        <button
                          onClick={() => togglePromptDiscussed(idx)}
                          className={`btn btn-sm ${isDone ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                        >
                          <Check size={14} />
                          <span>{isDone ? 'Discussed Tonight ✓' : 'Mark as Discussed'}</span>
                        </button>
                      </div>

                      <blockquote style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5, borderLeft: '3px solid var(--primary)', paddingLeft: '14px' }}>
                        "{dp.prompt}"
                      </blockquote>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                        <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                            Why this matters:
                          </span>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                            {dp.context}
                          </p>
                        </div>

                        <div style={{ background: 'var(--primary-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-highlight)' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                            Fun follow-up question:
                          </span>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                            {dp.followUp}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <HelpCircle size={32} style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0 }}>Dinner prompts will be generated automatically as new concepts are covered in class.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Encouragement Nudge Modal */}
      {isNudgeModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            className="glass-panel animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '28px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-highlight)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                  <Heart size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Send Encouragement to {studentReport.studentName}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    Your message will instantly appear on {childFirstName}'s learning portal.
                  </span>
                </div>
              </div>
              <button onClick={() => setIsNudgeModalOpen(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>

            {nudgeSuccess ? (
              <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(16, 185, 129, 0.12)', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
                <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontWeight: 700, color: '#10b981' }}>{nudgeSuccess}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    Quick Pre-made Notes:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {presetNudges.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendNudge(preset)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          textAlign: 'left',
                          padding: '10px 14px',
                          fontSize: '0.8rem',
                          lineHeight: 1.4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: 'var(--bg-surface-elevated)'
                        }}
                      >
                        <span>"{preset}"</span>
                        <Send size={12} style={{ flexShrink: 0, marginLeft: '8px' }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    Or Write a Custom Message:
                  </span>
                  <textarea
                    rows={3}
                    value={nudgeMessage}
                    onChange={e => setNudgeMessage(e.target.value)}
                    placeholder={`e.g. Great job on your physics lab today! Let me know if you want to study together later.`}
                    className="input"
                    style={{ width: '100%', resize: 'none', padding: '10px 14px', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => setIsNudgeModalOpen(false)} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendNudge()}
                    disabled={!nudgeMessage.trim()}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Send size={14} />
                    <span>Send Nudge</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HTML Email Preview Modal */}
      {showPreviewModal && emailStatus?.previewHtml && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-medium)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Weekly Digest Email Preview • {studentReport.studentName}
              </h3>
              <button onClick={() => setShowPreviewModal(false)} className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', background: '#ffffff', color: '#1e293b' }}>
              <div dangerouslySetInnerHTML={{ __html: emailStatus.previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
