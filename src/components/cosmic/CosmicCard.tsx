'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CosmicCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyber' | 'phase' | 'amber' | 'nko';
  hover?: boolean;
}

export function CosmicCard({ 
  children, 
  className = '', 
  glowColor = 'cyber',
  hover = true 
}: CosmicCardProps) {
  const glowStyles = {
    cyber: 'hover:shadow-cyber hover:border-cyber-500/30',
    phase: 'hover:shadow-phase hover:border-phase-500/30',
    amber: 'hover:shadow-amber hover:border-amber-500/30',
    nko: 'hover:shadow-nko hover:border-nko-gold/30',
  };

  const borderStyles = {
    cyber: 'border-cyber-500/10',
    phase: 'border-phase-500/10',
    amber: 'border-amber-500/10',
    nko: 'border-nko-gold/10',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-space-800/80 to-space-900/80',
        'backdrop-blur-xl border',
        borderStyles[glowColor],
        'transition-all duration-500 ease-out',
        hover && glowStyles[glowColor],
        className
      )}
    >
      {/* Glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated border gradient on group hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-2px] bg-gradient-to-r from-cyber-500/20 via-phase-500/20 to-cyber-500/20 rounded-2xl blur-sm animate-pulse-glow" />
      </div>
    </div>
  );
}

