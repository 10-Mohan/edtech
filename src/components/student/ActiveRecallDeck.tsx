import React, { useState } from 'react';
import { ConfidenceRating, RecallCard } from '../../types';
import { calculateNextReview, formatInterval, isCardDue } from '../../services/srsEngine';
import { MathRenderer } from '../common/MathRenderer';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Eye,
  Award,
  Layers,
  Check
} from 'lucide-react';

interface ActiveRecallDeckProps {
  cards: RecallCard[];
  onSaveCard: (card: RecallCard) => void;
  onAddXP: (amount: number) => void;
}

export const ActiveRecallDeck: React.FC<ActiveRecallDeckProps> = ({
  cards,
  onSaveCard,
  onAddXP
}) => {
  const [filterMode, setFilterMode] = useState<'due' | 'all' | 'mastered'>('due');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [sessionReviewedCount, setSessionReviewedCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // New Card Modal State
  const [isCreatingCard, setIsCreatingCard] = useState<boolean>(false);
  const [newFront, setNewFront] = useState<string>('');
  const [newBack, setNewBack] = useState<string>('');
  const [newEquation, setNewEquation] = useState<string>('');
  const [newHint, setNewHint] = useState<string>('');

  const filteredCards = cards.filter(card => {
    if (filterMode === 'due') return isCardDue(card);
    if (filterMode === 'mastered') return card.status === 'mastered';
    return true;
  });

  const activeCard = filteredCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = (rating: ConfidenceRating) => {
    if (!activeCard) return;

    const updated = calculateNextReview(activeCard, rating);
    onSaveCard(updated);
    onAddXP(15); // 15 XP per card reviewed

    setSessionReviewedCount(prev => prev + 1);
    setIsFlipped(false);
    setShowHint(false);

    if (currentIndex + 1 < filteredCards.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: RecallCard = {
      id: `card_${Date.now()}`,
      topicId: 'custom',
      subject: 'math',
      front: newFront,
      back: newBack,
      equation: newEquation || undefined,
      hint: newHint || undefined,
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date().toISOString(),
      status: 'new'
    };

    onSaveCard(newCard);
    setNewFront('');
    setNewBack('');
    setNewEquation('');
    setNewHint('');
    setIsCreatingCard(false);
    onAddXP(25);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Deck Header & Filter Tabs */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Spaced Repetition Deck</h1>
              <span className="badge badge-amber">SM-2 Algorithm</span>
            </div>
            <p style={{ margin: 0 }}>
              Active recall schedules reviews right before memory decay occurs, locking concepts into long-term retention.
            </p>
          </div>

          {/* Action Tabs & Create Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { setFilterMode('due'); handleRestart(); }}
                className="btn btn-sm"
                style={{
                  background: filterMode === 'due' ? 'var(--primary-gradient)' : 'transparent',
                  color: filterMode === 'due' ? '#fff' : 'var(--text-muted)'
                }}
              >
                Due for Review ({cards.filter(isCardDue).length})
              </button>
              <button
                onClick={() => { setFilterMode('all'); handleRestart(); }}
                className="btn btn-sm"
                style={{
                  background: filterMode === 'all' ? 'var(--primary-gradient)' : 'transparent',
                  color: filterMode === 'all' ? '#fff' : 'var(--text-muted)'
                }}
              >
                All Cards ({cards.length})
              </button>
              <button
                onClick={() => { setFilterMode('mastered'); handleRestart(); }}
                className="btn btn-sm"
                style={{
                  background: filterMode === 'mastered' ? 'var(--primary-gradient)' : 'transparent',
                  color: filterMode === 'mastered' ? '#fff' : 'var(--text-muted)'
                }}
              >
                Mastered ({cards.filter(c => c.status === 'mastered').length})
              </button>
            </div>

            <button onClick={() => setIsCreatingCard(true)} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Add Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Flashcard Practice Area */}
      {isCompleted || !activeCard ? (
        <div
          className="glass-panel animate-scale-up"
          style={{
            padding: '60px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px'
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px var(--accent-emerald-glow)',
              color: '#10b981'
            }}
          >
            <CheckCircle2 size={44} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Review Session Completed!</h2>
            <p style={{ maxWidth: '480px', margin: '0 auto' }}>
              Awesome job! You reviewed {sessionReviewedCount} cards and strengthened your neural pathways. Next interval reviews have been scheduled.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleRestart} className="btn btn-primary">
              <RotateCw size={16} />
              <span>Review Again</span>
            </button>
            <button onClick={() => { setFilterMode('all'); handleRestart(); }} className="btn btn-secondary">
              <Layers size={16} />
              <span>View Full Library</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          {/* Progress Indicator */}
          <div style={{ width: '100%', maxWidth: '680px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
            <span className="badge badge-indigo">
              Interval: {formatInterval(activeCard.intervalDays)} • Ease: {activeCard.easeFactor}
            </span>
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="card-flip-container"
            style={{ maxWidth: '680px', cursor: 'pointer' }}
            onClick={handleFlip}
          >
            <div className={`card-flip-inner ${isFlipped ? 'is-flipped' : ''}`}>
              {/* Front Face */}
              <div
                className="card-flip-front glass-panel"
                style={{
                  background: 'linear-gradient(135deg, rgba(22, 29, 48, 0.9) 0%, rgba(16, 21, 34, 0.95) 100%)',
                  border: '1px solid var(--border-medium)',
                  minHeight: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-cyan" style={{ textTransform: 'uppercase' }}>
                    {activeCard.subject}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={13} /> Click card to flip
                  </span>
                </div>

                <div style={{ padding: '24px 0', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5 }}>
                  <MathRenderer text={activeCard.front} />
                </div>

                {activeCard.hint && (
                  <div>
                    {showHint ? (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.1)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                        <strong>Hint:</strong> <MathRenderer text={activeCard.hint} />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowHint(true); }}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '0.75rem' }}
                      >
                        <HelpCircle size={13} /> Show Hint
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Back Face */}
              <div
                className="card-flip-back glass-panel"
                style={{
                  background: 'linear-gradient(135deg, rgba(26, 35, 60, 0.95) 0%, rgba(16, 21, 34, 0.98) 100%)',
                  border: '1px solid var(--border-highlight)',
                  minHeight: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-emerald">Recall Solution</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    Repetitions: {activeCard.repetitions}
                  </span>
                </div>

                <div style={{ padding: '20px 0', fontSize: '1.15rem', color: '#f8fafc', lineHeight: 1.6 }}>
                  <MathRenderer text={activeCard.back} />
                  {activeCard.equation && (
                    <div style={{ marginTop: '12px' }}>
                      <MathRenderer text={`$$${activeCard.equation}$$`} />
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  Rate your recall confidence below to calibrate next interval
                </div>
              </div>
            </div>
          </div>

          {/* SM-2 Confidence Buttons (Visible when flipped) */}
          {isFlipped && (
            <div
              className="animate-fade-in"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                width: '100%',
                maxWidth: '680px'
              }}
            >
              <button
                onClick={() => handleRating('again')}
                className="btn btn-rose"
                style={{ display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: '2px' }}
              >
                <span style={{ fontWeight: 700 }}>Again</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>1 Day (Reset)</span>
              </button>

              <button
                onClick={() => handleRating('hard')}
                className="btn btn-amber"
                style={{ display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: '2px' }}
              >
                <span style={{ fontWeight: 700 }}>Hard</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                  {formatInterval(Math.max(1, Math.round(activeCard.intervalDays * 1.2)))}
                </span>
              </button>

              <button
                onClick={() => handleRating('good')}
                className="btn btn-primary"
                style={{ display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: '2px' }}
              >
                <span style={{ fontWeight: 700 }}>Good</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                  {formatInterval(Math.max(2, Math.round(activeCard.intervalDays * activeCard.easeFactor)))}
                </span>
              </button>

              <button
                onClick={() => handleRating('easy')}
                className="btn btn-emerald"
                style={{ display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: '2px' }}
              >
                <span style={{ fontWeight: 700 }}>Easy</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>
                  {formatInterval(Math.max(4, Math.round(activeCard.intervalDays * activeCard.easeFactor * 1.3)))}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Card Modal */}
      {isCreatingCard && (
        <div className="modal-overlay" onClick={() => setIsCreatingCard(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Create Active Recall Flashcard</h2>
            <p style={{ fontSize: '0.85rem', marginBottom: '20px' }}>
              Add a prompt with optional LaTeX equations for spaced recall practice.
            </p>

            <form onSubmit={handleCreateCard} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Front Prompt (Question)
                </label>
                <textarea
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  placeholder="e.g. What is the derivative of $\ln(x^2)$?"
                  required
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Back Solution (Answer)
                </label>
                <textarea
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  placeholder="e.g. By the chain rule: $\frac{1}{x^2} \cdot 2x = \frac{2}{x}$."
                  required
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-body)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Equation Formula (Optional)
                </label>
                <input
                  type="text"
                  value={newEquation}
                  onChange={e => setNewEquation(e.target.value)}
                  placeholder="e.g. \frac{d}{dx}\ln(u) = \frac{u'}{u}"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-mono)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px' }}>
                  Hint (Optional)
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={e => setNewHint(e.target.value)}
                  placeholder="e.g. Differentiate the natural log first, then multiply by inner derivative."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-main)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCreatingCard(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Card (+25 XP)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
