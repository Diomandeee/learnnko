/**
 * GET /api/curriculum/runs/[id]/detections
 *
 * Returns detections for a specific source (video).
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
    const limit = parseInt(searchParams.get('limit') ?? '500', 10);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const offset = (page - 1) * limit;

    const supabase = getTrainingSupabase();

    // First get all frame IDs for this source
    const { data: frames, error: framesError } = await supabase
      .from('nko_frames')
      .select('id')
      .eq('source_id', sourceId);

    if (framesError) {
      console.error('Failed to fetch frames:', framesError);
      return NextResponse.json(
        { error: 'Failed to fetch frames' },
        { status: 500 }
      );
    }

    if (!frames || frames.length === 0) {
      return NextResponse.json({
        items: [],
        total: 0,
        page,
        pageSize: limit,
        hasMore: false,
        sourceId,
      });
    }

    const frameIds = frames.map((f: { id: string }) => f.id);

    // Get detections for all frames in this source
    const { data, error, count } = await supabase
      .from('nko_detections')
      .select('*', { count: 'exact' })
      .in('frame_id', frameIds)
      .order('confidence', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch detections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch detections' },
        { status: 500 }
      );
    }

    // Transform to UI format
    const items = (data ?? []).map((detection: Record<string, unknown>) => ({
      id: detection.id as string,
      frameId: detection.frame_id as string,
      nkoText: detection.nko_text as string,
      latinText: detection.latin_text as string | null,
      confidence: detection.confidence as number,
      boundingBox: detection.bounding_box as {
        x: number;
        y: number;
        width: number;
        height: number;
        rotation?: number;
      } | null,
      status: detection.status as string,
      createdAt: detection.created_at as string,
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
    console.error('Failed to fetch detections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detections' },
      { status: 500 }
    );
  }
}
