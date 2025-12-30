/**
 * Trajectory API Route
 *
 * Manages learning trajectories for tracking user progress through content.
 * Trajectories represent the path a user takes through vocabulary/content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import type { NkoTrajectoryInsert, NkoTrajectoryNodeInsert } from '@/lib/supabase/types';

// POST - Create a new trajectory or add a node
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ success: true, persisted: false });
    }

    const body = await request.json();
    const { action } = body;

    const supabase = getSupabase();

    if (action === 'create') {
      // Create a new trajectory
      const { session_id, trajectory_type } = body;

      if (!session_id) {
        return NextResponse.json({ error: 'session_id required' }, { status: 400 });
      }

      const trajectoryData: NkoTrajectoryInsert = {
        session_id,
        trajectory_type: trajectory_type || 'learning_path',
        is_active: true,
      };

      const { data, error } = await supabase
        .from('nko_trajectories')
        .insert(trajectoryData)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        trajectory_id: data.id,
        trajectory: data,
      });
    }

    if (action === 'add_node') {
      // Add a node to an existing trajectory
      const {
        trajectory_id,
        node_index,
        vocabulary_id,
        detection_id,
        trajectory_depth,
        trajectory_phase,
        trajectory_phase_confidence,
        salience_score,
        is_phase_transition,
        metadata,
      } = body;

      if (!trajectory_id) {
        return NextResponse.json({ error: 'trajectory_id required' }, { status: 400 });
      }

      const nodeData: NkoTrajectoryNodeInsert = {
        trajectory_id,
        node_index: node_index || 0,
        vocabulary_id: vocabulary_id || undefined,
        detection_id: detection_id || undefined,
        trajectory_depth: trajectory_depth || 0,
        trajectory_phase: trajectory_phase || 'exploration',
        trajectory_phase_confidence: trajectory_phase_confidence || 0.5,
        salience_score: salience_score || 0.5,
        is_phase_transition: is_phase_transition || false,
      };

      const { data, error } = await supabase
        .from('nko_trajectory_nodes')
        .insert(nodeData)
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        node_id: data.id,
        node: data,
      });
    }

    if (action === 'complete') {
      // Mark trajectory as complete
      const { trajectory_id } = body;

      if (!trajectory_id) {
        return NextResponse.json({ error: 'trajectory_id required' }, { status: 400 });
      }

      const { error } = await supabase
        .from('nko_trajectories')
        .update({ is_active: false })
        .eq('id', trajectory_id);

      if (error) throw error;

      return NextResponse.json({ success: true, action: 'completed' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Trajectory operation failed:', error);
    return NextResponse.json(
      { error: 'Trajectory operation failed', details: String(error) },
      { status: 500 }
    );
  }
}

// GET - Get trajectory with nodes
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const trajectory_id = searchParams.get('trajectory_id');
    const session_id = searchParams.get('session_id');

    const supabase = getSupabase();

    if (trajectory_id) {
      // Get specific trajectory with its nodes
      const { data: trajectory, error: trajError } = await supabase
        .from('nko_trajectories')
        .select('*')
        .eq('id', trajectory_id)
        .single();

      if (trajError) throw trajError;

      const { data: nodes, error: nodesError } = await supabase
        .from('nko_trajectory_nodes')
        .select('*')
        .eq('trajectory_id', trajectory_id)
        .order('node_index', { ascending: true });

      if (nodesError) throw nodesError;

      return NextResponse.json({
        success: true,
        trajectory,
        nodes,
        node_count: nodes.length,
      });
    }

    if (session_id) {
      // Get all trajectories for a session
      const { data: trajectories, error } = await supabase
        .from('nko_trajectories')
        .select('*')
        .eq('session_id', session_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        trajectories,
        count: trajectories.length,
      });
    }

    return NextResponse.json(
      { error: 'Either trajectory_id or session_id required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to get trajectory:', error);
    return NextResponse.json(
      { error: 'Failed to get trajectory', details: String(error) },
      { status: 500 }
    );
  }
}
