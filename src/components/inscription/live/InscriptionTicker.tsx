/**
 * InscriptionTicker Component
 *
 * Simple RTL streaming ticker for N'Ko inscriptions.
 * Text flows in from right to left like natural N'Ko reading.
 * Hover over sigils to see detailed explanations.
 */

'use client';

import * as React from 'react';
import { Wifi, WifiOff, Settings, Info, Eye, EyeOff, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { InscriptionWebSocket } from '@/lib/inscription/websocket';
import {
  useInscriptionStore,
  useFilteredLiveInscriptions,
} from '@/store/use-inscription-store';
import {
  CLAIM_SIGILS,
  CLAIM_COLORS,
  CLAIM_DESCRIPTIONS,
  type ClaimType,
} from '@/lib/inscription/types';
import { CLAIM_METADATA } from './ClaimLegend';

// =====================================================
// TICKER ITEM
// =====================================================

interface TickerItem {
  id: string;
  sigil: string;
  claimType: ClaimType;
  timestamp: number;
  confidence?: number;
}

function TickerItemDisplay({ item }: { item: TickerItem; index: number }) {
  const color = CLAIM_COLORS[item.claimType];
  const metadata = CLAIM_METADATA.find((c) => c.type === item.claimType);

  // Format timestamp as seconds
  const timeSeconds = (item.timestamp / 1000).toFixed(1);

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-block opacity-100',
            'mx-1.5 text-3xl md:text-4xl lg:text-5xl',
            'hover:scale-110 transition-transform duration-150 cursor-pointer',
            'hover:drop-shadow-[0_0_6px_currentColor]'
          )}
          style={{
            color,
            fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
          }}
        >
          {item.sigil}
        </span>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs p-3 bg-space-900/95 border-amber-500/30 backdrop-blur-xl"
      >
        <div className="space-y-2">
          {/* Header: Sigil + Name */}
          <div className="flex items-center gap-2">
            <span
              className="text-2xl leading-none"
              style={{ color, fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif" }}
            >
              {item.sigil}
            </span>
            <div>
              <div className="font-semibold text-amber-200 capitalize">
                {item.claimType}
              </div>
              {metadata && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4 capitalize text-gray-400"
                >
                  {metadata.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300">
            {metadata?.shortExplanation || CLAIM_DESCRIPTIONS[item.claimType]}
          </p>

          {/* Technical info */}
          <div className="text-xs text-gray-500 pt-1 border-t border-amber-500/20">
            <span>@ {timeSeconds}s</span>
            {item.confidence !== undefined && (
              <span className="ml-2">
                Confidence: {Math.round(item.confidence * 100)}%
              </span>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// =====================================================
// MAIN TICKER COMPONENT
// =====================================================

interface InscriptionTickerProps {
  /** Show detailed view button */
  onShowDetails?: () => void;
  /** Max items to display */
  maxItems?: number;
  /** Custom class */
  className?: string;
}

export function InscriptionTicker({
  onShowDetails,
  maxItems = 20,
  className,
}: InscriptionTickerProps) {
  const [wsInstance, setWsInstance] = React.useState<InscriptionWebSocket | null>(null);
  const [tickerItems, setTickerItems] = React.useState<TickerItem[]>([]);
  const [showPatternAnalysis, setShowPatternAnalysis] = React.useState(false);

  // Store actions and state
  const addLiveInscription = useInscriptionStore((state) => state.addLiveInscription);
  const setConnectionStatus = useInscriptionStore((state) => state.setConnectionStatus);
  const connectionStatus = useInscriptionStore((state) => state.connectionStatus);
  const loadRecentInscriptions = useInscriptionStore((state) => state.loadRecentInscriptions);
  const liveInscriptions = useInscriptionStore((state) => state.liveInscriptions);
  const isLoadingRecent = useInscriptionStore((state) => state.isLoadingRecent);

  // Get realtime subscription actions
  const subscribeToLiveInscriptions = useInscriptionStore((state) => state.subscribeToLiveInscriptions);
  const unsubscribeFromLiveInscriptions = useInscriptionStore((state) => state.unsubscribeFromLiveInscriptions);
  const isRealtimeSubscribed = useInscriptionStore((state) => state.isRealtimeSubscribed);

  // Load historical inscriptions and subscribe to realtime on mount
  React.useEffect(() => {
    loadRecentInscriptions(maxItems);
    subscribeToLiveInscriptions();

    return () => {
      unsubscribeFromLiveInscriptions();
    };
  }, [loadRecentInscriptions, subscribeToLiveInscriptions, unsubscribeFromLiveInscriptions, maxItems]);

  // Update ticker items when store inscriptions change
  React.useEffect(() => {
    if (liveInscriptions.length > 0) {
      const items: TickerItem[] = liveInscriptions.map((inscription) => ({
        id: inscription.id,
        sigil: CLAIM_SIGILS[inscription.claimType],
        claimType: inscription.claimType,
        timestamp: inscription.timestampMs,
        confidence: inscription.confidence,
      }));
      setTickerItems(items.slice(0, maxItems));
    }
  }, [liveInscriptions, maxItems]);

  // Optional WebSocket for local development (localhost only)
  React.useEffect(() => {
    // Only use WebSocket in local dev mode as a supplemental source
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const ws = new InscriptionWebSocket(
        undefined,
        (inscription) => {
          // Add to store (Supabase Realtime will dedupe if same ID)
          addLiveInscription(inscription);
        },
        (status, error) => {
          // Only update status if not already connected via Supabase
          if (!isRealtimeSubscribed) {
            setConnectionStatus(status, error);
          }
        }
      );

      setWsInstance(ws);
      ws.connect();

      return () => {
        ws.disconnect();
      };
    }
  }, [addLiveInscription, setConnectionStatus, isRealtimeSubscribed]);

  // Connection indicator - prefer realtime status
  const isConnected = isRealtimeSubscribed || connectionStatus === 'connected';

  // Compute pattern statistics for analysis view
  const patternStats = React.useMemo(() => {
    if (tickerItems.length === 0) return null;

    const claimCounts: Record<ClaimType, number> = {} as Record<ClaimType, number>;
    let totalConfidence = 0;

    tickerItems.forEach((item) => {
      claimCounts[item.claimType] = (claimCounts[item.claimType] || 0) + 1;
      totalConfidence += item.confidence || 0;
    });

    const dominantClaim = Object.entries(claimCounts).sort((a, b) => b[1] - a[1])[0];
    const avgConfidence = totalConfidence / tickerItems.length;

    return {
      claimCounts,
      dominantClaim: dominantClaim ? { type: dominantClaim[0] as ClaimType, count: dominantClaim[1] } : null,
      avgConfidence,
      total: tickerItems.length,
    };
  }, [tickerItems]);

  return (
    <TooltipProvider>
      <div className={cn('relative flex flex-col', className)}>
        {/* Header Bar */}
        <div className="flex items-center justify-between p-2 bg-space-800/60 border-b border-amber-500/20 rounded-t-lg">
          {/* Left: Connection status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-xs text-gray-400">
              {tickerItems.length} inscriptions
            </span>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Pattern Analysis Toggle */}
            <div className="flex items-center gap-2">
              <BarChart2 className={cn('h-4 w-4', showPatternAnalysis ? 'text-amber-400' : 'text-gray-500')} />
              <Switch
                checked={showPatternAnalysis}
                onCheckedChange={setShowPatternAnalysis}
                className="data-[state=checked]:bg-amber-500"
              />
              <span className="text-xs text-gray-400 hidden sm:inline">Patterns</span>
            </div>

            {onShowDetails && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-amber-300"
                onClick={onShowDetails}
                title="Show detailed view"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Pattern Analysis Panel (collapsible) */}
        {showPatternAnalysis && patternStats && (
          <div className="p-3 bg-space-800/80 border-b border-amber-500/20 space-y-2">
            <div className="text-xs font-medium text-amber-300 flex items-center gap-2">
              <Eye className="h-3 w-3" />
              Pattern Analysis
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {/* Dominant Claim */}
              <div className="bg-space-900/60 p-2 rounded">
                <div className="text-gray-500">Dominant</div>
                <div className="text-amber-200 font-medium capitalize">
                  {patternStats.dominantClaim?.type || '—'}
                  <span className="text-gray-400 ml-1">
                    ({patternStats.dominantClaim?.count || 0})
                  </span>
                </div>
              </div>
              {/* Avg Confidence */}
              <div className="bg-space-900/60 p-2 rounded">
                <div className="text-gray-500">Avg Confidence</div>
                <div className="text-amber-200 font-medium">
                  {Math.round(patternStats.avgConfidence * 100)}%
                </div>
              </div>
              {/* Claim Distribution */}
              <div className="bg-space-900/60 p-2 rounded col-span-2">
                <div className="text-gray-500 mb-1">Distribution</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(patternStats.claimCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <Badge
                        key={type}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 capitalize"
                        style={{ borderColor: CLAIM_COLORS[type as ClaimType] + '60', color: CLAIM_COLORS[type as ClaimType] }}
                      >
                        {CLAIM_SIGILS[type as ClaimType]} {count}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RTL Ticker Display - expands to fill remaining space */}
        <div
          className={cn(
            'flex-1 min-h-[400px]',
            'overflow-y-auto overflow-x-hidden',
            'bg-gradient-to-br from-space-900/90 via-space-800/80 to-space-900/90',
            'border-x border-b border-amber-500/20 rounded-b-lg',
            'py-6 px-4'
          )}
          dir="rtl"
          lang="nqo"
        >
          {tickerItems.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-gray-500 text-sm animate-pulse text-center">
                {isLoadingRecent
                  ? 'Loading historical inscriptions...'
                  : isConnected
                    ? 'Waiting for new inscriptions...'
                    : 'Connecting...'}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center items-center content-start gap-2 min-h-full">
              {tickerItems.map((item, index) => (
                <TickerItemDisplay key={item.id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Hover hint */}
        <div className="absolute bottom-2 left-3 text-xs text-gray-600 flex items-center gap-1 z-10">
          <Info className="h-3 w-3" />
          <span>Hover over sigils for details</span>
        </div>

        {/* Subtle gradient overlay for fade effect */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-space-900/50 to-transparent pointer-events-none rounded-l-lg" />
      </div>
    </TooltipProvider>
  );
}

// =====================================================
// FULLSCREEN TICKER (for immersive mode)
// =====================================================

export function InscriptionTickerFullscreen({
  onExit,
}: {
  onExit?: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-space-950 z-50 flex flex-col">
      {/* Exit button */}
      {onExit && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onExit}
        >
          Exit
        </Button>
      )}

      {/* Centered ticker */}
      <div className="flex-1 flex items-center justify-center">
        <InscriptionTicker
          maxItems={30}
          className="w-full max-w-6xl"
        />
      </div>

      {/* Instructions */}
      <div className="text-center pb-8 text-gray-500 text-sm">
        N'Ko inscriptions stream right-to-left as detected
      </div>
    </div>
  );
}
