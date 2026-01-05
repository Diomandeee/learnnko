/**
 * SessionReview Component
 *
 * Displays historical inscription sessions for review.
 * Allows selecting past sessions to examine their inscriptions.
 */

'use client';

import * as React from 'react';
import { Calendar, Clock, Hash, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase/client';
import {
  useInscriptionStore,
  useFilteredSessionInscriptions,
} from '@/store/use-inscription-store';
import { CLAIM_SIGILS, CLAIM_COLORS, type ClaimType } from '@/lib/inscription/types';

// =====================================================
// TYPES
// =====================================================

interface SessionSummary {
  sessionId: string;
  inscriptionCount: number;
  firstTimestamp: number;
  lastTimestamp: number;
  claimTypes: Record<string, number>;
}

// =====================================================
// SESSION LIST ITEM
// =====================================================

function SessionListItem({
  session,
  isSelected,
  onSelect,
}: {
  session: SessionSummary;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const duration = session.lastTimestamp - session.firstTimestamp;
  const durationSeconds = Math.round(duration / 1000);
  const durationMinutes = Math.floor(durationSeconds / 60);
  const durationDisplay = durationMinutes > 0
    ? `${durationMinutes}m ${durationSeconds % 60}s`
    : `${durationSeconds}s`;

  const date = new Date(session.firstTimestamp);

  // Get top 3 claim types
  const topClaims = Object.entries(session.claimTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full p-3 rounded-lg text-left transition-all',
        'border border-transparent hover:border-amber-500/30',
        isSelected
          ? 'bg-amber-500/20 border-amber-500/40'
          : 'bg-space-800/60 hover:bg-space-800/80'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          {/* Session ID (truncated) */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Hash className="h-3 w-3" />
            <span className="font-mono">{session.sessionId.slice(0, 8)}...</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-sm text-amber-200">
            <Calendar className="h-3.5 w-3.5" />
            <span>{date.toLocaleDateString()}</span>
            <span className="text-gray-400">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{session.inscriptionCount} inscriptions</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {durationDisplay}
            </span>
          </div>

          {/* Top claims */}
          <div className="flex flex-wrap gap-1 mt-1">
            {topClaims.map(([type, count]) => (
              <Badge
                key={type}
                variant="outline"
                className="text-[10px] px-1.5 py-0"
                style={{
                  borderColor: CLAIM_COLORS[type as ClaimType] + '60',
                  color: CLAIM_COLORS[type as ClaimType],
                }}
              >
                {CLAIM_SIGILS[type as ClaimType]} {count}
              </Badge>
            ))}
          </div>
        </div>

        <ChevronRight
          className={cn(
            'h-4 w-4 text-gray-500 transition-transform',
            isSelected && 'text-amber-400 rotate-90'
          )}
        />
      </div>
    </button>
  );
}

// =====================================================
// SESSION INSCRIPTIONS VIEW
// =====================================================

function SessionInscriptionsView() {
  const currentSessionId = useInscriptionStore((state) => state.currentSessionId);
  const sessionInscriptions = useFilteredSessionInscriptions();
  const isLoadingSession = useInscriptionStore((state) => state.isLoadingSession);
  const stats = useInscriptionStore((state) => state.stats);

  if (!currentSessionId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        Select a session to view its inscriptions
      </div>
    );
  }

  if (isLoadingSession) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Session stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-space-800/60 rounded-lg text-xs">
          <div>
            <div className="text-gray-500">Total</div>
            <div className="text-amber-200 font-medium">{stats.total}</div>
          </div>
          <div>
            <div className="text-gray-500">Avg Confidence</div>
            <div className="text-amber-200 font-medium">
              {Math.round(stats.avgConfidence * 100)}%
            </div>
          </div>
          <div>
            <div className="text-gray-500">Duration</div>
            <div className="text-amber-200 font-medium">
              {Math.round(stats.timeSpan / 1000)}s
            </div>
          </div>
          <div>
            <div className="text-gray-500">Rate</div>
            <div className="text-amber-200 font-medium">
              {stats.detectionRate.toFixed(1)}/s
            </div>
          </div>
        </div>
      )}

      {/* Inscriptions */}
      <ScrollArea className="h-[400px] pr-2">
        <div
          className="flex flex-wrap justify-center gap-2 p-4"
          dir="rtl"
          lang="nqo"
        >
          {sessionInscriptions.map((inscription) => (
            <span
              key={inscription.id}
              className="inline-block text-3xl hover:scale-110 transition-transform cursor-pointer hover:drop-shadow-[0_0_6px_currentColor]"
              style={{
                color: CLAIM_COLORS[inscription.claimType],
                fontFamily: "'Noto Sans NKo', 'Ebrima', sans-serif",
              }}
              title={`${inscription.claimType} - ${Math.round(inscription.confidence * 100)}%`}
            >
              {CLAIM_SIGILS[inscription.claimType]}
            </span>
          ))}
        </div>
      </ScrollArea>

      {sessionInscriptions.length === 0 && (
        <div className="text-center text-gray-500 text-sm py-8">
          No inscriptions found for this session
        </div>
      )}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function SessionReview() {
  const [sessions, setSessions] = React.useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const currentSessionId = useInscriptionStore((state) => state.currentSessionId);
  const loadSessionInscriptions = useInscriptionStore((state) => state.loadSessionInscriptions);
  const clearSessionInscriptions = useInscriptionStore((state) => state.clearSessionInscriptions);

  // Load available sessions
  const loadSessions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();

      // Get distinct sessions with their stats
      const { data, error: fetchError } = await supabase
        .from('nko_inscriptions')
        .select('session_id, claim_type, timestamp_ms')
        .not('session_id', 'is', null)
        .order('timestamp_ms', { ascending: false });

      if (fetchError) throw fetchError;

      // Group by session_id and compute summaries
      const sessionMap = new Map<string, SessionSummary>();

      for (const row of data || []) {
        const sessionId = row.session_id;
        if (!sessionId) continue;

        let summary = sessionMap.get(sessionId);
        if (!summary) {
          summary = {
            sessionId,
            inscriptionCount: 0,
            firstTimestamp: row.timestamp_ms,
            lastTimestamp: row.timestamp_ms,
            claimTypes: {},
          };
          sessionMap.set(sessionId, summary);
        }

        summary.inscriptionCount++;
        summary.firstTimestamp = Math.min(summary.firstTimestamp, row.timestamp_ms);
        summary.lastTimestamp = Math.max(summary.lastTimestamp, row.timestamp_ms);

        // Map claim_type index to name
        const claimTypeNames = [
          'stabilize', 'disperse', 'transition', 'return', 'dwell',
          'oscillate', 'recover', 'novel', 'placeShift', 'echo',
        ];
        const claimName = typeof row.claim_type === 'number'
          ? claimTypeNames[row.claim_type] || 'unknown'
          : row.claim_type;

        summary.claimTypes[claimName] = (summary.claimTypes[claimName] || 0) + 1;
      }

      // Sort by most recent first
      const sortedSessions = Array.from(sessionMap.values())
        .sort((a, b) => b.lastTimestamp - a.lastTimestamp)
        .slice(0, 20); // Limit to last 20 sessions

      setSessions(sortedSessions);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Clear session on unmount
  React.useEffect(() => {
    return () => {
      clearSessionInscriptions();
    };
  }, [clearSessionInscriptions]);

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === currentSessionId) {
      clearSessionInscriptions();
    } else {
      loadSessionInscriptions(sessionId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-amber-300">Session Review</h3>
          <p className="text-xs text-gray-400">
            Review past inscription sessions
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadSessions}
          disabled={isLoading}
          className="text-gray-400 hover:text-amber-300"
        >
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Session list */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Sessions ({sessions.length})
          </div>

          {isLoading && sessions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              No sessions found
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-2">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <SessionListItem
                    key={session.sessionId}
                    session={session}
                    isSelected={session.sessionId === currentSessionId}
                    onSelect={() => handleSelectSession(session.sessionId)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Session detail view */}
        <div className="lg:col-span-2 bg-gradient-to-br from-space-900/90 via-space-800/80 to-space-900/90 border border-amber-500/20 rounded-lg p-4">
          <SessionInscriptionsView />
        </div>
      </div>
    </div>
  );
}
