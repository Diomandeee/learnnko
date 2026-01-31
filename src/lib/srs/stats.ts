/**
 * SRS Statistics and Analytics
 */

import { startOfDay, subDays, isWithinInterval, startOfWeek, startOfMonth } from 'date-fns';
import { CardStatus, Quality, calculateRetentionRate } from './sm2';
import type { SRSCardData, DailyStats, UserSRSStats } from './types';

/**
 * Calculate card counts by status
 */
export function calculateCardCounts(cards: SRSCardData[]): {
  total: number;
  new: number;
  learning: number;
  review: number;
  relearning: number;
  mastered: number;
} {
  const counts = {
    total: cards.length,
    new: 0,
    learning: 0,
    review: 0,
    relearning: 0,
    mastered: 0,
  };
  
  for (const card of cards) {
    switch (card.status) {
      case CardStatus.NEW:
        counts.new++;
        break;
      case CardStatus.LEARNING:
        counts.learning++;
        break;
      case CardStatus.REVIEW:
        counts.review++;
        break;
      case CardStatus.RELEARNING:
        counts.relearning++;
        break;
      case CardStatus.MASTERED:
        counts.mastered++;
        break;
    }
  }
  
  return counts;
}

/**
 * Calculate due cards
 */
export function calculateDueCounts(cards: SRSCardData[]): {
  dueToday: number;
  dueThisWeek: number;
  overdue: number;
} {
  const today = startOfDay(new Date());
  const weekFromNow = startOfDay(subDays(new Date(), -7));
  
  let dueToday = 0;
  let dueThisWeek = 0;
  let overdue = 0;
  
  for (const card of cards) {
    const reviewDate = startOfDay(new Date(card.nextReviewDate));
    
    if (reviewDate < today) {
      overdue++;
      dueToday++; // Overdue cards are also due today
    } else if (reviewDate.getTime() === today.getTime()) {
      dueToday++;
    }
    
    if (reviewDate <= weekFromNow) {
      dueThisWeek++;
    }
  }
  
  return { dueToday, dueThisWeek, overdue };
}

/**
 * Calculate average ease factor
 */
export function calculateAverageEaseFactor(cards: SRSCardData[]): number {
  if (cards.length === 0) return 2.5;
  
  const sum = cards.reduce((acc, card) => acc + card.easeFactor, 0);
  return sum / cards.length;
}

/**
 * Calculate overall retention rate from all cards
 */
export function calculateOverallRetention(cards: SRSCardData[]): number {
  const allQualities = cards.flatMap(card => card.qualityHistory);
  return calculateRetentionRate(allQualities);
}

/**
 * Calculate streak from review history
 */
export function calculateStreak(reviewDates: Date[]): {
  current: number;
  longest: number;
} {
  if (reviewDates.length === 0) return { current: 0, longest: 0 };
  
  // Sort dates in descending order
  const sorted = [...reviewDates]
    .map(d => startOfDay(new Date(d)))
    .sort((a, b) => b.getTime() - a.getTime());
  
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));
  
  // Check if streak is active (reviewed today or yesterday)
  const lastReview = sorted[0];
  const isStreakActive = 
    lastReview.getTime() === today.getTime() ||
    lastReview.getTime() === yesterday.getTime();
  
  if (!isStreakActive) {
    return { current: 0, longest: calculateLongestStreak(sorted) };
  }
  
  // Calculate current streak
  let currentStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const expectedDate = startOfDay(subDays(sorted[i - 1], 1));
    if (sorted[i].getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  const longestStreak = Math.max(currentStreak, calculateLongestStreak(sorted));
  
  return { current: currentStreak, longest: longestStreak };
}

/**
 * Calculate longest streak from sorted dates
 */
function calculateLongestStreak(sortedDates: Date[]): number {
  if (sortedDates.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = sortedDates[i - 1].getTime() - sortedDates[i].getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (diff === oneDay) {
      current++;
      longest = Math.max(longest, current);
    } else if (diff > oneDay) {
      current = 1;
    }
    // Skip same-day entries
  }
  
  return longest;
}

/**
 * Generate daily statistics for a date range
 */
