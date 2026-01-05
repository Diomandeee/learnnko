'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CosmicCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'cyber' | 'phase' | 'amber' | 'nko';
  hover?: boolean;
  /**
   * Optional title for the card
   */
  title?: string;
  /**
   * Optional description for the card
   */
  description?: string;
  /**
   * Optional icon to show in header
   */
  icon?: ReactNode;
  /**
   * Optional header actions (buttons, etc.)
   */
  headerActions?: ReactNode;
  /**
   * Use structured Card component instead of div
   */
  structured?: boolean;
}

export function CosmicCard({
  children,
  className = '',
  glowColor = 'amber',
  hover = true,
  title,
  description,
  icon,
  headerActions,
  structured = false,
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

  const baseClassName = cn(
    'relative overflow-hidden rounded-2xl',
    'bg-gradient-to-br from-space-800/80 to-space-900/80',
    'backdrop-blur-xl border',
    borderStyles[glowColor],
    'transition-all duration-500 ease-out',
    hover && glowStyles[glowColor],
    className
  );

  // If using structured variant with title/description
  if (structured && (title || description || icon || headerActions)) {
    return (
      <Card className={baseClassName}>
        {(title || description || icon || headerActions) && (
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                {icon && (
                  <div className="text-amber-400 flex-shrink-0">
                    {icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {title && (
                    <CardTitle className="text-amber-300">
                      {title}
                    </CardTitle>
                  )}
                  {description && (
                    <CardDescription className="text-gray-400 mt-1">
                      {description}
                    </CardDescription>
                  )}
                </div>
              </div>
              {headerActions && (
                <div className="flex-shrink-0">
                  {headerActions}
                </div>
              )}
            </div>
          </CardHeader>
        )}
        <CardContent>
          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Animated border gradient on group hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-[-2px] bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-sm animate-pulse-glow" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Original simple variant
  return (
    <div className={baseClassName}>
      {/* Glass reflection */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated border gradient on group hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-[-2px] bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-sm animate-pulse-glow" />
      </div>
    </div>
  );
}

