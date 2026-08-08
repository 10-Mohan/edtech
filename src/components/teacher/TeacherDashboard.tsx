import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { ConceptNode, DifferentiatedWorksheet, StudentClassroomMetric, CohortMisconceptionAnalysis } from '../../types';
import { MathRenderer } from '../common/MathRenderer';
import { BackendService } from '../../services/backendService';
import { CurriculumGeneratorService } from '../../services/curriculumGenerator';
import { LoadingFallback } from '../common/LoadingFallback';
import { StudentDetailModal } from './StudentDetailModal';
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
  Compass,
  Search,
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  Flame,
  Award,
  ArrowUpDown,
  Filter,
  Eye,
  Send
} from 'lucide-react';

const CurriculumEditorModal = lazy(() =>
  import('./CurriculumEditorModal').then(m => ({ default: m.CurriculumEditorModal }))
);
const TeacherOnboardingModal = lazy(() =>
  import('./TeacherOnboardingModal').then(m => ({ default: m.TeacherOnboardingModal }))
);

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
  const [students, setStudents] = useState<StudentClassroomMetric[]>(() => BackendService.getClassroomMetrics());
  const [worksheets, setWorksheets] = useState<DifferentiatedWorksheet[]>(() => BackendService.getWorksheets());
  const [selectedWorksheet, setSelectedWorksheet] = useState<DifferentiatedWorksheet>(() => worksheets[0] || BackendService.getWorksheets()[0]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isCurriculumModalOpen, setIsCurriculumModalOpen] = useState<boolean>(false);
  const [curriculumModalTab, setCurriculumModalTab] = useState<'topics' | 'worksheets' | 'ai_synthesizer'>('topics');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Search, Filter & Sort Controls for 40-Student Cohort
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'thriving' | 'on_track' | 'needs_support' | 'at_risk'>('all');
  const [sortBy, setSortBy] = useState<'mastery_desc' | 'mastery_asc' | 'name' | 'attendance'>('mastery_desc');

  // Deep-Dive Modal State
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentClassroomMetric | null>(null);

  // Subscribe to live multi-device / cross-tab updates
  useEffect(() => {
    const unsubscribe = BackendService.subscribe(msg => {
      if (
        msg.type === 'STUDENT_METRIC_UPDATED' ||
        msg.type === 'COHORT_DATA_IMPORTED' ||
        msg.type === 'REMOTE_DB_SYNC'
      ) {
        setStudents(BackendService.getClassroomMetrics());
      }
      if (msg.type === 'WORKSHEET_CREATED') {
        const latestWs = BackendService.getWorksheets();
        setWorksheets(latestWs);
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute Cohort KPIs
  const cohortStats = useMemo(() => {
    const total = students.length || 40;
    const avgMastery = Math.round(students.reduce((acc, s) => acc + s.overallMastery, 0) / total);
    const avgAttendance = (
      students.reduce((acc, s) => acc + (s.attendanceRate || 95), 0) / total
    ).toFixed(1);
    const thrivingCount = students.filter(s => s.status === 'thriving').length;
    const onTrackCount = students.filter(s => s.status === 'on_track').length;
    const needsSupportCount = students.filter(s => s.status === 'needs_support').length;
    const atRiskCount = students.filter(s => s.status === 'at_risk').length;

    return {
      total,
      avgMastery,
      avgAttendance,
      thrivingCount,
      onTrackCount,
      needsSupportCount,
      atRiskCount
    };
  }, [students]);

  // Dynamically compute Misconception Clusters
  const misconceptions = useMemo(() => {
    return BackendService.computeCohortMisconceptions(students);
  }, [students]);

  // Filtered & Sorted Student List
  const filteredStudents = useMemo(() => {
    let list = [...students];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        s =>
          s.studentName.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          (s.studentEmail && s.studentEmail.toLowerCase().includes(q)) ||
          (s.parentName && s.parentName.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(s => s.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'mastery_desc') return b.overallMastery - a.overallMastery;
      if (sortBy === 'mastery_asc') return a.overallMastery - b.overallMastery;
      if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
      if (sortBy === 'attendance') return (b.attendanceRate || 0) - (a.attendanceRate || 0);
      return 0;
    });

    return list;
  }, [students, searchQuery, statusFilter, sortBy]);

  const handleGenerateNewWorksheet = async (topicTitle?: string) => {
    setIsGenerating(true);
    try {
      const targetTopic = topicTitle || nodes[Math.floor(Math.random() * nodes.length)]?.title || 'Composite Chain Rule Derivatives';
      const newWs = await CurriculumGeneratorService.generateDifferentiatedWorksheetAI(targetTopic, 'math');
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
              <span className="badge badge-cyan">AP STEM Cohort ({students.length} Enrolled)</span>
            </div>
            <p style={{ margin: 0 }}>
              Live mastery matrices, 40-student synchronized records, and automated 3-tier worksheet generation to eliminate 10+ hours of manual lesson differentiation.
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
              onClick={() => handleGenerateNewWorksheet()}
              disabled={isGenerating}
              className="btn btn-primary"
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'AI Synthesizing Tiers...' : 'Auto-Generate Tiered Worksheet'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Key Performance Metrics Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Total Cohort Roster</span>
            <Users size={18} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {cohortStats.total} Students
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Fully synchronized across faculty and parent portals
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Class Average Mastery</span>
            <Award size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
            {cohortStats.avgMastery}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {cohortStats.thrivingCount} Thriving • {cohortStats.onTrackCount} On Track
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Average Attendance</span>
            <UserCheck size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#06b6d4' }}>
            {cohortStats.avgAttendance}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Oakwood Horizon STEM Academy Term
          </div>
        </div>

        <div className="glass-card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Target Interventions</span>
            <AlertTriangle size={18} color="#f43f5e" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f43f5e' }}>
            {cohortStats.needsSupportCount + cohortStats.atRiskCount} Students
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {cohortStats.atRiskCount} Critical At-Risk • {cohortStats.needsSupportCount} Support Needed
          </div>
        </div>
      </div>

      {/* View 1: Classroom Mastery Heatmap (40-Student Synchronized Roster) */}
      {activeTeacherTab === 'class_overview' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          {/* Header & Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px 0' }}>Classroom Concept Mastery Matrix</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Showing {filteredStudents.length} of {students.length} students
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search Box */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Search student or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    paddingLeft: '32px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-main)',
                    width: '100%'
                  }}
                />
              </div>

              {/* Status Filter Dropdown */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)'
                }}
              >
                <option value="all">All Statuses ({students.length})</option>
                <option value="thriving">Thriving ({cohortStats.thrivingCount})</option>
                <option value="on_track">On Track ({cohortStats.onTrackCount})</option>
                <option value="needs_support">Needs Support ({cohortStats.needsSupportCount})</option>
                <option value="at_risk">At Risk ({cohortStats.atRiskCount})</option>
              </select>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                style={{
                  padding: '6px 10px',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)'
                }}
              >
                <option value="mastery_desc">Highest Mastery</option>
                <option value="mastery_asc">Lowest Mastery (Intervention)</option>
                <option value="name">Alphabetical (A-Z)</option>
                <option value="attendance">Highest Attendance</option>
              </select>
            </div>
          </div>

          {/* Heatmap Legend */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">Mastered (85%+)</span>
            <span className="badge badge-cyan">Proficient (70-84%)</span>
            <span className="badge badge-amber">Developing (50-69%)</span>
            <span className="badge badge-rose">Misconception Risk (&lt;50%)</span>
          </div>

          {/* Responsive Table Container */}
          <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>Student Name & ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>Mastery</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)', textAlign: 'center' }}>Attendance</th>
                  {nodes.slice(0, 6).map(node => (
                    <th key={node.id} style={{ padding: '12px 16px', color: 'var(--text-dim)', textAlign: 'center' }}>
                      {node.title.split(' ')[0]}
                    </th>
                  ))}
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)' }}>Status</th>
                  <th style={{ padding: '12px 16px', color: 'var(--text-dim)', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr
                    key={student.studentId}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background 0.2s ease'
                    }}
                    className="interactive-row"
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => setSelectedStudentForDetail(student)}
                      >
                        <img
                          src={student.avatar}
                          alt={student.studentName}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{student.studentName}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            ID: {student.studentId} • {student.grade || '11th Grade'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{student.overallMastery}%</span>
                        <div style={{ width: '50px', height: '5px', borderRadius: '3px', background: 'var(--border-subtle)', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${student.overallMastery}%`,
                              background: student.overallMastery >= 85 ? '#10b981' : student.overallMastery >= 70 ? '#06b6d4' : student.overallMastery >= 50 ? '#f59e0b' : '#f43f5e'
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: (student.attendanceRate || 95) >= 95 ? '#10b981' : '#f59e0b' }}>
                        {student.attendanceRate || 95}%
                      </span>
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

                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedStudentForDetail(student)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px' }}
                        title="Open comprehensive 360° student report"
                      >
                        <Eye size={13} />
                        <span>360° Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                    border: selectedWorksheet?.id === ws.id ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer'
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

      {/* View 3: Dynamic Cohort Misconception Radar (Calculated from 40 Students) */}
      {(activeTeacherTab === 'misconception_alerts' || activeTeacherTab === 'misconceptions') && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={24} color="#f43f5e" />
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Dynamic Cohort Misconception Radar</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Aggregated from {students.length} active student diagnostic scores and topic error logs
                </span>
              </div>
            </div>

            <button
              onClick={() => handleGenerateNewWorksheet('Composite Chain Rule Derivatives')}
              disabled={isGenerating}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={14} />
              <span>{isGenerating ? 'Synthesizing...' : 'Generate 3-Tier Remediation Pack'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
            {misconceptions.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '22px',
                  borderRadius: 'var(--radius-lg)',
                  background: item.severity === 'critical' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${item.severity === 'critical' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: '0 0 2px 0', color: item.severity === 'critical' ? '#fda4af' : '#fcd34d' }}>
                      {item.topicTitle}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{item.subject}</span>
                  </div>
                  <span className={`badge ${item.severity === 'critical' ? 'badge-rose' : 'badge-amber'}`}>
                    {item.affectedCount} of {item.totalStudents} Students ({item.affectedPercentage}%)
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  <MathRenderer text={item.misconceptionDetails} />
                </div>

                {/* Affected Students Avatars */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '6px', fontWeight: 600 }}>
                    Affected Cohort (Avg Score: {item.averageScore}%):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {item.affectedStudents.map(st => (
                      <div
                        key={st.id}
                        onClick={() => {
                          const full = students.find(s => s.studentId === st.id);
                          if (full) setSelectedStudentForDetail(full);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(0, 0, 0, 0.25)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                        title={`Score: ${st.score}% - Click for 360 report`}
                      >
                        <img src={st.avatar} alt="" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                        <span>{st.name}</span>
                        <span style={{ color: '#f87171', fontWeight: 700 }}>({st.score}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Home / Class Action */}
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.04)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--primary-light)' }}>Action Plan: </strong>
                  {item.recommendedIntervention}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student 360 Deep-Dive Modal */}
      {selectedStudentForDetail && (
        <StudentDetailModal
          student={selectedStudentForDetail}
          isOpen={!!selectedStudentForDetail}
          onClose={() => setSelectedStudentForDetail(null)}
        />
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