export function generateDailyStats(
  cards: SRSCardData[],
  days: number = 30
): DailyStats[] {
  const stats: Map<string, DailyStats> = new Map();
  const today = startOfDay(new Date());
  
  // Initialize all days
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    const dateStr = date.toISOString().split('T')[0];
    stats.set(dateStr, {
      date: dateStr,
      cardsReviewed: 0,
      newCardsLearned: 0,
      correctCount: 0,
      incorrectCount: 0,
      studyTimeMinutes: 0,
    });
  }
  
  // Aggregate from cards
  for (const card of cards) {
    if (card.lastReviewDate) {
      const dateStr = startOfDay(new Date(card.lastReviewDate))
        .toISOString()
        .split('T')[0];
      
      const dayStat = stats.get(dateStr);
      if (dayStat) {
        // This is a simplified version - in production you'd track per-review data
        dayStat.cardsReviewed++;
        
        // Check last quality
        const lastQuality = card.qualityHistory[card.qualityHistory.length - 1];
        if (lastQuality !== undefined) {
          if (lastQuality >= 3) {
            dayStat.correctCount++;
          } else {
            dayStat.incorrectCount++;
          }
        }
      }
    }
    
    // Track new cards learned (first review)
    if (card.status !== CardStatus.NEW && card.createdAt) {
      const dateStr = startOfDay(new Date(card.createdAt))
        .toISOString()
        .split('T')[0];
      
      const dayStat = stats.get(dateStr);
      if (dayStat) {
        dayStat.newCardsLearned++;
      }
    }
  }
  
  return Array.from(stats.values()).reverse();
}

/**
 * Calculate review counts for different periods
 */
export function calculateReviewCounts(reviewDates: Date[]): {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
} {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  
  let today = 0;
  let thisWeek = 0;
  let thisMonth = 0;
  
  for (const date of reviewDates) {
    const d = new Date(date);
    
    if (d >= todayStart) today++;
    if (d >= weekStart) thisWeek++;
    if (d >= monthStart) thisMonth++;
  }
  
  return {
    today,
    thisWeek,
    thisMonth,
    total: reviewDates.length,
  };
}

/**
 * Calculate difficulty distribution
 */
export function calculateDifficultyDistribution(cards: SRSCardData[]): {
  easy: number;    // EF >= 2.5
  medium: number;  // 1.8 <= EF < 2.5
  hard: number;    // EF < 1.8
} {
  let easy = 0;
  let medium = 0;
  let hard = 0;
  
  for (const card of cards) {
    if (card.easeFactor >= 2.5) {
      easy++;
    } else if (card.easeFactor >= 1.8) {
      medium++;
    } else {
      hard++;
    }
  }
  
  return { easy, medium, hard };
}

/**
 * Calculate forecast for upcoming reviews
 */
export function calculateReviewForecast(
  cards: SRSCardData[],
  days: number = 7
): { date: string; count: number }[] {
  const forecast: Map<string, number> = new Map();
  const today = startOfDay(new Date());
  
  // Initialize days
  for (let i = 0; i < days; i++) {
    const date = subDays(today, -i);
    forecast.set(date.toISOString().split('T')[0], 0);
  }
  
  // Count reviews per day
  for (const card of cards) {
    const reviewDate = startOfDay(new Date(card.nextReviewDate));
    const dateStr = reviewDate.toISOString().split('T')[0];
    
    if (forecast.has(dateStr)) {
      forecast.set(dateStr, (forecast.get(dateStr) || 0) + 1);
    }
  }
  
  return Array.from(forecast.entries()).map(([date, count]) => ({ date, count }));
}

/**
 * Build complete user SRS stats
 */
export function buildUserStats(
  userId: string,
  cards: SRSCardData[],
  reviewDates: Date[],
  totalStudyTimeMinutes: number,
  sessionCount: number
): UserSRSStats {
  const cardCounts = calculateCardCounts(cards);
  const dueCounts = calculateDueCounts(cards);
  const reviewCounts = calculateReviewCounts(reviewDates);
  const streak = calculateStreak(reviewDates);
  
  return {
    userId,
    totalCards: cardCounts.total,
    newCards: cardCounts.new,
    learningCards: cardCounts.learning,
    reviewCards: cardCounts.review,
    masteredCards: cardCounts.mastered,
    totalReviews: reviewCounts.total,
    reviewsToday: reviewCounts.today,
    reviewsThisWeek: reviewCounts.thisWeek,
    reviewsThisMonth: reviewCounts.thisMonth,
    dueToday: dueCounts.dueToday,
    dueThisWeek: dueCounts.dueThisWeek,
    overdue: dueCounts.overdue,
    averageEaseFactor: calculateAverageEaseFactor(cards),
    retentionRate: calculateOverallRetention(cards),
    currentStreak: streak.current,
    longestStreak: streak.longest,
    totalStudyTimeMinutes,
    averageSessionMinutes: sessionCount > 0 ? totalStudyTimeMinutes / sessionCount : 0,
    lastReviewDate: reviewDates.length > 0 ? reviewDates[reviewDates.length - 1] : null,
    updatedAt: new Date(),
  };
}
