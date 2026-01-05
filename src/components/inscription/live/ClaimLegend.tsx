/**
 * ClaimLegend Component
 *
 * A directive panel showing all 10 N'Ko inscription claim types.
 * Each claim type displays its sigil, color, name, and description
 * to help users understand the meaning of inscriptions as they stream.
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type ClaimType,
  CLAIM_SIGILS,
  CLAIM_DESCRIPTIONS,
  CLAIM_COLORS,
} from '@/lib/inscription/types';

// =====================================================
// CLAIM TYPE METADATA (Extended for legend display)
// =====================================================

interface ClaimMetadata {
  type: ClaimType;
  sigil: string;
  name: string;
  description: string;
  color: string;
  category: 'variance' | 'spatial' | 'temporal' | 'pattern';
  shortExplanation: string;
}

const CLAIM_METADATA: ClaimMetadata[] = [
  {
    type: 'stabilize',
    sigil: CLAIM_SIGILS.stabilize,
    name: 'Stabilize',
    description: CLAIM_DESCRIPTIONS.stabilize,
    color: CLAIM_COLORS.stabilize,
    category: 'variance',
    shortExplanation: 'Movement becoming more consistent and controlled',
  },
  {
    type: 'disperse',
    sigil: CLAIM_SIGILS.disperse,
    name: 'Disperse',
    description: CLAIM_DESCRIPTIONS.disperse,
    color: CLAIM_COLORS.disperse,
    category: 'variance',
    shortExplanation: 'Movement becoming more varied and exploratory',
  },
  {
    type: 'transition',
    sigil: CLAIM_SIGILS.transition,
    name: 'Transition',
    description: CLAIM_DESCRIPTIONS.transition,
    color: CLAIM_COLORS.transition,
    category: 'spatial',
    shortExplanation: 'Moving from one meaningful state to another',
  },
  {
    type: 'return',
    sigil: CLAIM_SIGILS.return,
    name: 'Return',
    description: CLAIM_DESCRIPTIONS.return,
    color: CLAIM_COLORS.return,
    category: 'spatial',
    shortExplanation: 'Coming back to a familiar movement pattern',
  },
  {
    type: 'dwell',
    sigil: CLAIM_SIGILS.dwell,
    name: 'Dwell',
    description: CLAIM_DESCRIPTIONS.dwell,
    color: CLAIM_COLORS.dwell,
    category: 'temporal',
    shortExplanation: 'Staying in a stable state for an extended period',
  },
  {
    type: 'oscillate',
    sigil: CLAIM_SIGILS.oscillate,
    name: 'Oscillate',
    description: CLAIM_DESCRIPTIONS.oscillate,
    color: CLAIM_COLORS.oscillate,
    category: 'temporal',
    shortExplanation: 'Rhythmic back-and-forth movement pattern',
  },
  {
    type: 'recover',
    sigil: CLAIM_SIGILS.recover,
    name: 'Recover',
    description: CLAIM_DESCRIPTIONS.recover,
    color: CLAIM_COLORS.recover,
    category: 'variance',
    shortExplanation: 'Returning to calm after intense movement',
  },
  {
    type: 'novel',
    sigil: CLAIM_SIGILS.novel,
    name: 'Novel',
    description: CLAIM_DESCRIPTIONS.novel,
    color: CLAIM_COLORS.novel,
    category: 'pattern',
    shortExplanation: 'Discovering a completely new movement pattern',
  },
  {
    type: 'placeShift',
    sigil: CLAIM_SIGILS.placeShift,
    name: 'Place Shift',
    description: CLAIM_DESCRIPTIONS.placeShift,
    color: CLAIM_COLORS.placeShift,
    category: 'spatial',
    shortExplanation: 'First-time visit to a new location or state',
  },
  {
    type: 'echo',
    sigil: CLAIM_SIGILS.echo,
    name: 'Echo',
    description: CLAIM_DESCRIPTIONS.echo,
    color: CLAIM_COLORS.echo,
    category: 'pattern',
    shortExplanation: 'Repeating a recent movement pattern',
  },
];

// =====================================================
// SINGLE CLAIM ITEM
// =====================================================

interface ClaimItemProps {
  claim: ClaimMetadata;
  isCompact?: boolean;
}

function ClaimItem({ claim, isCompact = false }: ClaimItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg',
        'bg-space-900/50 border border-amber-500/10',
        'hover:border-amber-500/30 hover:bg-space-800/50 transition-all'
      )}
    >
      {/* Sigil */}
      <span
        className={cn(
          'flex-shrink-0 leading-none',
          isCompact ? 'text-2xl' : 'text-3xl'
        )}
        style={{
          color: claim.color,
          fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
        }}
      >
        {claim.sigil}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-amber-200">{claim.name}</span>
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 capitalize"
          >
            {claim.category}
          </Badge>
        </div>
        {!isCompact && (
          <p className="text-sm text-gray-300 leading-relaxed">
            {claim.shortExplanation}
          </p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// MAIN LEGEND COMPONENT
// =====================================================

interface ClaimLegendProps {
  /** Show in compact mode (just sigils + names) */
  compact?: boolean;
  /** Allow collapsing */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function ClaimLegend({
  compact = false,
  collapsible = true,
  defaultCollapsed = false,
  className,
}: ClaimLegendProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  // Group claims by category
  const groupedClaims = React.useMemo(() => {
    const groups: Record<string, ClaimMetadata[]> = {
      variance: [],
      spatial: [],
      temporal: [],
      pattern: [],
    };
    CLAIM_METADATA.forEach((claim) => {
      groups[claim.category].push(claim);
    });
    return groups;
  }, []);

  const categoryLabels: Record<string, string> = {
    variance: 'Variance Claims',
    spatial: 'Spatial Claims',
    temporal: 'Temporal Claims',
    pattern: 'Pattern Claims',
  };

  const categoryDescriptions: Record<string, string> = {
    variance: 'Changes in movement consistency (sigma)',
    spatial: 'Movement through semantic spaces and places',
    temporal: 'Time-extended patterns and rhythms',
    pattern: 'Discovery and repetition of movement patterns',
  };

  return (
    <Card
      className={cn(
        'border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80 backdrop-blur-xl',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-amber-300">
            <Info className="h-5 w-5" />
            Claim Types Reference
          </CardTitle>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-amber-300"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        {!isCollapsed && (
          <p className="text-sm text-gray-400 mt-1">
            10 fundamental patterns detected in embodied movement dynamics
          </p>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-4">
          {compact ? (
            // Compact: Simple grid of all claims
            <div className="grid grid-cols-2 gap-2">
              {CLAIM_METADATA.map((claim) => (
                <ClaimItem key={claim.type} claim={claim} isCompact />
              ))}
            </div>
          ) : (
            // Full: Grouped by category
            <div className="space-y-4">
              {Object.entries(groupedClaims).map(([category, claims]) => (
                <div key={category}>
                  <div className="mb-2">
                    <h4 className="text-sm font-medium text-amber-200/80">
                      {categoryLabels[category]}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {categoryDescriptions[category]}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {claims.map((claim) => (
                      <ClaimItem key={claim.type} claim={claim} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Link to full reference page */}
          <div className="pt-2 border-t border-amber-500/10">
            <Link
              href="/claims"
              className="flex items-center justify-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors py-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Reference & Examples
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

// =====================================================
// INLINE LEGEND (Horizontal strip for ticker)
// =====================================================

export function ClaimLegendInline({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 py-2 px-3',
        'bg-space-900/60 border-y border-amber-500/10',
        className
      )}
    >
      <span className="text-xs text-gray-400 mr-2">Legend:</span>
      {CLAIM_METADATA.map((claim) => (
        <div
          key={claim.type}
          className="flex items-center gap-1.5 group cursor-default"
          title={claim.description}
        >
          <span
            className="text-lg leading-none group-hover:scale-125 transition-transform"
            style={{
              color: claim.color,
              fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
            }}
          >
            {claim.sigil}
          </span>
          <span className="text-xs text-gray-400 group-hover:text-amber-300 transition-colors">
            {claim.name}
          </span>
        </div>
      ))}
      <Link
        href="/claims"
        className="ml-auto text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
      >
        <ExternalLink className="w-3 h-3" />
        <span className="hidden sm:inline">Full Reference</span>
      </Link>
    </div>
  );
}

// =====================================================
// TOOLTIP CONTENT (For use in popovers)
// =====================================================

export function ClaimTooltipContent({
  claimType,
}: {
  claimType: ClaimType;
}) {
  const claim = CLAIM_METADATA.find((c) => c.type === claimType);
  if (!claim) return null;

  return (
    <div className="p-2 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-2xl leading-none"
          style={{
            color: claim.color,
            fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
          }}
        >
          {claim.sigil}
        </span>
        <div>
          <div className="font-semibold text-amber-200">{claim.name}</div>
          <Badge
            variant="outline"
            className="text-[10px] px-1 py-0 h-4 capitalize"
          >
            {claim.category}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-gray-300">{claim.description}</p>
      <p className="text-xs text-gray-400 mt-2 italic">
        {claim.shortExplanation}
      </p>
    </div>
  );
}

// Export metadata for use in other components
export { CLAIM_METADATA };
export type { ClaimMetadata };
