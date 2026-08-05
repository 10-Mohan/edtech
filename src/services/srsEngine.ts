import { ConfidenceRating, RecallCard } from '../types';

/**
 * SuperMemo SM-2 Algorithm with modern enhancements
 */
export function calculateNextReview(card: RecallCard, rating: ConfidenceRating): RecallCard {
  let quality: number;
  switch (rating) {
    case 'again':
      quality = 1;
      break;
    case 'hard':
      quality = 3;
      break;
    case 'good':
      quality = 4;
      break;
    case 'easy':
      quality = 5;
      break;
  }

  let { intervalDays, easeFactor, repetitions } = card;

  if (quality < 3) {
    // Failed recall: reset repetitions and set interval to 1 day
    repetitions = 0;
    intervalDays = 1;
  } else {
    // Successful recall
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = rating === 'easy' ? 4 : 2;
    } else {
      let multiplier = easeFactor;
      if (rating === 'hard') multiplier = Math.max(1.2, easeFactor * 0.85);
      if (rating === 'easy') multiplier = easeFactor * 1.3;
      intervalDays = Math.round(intervalDays * multiplier);
    }
    repetitions += 1;
  }

  // Update Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easeFactor = Math.max(1.3, Math.min(3.0, easeFactor + deltaEF));

  // Compute next review date
  const now = new Date();
  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  let newStatus: RecallCard['status'] = 'learning';
  if (repetitions >= 4 && intervalDays >= 14) {
    newStatus = 'mastered';
  } else if (repetitions >= 1) {
    newStatus = 'review';
  }

  return {
    ...card,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
    nextReviewDate: nextDate.toISOString(),
    lastReviewed: now.toISOString(),
    status: newStatus,
  };
}

export function isCardDue(card: RecallCard): boolean {
  if (!card.nextReviewDate) return true;
  const reviewTime = new Date(card.nextReviewDate).getTime();
  const nowTime = new Date().getTime();
  return nowTime >= reviewTime;
}

export function formatInterval(days: number): string {
  if (days <= 1) return '1d';
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  return `${months}mo`;
}
