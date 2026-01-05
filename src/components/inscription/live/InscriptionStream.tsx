/**
 * InscriptionStream Component
 *
 * Real-time N'Ko inscription stream from the GCP VM fusion system.
 *
 * Features:
 * - WebSocket connection to fusion system (6Hz updates)
 * - Live inscription feed with animations
 * - Connection status indicator
 * - Pause/resume controls
 * - Filters integration
 */

'use client';

import * as React from 'react';
import { Wifi, WifiOff, Pause, Play, X, Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  InscriptionCard,
  InscriptionCardSkeleton,
} from './InscriptionCard';
import { InscriptionWebSocket } from '@/lib/inscription/websocket';
import {
  useInscriptionStore,
  useFilteredLiveInscriptions,
} from '@/store/use-inscription-store';
import { inscriptionFromWebSocket } from '@/lib/inscription/types';

// =====================================================
// CONNECTION STATUS INDICATOR
// =====================================================

function ConnectionStatus() {
  const connectionStatus = useInscriptionStore((state) => state.connectionStatus);
  const connectionError = useInscriptionStore((state) => state.connectionError);

  const statusConfig = {
    disconnected: {
      icon: WifiOff,
      label: 'Disconnected',
      variant: 'secondary' as const,
      className: 'text-muted-foreground',
    },
    connecting: {
      icon: RefreshCw,
      label: 'Connecting...',
      variant: 'secondary' as const,
      className: 'text-blue-600 animate-spin',
    },
    connected: {
      icon: Wifi,
      label: 'Live',
      variant: 'default' as const,
      className: 'text-green-600',
    },
    error: {
      icon: WifiOff,
      label: 'Error',
      variant: 'destructive' as const,
      className: 'text-red-600',
    },
  };

  const config = statusConfig[connectionStatus];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3">
      <Badge variant={config.variant} className="gap-2">
        <Icon className={cn('h-3.5 w-3.5', config.className)} />
        <span>{config.label}</span>
      </Badge>

      {connectionError && (
        <span className="text-xs text-destructive">{connectionError}</span>
      )}
    </div>
  );
}

// =====================================================
// LIVE CONTROLS
// =====================================================

function LiveControls() {
  const isLivePaused = useInscriptionStore((state) => state.isLivePaused);
  const pauseLive = useInscriptionStore((state) => state.pauseLive);
  const resumeLive = useInscriptionStore((state) => state.resumeLive);
  const clearLiveInscriptions = useInscriptionStore((state) => state.clearLiveInscriptions);

  return (
    <div className="flex items-center gap-2">
      {/* Pause/Resume */}
      <Button
        variant="outline"
        size="sm"
        className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200"
        onClick={isLivePaused ? resumeLive : pauseLive}
      >
        {isLivePaused ? (
          <>
            <Play className="h-4 w-4 mr-2" />
            Resume
          </>
        ) : (
          <>
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </>
        )}
      </Button>

      {/* Clear */}
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-amber-300 hover:bg-amber-500/10"
        onClick={clearLiveInscriptions}
      >
        <X className="h-4 w-4 mr-2" />
        Clear
      </Button>
    </div>
  );
}

// =====================================================
// STREAM STATS
// =====================================================

