import React, { useState } from 'react';
import { HomeworkProblem } from '../../types';
import { mockHomeworkProblems } from '../../data/mockData';
import { MathRenderer } from '../common/MathRenderer';
import {
  ScanLine,
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  FileText,
  HelpCircle,
  Zap
} from 'lucide-react';

interface HomeworkScannerProps {
  onRemediateTopic: (topicId: string) => void;
  onAddXP: (amount: number) => void;
}

export const HomeworkScanner: React.FC<HomeworkScannerProps> = ({
  onRemediateTopic,
  onAddXP
}) => {
  const [selectedProblem, setSelectedProblem] = useState<HomeworkProblem>(mockHomeworkProblems[0]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanComplete, setScanComplete] = useState<boolean>(true);

  const handleScanSample = (problem: HomeworkProblem) => {
    setSelectedProblem(problem);
    setIsScanning(true);
    setScanComplete(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      onAddXP(20);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Homework Scanner & Error Pinpointer</h1>
              <span className="badge badge-cyan">Computer Vision & Logic Engine</span>
            </div>
            <p style={{ margin: 0 }}>
              Waypoint inspects multi-step mathematical derivations, isolates the exact logical or algebraic breakdown step, and explains how to recover.
            </p>
          </div>

          {/* Sample Problem Pickers */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {mockHomeworkProblems.map((prob, idx) => (
              <button
                key={prob.id}
                onClick={() => handleScanSample(prob)}
                className={`btn btn-sm ${selectedProblem.id === prob.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileText size={14} />
                <span>Sample {idx + 1}: {prob.title.split(':')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scanner Work Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left Column: Input Problem & Derivation Steps */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Student Submitted Work
            </span>
            <span className="badge badge-indigo">
              {selectedProblem.conceptTested}
            </span>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              marginBottom: '20px'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Given Problem:</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
              <MathRenderer text={selectedProblem.title} />
            </div>
          </div>

          {isScanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '14px' }}>
              <ScanLine size={40} className="animate-bounce" color="#6366f1" />
              <p style={{ color: 'var(--primary-light)', fontSize: '0.9rem' }}>
                AI Logic Engine analyzing algebraic derivations...
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {selectedProblem.steps.map(step => (
                <div
                  key={step.stepNumber}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: step.isError ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 21, 34, 0.6)',
                    border: step.isError ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step.isError ? '#f43f5e' : 'var(--text-dim)' }}>
                      STEP {step.stepNumber}
                    </span>
                    {step.isError ? (
                      <span className="badge badge-rose">
                        <AlertOctagon size={12} /> Flaw Detected
                      </span>
                    ) : (
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={12} /> Correct Logic
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
                    <MathRenderer text={step.expression} />
                  </div>

                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <MathRenderer text={step.explanation} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI Error Analysis & Remediation Prescription */}
        <div
          className="glass-panel"
          style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(244, 63, 94, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f43f5e'
                }}
              >
                <AlertOctagon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Root-Cause Diagnosis</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Pinpointed from Step {selectedProblem.steps.find(s => s.isError)?.stepNumber}
                </span>
              </div>
            </div>

            {(() => {
              const errorStep = selectedProblem.steps.find(s => s.isError);
              if (!errorStep) return null;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div
                    style={{
                      background: 'rgba(244, 63, 94, 0.08)',
                      border: '1px solid rgba(244, 63, 94, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px'
                    }}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fda4af', marginBottom: '6px' }}>
                      Identified Error Type:
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginBottom: '10px' }}>
                      {errorStep.errorType}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                      <MathRenderer text={errorStep.correctionHint || ''} />
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(99, 102, 241, 0.08)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a5b4fc', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '6px' }}>
                      <Sparkles size={14} /> Recommended Pedagogical Next Step
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      This error indicates an un-reinforced reflex during composite function operations. Launching an interactive remediation on the corresponding concept node will recalculate your graph mastery.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => onRemediateTopic(selectedProblem.remedialConceptId)}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              <Zap size={16} />
              <span>Remediate Concept on Knowledge Graph</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
