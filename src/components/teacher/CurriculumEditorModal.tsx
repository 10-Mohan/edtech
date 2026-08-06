import React, { useState } from 'react';
import { ConceptNode, SubjectId } from '../../types';
import { CurriculumGeneratorService } from '../../services/curriculumGenerator';
import { BackendService } from '../../services/backendService';
import {
  Layers,
  X,
  Plus,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  GitFork
} from 'lucide-react';

interface CurriculumEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: ConceptNode[];
  onNodesUpdated: (nodes: ConceptNode[]) => void;
}

export const CurriculumEditorModal: React.FC<CurriculumEditorModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onNodesUpdated
}) => {
  const [tab, setTab] = useState<'manage' | 'ai_generate'>('manage');
  const [editingNode, setEditingNode] = useState<Partial<ConceptNode> | null>(null);

  // AI Course Generator State
  const [subject, setSubject] = useState<SubjectId>('math');
  const [courseTitle, setCourseTitle] = useState<string>('AP Calculus BC & Matrix Algebra');
  const [keyUnits, setKeyUnits] = useState<string>('Taylor Series, Eigenvalues, Stokes Theorem');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode || !editingNode.title) return;

    const nodeToSave: ConceptNode = {
      id: editingNode.id || `node_${Date.now()}`,
      title: editingNode.title,
      subject: editingNode.subject || 'math',
      category: editingNode.category || 'Core Syllabus',
      status: editingNode.status || 'in_progress',
      masteryScore: editingNode.masteryScore ?? 65,
      prerequisites: editingNode.prerequisites || [],
      x: editingNode.x ?? (200 + Math.floor(Math.random() * 400)),
      y: editingNode.y ?? (100 + Math.floor(Math.random() * 300)),
      description: editingNode.description || 'Core conceptual topic.',
      estimatedStudyMins: editingNode.estimatedStudyMins || 20,
      commonMisconception: editingNode.commonMisconception || '',
      keyTakeaways: editingNode.keyTakeaways || ['Master foundational intuition', 'Verify with edge cases']
    };

    const updated = BackendService.addOrUpdateConceptNode(nodeToSave, 'teacher');
    onNodesUpdated(updated);
    setEditingNode(null);
  };

  const handleDeleteNode = (id: string) => {
    const updated = nodes.filter(n => n.id !== id);
    BackendService.saveConceptNodes(updated);
    onNodesUpdated(updated);
  };

  const handleAIGenerateCourse = async () => {
    setIsGenerating(true);
    try {
      const result = await CurriculumGeneratorService.generateCourseCurriculum({
        subject,
        courseTitle,
        targetLevel: 'ap_advanced',
        keyUnits: keyUnits.split(',').map(s => s.trim()),
        generateQuestions: true
      });

      const updated = [...result.nodes, ...nodes];
      BackendService.saveConceptNodes(updated);
      onNodesUpdated(updated);
      setTab('manage');
    } catch (e) {
      console.error('Course generation failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '780px',
          padding: '28px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 18px rgba(6,182,212,0.3)'
              }}
            >
              <GitFork size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Teacher Curriculum Studio
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>
                Manage Knowledge Graph topics, prerequisites, and synthesize courses with AI.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <button
            onClick={() => { setTab('manage'); setEditingNode(null); }}
            className={`btn ${tab === 'manage' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <BookOpen size={15} />
            <span>Manage Topics ({nodes.length})</span>
          </button>

          <button
            onClick={() => setTab('ai_generate')}
            className={`btn ${tab === 'ai_generate' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
          >
            <Sparkles size={15} />
            <span>AI Course Synthesizer</span>
          </button>
        </div>

        {/* VIEW 1: MANAGE TOPICS */}
        {tab === 'manage' && !editingNode && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dim)' }}>
                Active Syllabus Topics
              </span>
              <button
                onClick={() => setEditingNode({ subject: 'math', category: 'New Module', masteryScore: 70 })}
                className="btn btn-primary btn-sm"
              >
                <Plus size={14} />
                <span>Add Custom Topic</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto' }}>
              {nodes.map(node => (
                <div
                  key={node.id}
                  className="glass-card"
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>{node.title}</span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>{node.category}</span>
                      <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>{node.subject.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      {node.description.slice(0, 85)}...
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setEditingNode(node)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: '30px', height: '30px' }}
                      title="Edit Topic"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteNode(node.id)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: '30px', height: '30px', color: '#f43f5e' }}
                      title="Delete Topic"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: EDIT / ADD TOPIC FORM */}
        {tab === 'manage' && editingNode && (
          <form onSubmit={handleSaveNode} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px 0' }}>
              {editingNode.id ? 'Edit Topic' : 'Add New Topic to Knowledge Graph'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                  Topic Title
                </label>
                <input
                  type="text"
                  value={editingNode.title || ''}
                  onChange={e => setEditingNode(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Eigenvalues & Diagonalization"
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
                  Category
                </label>
                <input
                  type="text"
                  value={editingNode.category || ''}
                  onChange={e => setEditingNode(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Linear Systems"
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

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                Conceptual Description & Intuition
              </label>
              <textarea
                value={editingNode.description || ''}
                onChange={e => setEditingNode(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                placeholder="Explain the first principles mechanism..."
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
                Common Student Misconception
              </label>
              <input
                type="text"
                value={editingNode.commonMisconception || ''}
                onChange={e => setEditingNode(prev => ({ ...prev, commonMisconception: e.target.value }))}
                placeholder="e.g. Assuming det(A+B) = det(A) + det(B)"
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingNode(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <CheckCircle2 size={14} />
                <span>Save Topic to Graph</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: AI COURSE GENERATOR */}
        {tab === 'ai_generate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                      padding: '10px',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      border: subject === sub ? '2px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                      background: subject === sub ? 'rgba(99,102,241,0.15)' : 'var(--bg-surface-elevated)'
                    }}
                  >
                    {sub.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px' }}>
                Course Title
              </label>
              <input
                type="text"
                value={courseTitle}
                onChange={e => setCourseTitle(e.target.value)}
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

            <button
              onClick={handleAIGenerateCourse}
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ padding: '13px', marginTop: '6px', fontSize: '0.95rem' }}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'AI Synthesizing Course Graph & Prerequisite Edges...' : 'Generate Complete Knowledge Graph'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
