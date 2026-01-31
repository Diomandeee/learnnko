/**
 * SRS Types for the spaced repetition system
 */

import { CardStatus, Quality } from './sm2';

export type CardType = 'vocabulary' | 'lesson' | 'character' | 'phrase';

export interface SRSCardData {
  id: string;
  userId: string;
  cardType: CardType;
  contentId: string; // Reference to the actual content (vocabulary ID, lesson ID, etc.)
  
  // SM-2 fields
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate: Date | null;
  status: CardStatus;
  streak: number;
  lapses: number;
  
  // Content for display (denormalized for performance)
  front: string;        // Question/prompt (e.g., N'Ko word)
  back: string;         // Answer (e.g., English translation)
  pronunciation?: string;
  example?: string;
  audioUrl?: string;
  
  // Metadata
  qualityHistory: Quality[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewSessionData {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt: Date | null;
  
  // Statistics
  cardsReviewed: number;
  correctCount: number;
  incorrectCount: number;
  averageQuality: number;
  totalTimeMs: number;
  
  // Card IDs reviewed in this session
  cardIds: string[];
}

export interface UserSRSStats {
  userId: string;
  
  // Card counts by status
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  masteredCards: number;
  
  // Review statistics
  totalReviews: number;
  reviewsToday: number;
  reviewsThisWeek: number;
  reviewsThisMonth: number;
  
  // Due cards
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
  
  // Performance
  averageEaseFactor: number;
  retentionRate: number;
  currentStreak: number;
  longestStreak: number;
  
  // Time tracking
  totalStudyTimeMinutes: number;
  averageSessionMinutes: number;
  
  lastReviewDate: Date | null;
  updatedAt: Date;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  cardsReviewed: number;
  newCardsLearned: number;
  correctCount: number;
  incorrectCount: number;
  studyTimeMinutes: number;
}

export interface ReviewQueueOptions {
  limit?: number;
  includeNew?: boolean;
  newCardLimit?: number;
  cardTypes?: CardType[];
}

export interface ReviewSubmission {
  cardId: string;
  quality: Quality;
  responseTimeMs: number;
}

export interface QueueCard extends Omit<SRSCardData, 'qualityHistory'> {
  intervalPreview: Record<Quality, number>;
}
