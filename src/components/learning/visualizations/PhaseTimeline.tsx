'use client';

import { LearningPhase, PhaseTransition } from '@/lib/learning/types';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface PhaseTimelineProps {
  currentPhase: LearningPhase;
  transitions: PhaseTransition[];
}

const PHASES: LearningPhase[] = ['exploration', 'consolidation', 'synthesis', 'debugging', 'planning'];

export function PhaseTimeline({ currentPhase, transitions }: PhaseTimelineProps) {
  const getCurrentPhaseIndex = () => PHASES.indexOf(currentPhase);
  const activeIndex = getCurrentPhaseIndex();

  return (
    <div className="mt-6 pt-6 border-t">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Learning Phases
      </h4>

      <div className="relative flex items-center justify-between">
        {/* Connection Line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 -z-10" />

        {PHASES.map((phase, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;

          return (
            <div key={phase} className="flex flex-col items-center gap-2 relative group">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-500 border-2",
                isActive ? "bg-primary border-primary text-primary-foreground scale-125 shadow-lg shadow-primary/20" :
                  isPast ? "bg-primary/20 border-primary text-primary hover:bg-primary/30" :
                    "bg-background border-muted text-muted-foreground"
              )}>
                {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : index + 1}
              </div>

              <span className={cn(
                "text-[10px] bg-background px-1 capitalize transition-colors duration-300 absolute -bottom-5 w-max text-center",
                isActive ? "font-bold text-primary" :
                  isPast ? "font-medium text-foreground/80" :
                    "text-muted-foreground"
              )}>
                {phase}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
