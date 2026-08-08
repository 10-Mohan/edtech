import React, { useState, useEffect, useMemo } from 'react';
import { ConceptNode, NodeStatus } from '../../types';
import { MathRenderer } from '../common/MathRenderer';
import { BackendService } from '../../services/backendService';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Zap,
  TrendingUp,
  X,
  Heart,
  AlertTriangle,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';

interface KnowledgeGraphProps {
  nodes: ConceptNode[];
  onSelectNodeForPractice: (node: ConceptNode) => void;
  onUpdateNodeMastery: (nodeId: string, delta: number) => void;
  studentId?: string;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  nodes,
  onSelectNodeForPractice,
  onUpdateNodeMastery,
  studentId = 'st_01'
}) => {
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(nodes.find(n => n.id === 'diff_01') || nodes[0]);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [parentNudges, setParentNudges] = useState(() => BackendService.getParentNudges(studentId));
  const [heartReacted, setHeartReacted] = useState<boolean>(false);

  // Sync nudges when parent sends one
  useEffect(() => {
    const unsubscribe = BackendService.subscribe(msg => {
      if (msg.type === 'PARENT_NUDGE_SENT') {
        setParentNudges(BackendService.getParentNudges(studentId));
      }
    });
    return () => unsubscribe();
  }, [studentId]);

  // Compute weak nodes that need student's immediate attention
  const weakNodes = useMemo(() => {
    return nodes.filter(n => n.status === 'weak' || n.masteryScore < 65);
  }, [nodes]);

  // Compute graph edges based on prerequisites
  const edges: { fromNode: ConceptNode; toNode: ConceptNode }[] = [];
  nodes.forEach(toNode => {
    toNode.prerequisites.forEach(preId => {
      const fromNode = nodes.find(n => n.id === preId);
      if (fromNode) {
        edges.push({ fromNode, toNode });
      }
    });
  });

  const getNodeColor = (status: NodeStatus) => {
    switch (status) {
      case 'mastered':
        return { stroke: '#2F6F63', fill: 'rgba(47, 111, 99, 0.15)', glow: 'rgba(47, 111, 99, 0.35)' };
      case 'in_progress':
        return { stroke: '#B08A2E', fill: 'rgba(176, 138, 46, 0.15)', glow: 'rgba(176, 138, 46, 0.35)' };
      case 'weak':
        return { stroke: '#C4562F', fill: 'rgba(196, 86, 47, 0.20)', glow: 'rgba(196, 86, 47, 0.45)' };
      case 'locked':
        return { stroke: '#C8BEA5', fill: 'rgba(200, 190, 165, 0.18)', glow: 'transparent' };
    }
  };

  const getStatusBadge = (status: NodeStatus, score: number) => {
    switch (status) {
      case 'mastered':
        return <span className="badge badge-emerald"><CheckCircle2 size={12} /> Mastered ({score}%)</span>;
      case 'in_progress':
        return <span className="badge badge-amber"><Clock size={12} /> In Progress ({score}%)</span>;
      case 'weak':
        return <span className="badge badge-rose"><AlertCircle size={12} /> Gap Identified ({score}%)</span>;
      case 'locked':
        return <span className="badge" style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-dim)' }}><Lock size={12} /> Locked</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner & Stats Overview */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Adaptive Concept Map</h1>
              <span className="badge badge-indigo">DAG Engine</span>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} />
                Family & Faculty Synchronized
              </span>
            </div>
            <p style={{ margin: 0, maxWidth: '640px' }}>
              Your personalized knowledge graph tracks conceptual dependencies. High-risk misconceptions are automatically isolated with red beacons and shared with your guardian report.
            </p>
          </div>

          {/* Quick Filter & Legend */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-surface-elevated)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2F6F63' }} /> Mastered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B08A2E' }} /> Learning
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C4562F' }} /> Gap / Misconception
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Encouragement Banner (If available) */}
      {parentNudges.length > 0 && (
        <div
          style={{
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-highlight)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
              <Heart size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Message from {parentNudges[0].parentName}:
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{parentNudges[0].timestamp}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary-light)', fontStyle: 'italic' }}>
                "{parentNudges[0].message}"
              </p>
            </div>
          </div>

          <button
            onClick={() => setHeartReacted(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
          >
            <Heart size={13} fill={heartReacted ? '#f43f5e' : 'none'} color={heartReacted ? '#f43f5e' : 'currentColor'} />
            <span>{heartReacted ? 'Heart Sent to Parent!' : 'Send Thank You ❤️'}</span>
          </button>
        </div>
      )}

      {/* CRITICAL SECTION: My Learning Gaps & Action Plan (Synchronized with Parent Portal) */}
      {weakNodes.length > 0 && (
        <div className="card" style={{ padding: '20px 24px', borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e' }}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                  Focus Areas & Identified Misconceptions ({weakNodes.length} Topics)
                </h2>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  These are the specific concepts where you are losing points. Resolving them updates your mastery across your parent and teacher reports.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
            {weakNodes.map(node => (
              <div
                key={node.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{node.title}</span>
                  <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>{node.masteryScore}% Mastery</span>
                </div>

                {node.commonMisconception && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', background: 'var(--bg-surface)', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                    <strong style={{ color: '#f43f5e' }}>Where you're going wrong: </strong>
                    <MathRenderer text={node.commonMisconception} />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginTop: '4px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${node.masteryScore}%`, height: '100%', background: '#f43f5e', borderRadius: '3px' }} />
                  </div>
                  <button
                    onClick={() => onSelectNodeForPractice(node)}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                  >
                    <Sparkles size={12} />
                    <span>Practice with AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Graph Canvas & Sidebar Details Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px' }}>
        {/* SVG Interactive Canvas */}
        <div
          className="glass-panel"
          style={{
            position: 'relative',
            minHeight: '520px',
            overflow: 'hidden',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          {/* Subtle Ruled Grid Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(var(--border-subtle) 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
              opacity: 0.7,
              pointerEvents: 'none'
            }}
          />

          <svg
            style={{ width: '100%', height: '100%', minHeight: '520px', cursor: 'grab' }}
            viewBox="0 0 1000 480"
          >
            <defs>
              {/* Arrowhead marker */}
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="16"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="var(--border-medium)" />
              </marker>

              {/* Glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connecting Dependency Edges */}
            {edges.map((edge, idx) => {
              const { fromNode, toNode } = edge;
              // Bezier curve path
              const dx = toNode.x - fromNode.x;
              const controlX1 = fromNode.x + dx * 0.45;
              const controlX2 = toNode.x - dx * 0.45;
              const d = `M ${fromNode.x} ${fromNode.y} C ${controlX1} ${fromNode.y}, ${controlX2} ${toNode.y}, ${toNode.x} ${toNode.y}`;

              const isWeakEdge = toNode.status === 'weak';

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={d}
                    fill="none"
                    stroke={isWeakEdge ? 'var(--coral)' : 'var(--border-medium)'}
                    strokeWidth={isWeakEdge ? 2.5 : 1.8}
                    strokeDasharray={isWeakEdge ? '5,5' : 'none'}
                    markerEnd="url(#arrow)"
                  />
                </g>
              );
            })}

            {/* Concept Nodes */}
            {nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const colors = getNodeColor(node.status);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Outer pulse/glow on weak or selected nodes */}
                  {(node.status === 'weak' || isSelected) && (
                    <circle
                      r={isSelected ? 36 : 30}
                      fill="none"
                      stroke={colors.stroke}
                      strokeWidth={2}
                      opacity={0.5}
                      filter="url(#glow)"
                    />
                  )}

                  {/* Main Circle Body */}
                  <circle
                    r={26}
                    fill={colors.fill}
                    stroke={isSelected ? 'var(--coral)' : colors.stroke}
                    strokeWidth={isSelected ? 3 : 2}
                  />

                  {/* Icon or Mastery Text */}
                  {node.status === 'locked' ? (
                    <g transform="translate(-7, -7)">
                      <Lock size={14} color="var(--text-dim)" />
                    </g>
                  ) : (
                    <text
                      textAnchor="middle"
                      dy="5"
                      fill="var(--text-main)"
                      fontSize="12"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {node.masteryScore}%
                    </text>
                  )}

                  {/* Node Label Below */}
                  <text
                    textAnchor="middle"
                    dy="46"
                    fill={isSelected ? 'var(--coral)' : 'var(--text-main)'}
                    fontSize="13"
                    fontWeight={isSelected ? '700' : '600'}
                    fontFamily="var(--font-display)"
                  >
                    {node.title}
                  </text>

                  {/* Category Pill Above */}
                  <text
                    textAnchor="middle"
                    dy="-34"
                    fill="var(--text-dim)"
                    fontSize="10"
                    fontWeight="600"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                  >
                    {node.category}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Concept Details Drawer / Panel */}
        {selectedNode ? (
          <div
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {selectedNode.category}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '2px' }}>{selectedNode.title}</h3>
                </div>
                {getStatusBadge(selectedNode.status, selectedNode.masteryScore)}
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mastery Confidence</span>
                  <span style={{ fontWeight: 700 }}>{selectedNode.masteryScore}%</span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${selectedNode.masteryScore}%`,
                      background: selectedNode.status === 'weak' ? 'linear-gradient(90deg, #f43f5e, #fb7185)' : 'var(--primary-gradient)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
                <MathRenderer text={selectedNode.description} />
              </div>

              {/* Misconception Alert if Weak */}
              {selectedNode.commonMisconception && (
                <div
                  style={{
                    background: 'rgba(244, 63, 94, 0.12)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fda4af', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '4px' }}>
                    <AlertCircle size={15} />
                    <span>Where You're Going Wrong</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <MathRenderer text={selectedNode.commonMisconception} />
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Core Competencies
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedNode.keyTakeaways.map((point, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--primary-light)', marginTop: '2px' }}>•</span>
                      <MathRenderer text={point} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => onSelectNodeForPractice(selectedNode)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Sparkles size={16} />
                <span>Practice in Socratic AI</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => onUpdateNodeMastery(selectedNode.id, 10)}
                  className="btn btn-secondary btn-sm"
                  title="Simulate successful practice"
                >
                  <TrendingUp size={14} color="#10b981" />
                  <span>+10% Score</span>
                </button>
                <button
                  onClick={() => onUpdateNodeMastery(selectedNode.id, -10)}
                  className="btn btn-secondary btn-sm"
                  title="Simulate missed test"
                >
                  <AlertCircle size={14} color="#f43f5e" />
                  <span>-10% Score</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-dim)' }}>Select any concept node in the graph to view prerequisites and diagnostics.</p>
          </div>
        )}
      </div>
    </div>
  );
};
