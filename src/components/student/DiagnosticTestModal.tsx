import React, { useState } from 'react';
import { DiagnosticQuestion, DiagnosticResult, RecallCard } from '../../types';
import { processDiagnosticSubmission } from '../../services/aiEngine';
import { MathRenderer } from '../common/MathRenderer';
import confetti from 'canvas-confetti';
import {
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';

interface DiagnosticTestModalProps {
  questions: DiagnosticQuestion[];
  isOpen: boolean;
  onClose: () => void;
  onAutoGenerateCards: (cards: RecallCard[]) => void;
  onAddXP: (amount: number) => void;
}

export const DiagnosticTestModal: React.FC<DiagnosticTestModalProps> = ({
  questions,
  isOpen,
  onClose,
  onAutoGenerateCards,
  onAddXP
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  if (!isOpen) return null;

  const currentQ = questions[currentStep];

  const handleSelectOption = (optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  const handleNext = () => {
    if (currentStep + 1 < questions.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate results
      const res = processDiagnosticSubmission(questions, selectedAnswers);
      setResult(res);
      setIsSubmitted(true);
      onAddXP(50);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 }
      });
    }
  };

  const handleGenerateCardsAndFinish = () => {
    if (!result) return;

    // Create recall cards for identified gaps
    const newCards: RecallCard[] = result.identifiedGaps.map((gap, i) => ({
      id: `diag_gen_${Date.now()}_${i}`,
      topicId: gap.topicId,
      subject: 'math',
      front: `Diagnostic Focus: How do you avoid the misconception in **${gap.topicTitle}**?`,
      back: `Remember: ${gap.misconception} Recommended Action: ${gap.recommendedAction}`,
      intervalDays: 1,
      easeFactor: 2.4,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      status: 'learning'
    }));

    onAutoGenerateCards(newCards);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ padding: '32px', maxWidth: '720px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Adaptive Diagnostic Assessment</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Identifies deep conceptual gaps & misconception patterns
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Diagnostic Assessment Content */}
        {!isSubmitted ? (
          <div>
            {/* Step Bar */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>Question {currentStep + 1} of {questions.length}</span>
                <span className="badge badge-indigo">{currentQ.topicTitle}</span>
              </div>
              <div style={{ height: '6px', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                    background: 'var(--primary-gradient)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Question Body */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '12px' }}>
                <MathRenderer text={currentQ.question} />
              </h3>

              {currentQ.equation && (
                <div style={{ margin: '14px 0' }}>
                  <MathRenderer text={`$$${currentQ.equation}$$`} />
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {currentQ.options.map(opt => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-surface-elevated)',
                      border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '6px solid var(--primary-light)' : '2px solid var(--border-medium)',
                        background: 'transparent'
                      }}
                    />
                    <div style={{ fontSize: '0.9rem', color: isSelected ? '#ffffff' : 'var(--text-main)' }}>
                      <MathRenderer text={opt.text} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next / Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleNext}
                disabled={!selectedAnswers[currentQ.id]}
                className="btn btn-primary"
                style={{ opacity: !selectedAnswers[currentQ.id] ? 0.5 : 1 }}
              >
                <span>{currentStep + 1 === questions.length ? 'Submit Assessment' : 'Next Question'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Results and Misconception Summary */
          <div className="animate-scale-up">
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                marginBottom: '24px'
              }}
            >
              <h3 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
                Diagnostic Score: {result?.correctAnswers} / {result?.totalQuestions} Correct
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                {result?.identifiedGaps.length === 0
                  ? 'Outstanding! No critical misconceptions detected across these topics.'
                  : `Waypoint AI identified ${result?.identifiedGaps.length} conceptual gap(s) requiring remediation.`}
              </p>
            </div>

            {result && result.identifiedGaps.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>
                  Identified Misconceptions & Action Plans
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {result.identifiedGaps.map((gap, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '16px',
                        background: 'rgba(244, 63, 94, 0.08)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#fda4af', fontSize: '0.9rem' }}>
                          {gap.topicTitle}
                        </span>
                        <span className="badge badge-rose">High Severity Gap</span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                        <MathRenderer text={gap.misconception} />
                      </p>
                      <div style={{ fontSize: '0.78rem', color: '#67e8f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={13} /> {gap.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={onClose} className="btn btn-secondary">
                Close
              </button>
              <button onClick={handleGenerateCardsAndFinish} className="btn btn-primary">
                <Layers size={16} />
                <span>Auto-Generate Recall Cards (+50 XP)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
