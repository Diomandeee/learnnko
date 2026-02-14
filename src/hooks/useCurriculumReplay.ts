/**
 * useCurriculumReplay Hook
 *
 * Hook for replaying historical training pipeline data.
 * Provides frame-by-frame playback with RAF-based animation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  CurriculumFrame,
  CurriculumDetection,
  PlaybackState,
  PlaybackSpeed,
  UseCurriculumReplayReturn,
} from '@/lib/curriculum/types';
import { DEFAULT_PLAYBACK_STATE } from '@/lib/curriculum/types';

/**
 * Hook for replaying training pipeline runs.
 */
export function useCurriculumReplay(): UseCurriculumReplayReturn {
  const [frames, setFrames] = useState<CurriculumFrame[]>([]);
  const [detections, setDetections] = useState<Map<string, CurriculumDetection[]>>(
    new Map()
  );
  const [playback, setPlayback] = useState<PlaybackState>(DEFAULT_PLAYBACK_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Current frame based on playback index
  const currentFrame = frames[playback.currentIndex] ?? null;
  const currentDetections = currentFrame
    ? detections.get(currentFrame.id) ?? []
    : [];

  /**
   * Load frames and detections for a specific run.
   */
  const loadRun = useCallback(async (runId: string) => {
    setIsLoading(true);
    setError(null);
    pause();

    try {
      // Fetch frames
      const framesResponse = await fetch(`/api/curriculum/runs/${runId}/frames`);
      if (!framesResponse.ok) {
        throw new Error(`Failed to load frames: ${framesResponse.statusText}`);
      }
      const framesData = await framesResponse.json();

      // Fetch detections
      const detectionsResponse = await fetch(
        `/api/curriculum/runs/${runId}/detections`
      );
      if (!detectionsResponse.ok) {
        throw new Error(`Failed to load detections: ${detectionsResponse.statusText}`);
      }
      const detectionsData = await detectionsResponse.json();

      if (!isMountedRef.current) return;

      // Group detections by frame ID
      const detectionsMap = new Map<string, CurriculumDetection[]>();
      for (const detection of detectionsData.items || []) {
        const frameId = detection.frameId;
        if (!detectionsMap.has(frameId)) {
          detectionsMap.set(frameId, []);
        }
        detectionsMap.get(frameId)!.push(detection);
      }

      console.log('[useCurriculumReplay] Loaded frames:', framesData.items?.length || 0);
      console.log('[useCurriculumReplay] Loaded detections:', detectionsMap.size);
      setFrames(framesData.items || []);
      setDetections(detectionsMap);
      setPlayback({
        ...DEFAULT_PLAYBACK_STATE,
        totalFrames: framesData.items?.length || 0,
      });
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Start playback animation.
   */
  const play = useCallback(() => {
    if (frames.length === 0) return;

    setPlayback((prev) => ({ ...prev, isPlaying: true }));
    lastFrameTimeRef.current = performance.now();

    const animate = (timestamp: number) => {
      if (!isMountedRef.current) return;

      const elapsed = timestamp - lastFrameTimeRef.current;
      const frameInterval = 1000 / playback.speed; // ms per frame based on speed

      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = timestamp;

        setPlayback((prev) => {
          if (!prev.isPlaying) return prev;

          let nextIndex = prev.currentIndex + 1;

          if (nextIndex >= prev.totalFrames) {
            if (prev.loop) {
              nextIndex = 0;
            } else {
              return { ...prev, isPlaying: false };
            }
          }

          return { ...prev, currentIndex: nextIndex };
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [frames.length, playback.speed]);

  /**
   * Pause playback.
   */
  const pause = useCallback(() => {
    setPlayback((prev) => ({ ...prev, isPlaying: false }));
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  /**
   * Seek to a specific frame index.
   */
  const seek = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, frames.length - 1));
      setPlayback((prev) => ({ ...prev, currentIndex: clampedIndex }));
    },
    [frames.length]
  );

  /**
   * Set playback speed.
   */
  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setPlayback((prev) => ({ ...prev, speed }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Restart animation loop when speed changes during playback
  useEffect(() => {
    if (playback.isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      play();
    }
  }, [playback.speed, playback.isPlaying, play]);

  return {
    frames,
    detections,
    currentFrame,
    currentDetections,
    playback,
    isLoading,
    error,
    play,
    pause,
    seek,
    setSpeed,
    loadRun,
  };
}

export default useCurriculumReplay;
