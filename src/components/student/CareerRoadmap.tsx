import React, { useState } from 'react';
import { CareerPath } from '../../types';
import { mockCareerPaths } from '../../data/mockData';
import { MathRenderer } from '../common/MathRenderer';
import confetti from 'canvas-confetti';
import {
  Compass,
  Gamepad2,
  Dna,
  Bot,
  DollarSign,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  Briefcase
} from 'lucide-react';

interface CareerRoadmapProps {
  onAddXP: (amount: number) => void;
}

export const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ onAddXP }) => {
  const [selectedCareer, setSelectedCareer] = useState<CareerPath>(mockCareerPaths[0]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isChallengeSubmitted, setIsChallengeSubmitted] = useState<boolean>(false);

  const getCareerIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gamepad2':
        return <Gamepad2 size={24} color="#818cf8" />;
      case 'Dna':
        return <Dna size={24} color="#22d3ee" />;
      case 'Bot':
        return <Bot size={24} color="#34d399" />;
      default:
        return <Compass size={24} color="#818cf8" />;
    }
  };

  const handleSelectCareer = (career: CareerPath) => {
    setSelectedCareer(career);
    setSelectedOptionId(null);
    setIsChallengeSubmitted(false);
  };

  const handleAnswerChallenge = () => {
    if (!selectedOptionId) return;
    setIsChallengeSubmitted(true);

    const option = selectedCareer.miniSimulation.options.find(o => o.id === selectedOptionId);
    if (option && option.isCorrect) {
      onAddXP(40);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>"Why Am I Learning This?" Career Navigator</h1>
              <span className="badge badge-emerald">Real-World Relevance</span>
            </div>
            <p style={{ margin: 0 }}>
              Ever wondered when you'll use matrices or derivatives in real life? Explore high-impact careers and test your knowledge in real engineering scenarios.
            </p>
          </div>
        </div>
      </div>

      {/* Main Career Cards & Deep Dive Simulation */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px minmax(0, 1fr)', gap: '24px' }}>
        {/* Left Column: Career Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {mockCareerPaths.map(career => {
            const isSelected = selectedCareer.id === career.id;

            return (
              <div
                key={career.id}
                onClick={() => handleSelectCareer(career)}
                className={`glass-card interactive ${isSelected ? 'selected-card' : ''}`}
                style={{
                  padding: '20px',
                  border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-glass-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getCareerIcon(career.icon)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px' }}>{career.title}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{career.industry}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>{career.avgSalary}</span>
                  <span className="badge badge-indigo">{career.growthRate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Deep Dive & Mini Simulation Challenge */}
        <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Career Header & Salary Info */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
              <div>
                <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>{selectedCareer.industry}</span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{selectedCareer.title}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{selectedCareer.avgSalary}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Average Starting & Mid Compensation</div>
              </div>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {selectedCareer.description}
            </p>
          </div>

          {/* Connected High School Curriculum Topics */}
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>
              How Your Current Syllabus Directly Powers This Job
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {selectedCareer.connectedSyllabusTopics.map(topic => (
                <div
                  key={topic.topicId}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.875rem', marginBottom: '6px' }}>
                    <Sparkles size={14} />
                    <span>{topic.topicTitle}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <MathRenderer text={topic.howItIsUsed} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Simulation Sandbox */}
          <div
            style={{
              marginTop: '20px',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-glass)',
              border: '1px solid var(--border-medium)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Play size={18} color="var(--primary-light)" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Interactive Work Simulation: On-the-Job Challenge
              </h4>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '14px', fontStyle: 'italic' }}>
              "{selectedCareer.miniSimulation.scenario}"
            </p>

            <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '14px' }}>
              <MathRenderer text={selectedCareer.miniSimulation.challengeQuestion} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {selectedCareer.miniSimulation.options.map(opt => {
                const isSelected = selectedOptionId === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      if (!isChallengeSubmitted) setSelectedOptionId(opt.id);
                    }}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface-elevated)',
                      border: isSelected ? '1px solid var(--primary-light)' : '1px solid var(--border-subtle)',
                      cursor: isChallengeSubmitted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: isSelected ? '5px solid var(--primary-light)' : '2px solid var(--border-medium)',
                        background: 'transparent'
                      }}
                    />
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                      <MathRenderer text={opt.text} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submission / Feedback */}
            {!isChallengeSubmitted ? (
              <button
                onClick={handleAnswerChallenge}
                disabled={!selectedOptionId}
                className="btn btn-primary btn-sm"
                style={{ opacity: !selectedOptionId ? 0.5 : 1 }}
              >
                <span>Submit Decision (+40 XP)</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <div className="animate-fade-in" style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: selectedCareer.miniSimulation.options.find(o => o.id === selectedOptionId)?.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)', border: selectedCareer.miniSimulation.options.find(o => o.id === selectedOptionId)?.isCorrect ? '1px solid #10b981' : '1px solid #f43f5e' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.875rem', color: selectedCareer.miniSimulation.options.find(o => o.id === selectedOptionId)?.isCorrect ? '#10b981' : '#f43f5e', marginBottom: '4px' }}>
                  {selectedCareer.miniSimulation.options.find(o => o.id === selectedOptionId)?.isCorrect ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{selectedCareer.miniSimulation.options.find(o => o.id === selectedOptionId)?.isCorrect ? 'Correct Engineering Intuition!' : 'Incorrect Approach'}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', margin: 0 }}>
                  {selectedCareer.miniSimulation.options.find(o => o.id === selectedOptionId)?.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
