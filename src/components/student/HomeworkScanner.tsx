import React, { useState, useRef } from 'react';
import { HomeworkProblem } from '../../types';
import { mockHomeworkProblems } from '../../data/mockData';
import { MathRenderer } from '../common/MathRenderer';
import { AIProviderService } from '../../services/aiProvider';
import {
  ScanLine,
  UploadCloud,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  FileText,
  HelpCircle,
  Zap,
  Image as ImageIcon,
  Camera,
  RefreshCw
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
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [customAnalysis, setCustomAnalysis] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isLiveAI = AIProviderService.isLiveProviderActive();

  const handleScanSample = (problem: HomeworkProblem) => {
    setSelectedProblem(problem);
    setUploadedImagePreview(null);
    setCustomAnalysis(null);
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      onAddXP(20);
    }, 600);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setUploadedImagePreview(base64Data);
      setIsScanning(true);

      try {
        const result = await AIProviderService.analyzeHomeworkImage(base64Data);
        setCustomAnalysis(result);
        onAddXP(35);
      } catch (err) {
        console.error('Vision analysis error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Vision Homework Scanner & Pinpointer</h1>
              <span className={`badge ${isLiveAI ? 'badge-emerald' : 'badge-cyan'}`}>
                {isLiveAI ? `Live Multimodal AI (${AIProviderService.getActiveProviderName()})` : 'Neural OCR Simulator'}
              </span>
            </div>
            <p style={{ margin: 0 }}>
              Upload handwritten math homework or choose an AP benchmark problem. Waypoint reconstructs your steps and isolates the exact algebraic flaw.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
            >
              <Camera size={16} />
              <span>Upload Work Photo</span>
            </button>

            {mockHomeworkProblems.map((prob, idx) => (
              <button
                key={prob.id}
                onClick={() => handleScanSample(prob)}
                className={`btn btn-sm ${selectedProblem.id === prob.id && !uploadedImagePreview ? 'btn-primary' : 'btn-secondary'}`}
              >
                <FileText size={14} />
                <span>Sample {idx + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scanner Work Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
        {/* Left Column: Input Problem & Derivation Steps */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              {uploadedImagePreview ? 'Uploaded Handwritten Derivation' : 'Sample Exam Derivation'}
            </span>
            <span className="badge badge-indigo">
              {customAnalysis ? 'Computer Vision OCR Verified' : selectedProblem.conceptTested}
            </span>
          </div>

          {uploadedImagePreview && (
            <div style={{ marginBottom: '18px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              <img
                src={uploadedImagePreview}
                alt="Student Handwritten Work"
                style={{ maxHeight: '180px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>
          )}

          {!uploadedImagePreview && (
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                marginBottom: '20px'
              }}
            >
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Target Problem:</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                <MathRenderer text={selectedProblem.title} />
              </div>
            </div>
          )}

          {isScanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '14px' }}>
              <ScanLine size={44} className="animate-bounce" color="var(--primary-light)" />
              <p style={{ color: 'var(--primary-light)', fontSize: '0.95rem', fontWeight: 600 }}>
                Multimodal OCR analyzing handwriting & algebraic consistency...
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Display parsed steps from custom analysis or selectedProblem */}
              {(customAnalysis?.steps || selectedProblem.steps).map((step: any) => (
                <div
                  key={step.stepNumber}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: step.isError ? 'rgba(244, 63, 94, 0.12)' : 'var(--bg-surface-elevated)',
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

                  <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
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
                  width: '38px',
                  height: '38px',
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>AI Root-Cause Diagnosis</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Pinpointed from Step {((customAnalysis?.steps || selectedProblem.steps).find((s: any) => s.isError)?.stepNumber) || 2}
                </span>
              </div>
            </div>

            {(() => {
              const activeSteps = customAnalysis?.steps || selectedProblem.steps;
              const errorStep = activeSteps.find((s: any) => s.isError);
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
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f43f5e', marginBottom: '6px' }}>
                      Identified Error Type:
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
                      {errorStep.errorType || 'Algebraic / Derivative Inconsistency'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      <MathRenderer text={errorStep.correctionHint || 'Check chain rule expansion and constant factors.'} />
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
              onClick={() => onRemediateTopic(selectedProblem.remedialConceptId || 'calc-03-chain-rule')}
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
