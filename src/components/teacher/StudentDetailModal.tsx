import React, { useState } from 'react';
import { StudentClassroomMetric, StudentComprehensiveReport } from '../../types';
import { BackendService } from '../../services/backendService';
import { MathRenderer } from '../common/MathRenderer';
import {
  X,
  User,
  Mail,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  BookOpen,
  Flame,
  Award,
  Clock,
  ExternalLink,
  Phone,
  Sparkles
} from 'lucide-react';

interface StudentDetailModalProps {
  student: StudentClassroomMetric;
  isOpen: boolean;
  onClose: () => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'attendance' | 'weak_areas'>('overview');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailFeedback, setEmailFeedback] = useState<string>('');

  if (!isOpen) return null;

  const report: StudentComprehensiveReport = BackendService.getStudentReport(student.studentId);

  const handleSendParentDigest = async () => {
    setEmailStatus('sending');
    try {
      const res = await BackendService.sendParentWeeklyDigestEmail({
        studentId: student.studentId,
        parentEmail: report.parentEmail
      });
      if (res.success) {
        setEmailStatus('success');
        setEmailFeedback(`Weekly progress digest successfully dispatched to ${report.parentEmail}!`);
      } else {
        setEmailStatus('error');
        setEmailFeedback(res.error || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      setEmailStatus('error');
      setEmailFeedback(err.message || 'Error triggering notification.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'thriving':
        return <span className="badge badge-emerald">THRIVING (90%+)</span>;
      case 'on_track':
        return <span className="badge badge-cyan">ON TRACK (75-89%)</span>;
      case 'needs_support':
        return <span className="badge badge-amber">NEEDS SUPPORT (60-74%)</span>;
      default:
        return <span className="badge badge-rose">AT RISK (&lt;60%)</span>;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 8, 22, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '0',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <img
              src={student.avatar}
              alt={student.studentName}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '2px solid var(--primary-light)',
                objectFit: 'cover'
              }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {student.studentName}
                </h2>
                {getStatusBadge(student.status)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>ID: <strong>{student.studentId}</strong></span>
                <span>{report.grade}</span>
                <span>{report.school}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-dim)',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 24px',
            background: 'var(--bg-surface)'
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: activeTab === 'overview' ? 'var(--primary-light)' : 'var(--text-dim)',
              borderBottom: activeTab === 'overview' ? '2px solid var(--primary-light)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            360° Overview
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: activeTab === 'subjects' ? 'var(--primary-light)' : 'var(--text-dim)',
              borderBottom: activeTab === 'subjects' ? '2px solid var(--primary-light)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Subject Performance ({report.subjectBreakdown.length})
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: activeTab === 'attendance' ? 'var(--primary-light)' : 'var(--text-dim)',
              borderBottom: activeTab === 'attendance' ? '2px solid var(--primary-light)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Attendance & Engagement ({report.attendance.overallRate}%)
          </button>
          <button
            onClick={() => setActiveTab('weak_areas')}
            style={{
              padding: '14px 18px',
              border: 'none',
              background: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              color: activeTab === 'weak_areas' ? 'var(--primary-light)' : 'var(--text-dim)',
              borderBottom: activeTab === 'weak_areas' ? '2px solid var(--primary-light)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Misconceptions & Radar ({report.weakAreasRadar.length})
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Quick Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Overall Mastery</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                    {student.overallMastery}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Class Percentile: {student.overallMastery >= 90 ? 'Top 10%' : student.overallMastery >= 75 ? 'Top 35%' : 'Needs Focus'}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Attendance Rate</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                    {report.attendance.overallRate}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {report.attendance.presentDays} of {report.attendance.totalDays} Days Attended
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Active Streak</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Flame size={20} />
                    <span>{report.studyHabits.activeRecallStreakDays} Days</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Weekly Study: {report.studyHabits.weeklyFocusHours} hrs
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Cards Mastered</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7' }}>
                    {report.studyHabits.masteredCardsCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {report.studyHabits.socraticSessionsCompleted} Socratic Dialogues
                  </div>
                </div>
              </div>

              {/* Parent Contact Card & Email Dispatch */}
              <div
                style={{
                  padding: '18px 22px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(99, 102, 241, 0.07)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="#818cf8" />
                    <span>Parent / Guardian: {report.parentName}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Mail size={14} />
                    <span>{report.parentEmail}</span>
                  </div>
                </div>

                <button
                  onClick={handleSendParentDigest}
                  disabled={emailStatus === 'sending'}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={14} />
                  <span>{emailStatus === 'sending' ? 'Dispatching Email...' : 'Send Weekly Parent Digest'}</span>
                </button>
              </div>

              {emailStatus === 'success' && (
                <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>{emailFeedback}</span>
                </div>
              )}

              {/* Topic Breakdown Progress */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>Topic-Level Mastery Distribution</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {Object.entries(student.topicScores).map(([topicId, score]) => (
                    <div key={topicId} className="glass-card" style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                          {topicId.replace('_', ' ').toUpperCase()}
                        </span>
                        <span style={{ fontWeight: 700, color: score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e' }}>
                          {score}%
                        </span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-subtle)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${score}%`,
                            background: score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subjects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {report.subjectBreakdown.map((subj, idx) => (
                <div key={idx} className="glass-card" style={{ padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 2px 0' }}>{subj.subject}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Instructor: {subj.teacherName}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-indigo" style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                        {subj.score}% ({subj.gradeLetter})
                      </span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>{subj.rankInClass}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', fontStyle: 'italic', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px' }}>
                    "{subj.teacherRemarks}"
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#34d399' }}>Demonstrated Strengths:</span>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', color: 'var(--text-dim)' }}>
                        {subj.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span style={{ fontWeight: 700, color: '#f87171' }}>Target Growth Focus:</span>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', color: 'var(--text-dim)' }}>
                        {subj.weakSections.length > 0 ? (
                          subj.weakSections.map((wk, i) => <li key={i}>{wk}</li>)
                        ) : (
                          <li style={{ color: 'var(--text-dim)' }}>No critical deficits identified</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Days</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{report.attendance.totalDays}</div>
                </div>
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Present</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{report.attendance.presentDays}</div>
                </div>
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Excused</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{report.attendance.excusedAbsences}</div>
                </div>
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#f43f5e' }}>Unexcused</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>{report.attendance.unexcusedAbsences}</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px' }}>Recent Session Log</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {report.attendance.recentLog.map((log, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{log.date}</span>
                        <span style={{ color: 'var(--text-dim)' }}>•</span>
                        <span style={{ color: 'var(--text-muted)' }}>{log.subject}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{log.note}</span>
                        <span className={`badge ${log.status === 'present' ? 'badge-emerald' : log.status === 'excused' ? 'badge-amber' : 'badge-rose'}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weak_areas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {report.weakAreasRadar.map((area, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-lg)',
                    background: area.severity === 'critical' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    border: `1px solid ${area.severity === 'critical' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: area.severity === 'critical' ? '#fda4af' : '#fcd34d' }}>
                        {area.topic}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{area.subject}</div>
                    </div>
                    <span className={`badge ${area.severity === 'critical' ? 'badge-rose' : 'badge-amber'}`}>
                      {area.severity.toUpperCase()} RISK
                    </span>
                  </div>

                  <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '10px' }}>
                    <MathRenderer text={area.misconceptionSummary} />
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0, 0, 0, 0.2)', padding: '8px 12px', borderRadius: '6px' }}>
                    <strong>Recommended Intervention:</strong> {area.recommendedHomeAction}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
