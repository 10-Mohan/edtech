import React, { useState, useEffect, useMemo } from 'react';
import { StudentClassroomMetric } from '../../types';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock
} from 'lucide-react';

export interface EarlyWarningPanelProps {
  students: StudentClassroomMetric[];
  onSelectStudent?: (student: StudentClassroomMetric) => void;
}

export interface StudentRiskProfile {
  student: StudentClassroomMetric;
  riskScore: number; // 0 - 100
  riskLevel: 'High' | 'Medium';
  reasons: string[];
}

export const EarlyWarningPanel: React.FC<EarlyWarningPanelProps> = ({
  students,
  onSelectStudent
}) => {
  // Notified state keyed by studentId, backed by localStorage
  const [notifiedMap, setNotifiedMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem('waypoint_mentor_alerts');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      const res: Record<string, boolean> = {};
      Object.keys(parsed).forEach(id => {
        res[id] = true;
      });
      return res;
    } catch {
      return {};
    }
  });

  // Keep state synchronized across tabs or components
  useEffect(() => {
    const handleSync = () => {
      try {
        const raw = localStorage.getItem('waypoint_mentor_alerts');
        if (!raw) {
          setNotifiedMap({});
          return;
        }
        const parsed = JSON.parse(raw);
        const res: Record<string, boolean> = {};
        Object.keys(parsed).forEach(id => {
          res[id] = true;
        });
        setNotifiedMap(res);
      } catch {
        setNotifiedMap({});
      }
    };

    window.addEventListener('waypoint_mentor_alert_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('waypoint_mentor_alert_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Compute risk scores (0-100) and plain-language reasons
  const atRiskStudents: StudentRiskProfile[] = useMemo(() => {
    const results: StudentRiskProfile[] = [];

    students.forEach(student => {
      let score = 0;
      const reasons: string[] = [];

      // 1. Overall Mastery Impact
      if (student.overallMastery < 40) {
        score += 45;
        reasons.push(`Mastery critically low at ${student.overallMastery}% (< 40% cohort threshold)`);
      } else if (student.overallMastery < 65) {
        score += 25;
        reasons.push(`Overall mastery (${student.overallMastery}%) lagging behind cohort standard`);
      }

      // 2. Trend Impact
      if (student.trend === 'declining') {
        score += 30;
        reasons.push('Academic mastery dropped significantly over recent module tests');
      }

      // 3. Subject/Topic Specific Friction
      if (student.topicScores) {
        const entries = Object.entries(student.topicScores);
        const lowest = entries.sort((a, b) => a[1] - b[1])[0];
        if (lowest && lowest[1] < 45) {
          const topicLabels: Record<string, string> = {
            diff_01: 'Derivatives & Chain Rule',
            lim_01: 'Limits & Continuity',
            int_01: 'Integration',
            ds_arr_01: 'Data Structures: Arrays',
            ds_ll_01: 'Data Structures: Linked Lists',
            elec_ohm_01: 'Basic Electronics: Ohm’s Law'
          };
          const label = topicLabels[lowest[0]] || lowest[0];
          reasons.push(`Severe gap in ${label} (${lowest[1]}% mastery)`);
        }
      }

      // 4. Inactivity & Attendance Signals
      if (student.lastActive && (student.lastActive.includes('day') || student.lastActive.includes('week'))) {
        score += 15;
        if (reasons.length < 2) {
          reasons.push(`Inactive on adaptive platform for ${student.lastActive}`);
        }
      }

      if (student.attendanceRate && student.attendanceRate < 85) {
        score += 10;
        if (reasons.length < 2) {
          reasons.push(`Lecture & lab attendance fallen to ${student.attendanceRate}%`);
        }
      }

      // Fallback reason if needed
      if (reasons.length === 0) {
        reasons.push('Triggered proactive academic check-in threshold');
      }

      const finalScore = Math.min(100, score);
      if (finalScore >= 45 || student.status === 'at_risk' || student.trend === 'declining') {
        results.push({
          student,
          riskScore: finalScore,
          riskLevel: finalScore >= 70 ? 'High' : 'Medium',
          reasons: reasons.slice(0, 2)
        });
      }
    });

    // Sort descending by risk score
    return results.sort((a, b) => b.riskScore - a.riskScore);
  }, [students]);

  // Handler for notifying mentor
  const handleNotifyMentor = (profile: StudentRiskProfile) => {
    try {
      const raw = localStorage.getItem('waypoint_mentor_alerts');
      const currentAlerts = raw ? JSON.parse(raw) : {};

      currentAlerts[profile.student.studentId] = {
        studentId: profile.student.studentId,
        studentName: profile.student.studentName,
        riskLevel: profile.riskLevel,
        riskScore: profile.riskScore,
        reasons: profile.reasons,
        notifiedAt: new Date().toISOString()
      };

      localStorage.setItem('waypoint_mentor_alerts', JSON.stringify(currentAlerts));
      setNotifiedMap(prev => ({ ...prev, [profile.student.studentId]: true }));

      // Broadcast event for live cross-component sync
      window.dispatchEvent(new Event('waypoint_mentor_alert_updated'));
    } catch (err) {
      console.error('Failed to save mentor alert:', err);
    }
  };

  if (atRiskStudents.length === 0) {
    return null;
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: '22px 26px',
        border: '1.5px solid rgba(244, 63, 94, 0.3)',
        background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.06) 0%, rgba(15, 23, 42, 0.6) 100%)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      {/* Header Strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={20} color="#f43f5e" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Early Warning: Students Who Need Support
              </h2>
              <span
                className="badge badge-rose"
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: '#f43f5e',
                  border: '1px solid rgba(244, 63, 94, 0.3)'
                }}
              >
                {atRiskStudents.length} Flagged
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
              Automated algorithmic detection flagging low mastery, declining trends, and prolonged inactivity. Alert mentors with one click.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <Clock size={14} />
          <span>Real-time Risk Scoring</span>
        </div>
      </div>

      {/* Flagged Students List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {atRiskStudents.slice(0, 6).map(item => {
          const isNotified = Boolean(notifiedMap[item.student.studentId]);

          return (
            <div
              key={item.student.studentId}
              className="glass-card"
              style={{
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: item.riskLevel === 'High' ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={item.student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={item.student.studentName}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid var(--border-medium)'
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          color: 'var(--text-main)',
                          cursor: onSelectStudent ? 'pointer' : 'default'
                        }}
                        onClick={() => onSelectStudent && onSelectStudent(item.student)}
                        title={onSelectStudent ? 'View detailed student analytics' : undefined}
                      >
                        {item.student.studentName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {item.student.grade} • {item.student.lastActive}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`badge ${item.riskLevel === 'High' ? 'badge-rose' : 'badge-amber'}`}
                    style={{
                      background: item.riskLevel === 'High' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: item.riskLevel === 'High' ? '#f43f5e' : '#f59e0b',
                      border: item.riskLevel === 'High' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}
                  >
                    {item.riskLevel} Risk ({item.riskScore})
                  </span>
                </div>

                {/* Plain-Language Reasons */}
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {item.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-dim)',
                        lineHeight: 1.35,
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '6px'
                      }}
                    >
                      <span style={{ color: item.riskLevel === 'High' ? '#f43f5e' : '#f59e0b' }}>•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Strip: Notify Mentor Button */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Mastery: <strong style={{ color: item.student.overallMastery < 40 ? '#f43f5e' : '#f59e0b' }}>{item.student.overallMastery}%</strong>
                </div>

                {isNotified ? (
                  <button
                    disabled
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      borderColor: 'rgba(16, 185, 129, 0.4)',
                      color: '#10b981',
                      cursor: 'default'
                    }}
                  >
                    <CheckCircle2 size={14} color="#10b981" />
                    <span style={{ fontWeight: 600 }}>Mentor notified ✓</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNotifyMentor(item)}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      borderColor: 'rgba(245, 158, 11, 0.4)',
                      color: 'var(--text-main)'
                    }}
                    title={`Send early intervention alert to ${item.student.studentName}'s faculty mentor`}
                  >
                    <BellRing size={14} color="#f59e0b" />
                    <span>Notify Mentor</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
