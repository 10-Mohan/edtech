import React, { useState } from 'react';
import { SubjectId, ConceptNode, DifferentiatedWorksheet } from '../../types';
import { BackendService } from '../../services/backendService';
import { VectorService } from '../../services/vectorService';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  School,
  ShieldCheck,
  Zap,
  Sliders,
  Layers,
  Check,
  X,
  Compass
} from 'lucide-react';

interface TeacherOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (classroomData: any) => void;
}

export const TeacherOnboardingModal: React.FC<TeacherOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState<number>(1);
  const [className, setClassName] = useState<string>('Period 3 - AP STEM Mastery');
  const [subject, setSubject] = useState<SubjectId>('math');
  const [gradeLevel, setGradeLevel] = useState<string>('Grade 11 - 12 (Advanced Placement)');
  const [schoolName, setSchoolName] = useState<string>('St. Jude STEM Academy');
  const [socraticPacing, setSocraticPacing] = useState<'gentle' | 'balanced' | 'rigorous'>('balanced');
  const [autoDifferentiate, setAutoDifferentiate] = useState<boolean>(true);
  const [ferpaMode, setFerpaMode] = useState<boolean>(true);

  const [starterTopic, setStarterTopic] = useState<{
    title: string;
    description: string;
    prerequisites: string[];
  }>({
    title: 'Differential Calculus & Chain Rule',
    description: 'First-principles mastery of instantaneous rate of change and composite function decomposition.',
    prerequisites: ['Function Limits & Continuity', 'Basic Power Rule']
  });

  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [finishSuccess, setFinishSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFinishOnboarding = async () => {
    setIsFinishing(true);
    try {
      // 1. Create Starter Concept Node
      const newNode: ConceptNode = {
        id: `node_${Date.now()}`,
        title: starterTopic.title,
        subject,
        category: 'Core Curriculum',
        status: 'in_progress',
        masteryScore: 65,
        prerequisites: [],
        x: 350,
        y: 260,
        description: starterTopic.description,
        estimatedStudyMins: 30,
        commonMisconception: 'Forgetting to multiply by the derivative of the inner function.',
        keyTakeaways: [
          'The chain rule differentiates nested functions: d/dx[f(g(x))] = f\'(g(x)) * g\'(x)',
          'Inner rates multiply outer rates',
          'Applies in all coordinate rate modeling'
        ]
      };

      // Save to BackendService
      const currentNodes = BackendService.getConceptNodes();
      BackendService.saveConceptNodes([...currentNodes, newNode]);

      // 2. Index to Qdrant Vector Search
      await VectorService.indexConceptNodes([newNode]);

      // 3. Create Sample Differentiated Worksheet
      if (autoDifferentiate) {
        const starterWorksheet: DifferentiatedWorksheet = {
          id: `ws_${Date.now()}`,
          title: `${starterTopic.title} - Adaptive Practice Suite`,
          subject,
          topicTitle: starterTopic.title,
          createdAt: new Date().toISOString().substring(0, 10),
          tier1Foundational: {
            targetStudents: ['Maya Lin', 'Lucas Vance'],
            description: 'Scaffolded decomposition with intermediate substitution prompts.',
            problems: [
              'Find the derivative of $y = (3x^2 + 1)^4$ by substituting $u = 3x^2 + 1$.',
              'Differentiate $f(x) = (2x - 5)^3$.'
            ]
          },
          tier2Intermediate: {
            targetStudents: ['Sophia Rodriguez', 'Ethan Hunt'],
            description: 'Transcendental and composite trigonometric differentiations.',
            problems: [
              'Differentiate $f(x) = \\sin(x^3 + 2x)$ with respect to $x$.',
              'Find the equation of the tangent line to $y = e^{x^2 - 4}$ at $x = 2$.'
            ]
          },
          tier3Extension: {
            targetStudents: ['Alex Chen', 'Priya Patel'],
            description: 'Compounding physical rate modeling and implicit differentiation proofs.',
            problems: [
              'Given $e^{xy} + y^2 = 5$, determine $\\frac{dy}{dx}$ in terms of $x$ and $y$.',
              'Explain how the chain rule guarantees gear torque conservation in dual-planetary gearboxes.'
            ]
          }
        };

        const currentWorksheets = BackendService.getWorksheets();
        BackendService.saveWorksheets([starterWorksheet, ...currentWorksheets]);
      }

      setFinishSuccess(true);
      setTimeout(() => {
        onComplete({
          className,
          subject,
          gradeLevel,
          schoolName,
          socraticPacing,
          autoDifferentiate
        });
      }, 1000);
    } catch (e) {
      console.warn('Teacher onboarding save error:', e);
      onComplete({ className, subject, gradeLevel, schoolName });
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(14px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '740px',
          padding: '32px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          overflowY: 'auto'
        }}
      >
        {/* Header with Progress Steps */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}
              >
                <Compass size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Teacher Classroom Quickstart Setup
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Step {step} of 3: {step === 1 ? 'Class Details' : step === 2 ? 'Pedagogy & AI Rules' : 'Curriculum Seeding'}
                </span>
              </div>
            </div>

            <button onClick={onClose} className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px' }}>
              <X size={16} />
            </button>
          </div>

          {/* Stepper Bar */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  background: step >= i ? 'var(--primary-gradient)' : 'var(--bg-surface-elevated)',
                  transition: 'background 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Classroom & Subject Profile */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Class / Cohort Name
              </label>
              <input
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                placeholder="e.g. AP Calculus BC - Period 4"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  Primary STEM Discipline
                </label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value as SubjectId)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="math">Mathematics (Calculus, Linear Algebra, Stats)</option>
                  <option value="physics">Physics (Mechanics, Electromagnetism, Quantum)</option>
                  <option value="chemistry">Chemistry (Organic, Kinetics, Thermodynamics)</option>
                  <option value="biology">Biology & Genetics</option>
                  <option value="cs">Computer Science & Data Structures</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                  Target Academic Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={e => setGradeLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem'
                  }}
                >
                  <option value="Middle School STEM">Middle School (Grades 6 - 8)</option>
                  <option value="High School Honors">High School Honors (Grades 9 - 10)</option>
                  <option value="Grade 11 - 12 (Advanced Placement)">AP / IB STEM (Grades 11 - 12)</option>
                  <option value="Undergraduate STEM">Undergraduate STEM</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                School / Institution Name
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                <School size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="e.g. St. Jude STEM Academy"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pedagogical & AI Guardrail Rules */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                Socratic AI Inquiry Rigor
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { id: 'gentle', label: 'Guided / Gentle', desc: 'Frequent hints, lower frustration ceiling' },
                  { id: 'balanced', label: 'Bloom 2-Sigma Standard', desc: 'Step-by-step probing, no direct answers' },
                  { id: 'rigorous', label: 'Rigorous First-Principles', desc: 'Deep counter-examples and edge tests' }
                ].map(item => (
                  <div
                    key={item.id}
                    onClick={() => setSocraticPacing(item.id as any)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: socraticPacing === item.id ? 'var(--primary-surface)' : 'var(--bg-surface-elevated)',
                      border: socraticPacing === item.id ? '1px solid var(--primary-border)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: socraticPacing === item.id ? 'var(--primary-light)' : 'var(--text-main)', marginBottom: '4px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                onClick={() => setAutoDifferentiate(!autoDifferentiate)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Layers size={20} color="var(--primary-light)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      Auto-generate 3-Tier Differentiated Worksheets
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      Generates Foundational, Core, and Challenge tiers automatically on topic creation.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoDifferentiate}
                  onChange={() => {}}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
              </div>

              <div
                onClick={() => setFerpaMode(!ferpaMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                      Strict Student Data Privacy (FERPA & COPPA Guardrail Shield)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      Enkrypt AI automatically strips names, phone numbers, and student PII before external LLM calls.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={ferpaMode}
                  onChange={() => {}}
                  style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Initial Curriculum Seeding */}
        {step === 3 && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Sparkles size={16} color="var(--primary-light)" />
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Seed Your Knowledge Graph & Qdrant Vectors</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Waypoint will synthesize this inaugural node into your curriculum graph, create prerequisite edges, and generate 1536-dim Qdrant vector embeddings for live RAG retrieval.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                Inaugural Topic Title
              </label>
              <input
                type="text"
                value={starterTopic.title}
                onChange={e => setStarterTopic({ ...starterTopic, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>
                First-Principles Pedagogical Description
              </label>
              <textarea
                value={starterTopic.description}
                onChange={e => setStarterTopic({ ...starterTopic, description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  resize: 'none'
                }}
              />
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinishOnboarding}
              disabled={isFinishing || finishSuccess}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: finishSuccess ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--primary-gradient)'
              }}
            >
              {finishSuccess ? (
                <>
                  <Check size={16} />
                  <span>Classroom Initialized!</span>
                </>
              ) : isFinishing ? (
                <>
                  <Sparkles size={16} className="animate-spin" />
                  <span>Embedding Vectors & Initializing...</span>
                </>
              ) : (
                <>
                  <GraduationCap size={16} />
                  <span>Launch Teacher Studio</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
