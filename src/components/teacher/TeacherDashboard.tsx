import React, { useState } from 'react';
import { ConceptNode, DifferentiatedWorksheet, StudentClassroomMetric } from '../../types';
import { mockClassroomMetrics, mockWorksheets } from '../../data/mockData';
import { MathRenderer } from '../common/MathRenderer';
import {
  LayoutDashboard,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Sparkles,
  Download,
  Printer,
  Plus,
  CheckCircle2,
  TrendingDown,
  Layers
} from 'lucide-react';

interface TeacherDashboardProps {
  nodes: ConceptNode[];
  activeTeacherTab: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  nodes,
  activeTeacherTab
}) => {
  const [students, setStudents] = useState<StudentClassroomMetric[]>(mockClassroomMetrics);
  const [worksheets, setWorksheets] = useState<DifferentiatedWorksheet[]>(mockWorksheets);
  const [selectedWorksheet, setSelectedWorksheet] = useState<DifferentiatedWorksheet>(mockWorksheets[0]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleGenerateNewWorksheet = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newWs: DifferentiatedWorksheet = {
        id: `ws_${Date.now()}`,
        title: 'Tiered Differentiation: Vector Spaces & Matrices',
        subject: 'math',
        topicTitle: 'Vector Spaces & Matrices',
        createdAt: new Date().toISOString(),
        tier1Foundational: {
          targetStudents: ['Lucas Vance', 'Sophia Rodriguez'],
          description: 'Step-by-step matrix addition, scalar multiplication, and 2x2 determinant formulas.',
          problems: [
            'Given $A = \\begin{bmatrix} 2 & 3 \\\\ 1 & 4 \\end{bmatrix}$, compute $3A$.',
            'Find the determinant of matrix $B = \\begin{bmatrix} 5 & 2 \\\\ 3 & 1 \\end{bmatrix}$.',
            'State whether matrix $B$ has an inverse and explain why.'
          ]
        },
        tier2Intermediate: {
          targetStudents: ['Maya Lin', 'Aria Patel'],
          description: 'Matrix vector multiplication and 2D coordinate rotation geometry.',
          problems: [
            'Multiply $M = \\begin{bmatrix} 0 & -1 \\\\ 1 & 0 \\end{bmatrix}$ by vector $\\vec{v} = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$. What geometric rotation does this perform?',
            'Solve the system of equations using matrix inverses: $2x + y = 5$, $3x + 2y = 8$.'
          ]
        },
        tier3Extension: {
          targetStudents: ['Ethan Zhang'],
          description: 'Eigenvalues, eigenvectors, and linear transformation kernels.',
          problems: [
            'Find the eigenvalues $\\lambda$ of matrix $A = \\begin{bmatrix} 4 & 1 \\\\ 2 & 3 \\end{bmatrix}$ by solving $\\det(A - \\lambda I) = 0$.',
            'Prove that for any invertible matrix $M$, $\\det(M^{-1}) = \\frac{1}{\\det(M)}$.'
          ]
        }
      };

      setWorksheets(prev => [newWs, ...prev]);
      setSelectedWorksheet(newWs);
      setIsGenerating(false);
    }, 900);
  };

  const getHeatmapColor = (score?: number) => {
    if (score === undefined) return 'var(--bg-surface-elevated)';
    if (score >= 85) return 'rgba(16, 185, 129, 0.25)';
    if (score >= 70) return 'rgba(6, 182, 212, 0.25)';
    if (score >= 50) return 'rgba(245, 158, 11, 0.25)';
    return 'rgba(244, 63, 94, 0.3)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Instructor Header */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Teacher Orchestration Portal</h1>
              <span className="badge badge-cyan">AP STEM Cohort A</span>
            </div>
            <p style={{ margin: 0 }}>
              Live mastery matrices and automated 3-tier worksheet generation to eliminate 10+ hours of manual lesson differentiation.
            </p>
          </div>

          <button
            onClick={handleGenerateNewWorksheet}
            disabled={isGenerating}
            className="btn btn-primary"
          >
            <Sparkles size={16} />
            <span>{isGenerating ? 'AI Synthesizing Tiers...' : 'Auto-Generate Tiered Worksheet'}</span>
          </button>
        </div>
      </div>

      {/* View 1: Classroom Mastery Heatmap */}
      {activeTeacherTab === 'class_overview' && (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Classroom Concept Mastery Matrix</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="badge badge-emerald">Mastered (85%+)</span>
              <span className="badge badge-cyan">Proficient (70-84%)</span>
              <span className="badge badge-amber">Developing (50-69%)</span>
              <span className="badge badge-rose">Misconception Risk (&lt;50%)</span>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>Student</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>Overall</th>
                {nodes.slice(0, 6).map(node => (
                  <th key={node.id} style={{ padding: '12px 16px', color: 'var(--text-dim)', textAlign: 'center' }}>
                    {node.title.split(' ')[0]}
                  </th>
                ))}
                <th style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.studentId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={student.avatar} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{student.studentName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{student.grade}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                    {student.overallMastery}%
                  </td>

                  {nodes.slice(0, 6).map(node => {
                    const score = student.topicScores[node.id];
                    return (
                      <td key={node.id} style={{ padding: '8px', textAlign: 'center' }}>
                        <div
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: getHeatmapColor(score),
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.8125rem'
                          }}
                        >
                          {score !== undefined ? `${score}%` : '-'}
                        </div>
                      </td>
                    );
                  })}

                  <td style={{ padding: '14px 16px' }}>
                    {student.status === 'thriving' && <span className="badge badge-emerald">Thriving</span>}
                    {student.status === 'on_track' && <span className="badge badge-cyan">On Track</span>}
                    {student.status === 'needs_support' && <span className="badge badge-amber">Needs Support</span>}
                    {student.status === 'at_risk' && <span className="badge badge-rose">High Risk</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View 2: 3-Tier Differentiated Worksheet Studio */}
      {activeTeacherTab === 'tiered_worksheets' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', gap: '24px' }}>
          {/* Worksheets list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Generated Worksheets ({worksheets.length})
            </span>
            {worksheets.map(ws => (
              <div
                key={ws.id}
                onClick={() => setSelectedWorksheet(ws)}
                className={`glass-card interactive ${selectedWorksheet.id === ws.id ? 'selected-card' : ''}`}
                style={{
                  padding: '16px',
                  border: selectedWorksheet.id === ws.id ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                  background: selectedWorksheet.id === ws.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-glass-card)'
                }}
              >
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{ws.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(ws.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          {/* Worksheet Tier Inspector */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedWorksheet.title}</h2>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Topic: {selectedWorksheet.topicTitle} • Auto-grouped by student diagnostic readiness
                </span>
              </div>
              <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
                <Printer size={15} />
                <span>Print / Export PDF</span>
              </button>
            </div>

            {/* 3 Tier Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Tier 1: Foundational */}
              <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 800, color: '#fda4af', fontSize: '1rem' }}>
                    Tier 1: Foundational & Scaffolded Practice
                  </span>
                  <span className="badge badge-rose">
                    Assigned: {selectedWorksheet.tier1Foundational.targetStudents.join(', ')}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {selectedWorksheet.tier1Foundational.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedWorksheet.tier1Foundational.problems.map((prob, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                      <strong>{i + 1}.</strong> <MathRenderer text={prob} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier 2: Intermediate */}
              <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 800, color: '#a5b4fc', fontSize: '1rem' }}>
                    Tier 2: Intermediate Core Standard
                  </span>
                  <span className="badge badge-indigo">
                    Assigned: {selectedWorksheet.tier2Intermediate.targetStudents.join(', ')}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {selectedWorksheet.tier2Intermediate.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedWorksheet.tier2Intermediate.problems.map((prob, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                      <strong>{i + 1}.</strong> <MathRenderer text={prob} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tier 3: Extension */}
              <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 800, color: '#6ee7b7', fontSize: '1rem' }}>
                    Tier 3: Advanced Proof & Extension
                  </span>
                  <span className="badge badge-emerald">
                    Assigned: {selectedWorksheet.tier3Extension.targetStudents.join(', ')}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {selectedWorksheet.tier3Extension.description}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedWorksheet.tier3Extension.problems.map((prob, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                      <strong>{i + 1}.</strong> <MathRenderer text={prob} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Misconception Radar */}
      {activeTeacherTab === 'misconception_alerts' && (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <AlertTriangle size={24} color="#f43f5e" />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Cohort Misconception Alerts</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, color: '#fda4af' }}>Composite Derivatives (Chain Rule)</span>
                <span className="badge badge-rose">3 Students Affected</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '10px' }}>
                <MathRenderer text="Students are repeatedly dropping the internal derivative during $\frac{d}{dx}f(g(x))$." />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Affected: Maya Lin, Sophia Rodriguez, Lucas Vance
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, color: '#fcd34d' }}>Trigonometric Algebraic Isolation</span>
                <span className="badge badge-amber">2 Students Affected</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '10px' }}>
                <MathRenderer text="Students are neglecting negative roots when taking square roots of $\sin^2(x)$." />
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Affected: Sophia Rodriguez, Lucas Vance
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
