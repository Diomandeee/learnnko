/**
 * InscriptionCard Component
 *
 * Displays a single N'Ko inscription with:
 * - Claim type sigil and label
 * - N'Ko text (RTL rendered)
 * - Confidence badge
 * - Metadata (place, basin, timestamp)
 * - Provenance button (optional)
 */

'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Target, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NkoTextDisplay } from '@/components/learning/nko/NkoTextDisplay';
import { cn } from '@/lib/utils';
import {
  type Inscription,
  type ClaimType,
  CLAIM_SIGILS,
  CLAIM_DESCRIPTIONS,
  CLAIM_COLORS,
} from '@/lib/inscription/types';

// =====================================================
// COMPONENT PROPS
// =====================================================

interface InscriptionCardProps {
  /** The inscription to display */
  inscription: Inscription;

  /** Whether to show the provenance button */
  showProvenance?: boolean;

  /** Callback when provenance button is clicked */
  onProvenanceClick?: (inscription: Inscription) => void;

  /** Whether this card is selected */
  isSelected?: boolean;

  /** Click handler for the card */
  onClick?: (inscription: Inscription) => void;

  /** Additional CSS classes */
  className?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function InscriptionCard({
  inscription,
  showProvenance = false,
  onProvenanceClick,
  isSelected = false,
  onClick,
  className,
  /** Animation direction: 'right' (RTL like N'Ko) or 'left' */
  slideFrom = 'right',
}: InscriptionCardProps & { slideFrom?: 'right' | 'left' }) {
  const sigil = CLAIM_SIGILS[inscription.claimType];
  const description = CLAIM_DESCRIPTIONS[inscription.claimType];
  const color = CLAIM_COLORS[inscription.claimType];

  // Format timestamp as relative time
  const timeAgo = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(inscription.createdAt), { addSuffix: true });
    } catch {
      return 'recently';
    }
  }, [inscription.createdAt]);

  // Format timestamp in milliseconds as duration
  const formattedTimestamp = React.useMemo(() => {
    const seconds = Math.floor(inscription.timestampMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, [inscription.timestampMs]);

  // Confidence badge variant
  const confidenceBadgeVariant = React.useMemo(() => {
    if (inscription.confidence >= 0.8) return 'default';
    if (inscription.confidence >= 0.5) return 'secondary';
    return 'outline';
  }, [inscription.confidence]);

  // Parse nkoText to extract just the sigil and clean description
  const cleanNkoDisplay = React.useMemo(() => {
    // Format: "ߣ ⟦timestamp⟧ : body" or "ߕ ⟦t0→t1⟧ : body"
    const text = inscription.nkoText;
    // Extract sigil (first character)
    const sigilChar = text.charAt(0);
    // Extract the body after the colon
    const colonIndex = text.indexOf(':');
    const body = colonIndex > -1 ? text.slice(colonIndex + 1).trim() : text;
    return { sigil: sigilChar, body };
  }, [inscription.nkoText]);

  return (
    <Card
      className={cn(
        'animate-in fade-in duration-500',
        slideFrom === 'right' ? 'slide-in-from-right-12' : 'slide-in-from-left-12',
        'bg-gradient-to-br from-space-800/80 to-space-900/80 backdrop-blur-xl border border-amber-500/20 shadow-amber',
        'hover:shadow-lg hover:shadow-amber-500/25 transition-all',
        isSelected && 'ring-2 ring-amber-400',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={() => onClick?.(inscription)}
    >
      <CardContent className="p-4">
        {/* Header: Sigil + Claim Type + Confidence */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Sigil */}
            <span
              className="text-4xl leading-none"
              style={{ color }}
              title={description}
            >
              {sigil}
            </span>

            {/* Claim Type Label */}
            <div className="flex flex-col">
              <span className="font-semibold text-lg capitalize text-amber-200">
                {inscription.claimType}
              </span>
              <span className="text-xs text-gray-400 line-clamp-1">
                {description}
              </span>
            </div>
          </div>

          {/* Confidence Badge */}
          <Badge variant={confidenceBadgeVariant}>
            {Math.round(inscription.confidence * 100)}%
          </Badge>
        </div>

        {/* N'Ko Text - Clean Display */}
        <div className="my-4 p-3 bg-space-900/70 border border-amber-500/30 rounded-md">
          {/* Show the clean body text (without timestamp brackets) */}
          <NkoTextDisplay
            text={cleanNkoDisplay.body}
            size="lg"
            className="leading-relaxed"
          />
          {/* Show full technical text on hover/expand (optional debug) */}
          <details className="mt-2 text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-400">Raw inscription</summary>
            <code className="block mt-1 p-2 bg-space-950/50 rounded text-[10px] font-mono break-all">
              {inscription.nkoText}
            </code>
          </details>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-300">
          {/* Place */}
          {inscription.place && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-medium">{inscription.place}</span>
            </div>
          )}

          {/* Basin */}
          {inscription.basinId && (
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              <span className="font-mono text-xs">
                {inscription.basinId.slice(0, 8)}...
              </span>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{formattedTimestamp}</span>
          </div>

          {/* Time ago */}
          <span className="text-xs italic ml-auto">
            {timeAgo}
          </span>
        </div>

        {/* Window (for interval claims) */}
        {inscription.window && (
          <div className="mt-2 text-xs text-gray-400">
            Window: ⟦{inscription.window.t0.toFixed(1)}–{inscription.window.t1.toFixed(1)}⟧ ms
          </div>
        )}

        {/* Provenance Button */}
        {showProvenance && onProvenanceClick && (
          <div className="mt-3 pt-3 border-t border-amber-500/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
              onClick={(e) => {
                e.stopPropagation();
                onProvenanceClick(inscription);
              }}
            >
              <span className="text-xs">View Provenance Chain</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// COMPACT VARIANT
// =====================================================

/**
 * Compact inscription card for timeline/list views.
 */
export function InscriptionCardCompact({
  inscription,
  onClick,
  isSelected = false,
}: Pick<InscriptionCardProps, 'inscription' | 'onClick' | 'isSelected'>) {
  const sigil = CLAIM_SIGILS[inscription.claimType];
  const color = CLAIM_COLORS[inscription.claimType];

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(inscription)}
    >
      {/* Sigil */}
      <span className="text-2xl leading-none" style={{ color }}>
        {sigil}
      </span>

      {/* N'Ko Text (truncated) */}
      <div className="flex-1 min-w-0">
        <div
          className="text-sm truncate"
          dir="rtl"
          lang="nqo"
          style={{
            fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
            unicodeBidi: 'embed',
          }}
        >
          {inscription.nkoText}
        </div>
      </div>

      {/* Confidence */}
      <Badge variant="secondary" className="text-xs">
        {Math.round(inscription.confidence * 100)}%
      </Badge>
    </div>
  );
}

// =====================================================
// LOADING SKELETON
// =====================================================

/**
 * Loading skeleton for inscription card.
 */
export function InscriptionCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-1/3" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
          </div>
          <div className="h-6 w-12 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-16 bg-muted animate-pulse rounded mb-3" />
        <div className="flex gap-3">
          <div className="h-4 bg-muted animate-pulse rounded w-20" />
          <div className="h-4 bg-muted animate-pulse rounded w-24" />
          <div className="h-4 bg-muted animate-pulse rounded w-16 ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
