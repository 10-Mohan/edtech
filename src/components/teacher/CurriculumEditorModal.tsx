import React, { useState, useEffect } from 'react';
import { ConceptNode, DifferentiatedWorksheet, SubjectId } from '../../types';
import { CurriculumGeneratorService } from '../../services/curriculumGenerator';
import { BackendService } from '../../services/backendService';
import { VectorService } from '../../services/vectorService';
import { MathRenderer } from '../common/MathRenderer';
import {
  Layers,
  X,
  Plus,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  BookOpen,
  GitFork,
  FileText,
  Search,
  AlertCircle,
  Database,
  Check,
  Loader2,
  ListPlus,
  Compass,
  ArrowRight
} from 'lucide-react';

interface CurriculumEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: ConceptNode[];
  onNodesUpdated: (nodes: ConceptNode[]) => void;
  worksheets?: DifferentiatedWorksheet[];
  onWorksheetsUpdated?: (worksheets: DifferentiatedWorksheet[]) => void;
  initialTab?: 'topics' | 'worksheets' | 'ai_synthesizer';
}

export const CurriculumEditorModal: React.FC<CurriculumEditorModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onNodesUpdated,
  worksheets = [],
  onWorksheetsUpdated,
  initialTab = 'topics'
}) => {
  const [tab, setTab] = useState<'topics' | 'worksheets' | 'ai_synthesizer'>(initialTab);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<SubjectId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Concept Node Edit State
  const [editingNode, setEditingNode] = useState<Partial<ConceptNode> | null>(null);
  const [newTakeawayInput, setNewTakeawayInput] = useState<string>('');

  // Worksheet Edit State
  const [localWorksheets, setLocalWorksheets] = useState<DifferentiatedWorksheet[]>(
    worksheets.length > 0 ? worksheets : BackendService.getWorksheets()
  );
  const [editingWorksheet, setEditingWorksheet] = useState<Partial<DifferentiatedWorksheet> | null>(null);
  const [newProblemInputs, setNewProblemInputs] = useState<{ tier1: string; tier2: string; tier3: string }>({
    tier1: '',
    tier2: '',
    tier3: ''
  });

  // AI Course Generator State
  const [subject, setSubject] = useState<SubjectId>('math');
  const [courseTitle, setCourseTitle] = useState<string>('Multivariable Calculus & Linear Systems');
  const [keyUnits, setKeyUnits] = useState<string>('Vector Fields, Eigenvalues, Stokes Theorem, Line Integrals');
  const [generateWorksheetsWithAI, setGenerateWorksheetsWithAI] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Vector / Qdrant Real-time Status State
  const [embeddingStatus, setEmbeddingStatus] = useState<{
    inProgress: boolean;
    lastSavedTitle?: string;
    dim?: number;
    success?: boolean;
  } | null>(null);

  useEffect(() => {
    if (worksheets && worksheets.length > 0) {
      setLocalWorksheets(worksheets);
    }
  }, [worksheets]);

  useEffect(() => {
    if (isOpen && initialTab) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Filtered Concept Nodes
  const filteredNodes = nodes.filter(n => {
    const matchesSubject = activeSubjectFilter === 'all' || n.subject === activeSubjectFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // Filtered Worksheets
  const filteredWorksheets = localWorksheets.filter(w => {
    const matchesSubject = activeSubjectFilter === 'all' || w.subject === activeSubjectFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.topicTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  // -------------------------------------------------------------
  // CONCEPT NODE ACTIONS
  // -------------------------------------------------------------
  const handleStartAddNode = () => {
    setEditingNode({
      subject: activeSubjectFilter === 'all' ? 'math' : activeSubjectFilter,
      category: 'Core Syllabus',
      masteryScore: 70,
      prerequisites: [],
      keyTakeaways: ['Foundational intuition', 'Edge case analysis'],
      estimatedStudyMins: 20
    });
    setNewTakeawayInput('');
  };

  const handleTogglePrerequisite = (prereqId: string) => {
    if (!editingNode) return;
    const current = editingNode.prerequisites || [];
    if (current.includes(prereqId)) {
      setEditingNode({
        ...editingNode,
        prerequisites: current.filter(id => id !== prereqId)
      });
    } else {
      setEditingNode({
        ...editingNode,
        prerequisites: [...current, prereqId]
      });
    }
  };

  const handleAddTakeaway = () => {
    if (!newTakeawayInput.trim() || !editingNode) return;
    const current = editingNode.keyTakeaways || [];
    setEditingNode({
      ...editingNode,
      keyTakeaways: [...current, newTakeawayInput.trim()]
    });
    setNewTakeawayInput('');
  };

  const handleRemoveTakeaway = (idx: number) => {
    if (!editingNode) return;
    const current = [...(editingNode.keyTakeaways || [])];
    current.splice(idx, 1);
    setEditingNode({ ...editingNode, keyTakeaways: current });
  };

  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode || !editingNode.title) return;

    const nodeToSave: ConceptNode = {
      id: editingNode.id || `node_${Date.now()}`,
      title: editingNode.title.trim(),
      subject: editingNode.subject || 'math',
      category: editingNode.category?.trim() || 'Core Syllabus',
      status: editingNode.status || 'in_progress',
      masteryScore: editingNode.masteryScore ?? 65,
      prerequisites: editingNode.prerequisites || [],
      x: editingNode.x ?? (200 + Math.floor(Math.random() * 400)),
      y: editingNode.y ?? (100 + Math.floor(Math.random() * 300)),
      description: editingNode.description?.trim() || 'First-principles conceptual understanding.',
      estimatedStudyMins: editingNode.estimatedStudyMins || 20,
      commonMisconception: editingNode.commonMisconception?.trim() || '',
      keyTakeaways: editingNode.keyTakeaways && editingNode.keyTakeaways.length > 0
        ? editingNode.keyTakeaways
        : ['Core intuition master', 'Problem solving heuristics']
    };

    // 1. Save to Backend / Database
    const updated = BackendService.addOrUpdateConceptNode(nodeToSave, 'teacher');
    onNodesUpdated(updated);

    // 2. Auto-embed into Qdrant Vector Store
    setEmbeddingStatus({ inProgress: true, lastSavedTitle: nodeToSave.title });
    try {
      const vectorRes = await VectorService.indexSingleConceptNode(nodeToSave);
      setEmbeddingStatus({
        inProgress: false,
        lastSavedTitle: nodeToSave.title,
        dim: vectorRes.vectorDim,
        success: vectorRes.success
      });
    } catch (err) {
      setEmbeddingStatus({
        inProgress: false,
        lastSavedTitle: nodeToSave.title,
        success: false
      });
    }

    setEditingNode(null);
  };

  const handleDeleteNode = (id: string) => {
    const updated = nodes.filter(n => n.id !== id);
    BackendService.saveConceptNodes(updated);
    VectorService.deleteFromVectorStore(id);
    onNodesUpdated(updated);
  };

  // -------------------------------------------------------------
  // WORKSHEET ACTIONS
  // -------------------------------------------------------------
  const handleStartAddWorksheet = () => {
    const initialSubject = activeSubjectFilter === 'all' ? 'math' : activeSubjectFilter;
    const initialTopic = nodes.find(n => n.subject === initialSubject)?.title || 'Fundamental Calculus';

    setEditingWorksheet({
      title: `${initialTopic} Differentiated Practice`,
      subject: initialSubject,
      topicTitle: initialTopic,
      tier1Foundational: {
        targetStudents: ['Students scoring < 70%'],
        description: 'Scaffolded step-by-step guidance focusing on core definitions.',
        problems: [
          'State the formal definition of the concept.',
          'Solve $\\int x e^x dx$ using integration by parts formula $\\int u dv = uv - \\int v du$.'
        ]
      },
      tier2Intermediate: {
        targetStudents: ['On-grade mastery cohort'],
        description: 'Standard multi-step problem solving with analytical justification.',
        problems: [
          'Evaluate $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$ using first principles or L\'Hôpital\'s rule.'
        ]
      },
      tier3Extension: {
        targetStudents: ['High mastery / Olympiad track'],
        description: 'Challenging open-ended generalization and proof-oriented synthesis.',
        problems: [
          'Prove that $\\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6}$ using Fourier series or double contour integration.'
        ]
      }
    });
    setNewProblemInputs({ tier1: '', tier2: '', tier3: '' });
  };

  const handleAddProblemToTier = (tier: 'tier1' | 'tier2' | 'tier3') => {
    const problemText = newProblemInputs[tier].trim();
    if (!problemText || !editingWorksheet) return;

    const tierKey = tier === 'tier1' ? 'tier1Foundational' : tier === 'tier2' ? 'tier2Intermediate' : 'tier3Extension';
    const currentTierData = editingWorksheet[tierKey] || { targetStudents: [], description: '', problems: [] };

    setEditingWorksheet({
      ...editingWorksheet,
      [tierKey]: {
        ...currentTierData,
        problems: [...(currentTierData.problems || []), problemText]
      }
    });

    setNewProblemInputs(prev => ({ ...prev, [tier]: '' }));
  };

  const handleRemoveProblemFromTier = (tier: 'tier1' | 'tier2' | 'tier3', index: number) => {
    if (!editingWorksheet) return;
    const tierKey = tier === 'tier1' ? 'tier1Foundational' : tier === 'tier2' ? 'tier2Intermediate' : 'tier3Extension';
    const currentTierData = editingWorksheet[tierKey];
    if (!currentTierData) return;

    const updatedProblems = [...currentTierData.problems];
    updatedProblems.splice(index, 1);

    setEditingWorksheet({
      ...editingWorksheet,
      [tierKey]: {
        ...currentTierData,
        problems: updatedProblems
      }
    });
  };

  const handleSaveWorksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorksheet || !editingWorksheet.title) return;

    const worksheetToSave: DifferentiatedWorksheet = {
      id: editingWorksheet.id || `ws_${Date.now()}`,
      title: editingWorksheet.title.trim(),
      subject: editingWorksheet.subject || 'math',
      topicTitle: editingWorksheet.topicTitle?.trim() || 'Core Topic',
      createdAt: editingWorksheet.createdAt || new Date().toISOString().split('T')[0],
      tier1Foundational: editingWorksheet.tier1Foundational || {
        targetStudents: ['Review group'],
        description: 'Scaffolded practice',
        problems: ['Practice problem 1']
      },
      tier2Intermediate: editingWorksheet.tier2Intermediate || {
        targetStudents: ['Core group'],
        description: 'Standard practice',
        problems: ['Standard problem 1']
      },
      tier3Extension: editingWorksheet.tier3Extension || {
        targetStudents: ['Extension group'],
        description: 'Advanced synthesis',
        problems: ['Challenge problem 1']
      }
    };

    // 1. Save in Backend Service
    const updated = BackendService.addOrUpdateWorksheet(worksheetToSave, 'teacher');
    setLocalWorksheets(updated);
    if (onWorksheetsUpdated) onWorksheetsUpdated(updated);

    // 2. Auto-embed into Qdrant Vector Store
    setEmbeddingStatus({ inProgress: true, lastSavedTitle: worksheetToSave.title });
    try {
      const vectorRes = await VectorService.indexSingleWorksheet(worksheetToSave);
      setEmbeddingStatus({
        inProgress: false,
        lastSavedTitle: worksheetToSave.title,
        dim: vectorRes.vectorDim,
        success: vectorRes.success
      });
    } catch (err) {
      setEmbeddingStatus({
        inProgress: false,
        lastSavedTitle: worksheetToSave.title,
        success: false
      });
    }

    setEditingWorksheet(null);
  };

  const handleDeleteWorksheet = (id: string) => {
    const updated = BackendService.deleteWorksheet(id, 'teacher');
    setLocalWorksheets(updated);
    VectorService.deleteFromVectorStore(id);
    if (onWorksheetsUpdated) onWorksheetsUpdated(updated);
  };

  // -------------------------------------------------------------
  // AI COURSE & WORKSHEET SYNTHESIS
  // -------------------------------------------------------------
  const handleAIGenerateCourse = async () => {
    setIsGenerating(true);
    setEmbeddingStatus({ inProgress: true, lastSavedTitle: `AI Course: ${courseTitle}` });

    try {
      const result = await CurriculumGeneratorService.generateCourseCurriculum({
        subject,
        courseTitle,
        targetLevel: 'ap_advanced',
        keyUnits: keyUnits.split(',').map(s => s.trim()).filter(Boolean),
        generateQuestions: true
      });

      // Combine with existing nodes
      const updatedNodes = [...result.nodes, ...nodes];
      BackendService.saveConceptNodes(updatedNodes);
      onNodesUpdated(updatedNodes);

      // Auto-embed all generated concept nodes into Qdrant
      await VectorService.indexConceptNodes(updatedNodes);

      // If worksheets were generated or requested, scaffold them
      if (generateWorksheetsWithAI) {
        const generatedWorksheets: DifferentiatedWorksheet[] = result.nodes.slice(0, 3).map((node, i) => ({
          id: `ws_gen_${Date.now()}_${i}`,
          title: `${node.title} Differentiated Mastery Pack`,
          subject: node.subject,
          topicTitle: node.title,
          createdAt: new Date().toISOString().split('T')[0],
          tier1Foundational: {
            targetStudents: ['Needs Scaffolding'],
            description: `Guided intuition on ${node.title}. Focus on avoiding: ${node.commonMisconception}`,
            problems: [
              `Identify the core parameters in ${node.title}.`,
              `Solve foundational exercise: evaluate key intuition for ${node.keyTakeaways[0] || 'the fundamental equation'}.`
            ]
          },
          tier2Intermediate: {
            targetStudents: ['On-Track Mastery'],
            description: `Multi-step application of ${node.title}.`,
            problems: [
              `Apply ${node.title} principles to calculate the rate of change or equilibrium state.`,
              `Explain how ${node.title} connects to prerequisite concepts (${node.prerequisites.join(', ') || 'foundations'}).`
            ]
          },
          tier3Extension: {
            targetStudents: ['Advanced / Olympiad'],
            description: `Rigorous derivation and theoretical edge case analysis for ${node.title}.`,
            problems: [
              `Derive the asymptotic behavior or general boundary formulation for ${node.title}.`,
              `Construct a novel mathematical model leveraging ${node.title} under non-ideal constraints.`
            ]
          }
        }));

        let currentWs = BackendService.getWorksheets();
        for (const ws of generatedWorksheets) {
          currentWs = BackendService.addOrUpdateWorksheet(ws, 'teacher');
          await VectorService.indexSingleWorksheet(ws);
        }
        setLocalWorksheets(currentWs);
        if (onWorksheetsUpdated) onWorksheetsUpdated(currentWs);
      }

      setEmbeddingStatus({
        inProgress: false,
        lastSavedTitle: courseTitle,
        dim: 1536,
        success: true
      });

      setTab('topics');
    } catch (e) {
      console.error('Course generation failed:', e);
      setEmbeddingStatus({
        inProgress: false,
        lastSavedTitle: courseTitle,
        success: false
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          padding: '28px',
          boxShadow: '0 30px 70px rgba(0,0,0,0.65)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '92vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}
      >
        {/* MODAL HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 10px 22px rgba(6,182,212,0.35)'
              }}
            >
              <GitFork size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Teacher Curriculum & Content Studio
                </h2>
                <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                  <Database size={12} />
                  <span>Qdrant RAG Enabled</span>
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: '4px 0 0 0' }}>
                Author knowledge graphs, prerequisites, and 3-tier differentiated worksheets with automatic real-time vector embedding.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '34px', height: '34px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* EMBEDDING NOTIFICATION BANNER */}
        {embeddingStatus && (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: embeddingStatus.inProgress
                ? 'rgba(6,182,212,0.12)'
                : embeddingStatus.success
                ? 'rgba(16,185,129,0.14)'
                : 'rgba(239,68,68,0.14)',
              border: `1px solid ${
                embeddingStatus.inProgress
                  ? 'rgba(6,182,212,0.3)'
                  : embeddingStatus.success
                  ? 'rgba(16,185,129,0.35)'
                  : 'rgba(239,68,68,0.35)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              color: 'var(--text-main)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {embeddingStatus.inProgress ? (
                <Loader2 size={16} className="animate-spin" style={{ color: '#06b6d4' }} />
              ) : embeddingStatus.success ? (
                <Check size={16} style={{ color: '#10b981' }} />
              ) : (
                <AlertCircle size={16} style={{ color: '#ef4444' }} />
              )}
              <span>
                {embeddingStatus.inProgress
                  ? `Generating 1536-dim semantic embeddings and pushing to Qdrant for "${embeddingStatus.lastSavedTitle}"...`
                  : embeddingStatus.success
                  ? `Auto-embedded "${embeddingStatus.lastSavedTitle}" into Qdrant Vector Index (${embeddingStatus.dim || 1536}-dim). Ready for AI Tutor RAG.`
                  : `Failed to embed "${embeddingStatus.lastSavedTitle}" into Qdrant. Offline cache preserved.`}
              </span>
            </div>
            {!embeddingStatus.inProgress && (
              <button
                onClick={() => setEmbeddingStatus(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setTab('topics');
                setEditingNode(null);
              }}
              className={`btn ${tab === 'topics' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <BookOpen size={15} />
              <span>Concept Topics ({nodes.length})</span>
            </button>

            <button
              onClick={() => {
                setTab('worksheets');
                setEditingWorksheet(null);
              }}
              className={`btn ${tab === 'worksheets' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <FileText size={15} />
              <span>3-Tier Worksheets ({localWorksheets.length})</span>
            </button>

            <button
              onClick={() => {
                setTab('ai_synthesizer');
                setEditingNode(null);
                setEditingWorksheet(null);
              }}
              className={`btn ${tab === 'ai_synthesizer' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <Sparkles size={15} />
              <span>AI Curriculum Synthesizer</span>
            </button>
          </div>

          {/* Subject Filter Chips */}
          {tab !== 'ai_synthesizer' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['all', 'math', 'physics', 'cs', 'biology'] as const).map(sub => (
                <button
                  key={sub}
                  onClick={() => setActiveSubjectFilter(sub)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: activeSubjectFilter === sub ? 'var(--primary-light)' : 'var(--border-subtle)',
                    background: activeSubjectFilter === sub ? 'rgba(99,102,241,0.2)' : 'transparent',
                    color: activeSubjectFilter === sub ? 'var(--primary-light)' : 'var(--text-dim)',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: CONCEPT NODES & PREREQUISITES */}
        {/* ========================================================= */}
        {tab === 'topics' && !editingNode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Search & Add Bar */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
                <input
                  type="text"
                  placeholder="Search topics by title, category, or description..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button onClick={handleStartAddNode} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <Plus size={15} />
                <span>New Concept Topic</span>
              </button>
            </div>

            {/* Topics List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
              {filteredNodes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No concept topics match your filter.</p>
                </div>
              ) : (
                filteredNodes.map(node => {
                  const prereqNodes = nodes.filter(n => (node.prerequisites || []).includes(n.id));

                  return (
                    <div
                      key={node.id}
                      className="glass-card"
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            {node.title}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                            {node.category}
                          </span>
                          <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                            {node.subject.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ⏳ {node.estimatedStudyMins || 20}m study
                          </span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '5px' }}>
                          <MathRenderer text={node.description.slice(0, 120) + (node.description.length > 120 ? '...' : '')} />
                        </div>

                        {/* Prerequisites Chips */}
                        {prereqNodes.length > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              Prerequisites:
                            </span>
                            {prereqNodes.map(p => (
                              <span
                                key={p.id}
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  background: 'rgba(99,102,241,0.15)',
                                  border: '1px solid rgba(99,102,241,0.3)',
                                  color: 'var(--primary-light)',
                                  fontSize: '0.7rem'
                                }}
                              >
                                {p.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setEditingNode(node)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '32px', height: '32px' }}
                          title="Edit Topic & Prerequisites"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteNode(node.id)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '32px', height: '32px', color: '#f43f5e' }}
                          title="Delete Topic"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TOPIC EDIT / ADD FORM */}
        {tab === 'topics' && editingNode && (
          <form onSubmit={handleSaveNode} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingNode.id ? 'Edit Concept Node & Knowledge Edge' : 'Add New Concept to Knowledge Graph'}
              </h3>
              <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                Auto-Vectorizes to Qdrant
              </span>
            </div>

            {/* Row 1: Title, Subject, Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Concept Title *
                </label>
                <input
                  type="text"
                  value={editingNode.title || ''}
                  onChange={e => setEditingNode(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Stokes' Theorem & Circulation"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Discipline Subject
                </label>
                <select
                  value={editingNode.subject || 'math'}
                  onChange={e => setEditingNode(prev => ({ ...prev, subject: e.target.value as SubjectId }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="math">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="cs">Computer Science</option>
                  <option value="biology">Biology</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Category / Module
                </label>
                <input
                  type="text"
                  value={editingNode.category || ''}
                  onChange={e => setEditingNode(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Vector Calculus"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Row 2: Conceptual Explanation (with LaTeX Support) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                {"Conceptual Explanation & First-Principles Intuition (Supports LaTeX like $\\oint \\mathbf{F} \\cdot d\\mathbf{r}$)"}
              </label>
              <textarea
                value={editingNode.description || ''}
                onChange={e => setEditingNode(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Explain the geometric or intuitive mechanism..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
                required
              />
              {editingNode.description && (
                <div
                  style={{
                    marginTop: '6px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px dashed rgba(99,102,241,0.25)',
                    fontSize: '0.8rem',
                    color: 'var(--text-main)'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-light)', display: 'block', marginBottom: '2px' }}>
                    LIVE LATEX PREVIEW:
                  </span>
                  <MathRenderer text={editingNode.description} />
                </div>
              )}
            </div>

            {/* Row 3: Common Misconception & Study Minutes */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Root Cause Misconception to Warn Socratic AI
                </label>
                <input
                  type="text"
                  value={editingNode.commonMisconception || ''}
                  onChange={e => setEditingNode(prev => ({ ...prev, commonMisconception: e.target.value }))}
                  placeholder="e.g. Conflating surface curl with boundary line integral orientations"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Estimated Mins
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={editingNode.estimatedStudyMins || 20}
                  onChange={e => setEditingNode(prev => ({ ...prev, estimatedStudyMins: parseInt(e.target.value) || 20 }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Row 4: Interactive Prerequisite Edge Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Prerequisite Graph Dependencies (Select incoming prerequisite concepts)
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {nodes
                  .filter(n => n.id !== editingNode.id)
                  .map(candidate => {
                    const isSelected = (editingNode.prerequisites || []).includes(candidate.id);
                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => handleTogglePrerequisite(candidate.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                          background: isSelected ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.03)',
                          color: isSelected ? '#fff' : 'var(--text-dim)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {isSelected && <Check size={12} style={{ color: 'var(--primary-light)' }} />}
                        <span>{candidate.title}</span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Row 5: Key Takeaways Tag List */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Key Takeaways / Pedagogical Checkpoints
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={newTakeawayInput}
                  onChange={e => setNewTakeawayInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTakeaway();
                    }
                  }}
                  placeholder="Type a takeaway and press Enter..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem'
                  }}
                />
                <button type="button" onClick={handleAddTakeaway} className="btn btn-secondary btn-sm">
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(editingNode.keyTakeaways || []).map((point, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: 'rgba(6,182,212,0.12)',
                      border: '1px solid rgba(6,182,212,0.3)',
                      color: '#06b6d4',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{point}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTakeaway(idx)}
                      style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <CheckCircle2 size={15} />
                <span>Save Concept & Vectorize into Qdrant</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 2: 3-TIER DIFFERENTIATED WORKSHEETS */}
        {/* ========================================================= */}
        {tab === 'worksheets' && !editingWorksheet && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
                />
                <input
                  type="text"
                  placeholder="Search 3-tier worksheets by title or associated topic..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <button onClick={handleStartAddWorksheet} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <Plus size={15} />
                <span>Create 3-Tier Worksheet</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
              {filteredWorksheets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
                  <FileText size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>No 3-tier worksheets found.</p>
                </div>
              ) : (
                filteredWorksheets.map(ws => {
                  const totalProblems =
                    (ws.tier1Foundational?.problems?.length || 0) +
                    (ws.tier2Intermediate?.problems?.length || 0) +
                    (ws.tier3Extension?.problems?.length || 0);

                  return (
                    <div
                      key={ws.id}
                      className="glass-card"
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                            {ws.title}
                          </span>
                          <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
                            {ws.subject.toUpperCase()}
                          </span>
                          <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>
                            Topic: {ws.topicTitle}
                          </span>
                        </div>

                        {/* Tier Breakdown Preview */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                          <div style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60a5fa', display: 'block' }}>
                              TIER 1 (FOUNDATIONAL)
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {ws.tier1Foundational?.problems?.length || 0} problems
                            </span>
                          </div>

                          <div style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#34d399', display: 'block' }}>
                              TIER 2 (INTERMEDIATE)
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {ws.tier2Intermediate?.problems?.length || 0} problems
                            </span>
                          </div>

                          <div style={{ padding: '6px 8px', borderRadius: '6px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#c084fc', display: 'block' }}>
                              TIER 3 (EXTENSION)
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {ws.tier3Extension?.problems?.length || 0} problems
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => setEditingWorksheet(ws)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '32px', height: '32px' }}
                          title="Edit 3-Tier Worksheet"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteWorksheet(ws.id)}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '32px', height: '32px', color: '#f43f5e' }}
                          title="Delete Worksheet"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* WORKSHEET EDIT / ADD FORM */}
        {tab === 'worksheets' && editingWorksheet && (
          <form onSubmit={handleSaveWorksheet} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                {editingWorksheet.id ? 'Edit Differentiated Worksheet' : 'Author New 3-Tier Worksheet'}
              </h3>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                Auto-Vectorizes to Qdrant
              </span>
            </div>

            {/* Row 1: Title, Subject, Associated Topic */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Worksheet Title *
                </label>
                <input
                  type="text"
                  value={editingWorksheet.title || ''}
                  onChange={e => setEditingWorksheet(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Taylor Series & Error Bounds"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Discipline Subject
                </label>
                <select
                  value={editingWorksheet.subject || 'math'}
                  onChange={e => setEditingWorksheet(prev => ({ ...prev, subject: e.target.value as SubjectId }))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="math">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="cs">Computer Science</option>
                  <option value="biology">Biology</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Associated Concept Topic
                </label>
                <input
                  type="text"
                  value={editingWorksheet.topicTitle || ''}
                  onChange={e => setEditingWorksheet(prev => ({ ...prev, topicTitle: e.target.value }))}
                  placeholder="e.g. Taylor Series Approximations"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                  required
                />
              </div>
            </div>

            {/* 3 TIERS EDITOR */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
              {/* TIER 1 */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(59,130,246,0.05)',
                  border: '1px solid rgba(59,130,246,0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60a5fa' }}>
                    Tier 1: Foundational / Scaffolded (Review Cohort)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {editingWorksheet.tier1Foundational?.problems?.length || 0} Problems
                  </span>
                </div>

                <input
                  type="text"
                  value={editingWorksheet.tier1Foundational?.description || ''}
                  onChange={e =>
                    setEditingWorksheet(prev => ({
                      ...prev,
                      tier1Foundational: {
                        ...(prev?.tier1Foundational || { targetStudents: [], problems: [] }),
                        description: e.target.value
                      }
                    }))
                  }
                  placeholder="Pedagogical strategy / scaffolding focus..."
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    marginBottom: '8px'
                  }}
                />

                {/* Problem items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {(editingWorksheet.tier1Foundational?.problems || []).map((prob, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                    >
                      <MathRenderer text={prob} />
                      <button
                        type="button"
                        onClick={() => handleRemoveProblemFromTier('tier1', idx)}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newProblemInputs.tier1}
                    onChange={e => setNewProblemInputs(prev => ({ ...prev, tier1: e.target.value }))}
                    placeholder="Add Tier 1 problem (LaTeX supported like $\int x dx$)..."
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddProblemToTier('tier1')}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* TIER 2 */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16,185,129,0.05)',
                  border: '1px solid rgba(16,185,129,0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#34d399' }}>
                    Tier 2: Intermediate / Core Mastery (On-Grade Cohort)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {editingWorksheet.tier2Intermediate?.problems?.length || 0} Problems
                  </span>
                </div>

                <input
                  type="text"
                  value={editingWorksheet.tier2Intermediate?.description || ''}
                  onChange={e =>
                    setEditingWorksheet(prev => ({
                      ...prev,
                      tier2Intermediate: {
                        ...(prev?.tier2Intermediate || { targetStudents: [], problems: [] }),
                        description: e.target.value
                      }
                    }))
                  }
                  placeholder="Core analytical mastery goals..."
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    marginBottom: '8px'
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {(editingWorksheet.tier2Intermediate?.problems || []).map((prob, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                    >
                      <MathRenderer text={prob} />
                      <button
                        type="button"
                        onClick={() => handleRemoveProblemFromTier('tier2', idx)}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newProblemInputs.tier2}
                    onChange={e => setNewProblemInputs(prev => ({ ...prev, tier2: e.target.value }))}
                    placeholder="Add Tier 2 problem..."
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddProblemToTier('tier2')}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* TIER 3 */}
              <div
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(168,85,247,0.05)',
                  border: '1px solid rgba(168,85,247,0.2)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#c084fc' }}>
                    Tier 3: Extension / Olympiad Challenge (Advanced Cohort)
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {editingWorksheet.tier3Extension?.problems?.length || 0} Problems
                  </span>
                </div>

                <input
                  type="text"
                  value={editingWorksheet.tier3Extension?.description || ''}
                  onChange={e =>
                    setEditingWorksheet(prev => ({
                      ...prev,
                      tier3Extension: {
                        ...(prev?.tier3Extension || { targetStudents: [], problems: [] }),
                        description: e.target.value
                      }
                    }))
                  }
                  placeholder="Advanced proof and generalization strategy..."
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    marginBottom: '8px'
                  }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  {(editingWorksheet.tier3Extension?.problems || []).map((prob, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.8rem'
                      }}
                    >
                      <MathRenderer text={prob} />
                      <button
                        type="button"
                        onClick={() => handleRemoveProblemFromTier('tier3', idx)}
                        style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newProblemInputs.tier3}
                    onChange={e => setNewProblemInputs(prev => ({ ...prev, tier3: e.target.value }))}
                    placeholder="Add Tier 3 challenge problem..."
                    style={{
                      flex: 1,
                      padding: '7px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleAddProblemToTier('tier3')}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingWorksheet(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>

              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                <CheckCircle2 size={15} />
                <span>Save Worksheet & Vectorize into Qdrant</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 3: AI COURSE & TOPIC SYNTHESIZER */}
        {/* ========================================================= */}
        {tab === 'ai_synthesizer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={18} style={{ color: 'var(--primary-light)' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  Autonomous Pedagogical Knowledge Graph & Worksheet Synthesizer
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>
                Synthesizes a complete curriculum graph with topological prerequisite edges, first-principles descriptions, common student misconceptions, and 3-tier differentiated worksheets, auto-indexing everything into Qdrant for RAG.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '6px' }}>
                Target Subject Discipline
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {(['math', 'physics', 'cs', 'biology'] as SubjectId[]).map(sub => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className={`glass-card ${subject === sub ? 'selected-card' : ''}`}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      border: subject === sub ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                      background: subject === sub ? 'rgba(99,102,241,0.18)' : 'var(--bg-surface-elevated)'
                    }}
                  >
                    {sub.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                Course / Syllabus Title
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={e => setCourseTitle(e.target.value)}
                placeholder="e.g. AP Calculus BC & Linear Algebra"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                Key Focus Units (Comma-separated)
              </label>
              <input
                type="text"
                value={keyUnits}
                onChange={e => setKeyUnits(e.target.value)}
                placeholder="e.g. Taylor Series, Stokes Theorem, Eigenvalues"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)' }}>
              <input
                type="checkbox"
                id="genWorksheetsCheck"
                checked={generateWorksheetsWithAI}
                onChange={e => setGenerateWorksheetsWithAI(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="genWorksheetsCheck" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                Automatically scaffold 3-tier differentiated worksheets for each synthesized concept node
              </label>
            </div>

            <button
              onClick={handleAIGenerateCourse}
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ padding: '14px', marginTop: '6px', fontSize: '0.95rem' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Synthesizing Nodes, Worksheets & Vectorizing into Qdrant...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Generate Complete Knowledge Graph & Auto-Embed in Qdrant</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
