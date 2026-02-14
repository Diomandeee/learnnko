'use client';

/**
 * FrameViewer - Display training frames with bounding box overlays
 *
 * Shows video frames extracted during the training pipeline with
 * animated bounding boxes for detected N'Ko text.
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ImageOff, ZoomIn, ZoomOut, Maximize2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BoundingBoxOverlay } from './BoundingBoxOverlay';
import { useCurriculumStream } from '@/hooks/useCurriculumStream';
import { usePipelineStatus } from '@/hooks/usePipelineStatus';
import type { DataMode, CurriculumFrame, CurriculumDetection, PipelineHealth, RecentRun, UseCurriculumReplayReturn } from '@/lib/curriculum/types';

interface FrameViewerProps {
  dataMode: DataMode;
  replay: UseCurriculumReplayReturn;
}

export function FrameViewer({ dataMode, replay }: FrameViewerProps) {
  const [zoom, setZoom] = React.useState(1);
  const [showBoxes, setShowBoxes] = React.useState(true);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Use replay from props (lifted to parent), stream hook for live mode
  const stream = useCurriculumStream();
  const { status } = usePipelineStatus(30000, true); // Poll less frequently

  const currentFrame = dataMode === 'replay' ? replay.currentFrame : stream.currentFrame;
  const currentDetections =
    dataMode === 'replay' ? replay.currentDetections : stream.recentDetections;

  // Debug logging
  console.log('[FrameViewer] dataMode:', dataMode);
  console.log('[FrameViewer] replay.frames.length:', replay.frames?.length);
  console.log('[FrameViewer] currentFrame:', currentFrame?.id, currentFrame?.frameIndex);
  console.log('[FrameViewer] currentDetections:', currentDetections?.length);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowBoxes(!showBoxes)}
          className={`bg-space-900/80 backdrop-blur ${
            showBoxes ? 'text-amber-400' : 'text-gray-400'
          }`}
          title={showBoxes ? 'Hide bounding boxes' : 'Show bounding boxes'}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 0.5}
          className="bg-space-900/80 backdrop-blur text-gray-400 hover:text-amber-400"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 2}
          className="bg-space-900/80 backdrop-blur text-gray-400 hover:text-amber-400"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        {zoom !== 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomReset}
            className="bg-space-900/80 backdrop-blur text-gray-400 hover:text-amber-400"
          >
            {Math.round(zoom * 100)}%
          </Button>
        )}
      </div>

      {/* Frame Display */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-space-950"
        style={{ minHeight: '400px' }}
      >
        <AnimatePresence mode="wait">
          {currentFrame ? (
            <motion.div
              key={currentFrame.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <FrameImage frame={currentFrame} detections={currentDetections} />

              {/* Bounding Box Overlay */}
              {showBoxes && currentDetections.length > 0 && (
                <BoundingBoxOverlay
                  detections={currentDetections}
                  frameWidth={currentFrame.width || 1280}
                  frameHeight={currentFrame.height || 720}
                />
              )}
            </motion.div>
          ) : (
            <EmptyFrameState
              dataMode={dataMode}
              pipelineHealth={status?.pipelineHealth ?? null}
              recentRuns={status?.recentRuns ?? []}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Frame Info Bar */}
      {currentFrame && (
        <FrameInfoBar
          frame={currentFrame}
          detectionCount={currentDetections.length}
        />
      )}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

interface FrameImageProps {
  frame: CurriculumFrame;
  detections?: CurriculumDetection[];
}

function FrameImage({ frame, detections = [] }: FrameImageProps) {
  const [error, setError] = React.useState(false);

  if (error || !frame.imagePath) {
    // Show placeholder with frame metadata when no image available
    return (
      <div className="flex items-center justify-center h-[400px] bg-gradient-to-br from-space-900 to-space-950 border border-space-700/50 rounded-lg">
        <div className="flex flex-col items-center gap-4 text-center px-8 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <span className="text-amber-400 font-bold text-2xl">ߒ</span>
          </div>

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-300">
              Frame {frame.frameIndex + 1}
            </p>
            <p className="text-sm text-gray-500">
              {frame.hasNko ? `${frame.detectionCount} N'Ko detection${frame.detectionCount !== 1 ? 's' : ''} found` : 'No N\'Ko text detected'}
            </p>
            {frame.confidence > 0 && (
              <p className="text-xs text-gray-600">
                {Math.round(frame.confidence * 100)}% confidence
              </p>
            )}
          </div>

          {/* Show detected N'Ko text if available */}
          {detections.length > 0 && (
            <div className="w-full mt-2 p-3 rounded-lg bg-space-800/50 border border-amber-500/20">
              <p className="text-xs text-gray-500 mb-2">Detected text:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {detections.slice(0, 5).map((det) => (
                  <span
                    key={det.id}
                    className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 text-sm font-medium"
                    title={det.latinText || undefined}
                  >
                    {det.nkoText}
                  </span>
                ))}
                {detections.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{detections.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-600">
            Image storage not configured
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video">
      <Image
        src={frame.imagePath}
        alt={`Training frame ${frame.frameIndex}`}
        fill
        className="object-contain"
        onError={() => setError(true)}
        priority
      />
    </div>
  );
}

interface EmptyFrameStateProps {
  dataMode: DataMode;
  pipelineHealth: PipelineHealth | null;
  recentRuns: RecentRun[];
}

function EmptyFrameState({ dataMode, pipelineHealth, recentRuns }: EmptyFrameStateProps) {
  // Determine context-aware messaging
  const failedRuns = recentRuns.filter(
    (r) => r.status === 'failed' || r.status === 'completed_with_errors'
  );
  const latestFailedRun = failedRuns[0];
  const hasAllFailed = pipelineHealth?.status === 'error' && pipelineHealth?.errorCount > 0;
  const hasSomeFailed = pipelineHealth?.status === 'warning' && pipelineHealth?.errorCount > 0;

  // Get the appropriate icon and colors based on health status
  const getStatusDisplay = () => {
    if (hasAllFailed || hasSomeFailed) {
      return {
        icon: <XCircle className="w-8 h-8 text-red-400/70" />,
        bgColor: 'bg-red-500/10 border-red-500/20',
        title: 'No frames available',
        subtitle: hasAllFailed
          ? `All ${pipelineHealth?.errorCount} pipeline runs failed before frame extraction completed`
          : `${pipelineHealth?.errorCount} run(s) failed - frame extraction incomplete`,
      };
    }

    if (pipelineHealth?.status === 'idle') {
      return {
        icon: <Clock className="w-8 h-8 text-gray-400/70" />,
        bgColor: 'bg-gray-500/10 border-gray-500/20',
        title: dataMode === 'replay' ? 'No frames loaded' : 'Pipeline idle',
        subtitle: dataMode === 'replay'
          ? 'Select a training run from the timeline to view frames'
          : 'Start the pipeline to begin frame extraction',
      };
    }

    return {
      icon: <ImageOff className="w-8 h-8 text-amber-400/50" />,
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      title: dataMode === 'replay' ? 'No frames loaded' : 'Waiting for frames...',
      subtitle: dataMode === 'replay'
        ? 'Select a training run from the timeline to view frames'
        : 'Frames will appear here when the pipeline is processing',
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center h-[400px]"
    >
      <div className="flex flex-col items-center gap-4 text-center px-8 max-w-md">
        <div className={`w-16 h-16 rounded-2xl ${statusDisplay.bgColor} border flex items-center justify-center`}>
          {statusDisplay.icon}
        </div>

        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-300">
            {statusDisplay.title}
          </p>
          <p className="text-sm text-gray-500">
            {statusDisplay.subtitle}
          </p>
        </div>

        {/* Show latest error details if runs failed */}
        {latestFailedRun?.error && (
          <div className="mt-2 p-3 rounded-lg bg-red-900/20 border border-red-500/20 w-full">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-xs font-medium text-red-400">Latest Error</p>
                <p className="text-xs text-red-400/80 mt-1 break-words">
                  {latestFailedRun.error}
                </p>
                {latestFailedRun.failedVideo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Video: {latestFailedRun.failedVideo}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Helpful action hints */}
        {(hasAllFailed || hasSomeFailed) && (
          <p className="text-xs text-gray-600 mt-2">
            Check the pipeline configuration and video sources, then retry
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface FrameInfoBarProps {
  frame: CurriculumFrame;
  detectionCount: number;
}

function FrameInfoBar({ frame, detectionCount }: FrameInfoBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 flex flex-wrap items-center gap-2 text-sm"
    >
      <Badge variant="outline" className="border-amber-500/30 text-amber-300">
        Frame {frame.frameIndex}
      </Badge>

      {frame.hasNko && (
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
          {detectionCount} detection{detectionCount !== 1 ? 's' : ''}
        </Badge>
      )}

      {frame.confidence > 0 && (
        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
          {Math.round(frame.confidence * 100)}% confidence
        </Badge>
      )}

      <span className="text-gray-500 ml-auto">
        {frame.width}×{frame.height}
      </span>

      {frame.timestampMs > 0 && (
        <span className="text-gray-500">
          @ {formatTimestamp(frame.timestampMs)}
        </span>
      )}
    </motion.div>
  );
}

// ============================================================================
// Utilities
// ============================================================================

function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default FrameViewer;
