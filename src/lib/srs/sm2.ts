/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * 
 * Based on the SuperMemo SM-2 algorithm by Piotr Wozniak
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

import { addDays, startOfDay } from 'date-fns';

// Quality ratings for SM-2
export enum Quality {
  COMPLETE_BLACKOUT = 0,     // Complete failure to recall
  INCORRECT_REMEMBERED = 1,   // Incorrect response; upon seeing correct answer, remembered
  INCORRECT_EASY_RECALL = 2,  // Incorrect response; upon seeing correct answer, easy recall
  CORRECT_DIFFICULT = 3,      // Correct response with significant difficulty
  CORRECT_HESITATION = 4,     // Correct response after hesitation
  PERFECT = 5                 // Perfect response with no hesitation
}

// Card status based on SM-2 progression
export enum CardStatus {
  NEW = 'new',           // Never reviewed
  LEARNING = 'learning', // In initial learning phase
  REVIEW = 'review',     // Graduated to review phase
  RELEARNING = 'relearning', // Failed review, back to learning
  MASTERED = 'mastered'  // High ease factor and long interval
}

export interface SM2Card {
  easeFactor: number;      // E-Factor (2.5 default, minimum 1.3)
  interval: number;        // Current interval in days
  repetitions: number;     // Number of successful repetitions
  nextReviewDate: Date;    // Next scheduled review
  lastReviewDate: Date | null;
  status: CardStatus;
  streak: number;          // Consecutive correct answers
  lapses: number;          // Number of times card was forgotten
}

export interface SM2ReviewResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  status: CardStatus;
  streak: number;
  lapses: number;
}

// Default values for new cards
export const DEFAULT_EASE_FACTOR = 2.5;
export const MIN_EASE_FACTOR = 1.3;
export const MASTERED_THRESHOLD_INTERVAL = 21; // 3 weeks
export const MASTERED_THRESHOLD_EASE = 2.3;

/**
 * Calculate the new ease factor based on quality
 * EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
 */
export function calculateEaseFactor(currentEF: number, quality: Quality): number {
  const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(MIN_EASE_FACTOR, newEF);
}

/**
 * Calculate the next interval based on SM-2 algorithm
 */
export function calculateInterval(
  currentInterval: number,
  repetitions: number,
  easeFactor: number,
  quality: Quality
): number {
  // If quality < 3, restart repetitions
  if (quality < 3) {
    return 1; // Reset to 1 day
  }

  // First successful review
  if (repetitions === 0) {
    return 1;
  }
  
  // Second successful review
  if (repetitions === 1) {
    return 6;
  }
  
  // Subsequent reviews: I(n) = I(n-1) * EF
  return Math.round(currentInterval * easeFactor);
}

/**
 * Determine card status based on current state
 */
export function determineStatus(
  interval: number,
  easeFactor: number,
  repetitions: number,
  quality: Quality,
  previousStatus: CardStatus
): CardStatus {
  // Failed review - go to relearning
  if (quality < 3) {
    if (previousStatus === CardStatus.NEW || previousStatus === CardStatus.LEARNING) {
      return CardStatus.LEARNING;
    }
    return CardStatus.RELEARNING;
  }
  
  // New card with first successful review
  if (previousStatus === CardStatus.NEW) {
    return CardStatus.LEARNING;
  }
  
  // Learning card that passed
  if (previousStatus === CardStatus.LEARNING && repetitions >= 2) {
    return CardStatus.REVIEW;
  }
  
  // Relearning card that passed - back to review
  if (previousStatus === CardStatus.RELEARNING) {
    return CardStatus.REVIEW;
  }
  
  // Check for mastery
  if (interval >= MASTERED_THRESHOLD_INTERVAL && easeFactor >= MASTERED_THRESHOLD_EASE) {
    return CardStatus.MASTERED;
  }
  
  // Keep current status for learning cards
  if (previousStatus === CardStatus.LEARNING) {
    return CardStatus.LEARNING;
  }
  
  return CardStatus.REVIEW;
}

/**
 * Process a review and calculate the next scheduling
 */
export function processReview(
  card: SM2Card,
  quality: Quality
): SM2ReviewResult {
  const isCorrect = quality >= 3;
  
  // Calculate new ease factor
  const newEaseFactor = calculateEaseFactor(card.easeFactor, quality);
  
  // Calculate repetitions
  let newRepetitions: number;
  if (quality < 3) {
    newRepetitions = 0; // Reset on failure
  } else {
    newRepetitions = card.repetitions + 1;
  }
  
  // Calculate interval
  const newInterval = calculateInterval(
    card.interval,
    newRepetitions,
    newEaseFactor,
    quality
  );
  
  // Calculate next review date
  const today = startOfDay(new Date());
  const nextReviewDate = addDays(today, newInterval);
  
  // Determine new status
  const newStatus = determineStatus(
    newInterval,
    newEaseFactor,
    newRepetitions,
    quality,
    card.status
  );
  
  // Calculate streak
  const newStreak = isCorrect ? card.streak + 1 : 0;
  
  // Calculate lapses
  const newLapses = !isCorrect && card.status !== CardStatus.NEW 
    ? card.lapses + 1 
    : card.lapses;
  
  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
    status: newStatus,
    streak: newStreak,
    lapses: newLapses,
  };
}

/**
 * Create a new SM2 card with default values
 */
export function createNewCard(): SM2Card {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
    nextReviewDate: startOfDay(new Date()),
    lastReviewDate: null,
    status: CardStatus.NEW,
    streak: 0,
    lapses: 0,
  };
}

/**
 * Check if a card is due for review
 */
export function isCardDue(card: SM2Card): boolean {
  const today = startOfDay(new Date());
  const reviewDate = startOfDay(new Date(card.nextReviewDate));
  return reviewDate <= today;
}

/**
 * Calculate retention rate from quality history
 */
export function calculateRetentionRate(qualityHistory: Quality[]): number {
  if (qualityHistory.length === 0) return 0;
  
  const correct = qualityHistory.filter(q => q >= 3).length;
  return (correct / qualityHistory.length) * 100;
}

/**
 * Get a human-readable description of the next interval
 */
export function formatInterval(days: number): string {
  if (days === 0) return 'Now';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  }
  const years = Math.round(days / 365);
  return years === 1 ? '1 year' : `${years} years`;
}

/**
 * Get preview intervals for each quality rating
 * Useful for showing users what happens with each button
 */
export function getIntervalPreviews(card: SM2Card): Record<Quality, number> {
  return {
    [Quality.COMPLETE_BLACKOUT]: 1,
    [Quality.INCORRECT_REMEMBERED]: 1,
    [Quality.INCORRECT_EASY_RECALL]: 1,
    [Quality.CORRECT_DIFFICULT]: calculateInterval(card.interval, card.repetitions + 1, calculateEaseFactor(card.easeFactor, Quality.CORRECT_DIFFICULT), Quality.CORRECT_DIFFICULT),
    [Quality.CORRECT_HESITATION]: calculateInterval(card.interval, card.repetitions + 1, calculateEaseFactor(card.easeFactor, Quality.CORRECT_HESITATION), Quality.CORRECT_HESITATION),
    [Quality.PERFECT]: calculateInterval(card.interval, card.repetitions + 1, calculateEaseFactor(card.easeFactor, Quality.PERFECT), Quality.PERFECT),
  };
}
