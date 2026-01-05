/**
 * API Route: GET /api/inscriptions/session/[id]
 *
 * Fetches all inscriptions for a given session ID.
 *
 * Query Parameters:
 * - claim_type: Filter by claim type (0-9)
 * - min_confidence: Minimum confidence threshold (0.0-1.0)
 * - place: Filter by place name
 * - limit: Maximum number of results (default: 1000)
 * - order: Sort order - 'asc' or 'desc' (default: 'asc')
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE CLIENT
// =====================================================

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }

  return createClient(url, key);
}

// =====================================================
// TYPES
// =====================================================

interface InscriptionRow {
  id: string;
  created_at: string;
  session_id: string | null;
  claim_type: number;
  nko_text: string;
  timestamp_ms: number;
  window_t0: number | null;
  window_t1: number | null;
  confidence: number;
  place: string | null;
  basin_id: string | null;
  fusion_frame_id: number | null;
  sensor_frame_ids: number[] | null;
  claim_ir: Record<string, unknown>;
}

interface ApiResponse {
  inscriptions: InscriptionRow[];
  count: number;
  sessionId: string;
  filters?: {
    claimType?: number;
    minConfidence?: number;
    place?: string;
  };
}

interface ApiError {
  error: string;
  details?: string;
}

// =====================================================
// GET HANDLER
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    // Validate session ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        {
          error: 'Invalid session ID format. Must be a valid UUID.',
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const claimTypeParam = searchParams.get('claim_type');
    const minConfidenceParam = searchParams.get('min_confidence');
    const placeParam = searchParams.get('place');
    const limitParam = searchParams.get('limit');
    const orderParam = searchParams.get('order');

    // Validate parameters
    const claimType = claimTypeParam !== null ? parseInt(claimTypeParam, 10) : undefined;
    const minConfidence = minConfidenceParam !== null ? parseFloat(minConfidenceParam) : undefined;
    const limit = limitParam !== null ? parseInt(limitParam, 10) : 1000;
    const order = orderParam === 'desc' ? 'desc' : 'asc';

    if (claimType !== undefined && (isNaN(claimType) || claimType < 0 || claimType > 9)) {
      return NextResponse.json(
        {
          error: 'Invalid claim_type parameter. Must be between 0 and 9.',
        } satisfies ApiError,
        { status: 400 }
      );
    }

    if (minConfidence !== undefined && (isNaN(minConfidence) || minConfidence < 0 || minConfidence > 1)) {
      return NextResponse.json(
        {
          error: 'Invalid min_confidence parameter. Must be between 0.0 and 1.0.',
        } satisfies ApiError,
        { status: 400 }
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 10000) {
      return NextResponse.json(
        {
          error: 'Invalid limit parameter. Must be between 1 and 10000.',
        } satisfies ApiError,
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = getSupabaseClient();

    // Build query
    let query = supabase
      .from('nko_inscriptions')
      .select('*')
      .eq('session_id', sessionId);

    // Apply filters
    if (claimType !== undefined) {
      query = query.eq('claim_type', claimType);
    }

    if (minConfidence !== undefined) {
      query = query.gte('confidence', minConfidence);
    }

    if (placeParam) {
      query = query.eq('place', placeParam);
    }

    // Apply ordering and limit
    query = query
      .order('timestamp_ms', { ascending: order === 'asc' })
      .limit(limit);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('[InscriptionAPI] Supabase error:', error);
      return NextResponse.json(
        {
          error: 'Failed to fetch inscriptions',
          details: error.message,
        } satisfies ApiError,
        { status: 500 }
      );
    }

    // Return response
    const response: ApiResponse = {
      inscriptions: (data || []) as InscriptionRow[],
      count: data?.length || 0,
      sessionId,
      filters: {
        ...(claimType !== undefined && { claimType }),
        ...(minConfidence !== undefined && { minConfidence }),
        ...(placeParam && { place: placeParam }),
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('[InscriptionAPI] Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      } satisfies ApiError,
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS HANDLER (CORS)
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
