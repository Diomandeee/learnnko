'use client';

import { useState, useCallback, useEffect } from 'react';
import { Quality, CardStatus, formatInterval } from '@/lib/srs';

export interface SRSCard {
  id: string;
  cardType: string;
  contentId: string;
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
  audioUrl?: string;
  status: CardStatus;
  easeFactor: number;
  interval: number;
  repetitions: number;
  streak: number;
  nextReviewDate: Date;
  intervalPreview: Record<Quality, number>;
}

export interface SRSStats {
  cardCounts: {
    total: number;
    new: number;
    learning: number;
    review: number;
    mastered: number;
  };
  dueCounts: {
    today: number;
    thisWeek: number;
    overdue: number;
  };
  performance: {
    averageEaseFactor: number;
    retentionRate: number;
  };
  streak: {
    current: number;
    longest: number;
  };
  activity: {
    reviewsToday: number;
    reviewsThisWeek: number;
    reviewsThisMonth: number;
    totalReviews: number;
    totalStudyTimeMinutes: number;
  };
  lastReviewDate: Date | null;
}

export interface ReviewSession {
  id: string;
  startedAt: Date;
  endedAt: Date | null;
  cardsReviewed: number;
  correctCount: number;
  incorrectCount: number;
  averageQuality: number;
  totalTimeMs: number;
}

export interface ReviewResult {
  success: boolean;
  card: {
    id: string;
    status: CardStatus;
    easeFactor: number;
    interval: number;
    nextReviewDate: Date;
    streak: number;
  };
  review: {
    id: string;
    quality: Quality;
    isCorrect: boolean;
  };
}

export interface SessionSummary {
  cardsReviewed: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  averageQuality: number;
  duration: number;
}

export function useSRS() {
  const [queue, setQueue] = useState<SRSCard[]>([]);
  const [stats, setStats] = useState<SRSStats | null>(null);
  const [session, setSession] = useState<ReviewSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Fetch the review queue
   */
  const fetchQueue = useCallback(async (options?: {
    limit?: number;
    includeNew?: boolean;
    newCardLimit?: number;
    cardTypes?: string[];
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.includeNew !== undefined) params.set('includeNew', options.includeNew.toString());
      if (options?.newCardLimit) params.set('newCardLimit', options.newCardLimit.toString());
      if (options?.cardTypes) params.set('cardTypes', options.cardTypes.join(','));
      
      const response = await fetch(`/api/srs/queue?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch queue');
      }
      
      setQueue(data.cards);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch queue';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Fetch user statistics
   */
  const fetchStats = useCallback(async (options?: {
    history?: boolean;
    historyDays?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (options?.history) params.set('history', 'true');
      if (options?.historyDays) params.set('historyDays', options.historyDays.toString());
      
      const response = await fetch(`/api/srs/stats?${params}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }
      
      setStats(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Start a new review session
   */
  const startSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/srs/session', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start session');
      }
      
      setSession(data.session);
      return data.session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * End the current review session
   */
  const endSession = useCallback(async (): Promise<SessionSummary | null> => {
    if (!session) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/srs/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to end session');
      }
      
      setSession(null);
      return data.summary;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end session';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);
  
  /**
   * Submit a review for a card
   */
  const submitReview = useCallback(async (
    cardId: string,
    quality: Quality,
    responseTimeMs: number
  ): Promise<ReviewResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/srs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId,
          quality,
          responseTimeMs,
          sessionId: session?.id,
        }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }
      
      // Remove reviewed card from queue
      setQueue(prev => prev.filter(c => c.id !== cardId));
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);
  
  /**
   * Add a card to the SRS system
   */
  const addCard = useCallback(async (card: {
    cardType: 'VOCABULARY' | 'LESSON' | 'CHARACTER' | 'PHRASE';
    contentId: string;
    front: string;
    back: string;
    pronunciation?: string;
    example?: string;
    audioUrl?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/srs/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add card');
      }
      
      return data.card;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add card';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Add multiple cards at once
   */
  const addCards = useCallback(async (cards: Array<{
    cardType: 'VOCABULARY' | 'LESSON' | 'CHARACTER' | 'PHRASE';
    contentId: string;
    front: string;
    back: string;
    pronunciation?: string;
    example?: string;
    audioUrl?: string;
  }>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/srs/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add cards');
      }
      
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add cards';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Delete a card
   */
  const deleteCard = useCallback(async (cardId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/srs/cards?id=${cardId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete card');
      }
      
      setQueue(prev => prev.filter(c => c.id !== cardId));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete card';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Get human-readable interval preview
   */
  const getIntervalLabel = useCallback((days: number) => {
    return formatInterval(days);
  }, []);
  
  /**
   * Get the current card (first in queue)
   */
  const currentCard = queue[0] || null;
  
  /**
   * Check if there are more cards
   */
  const hasMoreCards = queue.length > 0;
  
  /**
   * Get queue size
   */
  const queueSize = queue.length;
  
  return {
    // State
    queue,
    currentCard,
    hasMoreCards,
    queueSize,
    stats,
    session,
    loading,
    error,
    
    // Actions
    fetchQueue,
    fetchStats,
    startSession,
    endSession,
    submitReview,
    addCard,
    addCards,
    deleteCard,
    
    // Helpers
    getIntervalLabel,
    Quality,
    CardStatus,
  };
}

export default useSRS;
