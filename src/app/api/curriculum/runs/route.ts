/**
 * GET /api/curriculum/runs
 *
 * Returns list of pipeline runs for replay selection.
 * Uses nko_sources table which contains actual processed video data.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTrainingSupabase,
  isTrainingDbConfigured,
  getSources,
} from '@/lib/supabase/training-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isTrainingDbConfigured()) {
    return NextResponse.json(
      { error: 'Training database not configured' },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const offset = (page - 1) * limit;

  const supabase = getTrainingSupabase();

  // Get sources from nko_sources table (actual processed videos)
  const { data, error, count } = await supabase
    .from('nko_sources')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Failed to fetch sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    );
  }

  // Transform nko_sources to PipelineRun format for the UI
  const items = (data ?? []).map((source: Record<string, unknown>) => {
    return {
      id: source.id as string,
      videoId: source.external_id as string,
      videoTitle: source.title as string | null || `Video ${source.external_id}`,
      channelId: source.channel_id as string | null,
      channelName: source.channel_name as string | null,
      status: source.status as string,
      passNumber: 1, // Source represents extraction pass completion
      framesExtracted: (source.frame_count as number) || 0,
      nkoFrameCount: (source.nko_frame_count as number) || 0,
      detectionsFound: (source.total_detections as number) || 0,
      cost: 0, // Cost not tracked per-source
      startedAt: null,
      completedAt: source.updated_at as string | null,
      createdAt: source.created_at as string,
      error: null,
      // Source metadata
      sourceType: source.source_type as string,
      url: source.url as string | null,
      durationSeconds: source.duration_seconds as number | null,
    };
  });

  return NextResponse.json({
    items,
    total: count ?? 0,
    page,
    pageSize: limit,
    hasMore: offset + items.length < (count ?? 0),
  });
}