function StreamStats() {
  const stats = useInscriptionStore((state) => state.stats);

  if (!stats || stats.total === 0) return null;

  return (
    <div className="flex items-center gap-4 text-sm text-gray-300">
      <span>Total: {stats.total}</span>
      <span>Avg Confidence: {Math.round(stats.avgConfidence * 100)}%</span>
      {stats.detectionRate > 0 && (
        <span>Rate: {stats.detectionRate.toFixed(1)}/s</span>
      )}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function InscriptionStream() {
  const [wsInstance, setWsInstance] = React.useState<InscriptionWebSocket | null>(null);

  // Store actions
  const addLiveInscription = useInscriptionStore((state) => state.addLiveInscription);
  const setConnectionStatus = useInscriptionStore((state) => state.setConnectionStatus);
  const computeStats = useInscriptionStore((state) => state.computeStats);

  // Filtered inscriptions
  const filteredInscriptions = useFilteredLiveInscriptions();

  // Connection state
  const connectionStatus = useInscriptionStore((state) => state.connectionStatus);
  const isLivePaused = useInscriptionStore((state) => state.isLivePaused);

  // ============ WebSocket Setup ============

  React.useEffect(() => {
    // Create WebSocket instance
    const ws = new InscriptionWebSocket(
      undefined, // Use default URL
      (inscription) => {
        // Add inscription to store
        addLiveInscription(inscription);
        computeStats();
      },
      (status, error) => {
        // Update connection status
        setConnectionStatus(status, error);
      }
    );

    setWsInstance(ws);

    // Connect immediately
    ws.connect();

    // Cleanup on unmount
    return () => {
      ws.disconnect();
    };
  }, []); // Empty deps - only run once

  // ============ Render ============

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
            Live Inscription Stream
          </h2>
          <p className="text-sm text-gray-300">
            Real-time N'Ko inscriptions from motion data at 6Hz
          </p>
        </div>
        <LiveControls />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-br from-space-800/80 to-space-900/80 backdrop-blur-xl border border-amber-500/20 rounded-lg shadow-amber">
        <ConnectionStatus />
        <StreamStats />
      </div>

      {/* Pause Overlay */}
      {isLivePaused && (
        <Alert>
          <Pause className="h-4 w-4" />
          <AlertDescription>
            Stream is paused. New inscriptions are being received but not displayed.
            Click Resume to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {connectionStatus === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to connect to the fusion system. Make sure the GCP VM is running
            and accessible at ws://136.114.76.114:8765/fusion/ws
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {connectionStatus === 'connecting' && filteredInscriptions.length === 0 && (
        <div className="space-y-3">
          <InscriptionCardSkeleton />
          <InscriptionCardSkeleton />
          <InscriptionCardSkeleton />
        </div>
      )}

      {/* Empty State */}
      {connectionStatus === 'connected' &&
        filteredInscriptions.length === 0 &&
        !isLivePaused && (
          <div className="text-center py-12 text-gray-300">
            <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50 text-amber-400" />
            <p className="text-lg font-medium">Connected and waiting for inscriptions...</p>
            <p className="text-sm mt-2 text-gray-400">
              Inscriptions will appear here as they are detected by the fusion system.
            </p>
          </div>
        )}

      {/* Inscription List */}
      {filteredInscriptions.length > 0 && (
        <div className="space-y-3">
          {filteredInscriptions.map((inscription, index) => (
            <InscriptionCard
              key={inscription.id}
              inscription={inscription}
              showProvenance
              // Alternate animation: newest from right (RTL like N'Ko), older from left
              slideFrom={index % 2 === 0 ? 'right' : 'left'}
              onProvenanceClick={(insc) => {
                console.log('Provenance clicked:', insc.provenance);
                // TODO: Open provenance modal/drawer
              }}
            />
          ))}
        </div>
      )}

      {/* Footer Info */}
      {filteredInscriptions.length > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          Showing the most recent {Math.min(filteredInscriptions.length, 50)} inscriptions
        </div>
      )}
    </div>
  );
}

// =====================================================
// COMPACT VARIANT (for sidebars)
// =====================================================

/**
 * Compact inscription stream for sidebar/panel views.
 */
export function InscriptionStreamCompact() {
  const filteredInscriptions = useFilteredLiveInscriptions();
  const connectionStatus = useInscriptionStore((state) => state.connectionStatus);

  return (
    <div className="space-y-2">
      {/* Mini Status */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ConnectionStatus />
      </div>

      {/* Mini List (last 5) */}
      <div className="space-y-1">
        {filteredInscriptions.slice(0, 5).map((inscription) => (
          <div
            key={inscription.id}
            className="p-2 rounded hover:bg-muted/50 transition-colors"
          >
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
            <div className="text-xs text-muted-foreground mt-1">
              {inscription.claimType} • {Math.round(inscription.confidence * 100)}%
            </div>
          </div>
        ))}
      </div>

      {connectionStatus === 'connected' && filteredInscriptions.length === 0 && (
        <div className="text-center py-6 text-xs text-muted-foreground">
          Waiting for inscriptions...
        </div>
      )}
    </div>
  );
}
