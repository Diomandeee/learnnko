import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
}

interface PipelineRun {
  id: string;
  run_type: string;
  channel_name: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  videos_total: number;
  videos_completed: number;
  videos_failed: number;
  frames_extracted: number;
  detections_found: number;
  audio_segments: number;
  cost_estimate: number;
  error_message: string | null;
}

interface PipelineEvent {
  id: number;
  run_id: string;
  event_type: string;
  video_id: string | null;
  message: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Fetch current/recent pipeline runs from new observability table
    const { data: pipelineRuns, error: runsError } = await supabase
      .from('pipeline_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);

    // Get the current running pipeline (if any)
    const currentRun = pipelineRuns?.find(run => run.status === 'running') || null;
    const recentRuns = pipelineRuns || [];

    // Fetch recent events for live activity feed
    const { data: recentEvents, error: eventsError } = await supabase
      .from('pipeline_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Fallback: Fetch source counts by channel (legacy method)
    const { data: sources, error: sourcesError } = await supabase
      .from('nko_sources')
      .select('channel_name, status')
      .order('channel_name');

    // Aggregate channel stats
    const channelStats: Record<string, {
      name: string;
      videosTotal: number;
      videosProcessed: number;
      detections: number;
      lastProcessed: string | null;
    }> = {};

    // Known channel totals (from config)
    const knownChannels: Record<string, number> = {
      'babamamadidiane': 532,
      'ankataa': 157,
    };

    // Initialize with known channels
    for (const [name, total] of Object.entries(knownChannels)) {
      channelStats[name] = {
        name,
        videosTotal: total,
        videosProcessed: 0,
        detections: 0,
        lastProcessed: null,
      };
    }

    // Count processed videos from sources
    if (sources) {
      for (const source of sources) {
        const channelName = source.channel_name || 'unknown';
        if (!channelStats[channelName]) {
          channelStats[channelName] = {
            name: channelName,
            videosTotal: 0,
            videosProcessed: 0,
            detections: 0,
            lastProcessed: null,
          };
        }
        if (source.status === 'completed') {
          channelStats[channelName].videosProcessed++;
        }
      }
    }

    // Get overall stats from database
    const { count: totalFrames } = await supabase
      .from('nko_frames')
      .select('*', { count: 'exact', head: true });

    const { count: totalDetections } = await supabase
      .from('nko_detections')
      .select('*', { count: 'exact', head: true });

    // Calculate totals
    const totalProcessed = Object.values(channelStats)
      .reduce((sum, ch) => sum + ch.videosProcessed, 0);
    const totalVideos = Object.values(channelStats)
      .reduce((sum, ch) => sum + ch.videosTotal, 0);

    // Build pipeline status from current run or legacy data
    let pipelineStatus;
    
    if (currentRun) {
      // Use real-time data from pipeline_runs table
      const startTime = new Date(currentRun.started_at).getTime();
      const elapsedMs = Date.now() - startTime;
      const videosRemaining = currentRun.videos_total - currentRun.videos_completed - currentRun.videos_failed;
      const avgTimePerVideo = currentRun.videos_completed > 0 
        ? elapsedMs / currentRun.videos_completed 
        : 120000; // Default 2 min per video
      const estimatedRemainingMs = videosRemaining * avgTimePerVideo;
      const estimatedCompletion = new Date(Date.now() + estimatedRemainingMs).toISOString();

      pipelineStatus = {
        isRunning: true,
        runId: currentRun.id,
        runType: currentRun.run_type,
        currentChannel: currentRun.channel_name,
        videosProcessed: currentRun.videos_completed,
        videosFailed: currentRun.videos_failed,
        videosTotal: currentRun.videos_total,
        framesExtracted: currentRun.frames_extracted,
        detectionsFound: currentRun.detections_found,
        audioSegments: currentRun.audio_segments,
        costEstimate: currentRun.cost_estimate,
        startedAt: currentRun.started_at,
        lastUpdated: currentRun.started_at,
        estimatedCompletion,
        progressPercent: currentRun.videos_total > 0 
          ? Math.round((currentRun.videos_completed / currentRun.videos_total) * 100) 
          : 0,
      };
    } else {
      // Fallback to legacy data
      const { data: lastUpdate } = await supabase
        .from('nko_sources')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      pipelineStatus = {
        isRunning: false,
        runId: null,
        runType: null,
        currentChannel: null,
        videosProcessed: totalProcessed,
        videosFailed: 0,
        videosTotal: totalVideos,
        framesExtracted: totalFrames || 0,
        detectionsFound: totalDetections || 0,
        audioSegments: 0,
        costEstimate: 0,
        startedAt: null,
        lastUpdated: lastUpdate?.updated_at || new Date().toISOString(),
        estimatedCompletion: null,
        progressPercent: totalVideos > 0 
          ? Math.round((totalProcessed / totalVideos) * 100) 
          : 0,
      };
    }

    // Format recent events for frontend
    const formattedEvents = (recentEvents || []).map((event: PipelineEvent) => ({
      id: event.id,
      type: event.event_type,
      videoId: event.video_id,
      message: event.message,
      data: event.data,
      timestamp: event.created_at,
    }));

    // Format recent runs for history
    const runHistory = recentRuns.map((run: PipelineRun) => ({
      id: run.id,
      type: run.run_type,
      channel: run.channel_name,
      status: run.status,
      startedAt: run.started_at,
      endedAt: run.ended_at,
      videosCompleted: run.videos_completed,
      videosTotal: run.videos_total,
      detectionsFound: run.detections_found,
      costEstimate: run.cost_estimate,
    }));

    const response = {
      pipeline: pipelineStatus,
      channels: Object.values(channelStats),
      recentEvents: formattedEvents,
      runHistory,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Pipeline status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline status', details: String(error) },
      { status: 500 }
    );
  }
}
