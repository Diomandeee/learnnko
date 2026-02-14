/**
 * GET /api/curriculum/runs/[id]/frames
 *
 * Returns frames for a specific source (video).
 * Uses the training database (zceeunlfhcherokveyek) where N'Ko training data is stored.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTrainingSupabase,
  isTrainingDbConfigured,
} from '@/lib/supabase/training-client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!isTrainingDbConfigured()) {
    return NextResponse.json(
      { error: 'Training database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id: sourceId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') ?? '100', 10);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const offset = (page - 1) * limit;

    const supabase = getTrainingSupabase();

    // Get frames for this source from the training database
    const { data, error, count } = await supabase
      .from('nko_frames')
      .select('*', { count: 'exact' })
      .eq('source_id', sourceId)
      .order('frame_index', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch frames:', error);
      return NextResponse.json(
        { error: 'Failed to fetch frames' },
        { status: 500 }
      );
    }

    // Transform to UI format
    const items = (data ?? []).map((frame: Record<string, unknown>) => ({
      id: frame.id as string,
      runId: frame.source_id as string,
      videoId: frame.source_id as string,
      frameIndex: frame.frame_index as number,
      timestampMs: frame.timestamp_ms as number,
      imagePath: frame.storage_path as string | null,
      thumbnailPath: frame.thumbnail_path as string | null,
      width: frame.width as number,
      height: frame.height as number,
      hasNko: frame.has_nko as boolean,
      detectionCount: frame.detection_count as number,
      confidence: frame.confidence as number,
      createdAt: frame.created_at as string,
    }));

    return NextResponse.json({
      items,
      total: count ?? 0,
      page,
      pageSize: limit,
      hasMore: offset + items.length < (count ?? 0),
      sourceId,
    });
  } catch (error) {
    console.error('Failed to fetch frames:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frames' },
      { status: 500 }
    );
  }
}
