/**
 * Learning Session API Route
 *
 * Manages learning sessions in Supabase:
 * - POST: Create a new session
 * - PATCH: Update session (phase changes, end session)
 * - GET: Get session by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSupabase,
  isSupabaseConfigured,
  createSession,
  endSession,
  recordLearningEvent,
} from '@/lib/supabase';
import type { NkoSessionInsert, NkoLearningEventInsert } from '@/lib/supabase/types';

// POST - Create a new session
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured', session_id: `local_${Date.now()}` },
        { status: 200 }
      );
    }

    const body = await request.json();
    const { session_type, source_id, user_id } = body;

    const sessionData: NkoSessionInsert = {
      session_type: session_type || 'realtime_learning',
      source_id: source_id || undefined,
      current_phase: 'exploration',
    };

    const session = await createSession(sessionData);

    return NextResponse.json({
      success: true,
      session_id: session.id,
      session,
    });
  } catch (error) {
    console.error('Failed to create session:', error);
    return NextResponse.json(
      { error: 'Failed to create session', details: String(error) },
      { status: 500 }
    );
  }
}

// PATCH - Update session (end it or update phase)
export async function PATCH(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, message: 'Supabase not configured' });
    }

    const body = await request.json();
    const { session_id, action, data } = body;

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    const supabase = getSupabase();

    if (action === 'end') {
      // End the session
      const updates: Record<string, unknown> = {
        ended_at: new Date().toISOString(),
      };

      if (data?.vocabulary_learned !== undefined) {
        updates.vocabulary_learned = data.vocabulary_learned;
      }
      if (data?.corrections_made !== undefined) {
        updates.corrections_made = data.corrections_made;
      }
      if (data?.final_phase) {
        updates.final_phase = data.final_phase;
      }
      if (data?.summary) {
        updates.summary = data.summary;
      }

      const { error } = await supabase
        .from('nko_sessions')
        .update(updates)
        .eq('id', session_id);

      if (error) throw error;

      return NextResponse.json({ success: true, action: 'ended' });
    }

    if (action === 'update_phase') {
      // Update current phase
      const { error } = await supabase
        .from('nko_sessions')
        .update({ current_phase: data.phase })
        .eq('id', session_id);

      if (error) throw error;

      return NextResponse.json({ success: true, action: 'phase_updated' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to update session:', error);
    return NextResponse.json(
      { error: 'Failed to update session', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Get session by ID
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const session_id = searchParams.get('session_id');

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('nko_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, session: data });
  } catch (error) {
    console.error('Failed to get session:', error);
    return NextResponse.json(
      { error: 'Failed to get session', details: String(error) },
      { status: 500 }
    );
  }
}

