'use client';

/**
 * TrainingTimeline - Timeline scrubber and run selection for replay mode
 *
 * Provides:
 * - Run selection dropdown
 * - Timeline scrubber with frame thumbnails
 * - Playback controls (play, pause, speed)
 */

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronDown,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PlaybackSpeed, PipelineRun, UseCurriculumReplayReturn } from '@/lib/curriculum/types';

interface TrainingTimelineProps {
  replay: UseCurriculumReplayReturn;
}

export function TrainingTimeline({ replay }: TrainingTimelineProps) {
  const [runs, setRuns] = React.useState<PipelineRun[]>([]);
  const [selectedRun, setSelectedRun] = React.useState<PipelineRun | null>(null);
  const [runsLoading, setRunsLoading] = React.useState(true);

  // Use replay from props (lifted to parent CurriculumHub)
  const {
    frames,
    playback,
    isLoading,
    play,
    pause,
    seek,
    setSpeed,
    loadRun,
  } = replay;

  // Load available runs on mount
  React.useEffect(() => {
    async function fetchRuns() {
      try {
        const response = await fetch('/api/curriculum/runs?limit=20');
        if (response.ok) {
          const data = await response.json();
          setRuns(data.items || []);
          // Auto-select first run if available
          if (data.items?.length > 0) {
            setSelectedRun(data.items[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch runs:', error);
      } finally {
        setRunsLoading(false);
      }
    }

    fetchRuns();
  }, []);

  // Load frames when run is selected
  React.useEffect(() => {
    if (selectedRun) {
      console.log('[TrainingTimeline] Loading run:', selectedRun.id, selectedRun.videoTitle);
      loadRun(selectedRun.id);
    }
  }, [selectedRun, loadRun]);

  // Debug: Log when runs are fetched
  React.useEffect(() => {
    console.log('[TrainingTimeline] runs loaded:', runs.length, 'selected:', selectedRun?.id);
  }, [runs, selectedRun]);

  const handleRunSelect = (run: PipelineRun) => {
    setSelectedRun(run);
  };

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  const handleSpeedChange = (speed: PlaybackSpeed) => {
    setSpeed(speed);
  };

  const handleStepBackward = () => {
    seek(Math.max(0, playback.currentIndex - 1));
  };

  const handleStepForward = () => {
    seek(Math.min(playback.totalFrames - 1, playback.currentIndex + 1));
  };

  return (
    <Card className="p-4 border-amber-500/20 bg-gradient-to-r from-space-800/80 to-space-900/80">
      <div className="space-y-4">
        {/* Run Selection and Playback Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Run Selector */}
          <RunSelector
            runs={runs}
            selectedRun={selectedRun}
            onSelect={handleRunSelect}
            isLoading={runsLoading}
          />

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={playback.isPlaying}
            speed={playback.speed}
            onPlay={play}
            onPause={pause}
            onStepBackward={handleStepBackward}
            onStepForward={handleStepForward}
            onSpeedChange={handleSpeedChange}
            disabled={frames.length === 0 || isLoading}
          />
        </div>

        {/* Timeline Scrubber */}
        <TimelineScrubber
          currentIndex={playback.currentIndex}
          totalFrames={playback.totalFrames}
          onSeek={handleSeek}
          disabled={frames.length === 0 || isLoading}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface RunSelectorProps {
  runs: PipelineRun[];
  selectedRun: PipelineRun | null;
  onSelect: (run: PipelineRun) => void;
  isLoading: boolean;
}

function RunSelector({
  runs,
  selectedRun,
  onSelect,
  isLoading,
}: RunSelectorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading runs...</span>
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-sm text-gray-400">No training runs available</div>
    );
  }

  // Sort runs: running first, then completed, then failed
  const sortedRuns = [...runs].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      processing: 0,
      running: 0,
      pending: 1,
      completed: 2,
      failed: 3,
      completed_with_errors: 3,
    };
    const orderA = statusOrder[a.status] ?? 2;
    const orderB = statusOrder[b.status] ?? 2;
    return orderA - orderB;
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-auto justify-between border-amber-500/30 bg-space-900/50 hover:bg-space-800"
        >
          <div className="flex items-center gap-2">
            {selectedRun && <RunStatusIcon status={selectedRun.status} />}
            <span className="truncate max-w-[180px]">
              {selectedRun
                ? selectedRun.videoTitle || `Run ${selectedRun.id.slice(0, 8)}`
                : 'Select a run'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 bg-space-900 border-amber-500/30">
        {sortedRuns.map((run) => {
          const isFailed = run.status === 'failed' || run.status === 'completed_with_errors';
          return (
            <DropdownMenuItem
              key={run.id}
              onClick={() => onSelect(run)}
              className={`cursor-pointer ${
                selectedRun?.id === run.id ? 'bg-amber-500/20' : ''
              }`}
            >
              <div className="flex items-start gap-3 w-full">
                <RunStatusIcon status={run.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm truncate ${isFailed ? 'text-red-300' : 'text-gray-200'}`}>
                      {run.videoTitle || `Run ${run.id.slice(0, 8)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{run.framesExtracted} frames</span>
                    <span>·</span>
                    <span>{run.detectionsFound} detections</span>
                  </div>
                  {isFailed && (
                    <span className="text-xs text-red-400/70 capitalize">
                      {run.status.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface RunStatusIconProps {
  status: string;
}

function RunStatusIcon({ status }: RunStatusIconProps) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    case 'failed':
    case 'completed_with_errors':
      return <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
    case 'processing':
    case 'running':
      return <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />;
    default:
      return <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
  }
}

interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  disabled: boolean;
}

function PlaybackControls({
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStepBackward,
  onStepForward,
  onSpeedChange,
  disabled,
}: PlaybackControlsProps) {
  const speeds: PlaybackSpeed[] = [0.5, 1, 2, 4];

  return (
    <div className="flex items-center gap-2">
      {/* Step Backward */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onStepBackward}
        disabled={disabled}
        className="text-gray-400 hover:text-amber-400"
      >
        <SkipBack className="w-4 h-4" />
      </Button>

      {/* Play/Pause */}
      <Button
        variant="ghost"
        size="icon"
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className={`w-10 h-10 rounded-full ${
          isPlaying
            ? 'bg-amber-500/20 text-amber-400'
            : 'text-gray-400 hover:text-amber-400'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5" />
        )}
      </Button>

      {/* Step Forward */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onStepForward}
        disabled={disabled}
        className="text-gray-400 hover:text-amber-400"
      >
        <SkipForward className="w-4 h-4" />
      </Button>

      {/* Speed Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-gray-400 hover:text-amber-400 min-w-[50px]"
          >
            {speed}x
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-space-900 border-amber-500/30">
          {speeds.map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`cursor-pointer ${speed === s ? 'bg-amber-500/20' : ''}`}
            >
              {s}x
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface TimelineScrubberProps {
  currentIndex: number;
  totalFrames: number;
  onSeek: (value: number[]) => void;
  disabled: boolean;
  isLoading: boolean;
}

function TimelineScrubber({
  currentIndex,
  totalFrames,
  onSeek,
  disabled,
  isLoading,
}: TimelineScrubberProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {/* Slider */}
        <div className="flex-1">
          {isLoading ? (
            <div className="h-2 bg-space-700 rounded-full animate-pulse" />
          ) : (
            <Slider
              value={[currentIndex]}
              min={0}
              max={Math.max(0, totalFrames - 1)}
              step={1}
              onValueChange={onSeek}
              disabled={disabled}
              className="cursor-pointer"
            />
          )}
        </div>

        {/* Frame Counter */}
        <div className="text-sm text-gray-400 min-w-[80px] text-right">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            <span>
              {currentIndex + 1} / {totalFrames}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar (visual only) */}
      {!isLoading && totalFrames > 0 && (
        <motion.div
          className="h-1 bg-space-700 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / totalFrames) * 100}%`,
            }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      )}
    </div>
  );
}

export default TrainingTimeline;
