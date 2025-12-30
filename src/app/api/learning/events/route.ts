/**
 * Learning Events API Route
 *
 * Records learning events (vocabulary views, correct/incorrect responses, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured, recordLearningEvent } from '@/lib/supabase';
import type { NkoLearningEventInsert } from '@/lib/supabase/types';

// POST - Record a learning event
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      // Silently succeed if Supabase is not configured
      return NextResponse.json({ success: true, persisted: false });
    }

    const body = await request.json();
    const {
      session_id,
      vocabulary_id,
      detection_id,
      event_type,
      outcome,
      confidence,
      response_time_ms,
      metadata,
    } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    if (!event_type) {
      return NextResponse.json({ error: 'event_type required' }, { status: 400 });
    }

    const eventData: NkoLearningEventInsert = {
      session_id,
      vocabulary_id: vocabulary_id || undefined,
      detection_id: detection_id || undefined,
      event_type,
      outcome: outcome || undefined,
      confidence: confidence || undefined,
      response_time_ms: response_time_ms || undefined,
      metadata: metadata || undefined,
    };

    const event = await recordLearningEvent(eventData);

    return NextResponse.json({
      success: true,
      persisted: true,
      event_id: event.id,
    });
  } catch (error) {
    console.error('Failed to record learning event:', error);
    return NextResponse.json(
      { error: 'Failed to record event', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Get events for a session
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('nko_learning_events')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      events: data,
      count: data.length,
    });
  } catch (error) {
    console.error('Failed to get learning events:', error);
    return NextResponse.json(
      { error: 'Failed to get events', details: String(error) },
      { status: 500 }
    );
  }
}

