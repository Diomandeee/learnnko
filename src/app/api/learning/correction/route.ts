import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured, submitCorrection } from '@/lib/supabase';
import type { NkoCorrectionInsert } from '@/lib/supabase/types';

/**
 * Submit User Correction - Persists to Supabase and forwards to backend analyzer
 * 
 * POST /api/learning/correction
 * 
 * Body: {
 *   session_id: string (required)
 *   frame_id?: string (optional)
 *   detection_id?: string (optional - preferred)
 *   original_nko: string (required)
 *   corrected_nko: string (required)
 *   correction_type: 'spelling' | 'tone' | 'meaning' | 'grammar' | 'other' (required)
 *   explanation?: string (optional)
 *   confidence?: number (optional)
 * }
 * 
 * Returns: {
 *   success: boolean
 *   correction_id?: string
 *   message: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id,
      frame_id,
      detection_id,
      vocabulary_id,
      original_nko,
      corrected_nko,
      correction_type,
      explanation,
      confidence,
    } = body;

    // Validate required fields
    if (!original_nko || !corrected_nko || !correction_type) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['original_nko', 'corrected_nko', 'correction_type'],
        },
        { status: 400 }
      );
    }

    let correctionId: string | null = null;

    // Persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const correctionData: NkoCorrectionInsert = {
          detection_id: detection_id || undefined,
          vocabulary_id: vocabulary_id || undefined,
          field_corrected: correction_type === 'meaning' ? 'translation' : correction_type === 'tone' ? 'tone_marks' : 'nko_text',
          original_value: original_nko,
          corrected_value: corrected_nko,
          correction_type: correction_type,
          reason: explanation || undefined,
          confidence: confidence || 0.8,
          status: 'pending',
        };

        const correction = await submitCorrection(correctionData);
        correctionId = correction.id;
        console.log('Correction saved to Supabase:', correctionId);
      } catch (supabaseError) {
        console.warn('Failed to save correction to Supabase:', supabaseError);
        // Continue - we'll still try the backend
      }
    }

    // Also forward to backend if available
    const backendUrl = process.env.ANALYZER_BACKEND_URL;
    if (backendUrl) {
      try {
        const backendResponse = await fetch(`${backendUrl}/api/analyze/correction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id,
            frame_id,
            original_nko,
            corrected_nko,
            correction_type,
            explanation,
            timestamp: Date.now(),
          }),
        });

        if (!backendResponse.ok) {
          console.warn('Backend correction failed:', backendResponse.status);
        }
      } catch (backendError) {
        console.warn('Backend correction request failed:', backendError);
        // Continue - we already saved to Supabase
      }
    }

    return NextResponse.json({
      success: true,
      correction_id: correctionId,
      message: 'Correction submitted successfully',
      persisted: Boolean(correctionId),
    });
  } catch (error) {
    console.error('Error submitting correction:', error);
    return NextResponse.json(
      {
        error: 'Failed to submit correction',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Get corrections (for review)
export async function GET(req: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('nko_corrections')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      corrections: data,
      count: data.length,
    });
  } catch (error) {
    console.error('Failed to get corrections:', error);
    return NextResponse.json(
      { error: 'Failed to get corrections', details: String(error) },
      { status: 500 }
    );
  }
}
