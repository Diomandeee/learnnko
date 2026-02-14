/**
 * GET /api/curriculum/progress
 *
 * Returns current training pipeline progress including:
 * - Source counts from nko_sources table
 * - Frame/detection counts from nko_frames/nko_detections
 * - Pipeline run history
 * - Training statistics
 */

import { NextResponse } from 'next/server';
import {
  getTrainingSupabase,
  isTrainingDbConfigured,
  getTrainingStats,
} from '@/lib/supabase/training-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isTrainingDbConfigured()) {
    return NextResponse.json(
      { error: 'Training database not configured' },
      { status: 503 }
    );
  }

  try {
    // Get comprehensive training stats
    const trainingStats = await getTrainingStats();
    const supabase = getTrainingSupabase();

    // Get today's date for budget tracking
    const today = new Date().toISOString().split('T')[0];
    let dailyBudget = {
      date: today,
      limit: 2.0,
      spent: 0,
      remaining: 2.0,
      videosProcessed: trainingStats.sources.total,
      framesAnalyzed: trainingStats.frames.total,
      worldsGenerated: 0,
    };

    // Try to get daily budget if table exists
    try {
      const { data: budgetData } = await supabase
        .from('daily_budgets')
        .select('*')
        .eq('budget_date', today)
        .single();

      if (budgetData && typeof budgetData === 'object') {
        const budget = budgetData as {
          budget_date?: string;
          budget_limit?: number;
          spent?: number;
          videos_processed?: number;
          frames_analyzed?: number;
          worlds_generated?: number;
        };
        dailyBudget = {
          date: budget.budget_date ?? today,
          limit: budget.budget_limit ?? 2.0,
          spent: budget.spent ?? 0,
          remaining: (budget.budget_limit ?? 2.0) - (budget.spent ?? 0),
          videosProcessed: budget.videos_processed ?? trainingStats.sources.total,
          framesAnalyzed: budget.frames_analyzed ?? trainingStats.frames.total,
          worldsGenerated: budget.worlds_generated ?? 0,
        };
      }
    } catch {
      // daily_budgets table might not exist - use training stats
    }

    // Get pass progress - for now, use source completion as pass 1
    const passes: Record<number, { status: string; completed: number; total: number }> = {
      1: {
        status: trainingStats.sources.completed > 0 ? 'completed' :
                trainingStats.sources.processing > 0 ? 'processing' : 'pending',
        completed: trainingStats.sources.completed,
        total: trainingStats.sources.total,
      },
      2: { status: 'pending', completed: 0, total: 0 },
      3: { status: 'pending', completed: 0, total: 0 },
      4: { status: 'pending', completed: 0, total: 0 },
    };

    // Get recent sources as "runs" for the UI
    const recentRuns: Array<{
      id: string;
      status: string;
      runType: string;
      error: string | null;
      failedVideo: string | null;
      startedAt: string | null;
      completedAt: string | null;
    }> = [];

    let latestRun = null;

    try {
      const { data: sourcesData } = await supabase
        .from('nko_sources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (sourcesData && sourcesData.length > 0) {
        for (const source of sourcesData) {
          recentRuns.push({
            id: source.id,
            status: source.status,
            runType: 'extraction',
            error: null,
            failedVideo: null,
            startedAt: source.created_at,
            completedAt: source.updated_at,
          });
        }

        // Set latest run (first in list)
        const firstSource = sourcesData[0];
        latestRun = {
          id: firstSource.id,
          status: firstSource.status,
          runType: 'extraction',
          startedAt: firstSource.created_at,
          completedAt: firstSource.updated_at,
          videoId: firstSource.external_id,
          title: firstSource.title,
          framesExtracted: firstSource.frame_count,
          detectionsFound: firstSource.total_detections,
        };
      }
    } catch {
      // No sources yet
    }

    // Calculate pipeline health based on actual training data
    type PipelineHealthStatus = 'healthy' | 'idle' | 'warning' | 'error';
    let healthStatus: PipelineHealthStatus = 'idle';
    let healthMessage = 'Pipeline idle - no data yet';
    let lastSuccessfulRun: string | null = null;

    if (trainingStats.sources.processing > 0) {
      healthStatus = 'healthy';
      healthMessage = `Processing ${trainingStats.sources.processing} source(s)`;
    } else if (trainingStats.sources.failed > 0 && trainingStats.sources.completed === 0) {
      healthStatus = 'error';
      healthMessage = `All ${trainingStats.sources.failed} sources failed`;
    } else if (trainingStats.sources.failed > 0) {
      healthStatus = 'warning';
      healthMessage = `${trainingStats.sources.failed} of ${trainingStats.sources.total} sources failed`;
    } else if (trainingStats.sources.completed > 0) {
      healthStatus = 'healthy';
      healthMessage = `${trainingStats.sources.completed} sources processed - ${trainingStats.frames.total} frames, ${trainingStats.detections.total} detections`;
    }

    // Find last successful source
    const successfulRun = recentRuns.find(r => r.status === 'completed');
    if (successfulRun) {
      lastSuccessfulRun = successfulRun.id;
    }

    const pipelineHealth = {
      status: healthStatus,
      message: healthMessage,
      lastSuccessfulRun,
      errorCount: trainingStats.sources.failed,
    };

    // Check if any processing is happening
    const isRunning = trainingStats.sources.processing > 0 || trainingStats.runs.running > 0;

    return NextResponse.json({
      videos: {
        total: trainingStats.sources.total,
        completed: trainingStats.sources.completed,
        failed: trainingStats.sources.failed,
        inProgress: trainingStats.sources.processing,
        remaining: trainingStats.sources.total - trainingStats.sources.completed - trainingStats.sources.failed,
      },
      runs: {
        total: trainingStats.runs.total,
        completed: trainingStats.runs.completed,
        failed: trainingStats.runs.failed,
        running: trainingStats.runs.running,
      },
      training: {
        sources: trainingStats.sources.total,
        frames: trainingStats.frames.total,
        framesWithNko: trainingStats.frames.withNko,
        detections: trainingStats.detections.total,
      },
      passes,
      stats: {
        totalVideos: trainingStats.sources.total,
        totalRuns: trainingStats.runs.total,
        completedVideos: trainingStats.sources.completed,
        failedVideos: trainingStats.sources.failed,
        totalFrames: trainingStats.frames.total,
        totalDetections: trainingStats.detections.total,
      },
      budget: dailyBudget,
      latestRun,
      recentRuns,
      pipelineHealth,
      lastUpdated: new Date().toISOString(),
      isRunning,
      paused: false,
      error: null,
    });
  } catch (error) {
    console.error('Failed to fetch pipeline progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline progress' },
      { status: 500 }
    );
  }
}
