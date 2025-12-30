/**
 * N'Ko Language Learning - Supabase Client
 * 
 * Provides typed access to the Supabase database with helper functions
 * for common operations.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { 
  Database, 
  NkoSource, 
  NkoFrame, 
  NkoDetection,
  NkoVocabulary, 
  NkoTranslation, 
  NkoCorrection,
  NkoSession,
  NkoTrajectory,
  NkoTrajectoryNode,
  NkoUser,
  NkoLearningEvent,
  LearningPhase,
  NkoVocabularyInsert,
  NkoTranslationInsert,
  NkoCorrectionInsert,
  NkoSessionInsert,
} from './types';

// ============================================
// Environment Configuration
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

// ============================================
// Client Singleton
// ============================================

let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Get the Supabase client instance.
 * Creates a singleton client on first call.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }

  return supabaseClient;
}

/**
 * Check if Supabase is configured.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// ============================================
// Source Operations
// ============================================

export async function getSources(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<NkoSource[]> {
  const supabase = getSupabase();
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
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getSourceByExternalId(
  sourceType: string,
  externalId: string
): Promise<NkoSource | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_sources')
    .select('*')
    .eq('source_type', sourceType)
    .eq('external_id', externalId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============================================
// Vocabulary Operations
// ============================================

export async function getVocabulary(options?: {
  search?: string;
  pos?: string;
  level?: string;
  limit?: number;
  offset?: number;
}): Promise<NkoVocabulary[]> {
  const supabase = getSupabase();
  let query = supabase.from('nko_vocabulary').select('*');

  if (options?.search) {
    query = query.or(`word.ilike.%${options.search}%,latin.ilike.%${options.search}%,meaning_primary.ilike.%${options.search}%`);
  }

  if (options?.pos) {
    query = query.eq('pos', options.pos);
  }

  if (options?.level) {
    query = query.eq('cefr_level', options.level);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query.order('frequency', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getVocabularyById(id: string): Promise<NkoVocabulary | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_vocabulary')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getVocabularyByWord(word: string): Promise<NkoVocabulary | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_vocabulary')
    .select('*')
    .eq('word', word)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createVocabulary(vocab: NkoVocabularyInsert): Promise<NkoVocabulary> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_vocabulary')
    .insert(vocab)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateVocabulary(
  id: string,
  updates: Partial<NkoVocabularyInsert>
): Promise<NkoVocabulary> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_vocabulary')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Translation Operations
// ============================================

export async function getTranslations(options?: {
  qualityTier?: string;
  validated?: boolean;
  limit?: number;
}): Promise<NkoTranslation[]> {
  const supabase = getSupabase();
  let query = supabase.from('nko_translations').select('*');

  if (options?.qualityTier) {
    query = query.eq('quality_tier', options.qualityTier);
  }

  if (options?.validated !== undefined) {
    query = query.eq('validated', options.validated);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTranslation(translation: NkoTranslationInsert): Promise<NkoTranslation> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_translations')
    .insert(translation)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Correction Operations
// ============================================

export async function submitCorrection(correction: NkoCorrectionInsert): Promise<NkoCorrection> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_corrections')
    .insert(correction)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getPendingCorrections(limit = 50): Promise<NkoCorrection[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_corrections')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function reviewCorrection(
  id: string,
  status: 'approved' | 'rejected',
  reviewerId: string,
  note?: string
): Promise<NkoCorrection> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_corrections')
    .update({
      status,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_note: note,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Session Operations
// ============================================

export async function createSession(session: NkoSessionInsert): Promise<NkoSession> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_sessions')
    .insert(session)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function endSession(
  id: string,
  stats?: {
    vocabulary_learned?: number;
    vocabulary_reviewed?: number;
    corrections_made?: number;
  }
): Promise<NkoSession> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_sessions')
    .update({
      ended_at: new Date().toISOString(),
      ...stats,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionPhase(
  id: string,
  phase: LearningPhase,
  trigger: string
): Promise<NkoSession> {
  const supabase = getSupabase();
  
  // Get current session to update phase_transitions
  const { data: current, error: fetchError } = await supabase
    .from('nko_sessions')
    .select('phase_transitions')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const transitions = current?.phase_transitions || [];
  transitions.push({
    phase,
    timestamp_ms: Date.now(),
    trigger,
    confidence: 0.8,
  });

  const { data, error } = await supabase
    .from('nko_sessions')
    .update({
      current_phase: phase,
      phase_transitions: transitions,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Learning Event Operations
// ============================================

export async function recordLearningEvent(event: {
  session_id: string;
  vocabulary_id?: string;
  detection_id?: string;
  translation_id?: string;
  event_type: string;
  timestamp_ms: number;
  duration_ms?: number;
  was_correct?: boolean;
  confidence?: number;
}): Promise<NkoLearningEvent> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_learning_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// Trajectory Operations
// ============================================

export async function createTrajectory(trajectory: {
  session_id?: string;
  user_id?: string;
  name?: string;
  trajectory_type?: string;
}): Promise<NkoTrajectory> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_trajectories')
    .insert(trajectory)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addTrajectoryNode(node: {
  trajectory_id: string;
  node_index: number;
  vocabulary_id?: string;
  detection_id?: string;
  trajectory_depth?: number;
  trajectory_phase?: LearningPhase;
  salience_score?: number;
  content_preview?: string;
}): Promise<NkoTrajectoryNode> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_trajectory_nodes')
    .insert(node)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTrajectoryWithNodes(
  trajectoryId: string
): Promise<{ trajectory: NkoTrajectory; nodes: NkoTrajectoryNode[] }> {
  const supabase = getSupabase();

  const [trajectoryResult, nodesResult] = await Promise.all([
    supabase.from('nko_trajectories').select('*').eq('id', trajectoryId).single(),
    supabase
      .from('nko_trajectory_nodes')
      .select('*')
      .eq('trajectory_id', trajectoryId)
      .order('node_index', { ascending: true }),
  ]);

  if (trajectoryResult.error) throw trajectoryResult.error;
  if (nodesResult.error) throw nodesResult.error;

  return {
    trajectory: trajectoryResult.data,
    nodes: nodesResult.data || [],
  };
}

// ============================================
// User Operations
// ============================================

export async function getCurrentUser(): Promise<NkoUser | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('nko_users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateUserStats(
  userId: string,
  stats: {
    vocabulary_learned?: number;
    sessions_completed?: number;
    total_learning_time_ms?: number;
  }
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('nko_users')
    .update({
      ...stats,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

// ============================================
// Welford Stats Operations
// ============================================

export async function updateWelfordStats(
  vocabularyId: string,
  userId: string,
  statType: 'confidence' | 'response_time' | 'accuracy' | 'retention',
  newValue: number
): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('update_welford_stats', {
    p_vocabulary_id: vocabularyId,
    p_user_id: userId,
    p_stat_type: statType,
    p_new_value: newValue,
  });

  if (error) throw error;
}

// ============================================
// Embedding/Search Operations
// ============================================

export async function findSimilarVocabulary(
  embedding: number[],
  limit = 10
): Promise<{ vocabulary_id: string; word: string; latin: string | null; meaning: string | null; similarity: number }[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('find_similar_vocabulary', {
    query_text: '',
    query_embedding: embedding,
    match_count: limit,
  });

  if (error) throw error;
  return data || [];
}

// ============================================
// Detection Operations
// ============================================

export async function getDetectionsByFrame(frameId: string): Promise<NkoDetection[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('nko_detections')
    .select('*')
    .eq('frame_id', frameId)
    .order('confidence', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFramesBySource(
  sourceId: string,
  options?: { hasNko?: boolean; limit?: number }
): Promise<NkoFrame[]> {
  const supabase = getSupabase();
  let query = supabase.from('nko_frames').select('*').eq('source_id', sourceId);

  if (options?.hasNko !== undefined) {
    query = query.eq('has_nko', options.hasNko);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.order('frame_index', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ============================================
// Export all types
// ============================================

export * from './types';

