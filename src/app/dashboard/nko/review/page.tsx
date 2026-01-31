'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReviewSession, SRSDashboard } from '@/components/srs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ReviewPage() {
  const router = useRouter();
  const [isReviewing, setIsReviewing] = useState(false);
  
  const handleStartReview = () => {
    setIsReviewing(true);
  };
  
  const handleCompleteReview = () => {
    setIsReviewing(false);
  };
  
  const handleExit = () => {
    if (isReviewing) {
      setIsReviewing(false);
    } else {
      router.push('/dashboard/nko');
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleExit}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isReviewing ? 'Exit Review' : 'Back to Dashboard'}
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isReviewing ? 'Review Session' : 'Spaced Repetition'}
        </h1>
        <p className="text-muted-foreground">
          {isReviewing 
            ? 'Review your cards and rate how well you remembered each one.'
            : 'Master N\'Ko vocabulary and characters through spaced repetition.'}
        </p>
      </div>
      
      {isReviewing ? (
        <ReviewSession 
          onComplete={handleCompleteReview}
          onExit={handleExit}
        />
      ) : (
        <SRSDashboard onStartReview={handleStartReview} />
      )}
    </div>
  );
}
