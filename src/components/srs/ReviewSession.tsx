'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSRS, SRSCard, SessionSummary } from '@/hooks/useSRS';
import { Quality, formatInterval } from '@/lib/srs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  Volume2, 
  Eye, 
  EyeOff,
  Clock,
  Flame,
  Trophy,
  ArrowRight,
  Home
} from 'lucide-react';

interface ReviewSessionProps {
  onComplete?: (summary: SessionSummary) => void;
  onExit?: () => void;
  cardTypes?: ('VOCABULARY' | 'LESSON' | 'CHARACTER' | 'PHRASE')[];
  limit?: number;
  newCardLimit?: number;
}

type ReviewState = 'loading' | 'reviewing' | 'revealed' | 'complete';

export function ReviewSession({
  onComplete,
  onExit,
  cardTypes,
  limit = 20,
  newCardLimit = 10,
}: ReviewSessionProps) {
  const {
    queue,
    currentCard,
    hasMoreCards,
    queueSize,
    session,
    loading,
    error,
    fetchQueue,
    startSession,
    endSession,
    submitReview,
    getIntervalLabel,
  } = useSRS();
  
  const [reviewState, setReviewState] = useState<ReviewState>('loading');
  const [cardStartTime, setCardStartTime] = useState<number>(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Initialize session
  useEffect(() => {
    async function init() {
      try {
        await startSession();
        await fetchQueue({
          limit,
          newCardLimit,
          cardTypes,
        });
        setReviewState('reviewing');
      } catch (err) {
        console.error('Failed to initialize session:', err);
      }
    }
    init();
  }, [startSession, fetchQueue, limit, newCardLimit, cardTypes]);
  
  // Start timer for new card
  useEffect(() => {
    if (currentCard && reviewState === 'reviewing') {
      setCardStartTime(Date.now());
      setIsFlipped(false);
    }
  }, [currentCard?.id, reviewState]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (reviewState === 'reviewing') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleReveal();
        }
      } else if (reviewState === 'revealed') {
        const keyMap: Record<string, Quality> = {
          '1': Quality.COMPLETE_BLACKOUT,
          '2': Quality.INCORRECT_REMEMBERED,
          '3': Quality.CORRECT_DIFFICULT,
          '4': Quality.CORRECT_HESITATION,
          '5': Quality.PERFECT,
        };
        if (keyMap[e.key] !== undefined) {
          e.preventDefault();
          handleQualityRating(keyMap[e.key]);
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [reviewState]);
  
  const handleReveal = useCallback(() => {
    setIsFlipped(true);
    setReviewState('revealed');
  }, []);
  
  const handleQualityRating = useCallback(async (quality: Quality) => {
    if (!currentCard) return;
    
    const responseTimeMs = Date.now() - cardStartTime;
    
    try {
      await submitReview(currentCard.id, quality, responseTimeMs);
      
      setTotalReviewed(prev => prev + 1);
      if (quality >= 3) {
        setCorrectCount(prev => prev + 1);
      }
      
      if (queue.length <= 1) {
        // Last card - end session
        const sessionSummary = await endSession();
        setSummary(sessionSummary);
        setReviewState('complete');
        if (sessionSummary && onComplete) {
          onComplete(sessionSummary);
        }
      } else {
        setReviewState('reviewing');
        setIsFlipped(false);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  }, [currentCard, cardStartTime, queue.length, submitReview, endSession, onComplete]);
  
  const handlePlayAudio = useCallback(() => {
    if (currentCard?.audioUrl) {
      const audio = new Audio(currentCard.audioUrl);
      audio.play();
    }
  }, [currentCard?.audioUrl]);
  
  const handleExit = useCallback(async () => {
    if (session) {
      await endSession();
    }
    if (onExit) {
      onExit();
    }
  }, [session, endSession, onExit]);
  
  // Loading state
  if (reviewState === 'loading' || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="text-muted-foreground">Loading your review session...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  // Complete state
  if (reviewState === 'complete' || !hasMoreCards) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Trophy className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <CardTitle className="text-2xl">Session Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {summary && (
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{summary.cardsReviewed}</p>
                <p className="text-sm text-muted-foreground">Cards Reviewed</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold">{summary.accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-green-500">{summary.correctCount}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-3xl font-bold text-red-500">{summary.incorrectCount}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleExit}
            >
              <Home className="h-4 w-4 mr-2" />
              Exit
            </Button>
            <Button 
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Review state
  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="text-lg">No cards due for review!</p>
        <p className="text-muted-foreground">Great job staying on top of your reviews.</p>
        <Button onClick={handleExit}>Go Back</Button>
      </div>
    );
  }
  
  const progressPercent = (totalReviewed / (totalReviewed + queueSize)) * 100;
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{queueSize} cards remaining</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-medium">{correctCount}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-red-500 font-medium">{totalReviewed - correctCount}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleExit}>
          Exit
        </Button>
      </div>
      
      <Progress value={progressPercent} className="h-2" />
      
      {/* Flashcard */}
      <div 
        ref={cardRef}
        className="perspective-1000"
        onClick={reviewState === 'reviewing' ? handleReveal : undefined}
      >
        <motion.div
          className="relative w-full min-h-[300px] cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front of card */}
          <Card 
            className="absolute inset-0 flex flex-col items-center justify-center p-8 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardContent className="text-center space-y-4">
              <p className="text-4xl font-bold" style={{ fontFamily: 'Noto Sans NKo, serif' }}>
                {currentCard.front}
              </p>
              {currentCard.pronunciation && (
                <p className="text-lg text-muted-foreground">
                  [{currentCard.pronunciation}]
                </p>
              )}
              {currentCard.audioUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio();
                  }}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              )}
              
              <div className="pt-8 flex items-center justify-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-sm">Tap to reveal answer</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Back of card */}
          <Card 
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardContent className="text-center space-y-4">
              <p className="text-2xl font-bold">{currentCard.back}</p>
              {currentCard.example && (
                <p className="text-muted-foreground italic">
                  "{currentCard.example}"
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Quality rating buttons */}
      <AnimatePresence>
        {reviewState === 'revealed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <p className="text-center text-sm text-muted-foreground">
              How well did you remember this?
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="flex flex-col gap-1 h-auto py-3 border-red-200 hover:border-red-400 hover:bg-red-50"
                onClick={() => handleQualityRating(Quality.COMPLETE_BLACKOUT)}
              >
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-xs">Again</span>
                <span className="text-xs text-muted-foreground">
                  {formatInterval(currentCard.intervalPreview[Quality.COMPLETE_BLACKOUT])}
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col gap-1 h-auto py-3 border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                onClick={() => handleQualityRating(Quality.CORRECT_DIFFICULT)}
              >
                <span className="text-lg">😅</span>
                <span className="text-xs">Hard</span>
                <span className="text-xs text-muted-foreground">
                  {formatInterval(currentCard.intervalPreview[Quality.CORRECT_DIFFICULT])}
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col gap-1 h-auto py-3 border-green-200 hover:border-green-400 hover:bg-green-50"
                onClick={() => handleQualityRating(Quality.CORRECT_HESITATION)}
              >
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-xs">Good</span>
                <span className="text-xs text-muted-foreground">
                  {formatInterval(currentCard.intervalPreview[Quality.CORRECT_HESITATION])}
                </span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col gap-1 h-auto py-3 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                onClick={() => handleQualityRating(Quality.PERFECT)}
              >
                <Flame className="h-5 w-5 text-blue-500" />
                <span className="text-xs">Easy</span>
                <span className="text-xs text-muted-foreground">
                  {formatInterval(currentCard.intervalPreview[Quality.PERFECT])}
                </span>
              </Button>
            </div>
            
            <p className="text-center text-xs text-muted-foreground">
              Keyboard: 1 = Again, 3 = Hard, 4 = Good, 5 = Easy
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Show answer prompt */}
      {reviewState === 'reviewing' && (
        <div className="text-center">
          <Button onClick={handleReveal} size="lg">
            Show Answer
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Press Space or Enter
          </p>
        </div>
      )}
    </div>
  );
}

export default ReviewSession;
