import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Fetch source counts by channel
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
      'babamamadidiane': 522,
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

    // Count processed videos
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

    // Get detection counts per channel
    const { data: detectionCounts, error: detectError } = await supabase
      .from('nko_sources')
      .select(`
        channel_name,
        nko_frames!inner(
          nko_detections(count)
        )
      `)
      .eq('status', 'completed');

    // Get overall stats
    const { count: totalFrames } = await supabase
      .from('nko_frames')
      .select('*', { count: 'exact', head: true });

    const { count: totalDetections } = await supabase
      .from('nko_detections')
      .select('*', { count: 'exact', head: true });

    // Check if pipeline is currently running (look for 'processing' status)
    const { data: processing } = await supabase
      .from('nko_sources')
      .select('channel_name, updated_at')
      .eq('status', 'processing')
      .limit(1);

    const isRunning = processing && processing.length > 0;
    const currentChannel = isRunning ? processing[0].channel_name : null;

    // Calculate totals
    const totalProcessed = Object.values(channelStats)
      .reduce((sum, ch) => sum + ch.videosProcessed, 0);
    const totalVideos = Object.values(channelStats)
      .reduce((sum, ch) => sum + ch.videosTotal, 0);

    // Get last update time
    const { data: lastUpdate } = await supabase
      .from('nko_sources')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    const response = {
      pipeline: {
        isRunning,
        currentChannel,
        videosProcessed: totalProcessed,
        videosTotal: totalVideos,
        framesExtracted: totalFrames || 0,
        detectionsFound: totalDetections || 0,
        lastUpdated: lastUpdate?.updated_at || new Date().toISOString(),
      },
      channels: Object.values(channelStats),
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

