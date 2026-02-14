/**
 * N'Ko Training Database Client (Server-Side Only)
 *
 * This client connects to the training database (zceeunlfhcherokveyek)
 * where all N'Ko training pipeline data is stored:
 * - nko_sources (video sources)
 * - nko_frames (extracted frames)
 * - nko_detections (OCR detections)
 * - pipeline_runs (training run history)
 *
 * DO NOT use this client on the client-side. It uses the service role key.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================
// Environment Configuration (Server-Side Only)
// ============================================

const trainingDbUrl = process.env.SUPABASE_URL;
const trainingDbKey = process.env.SUPABASE_SERVICE_KEY;

// ============================================
// Client Singleton
// ============================================

let trainingClient: SupabaseClient | null = null;

/**
 * Get the training database Supabase client.
 * This client has full access via the service role key.
 * ONLY use in server-side code (API routes, server components).
 */
export function getTrainingSupabase(): SupabaseClient {
  if (!trainingClient && trainingDbUrl && trainingDbKey) {
    trainingClient = createClient(trainingDbUrl, trainingDbKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  if (!trainingClient) {
    throw new Error(
      'Training database client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.'
    );
  }

  return trainingClient;
}

/**
 * Check if the training database is configured.
 */
export function isTrainingDbConfigured(): boolean {
  return Boolean(trainingDbUrl && trainingDbKey);
}

// ============================================
// Source Operations (nko_sources)
// ============================================

export interface NkoSource {
  id: string;
  source_type: string;
  external_id: string;
  title: string | null;
  url: string | null;
  channel_id: string | null;
  channel_name: string | null;
  duration_seconds: number | null;
  status: string;
  frame_count: number;
  nko_frame_count: number;
  total_detections: number;
  processing_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export async function getSources(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<NkoSource[]> {
  const supabase = getTrainingSupabase();
  let query = supabase.from('nko_sources').select('*');

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSourceById(id: string): Promise<NkoSource | null> {
  const supabase = getTrainingSupabase();
  const { data, error } = await supabase
    .from('nko_sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getSourcesCount(): Promise<number> {
  const supabase = getTrainingSupabase();
  const { count, error } = await supabase
    .from('nko_sources')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
}

// ============================================
// Frame Operations (nko_frames)
// ============================================

export interface NkoFrame {
  id: string;
  source_id: string;
  frame_index: number;
  timestamp_ms: number;
  width: number;
  height: number;
  has_nko: boolean;
  detection_count: number;
  confidence: number;
  storage_path: string | null;
  thumbnail_path: string | null;
  created_at: string;
}

export async function getFramesBySource(
  sourceId: string,
  options?: { hasNko?: boolean; limit?: number; offset?: number }
): Promise<NkoFrame[]> {
  const supabase = getTrainingSupabase();
  let query = supabase.from('nko_frames').select('*').eq('source_id', sourceId);

  if (options?.hasNko !== undefined) {
    query = query.eq('has_nko', options.hasNko);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
  }

  const { data, error } = await query.order('frame_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getFrameById(id: string): Promise<NkoFrame | null> {
  const supabase = getTrainingSupabase();
  const { data, error } = await supabase
    .from('nko_frames')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getFramesCount(sourceId?: string): Promise<number> {
  const supabase = getTrainingSupabase();
  let query = supabase.from('nko_frames').select('*', { count: 'exact', head: true });

  if (sourceId) {
    query = query.eq('source_id', sourceId);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}

// ============================================
// Detection Operations (nko_detections)
// ============================================

export interface NkoDetection {
  id: string;
  frame_id: string;
  nko_text: string;
  latin_text: string | null;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  } | null;
  status: string;
  created_at: string;
}

export async function getDetectionsByFrame(frameId: string): Promise<NkoDetection[]> {
  const supabase = getTrainingSupabase();
  const { data, error } = await supabase
    .from('nko_detections')
    .select('*')
    .eq('frame_id', frameId)
    .order('confidence', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDetectionsBySource(sourceId: string): Promise<NkoDetection[]> {
  const supabase = getTrainingSupabase();

  // First get all frame IDs for this source
  const { data: frames, error: framesError } = await supabase
    .from('nko_frames')
    .select('id')
    .eq('source_id', sourceId);

  if (framesError) throw framesError;
  if (!frames || frames.length === 0) return [];

  const frameIds = frames.map((f) => f.id);

  const { data, error } = await supabase
    .from('nko_detections')
    .select('*')
    .in('frame_id', frameIds)
    .order('confidence', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getDetectionsCount(frameId?: string): Promise<number> {
  const supabase = getTrainingSupabase();
  let query = supabase.from('nko_detections').select('*', { count: 'exact', head: true });

  if (frameId) {
    query = query.eq('frame_id', frameId);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}

// ============================================
// Pipeline Run Operations (pipeline_runs)
// ============================================

export interface PipelineRun {
  id: string;
  run_type: string;
  status: string;
  channel_name: string | null;
  pass_number: number | null;
  videos_total: number;
  videos_processed: number;
  daily_budget_used: number;
  daily_budget_limit: number;
  cost_usd: number;
  config: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export async function getPipelineRuns(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<PipelineRun[]> {
  const supabase = getTrainingSupabase();
  let query = supabase.from('pipeline_runs').select('*');

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
  }

  const { data, error } = await query.order('started_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPipelineRunById(id: string): Promise<PipelineRun | null> {
  const supabase = getTrainingSupabase();
  const { data, error } = await supabase
    .from('pipeline_runs')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getPipelineRunsCount(status?: string): Promise<number> {
  const supabase = getTrainingSupabase();
  let query = supabase.from('pipeline_runs').select('*', { count: 'exact', head: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}

// ============================================
// Training Progress Statistics
// ============================================

export interface TrainingStats {
  sources: {
    total: number;
    completed: number;
    processing: number;
    failed: number;
  };
  frames: {
    total: number;
    withNko: number;
  };
  detections: {
    total: number;
  };
  runs: {
    total: number;
    completed: number;
    failed: number;
    running: number;
  };
}

export async function getTrainingStats(): Promise<TrainingStats> {
  const supabase = getTrainingSupabase();

  // Run all queries in parallel
  const [
    sourcesTotal,
    sourcesCompleted,
    sourcesProcessing,
    sourcesFailed,
    framesTotal,
    framesWithNko,
    detectionsTotal,
    runsTotal,
    runsCompleted,
    runsFailed,
    runsRunning,
  ] = await Promise.all([
    supabase.from('nko_sources').select('*', { count: 'exact', head: true }),
    supabase.from('nko_sources').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('nko_sources').select('*', { count: 'exact', head: true }).eq('status', 'processing'),
    supabase.from('nko_sources').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase.from('nko_frames').select('*', { count: 'exact', head: true }),
    supabase.from('nko_frames').select('*', { count: 'exact', head: true }).eq('has_nko', true),
    supabase.from('nko_detections').select('*', { count: 'exact', head: true }),
    supabase.from('pipeline_runs').select('*', { count: 'exact', head: true }),
    supabase.from('pipeline_runs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('pipeline_runs').select('*', { count: 'exact', head: true }).in('status', ['failed', 'completed_with_errors']),
    supabase.from('pipeline_runs').select('*', { count: 'exact', head: true }).eq('status', 'running'),
  ]);

  return {
    sources: {
      total: sourcesTotal.count || 0,
      completed: sourcesCompleted.count || 0,
      processing: sourcesProcessing.count || 0,
      failed: sourcesFailed.count || 0,
    },
    frames: {
      total: framesTotal.count || 0,
      withNko: framesWithNko.count || 0,
    },
    detections: {
      total: detectionsTotal.count || 0,
    },
    runs: {
      total: runsTotal.count || 0,
      completed: runsCompleted.count || 0,
      failed: runsFailed.count || 0,
      running: runsRunning.count || 0,
    },
  };
}
