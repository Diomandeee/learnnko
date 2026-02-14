'use client';

/**
 * CurriculumHub - Main Container for Training Pipeline Visualization
 *
 * Provides an animated view of the N'Ko training pipeline with:
 * - Toggle between replay (historical) and live (SSE streaming) modes
 * - Toggle between frame view (with bounding boxes) and abstract flow view
 * - Real-time progress statistics and budget tracking
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Radio,
  Image as ImageIcon,
  GitBranch,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePipelineStatus } from '@/hooks/usePipelineStatus';
import { useCurriculumReplay } from '@/hooks/useCurriculumReplay';
import { PipelineHealthBanner } from './PipelineHealthBanner';
import type {
  DataMode,
  ViewMode,
  CurriculumModeState,
} from '@/lib/curriculum/types';

// Lazy load heavy visualization components
const FrameViewer = React.lazy(() => import('./visualization/FrameViewer'));
const PipelineFlow = React.lazy(() => import('./visualization/PipelineFlow'));
const StatsPanel = React.lazy(() => import('./stats/StatsPanel'));
const TrainingTimeline = React.lazy(() => import('./timeline/TrainingTimeline'));

/**
 * Main Curriculum visualization hub.
 */
export function CurriculumHub() {
  const [modes, setModes] = React.useState<CurriculumModeState>({
    dataMode: 'replay',
    viewMode: 'frames',
  });

  const { status, isLoading, error, refetch } = usePipelineStatus(10000, true);

  // Lift replay state to parent so both FrameViewer and TrainingTimeline share the same state
  const replay = useCurriculumReplay();

  const handleDataModeChange = (value: string) => {
    if (value === 'replay' || value === 'live') {
      setModes((prev) => ({ ...prev, dataMode: value as DataMode }));
    }
  };

  const handleViewModeChange = (value: string) => {
    if (value === 'frames' || value === 'flow') {
      setModes((prev) => ({ ...prev, viewMode: value as ViewMode }));
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header with Mode Toggles */}
      <CurriculumHeader
        modes={modes}
        onDataModeChange={handleDataModeChange}
        onViewModeChange={handleViewModeChange}
        isLive={status?.state === 'running'}
      />

      {/* Pipeline Health Banner */}
      {status?.pipelineHealth && (
        <PipelineHealthBanner
          health={status.pipelineHealth}
          recentRuns={status.recentRuns ?? []}
          onRetry={() => refetch()}
        />
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Visualization Panel (3/4 width on large screens) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Error State */}
          {error && (
            <Card className="p-6 border-red-500/30 bg-red-900/10">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Failed to load pipeline status</p>
                  <p className="text-sm text-red-400/70">{error.message}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {/* Main Visualization */}
          <Card className="relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
            <React.Suspense fallback={<VisualizationLoader />}>
              <AnimatePresence mode="wait">
                {modes.viewMode === 'frames' ? (
                  <motion.div
                    key="frames"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FrameViewer dataMode={modes.dataMode} replay={replay} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="flow"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PipelineFlow passes={status?.passes ?? []} />
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Suspense>
          </Card>

          {/* Timeline (only shown in replay mode) */}
          {modes.dataMode === 'replay' && (
            <React.Suspense fallback={<TimelineLoader />}>
              <TrainingTimeline replay={replay} />
            </React.Suspense>
          )}

          {/* Live Indicator (only shown in live mode) */}
          {modes.dataMode === 'live' && (
            <LiveIndicator isConnected={status?.state === 'running'} />
          )}
        </div>

        {/* Stats Sidebar (1/4 width on large screens) */}
        <div className="lg:col-span-1">
          <React.Suspense fallback={<StatsPanelLoader />}>
            <StatsPanel status={status} isLoading={isLoading} />
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface CurriculumHeaderProps {
  modes: CurriculumModeState;
  onDataModeChange: (value: string) => void;
  onViewModeChange: (value: string) => void;
  isLive?: boolean;
}

function CurriculumHeader({
  modes,
  onDataModeChange,
  onViewModeChange,
  isLive,
}: CurriculumHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
          <span className="text-amber-400 font-bold text-xl">ߒ</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-amber-300">Curriculum</h1>
          <p className="text-sm text-gray-400">N'Ko Training Pipeline</p>
        </div>
        {isLive && (
          <Badge variant="outline" className="ml-2 border-green-500/50 text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Processing
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Data Mode Toggle */}
        <ToggleGroup
          type="single"
          value={modes.dataMode}
          onValueChange={onDataModeChange}
          className="bg-space-900/50 rounded-lg p-1"
        >
          <ToggleGroupItem
            value="replay"
            aria-label="Replay mode"
            className="data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-300"
          >
            <Play className="w-4 h-4 mr-2" />
            Replay
          </ToggleGroupItem>
          <ToggleGroupItem
            value="live"
            aria-label="Live mode"
            className="data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-300"
          >
            <Radio className="w-4 h-4 mr-2" />
            Live
          </ToggleGroupItem>
        </ToggleGroup>

        {/* View Mode Toggle */}
        <ToggleGroup
          type="single"
          value={modes.viewMode}
          onValueChange={onViewModeChange}
          className="bg-space-900/50 rounded-lg p-1"
        >
          <ToggleGroupItem
            value="frames"
            aria-label="Frame view"
            className="data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-300"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Frames
          </ToggleGroupItem>
          <ToggleGroupItem
            value="flow"
            aria-label="Flow view"
            className="data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-300"
          >
            <GitBranch className="w-4 h-4 mr-2" />
            Flow
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

interface LiveIndicatorProps {
  isConnected: boolean;
}

function LiveIndicator({ isConnected }: LiveIndicatorProps) {
  return (
    <Card className="p-4 border-amber-500/20 bg-gradient-to-r from-space-800/80 to-space-900/80">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            }`}
          />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Connected to live stream' : 'Waiting for activity...'}
          </span>
        </div>
        {isConnected && (
          <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
            SSE Active
          </Badge>
        )}
      </div>
    </Card>
  );
}

// ============================================================================
// Loading States
// ============================================================================

function VisualizationLoader() {
  return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm text-gray-400">Loading visualization...</p>
      </div>
    </div>
  );
}

function TimelineLoader() {
  return (
    <Card className="p-4 border-amber-500/20 bg-space-800/50">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
        <span className="text-sm text-gray-400">Loading timeline...</span>
      </div>
    </Card>
  );
}

function StatsPanelLoader() {
  return (
    <Card className="p-6 border-amber-500/20 bg-gradient-to-br from-space-800/80 to-space-900/80">
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    </Card>
  );
}

export default CurriculumHub;
