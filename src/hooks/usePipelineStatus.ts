/**
 * usePipelineStatus Hook
 *
 * Polling hook for fetching training pipeline status.
 * Provides real-time visibility into the 4-pass N'Ko training pipeline.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  PipelineStatus,
  PipelinePass,
  TrainingProgress,
  DailyBudget,
  PipelineHealth,
  RecentRun,
  PassNumber,
  PassStatus,
  UsePipelineStatusReturn,
} from '@/lib/curriculum/types';
import { PASS_NAMES } from '@/lib/curriculum/types';

const DEFAULT_POLL_INTERVAL = 10000; // 10 seconds

/**
 * Hook for polling pipeline status.
 *
 * @param pollInterval - Polling interval in milliseconds (default: 10s)
 * @param enabled - Whether polling is enabled (default: true)
 */
export function usePipelineStatus(
  pollInterval = DEFAULT_POLL_INTERVAL,
  enabled = true
): UsePipelineStatusReturn {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/curriculum/progress');

      if (!response.ok) {
        throw new Error(`Failed to fetch pipeline status: ${response.statusText}`);
      }

      const data = await response.json();

      if (isMountedRef.current) {
        setStatus(transformApiResponse(data));
        setError(null);
      }
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

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
  }, [fetchStatus]);

  // Initial fetch and polling setup
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      fetchStatus();

      intervalRef.current = setInterval(fetchStatus, pollInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, pollInterval, fetchStatus]);

  return {
    status,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Transform API response to PipelineStatus type.
 * Handles null/undefined values and provides defaults.
 */
function transformApiResponse(data: ApiProgressResponse): PipelineStatus {
  const passes: PipelinePass[] = [1, 2, 3, 4].map((num) => {
    const passNum = num as PassNumber;
    const passData = data.passes?.[passNum];

    return {
      number: passNum,
      name: PASS_NAMES[passNum],
      status: (passData?.status ?? 'pending') as PassStatus,
      tasksCompleted: passData?.completed ?? 0,
      tasksTotal: passData?.total ?? 0,
      currentVideoId: passData?.currentVideoId ?? null,
      progress: passData?.total
        ? Math.round(((passData?.completed ?? 0) / passData.total) * 100)
        : 0,
    };
  });

  const progress: TrainingProgress = {
    totalVideos: data.videos?.total ?? 0,
    completedVideos: data.videos?.completed ?? 0,
    inProgressVideos: data.videos?.inProgress ?? 0,
    failedVideos: data.videos?.failed ?? 0,
    remainingVideos: data.videos?.remaining ?? 0,
    totalFrames: data.stats?.totalFrames ?? 0,
    totalDetections: data.stats?.totalDetections ?? 0,
    estimatedCompletion: data.estimatedCompletion ?? null,
  };

  const dailyBudget: DailyBudget = {
    date: data.budget?.date ?? new Date().toISOString().split('T')[0],
    budgetLimit: data.budget?.limit ?? 1.5,
    spent: data.budget?.spent ?? 0,
    remaining: data.budget?.remaining ?? data.budget?.limit ?? 1.5,
    videosProcessed: data.budget?.videosProcessed ?? 0,
    framesAnalyzed: data.budget?.framesAnalyzed ?? 0,
    worldsGenerated: data.budget?.worldsGenerated ?? 0,
  };

  // Determine current pass (first non-completed pass that's processing)
  const currentPass = passes.find((p) => p.status === 'processing')?.number ?? null;

  // Determine overall state
  let state: PipelineStatus['state'] = 'idle';
  if (data.error) {
    state = 'error';
  } else if (passes.some((p) => p.status === 'processing')) {
    state = 'running';
  } else if (data.paused) {
    state = 'paused';
  }

  // Transform pipeline health
  const pipelineHealth: PipelineHealth = {
    status: (data.pipelineHealth?.status ?? 'idle') as PipelineHealth['status'],
    message: data.pipelineHealth?.message ?? 'Pipeline status unknown',
    lastSuccessfulRun: data.pipelineHealth?.lastSuccessfulRun ?? null,
    errorCount: data.pipelineHealth?.errorCount ?? 0,
  };

  // Transform recent runs
  const recentRuns: RecentRun[] = (data.recentRuns ?? []).map((run) => ({
    id: run.id ?? '',
    status: run.status ?? 'unknown',
    runType: run.runType ?? 'unknown',
    error: run.error ?? null,
    failedVideo: run.failedVideo ?? null,
    startedAt: run.startedAt ?? null,
    completedAt: run.completedAt ?? null,
  }));

  return {
    state,
    currentPass,
    passes,
    progress,
    dailyBudget,
    pipelineHealth,
    recentRuns,
    lastUpdated: data.lastUpdated ?? new Date().toISOString(),
  };
}

// API Response type (matches what /api/curriculum/progress returns)
interface ApiProgressResponse {
  videos?: {
    total?: number;
    completed?: number;
    inProgress?: number;
    failed?: number;
    remaining?: number;
  };
  passes?: Record<
    number,
    {
      status?: string;
      completed?: number;
      total?: number;
      currentVideoId?: string;
    }
  >;
  stats?: {
    totalFrames?: number;
    totalDetections?: number;
  };
  budget?: {
    date?: string;
    limit?: number;
    spent?: number;
    remaining?: number;
    videosProcessed?: number;
    framesAnalyzed?: number;
    worldsGenerated?: number;
  };
  pipelineHealth?: {
    status?: string;
    message?: string;
    lastSuccessfulRun?: string | null;
    errorCount?: number;
  };
  recentRuns?: Array<{
    id?: string;
    status?: string;
    runType?: string;
    error?: string | null;
    failedVideo?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
  }>;
  estimatedCompletion?: string;
  lastUpdated?: string;
  paused?: boolean;
  error?: string;
}

export default usePipelineStatus;
