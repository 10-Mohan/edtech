import React, { useState, Suspense, lazy } from 'react';
import { ConceptNode, DifferentiatedWorksheet, StudentClassroomMetric } from '../../types';
import { mockClassroomMetrics } from '../../data/mockData';
import { MathRenderer } from '../common/MathRenderer';
import { BackendService } from '../../services/backendService';
import { CurriculumGeneratorService } from '../../services/curriculumGenerator';
import { LoadingFallback } from '../common/LoadingFallback';

const CurriculumEditorModal = lazy(() =>
  import('./CurriculumEditorModal').then(m => ({ default: m.CurriculumEditorModal }))
);
const TeacherOnboardingModal = lazy(() =>
  import('./TeacherOnboardingModal').then(m => ({ default: m.TeacherOnboardingModal }))
);
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
  Layers,
  GitFork,
  BookOpen,
  Compass
} from 'lucide-react';

interface TeacherDashboardProps {
  nodes: ConceptNode[];
  activeTeacherTab: string;
  onNodesUpdated?: (nodes: ConceptNode[]) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  nodes,
  activeTeacherTab,
  onNodesUpdated
}) => {
  const [students, setStudents] = useState<StudentClassroomMetric[]>(BackendService.getClassroomMetrics());
  const [worksheets, setWorksheets] = useState<DifferentiatedWorksheet[]>(BackendService.getWorksheets());
  const [selectedWorksheet, setSelectedWorksheet] = useState<DifferentiatedWorksheet>(worksheets[0] || BackendService.getWorksheets()[0]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState<boolean>(false);
  const [curriculumModalTab, setCurriculumModalTab] = useState<'topics' | 'worksheets' | 'ai_synthesizer'>('topics');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  const handleGenerateNewWorksheet = async () => {
    setIsGenerating(true);
    try {
      const topicName = nodes[Math.floor(Math.random() * nodes.length)]?.title || 'Vector Spaces & Matrices';
      const newWs = await CurriculumGeneratorService.generateDifferentiatedWorksheetAI(topicName, 'math');
      const updated = BackendService.addWorksheet(newWs, 'teacher');
      setWorksheets(updated);
      setSelectedWorksheet(newWs);
    } catch (e) {
      console.error('Worksheet generation failed:', e);
    } finally {
      setIsGenerating(false);
    }
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

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Classroom Quickstart Setup Wizard"
            >
              <Compass size={16} color="#a855f7" />
              <span>Quickstart Setup Wizard</span>
            </button>

            <button
              onClick={() => {
                setCurriculumModalTab('topics');
                setIsCurriculumModalOpen(true);
              }}
              className="btn btn-secondary"
              title="Add or edit Knowledge Graph syllabus nodes & worksheets"
            >
              <GitFork size={16} color="#22d3ee" />
              <span>Curriculum & Content Studio</span>
            </button>

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
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{student.studentName}</div>
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
                      <td key={node.id} style={{ padding: '10px', textAlign: 'center' }}>
                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: getHeatmapColor(score),
                            fontWeight: 700,
                            display: 'inline-block',
                            minWidth: '42px'
                          }}
                        >
                          {score !== undefined ? `${score}%` : '—'}
                        </div>
                      </td>
                    );
                  })}

                  <td style={{ padding: '14px 16px' }}>
                    <span
                      className={`badge ${
                        student.status === 'thriving'
                          ? 'badge-emerald'
                          : student.status === 'on_track'
                          ? 'badge-cyan'
                          : student.status === 'needs_support'
                          ? 'badge-amber'
                          : 'badge-rose'
                      }`}
                    >
                      {student.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View 2: Differentiated Worksheets Studio */}
      {(activeTeacherTab === 'tiered_worksheets' || activeTeacherTab === 'worksheet_studio') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: '24px' }}>
          {/* Left Column: List of Worksheets */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Worksheet Packs</h3>
              <button
                onClick={() => {
                  setCurriculumModalTab('worksheets');
                  setIsCurriculumModalOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                title="Author new 3-tier differentiated worksheet"
              >
                <Plus size={13} />
                <span>Author</span>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {worksheets.map(ws => (
                <div
                  key={ws.id}
                  onClick={() => setSelectedWorksheet(ws)}
                  className={`glass-card interactive ${selectedWorksheet?.id === ws.id ? 'selected-card' : ''}`}
                  style={{
                    padding: '14px',
                    border: selectedWorksheet?.id === ws.id ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {ws.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    <span>{ws.subject.toUpperCase()}</span>
                    <span>{new Date(ws.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: 3-Tier Worksheet Preview */}
          {selectedWorksheet && (
            <div className="glass-panel" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0' }}>{selectedWorksheet.title}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Target Concept: {selectedWorksheet.topicTitle}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
                    <Printer size={14} />
                    <span>Print Handout</span>
                  </button>
                  <button onClick={() => alert('PDF export ready for download!')} className="btn btn-primary btn-sm">
                    <Download size={14} />
                    <span>Export 3-Tier PDF</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Tier 1: Foundational */}
                <div style={{ borderLeft: '4px solid #38bdf8', paddingLeft: '16px', background: 'rgba(56, 189, 248, 0.05)', padding: '16px', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>Tier 1: Foundational Scaffolding</span>
                    <span className="badge badge-cyan">Assigned to: {selectedWorksheet.tier1Foundational.targetStudents.join(', ')}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {selectedWorksheet.tier1Foundational.description}
                  </p>
                  <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedWorksheet.tier1Foundational.problems.map((p, idx) => (
                      <li key={idx} style={{ fontSize: '0.875rem' }}>
                        <MathRenderer text={p} />
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tier 2: Intermediate */}
                <div style={{ borderLeft: '4px solid #6366f1', paddingLeft: '16px', background: 'rgba(99, 102, 241, 0.05)', padding: '16px', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#818cf8' }}>Tier 2: Standard Analytical Proficiency</span>
                    <span className="badge badge-indigo">Assigned to: {selectedWorksheet.tier2Intermediate.targetStudents.join(', ')}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {selectedWorksheet.tier2Intermediate.description}
                  </p>
                  <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedWorksheet.tier2Intermediate.problems.map((p, idx) => (
                      <li key={idx} style={{ fontSize: '0.875rem' }}>
                        <MathRenderer text={p} />
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Tier 3: Extension */}
                <div style={{ borderLeft: '4px solid #10b981', paddingLeft: '16px', background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#34d399' }}>Tier 3: Advanced Olympiad & Proofs Extension</span>
                    <span className="badge badge-emerald">Assigned to: {selectedWorksheet.tier3Extension.targetStudents.join(', ')}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {selectedWorksheet.tier3Extension.description}
                  </p>
                  <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedWorksheet.tier3Extension.problems.map((p, idx) => (
                      <li key={idx} style={{ fontSize: '0.875rem' }}>
                        <MathRenderer text={p} />
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 3: Cohort Misconception Radar */}
      {(activeTeacherTab === 'misconception_alerts' || activeTeacherTab === 'misconceptions') && (
        <div className="glass-panel" style={{ padding: '24px' }}>
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

      {/* Curriculum Studio Modal */}
      {isCurriculumModalOpen && (
        <Suspense fallback={<LoadingFallback message="Loading Curriculum Editor & Vector Indexer..." />}>
          <CurriculumEditorModal
            isOpen={isCurriculumModalOpen}
            onClose={() => setIsCurriculumModalOpen(false)}
            nodes={nodes}
            onNodesUpdated={updated => {
              if (onNodesUpdated) onNodesUpdated(updated);
            }}
            worksheets={worksheets}
            onWorksheetsUpdated={updated => {
              setWorksheets(updated);
              if (updated.length > 0 && (!selectedWorksheet || !updated.find(w => w.id === selectedWorksheet.id))) {
                setSelectedWorksheet(updated[0]);
              }
            }}
            initialTab={curriculumModalTab}
          />
        </Suspense>
      )}

      {/* Teacher Onboarding Quickstart Modal */}
      {isOnboardingOpen && (
        <Suspense fallback={<LoadingFallback message="Loading Teacher Quickstart..." />}>
          <TeacherOnboardingModal
            isOpen={isOnboardingOpen}
            onClose={() => setIsOnboardingOpen(false)}
            onComplete={data => {
              setIsOnboardingOpen(false);
              const currentNodes = BackendService.getConceptNodes();
              if (onNodesUpdated) onNodesUpdated(currentNodes);
              const updatedWs = BackendService.getWorksheets();
              setWorksheets(updatedWs);
              if (updatedWs.length > 0) {
                setSelectedWorksheet(updatedWs[0]);
              }
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
