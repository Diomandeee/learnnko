'use client';

/**
 * ProgressRing - Circular progress visualization with confidence bands
 *
 * Shows learning progress as a circular ring with:
 * - Main progress arc based on accuracy/confidence
 * - Inner confidence interval bands
 * - Phase-colored indicator
 * - Animated pulse when active
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ProgressRingProps, LearningPhase } from '@/lib/learning/types';
import { PHASE_COLORS } from '@/lib/learning/types';

const SIZE_CONFIG = {
  sm: { size: 120, stroke: 8, fontSize: 'text-lg' },
  md: { size: 160, stroke: 10, fontSize: 'text-2xl' },
  lg: { size: 200, stroke: 12, fontSize: 'text-3xl' },
};

export function ProgressRing({
  stats,
  phase,
  isActive,
  size = 'md',
}: ProgressRingProps) {
  const config = SIZE_CONFIG[size];
  const center = config.size / 2;
  const radius = center - config.stroke;
  const circumference = 2 * Math.PI * radius;

  // Calculate stroke dashoffset for progress (handle NaN)
  const rawProgress = isNaN(stats.mean) ? 0 : stats.mean;
  const progress = Math.max(0, Math.min(1, rawProgress));
  const progressOffset = circumference * (1 - progress);

  // Calculate confidence band positions (handle NaN)
  const rawLower = isNaN(stats.confidence?.lower) ? 0 : stats.confidence?.lower ?? 0;
  const rawUpper = isNaN(stats.confidence?.upper) ? 1 : stats.confidence?.upper ?? 1;
  const confidenceLower = Math.max(0, Math.min(1, rawLower));
  const confidenceUpper = Math.max(0, Math.min(1, rawUpper));

  // Arc calculations for confidence bands
  const innerRadius = radius - config.stroke - 4;
  const innerCircumference = 2 * Math.PI * innerRadius;

  const phaseColor = PHASE_COLORS[phase];

  // Generate confidence band path
  const confidenceBandPath = useMemo(() => {
    const startAngle = -90 + (confidenceLower * 360);
    const endAngle = -90 + (confidenceUpper * 360);

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const outerR = radius - 2;
    const innerR = innerRadius + 2;

    const x1 = center + outerR * Math.cos(startRad);
    const y1 = center + outerR * Math.sin(startRad);
    const x2 = center + outerR * Math.cos(endRad);
    const y2 = center + outerR * Math.sin(endRad);
    const x3 = center + innerR * Math.cos(endRad);
    const y3 = center + innerR * Math.sin(endRad);
    const x4 = center + innerR * Math.cos(startRad);
    const y4 = center + innerR * Math.sin(startRad);

    const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

    return `M ${x1} ${y1}
            A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4}
            Z`;
  }, [center, radius, innerRadius, confidenceLower, confidenceUpper]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={config.size}
        height={config.size}
        className={cn(isActive && 'animate-spin-slow')}
        style={{ animationDuration: '20s' }}
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-gray-200 dark:text-gray-700"
        />

        {/* Confidence band (shaded area showing uncertainty) */}
        {stats.count >= 2 && (
          <path
            d={confidenceBandPath}
            fill={phaseColor}
            opacity={0.15}
          />
        )}

        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={phaseColor}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
          className="transition-all duration-500 ease-out"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        />

        {/* Active pulse indicator */}
        {isActive && (
          <circle
            cx={center}
            cy={center}
            r={radius + config.stroke / 2 + 4}
            fill="none"
            stroke={phaseColor}
            strokeWidth={2}
            opacity={0.3}
            className="animate-ping"
            style={{ animationDuration: '2s' }}
          />
        )}

        {/* Inner decorative circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 8}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-gray-200 dark:text-gray-700"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn(config.fontSize, 'font-bold')} style={{ color: phaseColor }}>
          {(progress * 100).toFixed(0)}%
        </div>
        <div className="text-xs text-muted-foreground">
          {stats.count} obs
        </div>
        {stats.count >= 2 && (
          <div className="text-xs text-muted-foreground mt-1">
            ±{((confidenceUpper - confidenceLower) * 50).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Phase indicator dot */}
      <div
        className={cn(
          'absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full',
          isActive && 'animate-pulse'
        )}
        style={{ backgroundColor: phaseColor }}
      />
    </div>
  );
}

export default ProgressRing;
