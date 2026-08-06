import { describe, it, expect } from 'vitest';
import { calculateNextReview, isCardDue, formatInterval } from '../services/srsEngine';
import { RecallCard } from '../types';

describe('SM-2 Spaced Repetition Engine', () => {
  const baseCard: RecallCard = {
    id: 'test_card_01',
    topicId: 'calc_limits_01',
    subject: 'math',
    front: 'What is the limit definition of a derivative?',
    back: "f'(x) = lim_{h->0} [f(x+h) - f(x)] / h",
    lastReviewed: '2026-08-01T00:00:00.000Z',
    nextReviewDate: '2026-08-02T00:00:00.000Z',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 1,
    status: 'learning'
  };

  it('correctly increments interval on easy recall', () => {
    const updated = calculateNextReview(baseCard, 'easy');
    expect(updated.repetitions).toBe(2);
    expect(updated.intervalDays).toBeGreaterThanOrEqual(2);
    expect(updated.easeFactor).toBeGreaterThanOrEqual(2.5);
    expect(updated.lastReviewed).toBeDefined();
  });

  it('resets interval and repetitions count on failed recall (again)', () => {
    const masteredCard: RecallCard = {
      ...baseCard,
      repetitions: 5,
      intervalDays: 30,
      status: 'mastered'
    };
    const updated = calculateNextReview(masteredCard, 'again');
    expect(updated.repetitions).toBe(0);
    expect(updated.intervalDays).toBe(1);
    expect(updated.easeFactor).toBeLessThan(masteredCard.easeFactor);
  });

  it('maintains minimum ease factor bound at 1.3', () => {
    let card: RecallCard = { ...baseCard, easeFactor: 1.35 };
    for (let i = 0; i < 5; i++) {
      card = calculateNextReview(card, 'again');
    }
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('identifies overdue and due cards correctly', () => {
    const pastCard: RecallCard = {
      ...baseCard,
      nextReviewDate: '2020-01-01T00:00:00.000Z'
    };
    const futureCard: RecallCard = {
      ...baseCard,
      nextReviewDate: '2099-01-01T00:00:00.000Z'
    };

    expect(isCardDue(pastCard)).toBe(true);
    expect(isCardDue(futureCard)).toBe(false);
  });

  it('formats interval strings cleanly', () => {
    expect(formatInterval(1)).toBe('1d');
    expect(formatInterval(14)).toBe('14d');
    expect(formatInterval(60)).toBe('2mo');
  });
});
