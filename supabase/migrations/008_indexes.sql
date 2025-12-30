-- Migration 008: Performance Indexes
-- N'Ko Language Learning Database
--
-- Optimized indexes for common query patterns.

-- ============================================
-- Source Layer Indexes
-- ============================================

-- Quick lookup by status (for processing queue)
CREATE INDEX IF NOT EXISTS idx_sources_status 
ON nko_sources(status);

-- Lookup by source type and external ID
CREATE INDEX IF NOT EXISTS idx_sources_type_external 
ON nko_sources(source_type, external_id);

-- Sources with N'Ko content
CREATE INDEX IF NOT EXISTS idx_sources_with_nko 
ON nko_sources(nko_frame_count DESC) 
WHERE nko_frame_count > 0;

-- Recent sources
CREATE INDEX IF NOT EXISTS idx_sources_created 
ON nko_sources(created_at DESC);

-- ============================================
-- Frame Layer Indexes
-- ============================================

-- Frames by source
CREATE INDEX IF NOT EXISTS idx_frames_source 
ON nko_frames(source_id);

-- Frames with N'Ko content
CREATE INDEX IF NOT EXISTS idx_frames_has_nko 
ON nko_frames(source_id, frame_index) 
WHERE has_nko = TRUE;

-- Frame lookup by timestamp
CREATE INDEX IF NOT EXISTS idx_frames_timestamp 
ON nko_frames(source_id, timestamp_ms);

-- High confidence frames
CREATE INDEX IF NOT EXISTS idx_frames_confidence 
ON nko_frames(confidence DESC) 
WHERE has_nko = TRUE AND confidence > 0.8;

-- ============================================
-- Detection Layer Indexes
-- ============================================

-- Detections by frame
CREATE INDEX IF NOT EXISTS idx_detections_frame 
ON nko_detections(frame_id);

-- High confidence detections
CREATE INDEX IF NOT EXISTS idx_detections_confidence 
ON nko_detections(confidence DESC);

-- Full-text search on N'Ko text
CREATE INDEX IF NOT EXISTS idx_detections_nko_text 
ON nko_detections USING gin(to_tsvector('simple', nko_text));

-- Detections by status
CREATE INDEX IF NOT EXISTS idx_detections_status 
ON nko_detections(status);

-- Validated detections
CREATE INDEX IF NOT EXISTS idx_detections_validated 
ON nko_detections(validated_at DESC) 
WHERE status = 'validated';

-- Context type lookup
CREATE INDEX IF NOT EXISTS idx_detections_context 
ON nko_detections(context_type) 
WHERE context_type IS NOT NULL;

-- Characters by detection
CREATE INDEX IF NOT EXISTS idx_characters_detection 
ON nko_characters(detection_id);

-- Character type distribution
CREATE INDEX IF NOT EXISTS idx_characters_type 
ON nko_characters(char_type);

-- ============================================
-- Vocabulary Layer Indexes
-- ============================================

-- Unique word lookup
CREATE INDEX IF NOT EXISTS idx_vocabulary_word 
ON nko_vocabulary(word);

-- Latin transliteration lookup
CREATE INDEX IF NOT EXISTS idx_vocabulary_latin 
ON nko_vocabulary(latin);

-- Frequency ranking
CREATE INDEX IF NOT EXISTS idx_vocabulary_frequency 
ON nko_vocabulary(frequency DESC);

-- Part of speech
CREATE INDEX IF NOT EXISTS idx_vocabulary_pos 
ON nko_vocabulary(pos) 
WHERE pos IS NOT NULL;

-- CEFR level
CREATE INDEX IF NOT EXISTS idx_vocabulary_cefr 
ON nko_vocabulary(cefr_level) 
WHERE cefr_level IS NOT NULL;

-- Status
CREATE INDEX IF NOT EXISTS idx_vocabulary_status 
ON nko_vocabulary(status);

-- Full-text search on meanings
CREATE INDEX IF NOT EXISTS idx_vocabulary_meaning 
ON nko_vocabulary USING gin(to_tsvector('english', COALESCE(meaning_primary, '') || ' ' || COALESCE(definition, '')));

-- ============================================
-- Translation Layer Indexes
-- ============================================

-- Translations by quality tier
CREATE INDEX IF NOT EXISTS idx_translations_quality 
ON nko_translations(quality_tier);

-- Training samples
CREATE INDEX IF NOT EXISTS idx_translations_training 
ON nko_translations(id) 
WHERE is_training_sample = TRUE;

-- Validated translations
CREATE INDEX IF NOT EXISTS idx_translations_validated 
ON nko_translations(validation_score DESC) 
WHERE validated = TRUE;

-- Full-text search on English
CREATE INDEX IF NOT EXISTS idx_translations_english 
ON nko_translations USING gin(to_tsvector('english', english_text));

-- Examples by vocabulary
CREATE INDEX IF NOT EXISTS idx_examples_vocabulary 
ON nko_examples(vocabulary_id);

-- ============================================
-- User Layer Indexes
-- ============================================

-- User auth lookup
CREATE INDEX IF NOT EXISTS idx_users_auth 
ON nko_users(auth_id) 
WHERE auth_id IS NOT NULL;

-- Anonymous users
CREATE INDEX IF NOT EXISTS idx_users_anonymous 
ON nko_users(anonymous_id) 
WHERE anonymous_id IS NOT NULL;

-- User role
CREATE INDEX IF NOT EXISTS idx_users_role 
ON nko_users(role);

-- Active users
CREATE INDEX IF NOT EXISTS idx_users_active 
ON nko_users(last_active_at DESC) 
WHERE is_active = TRUE;

-- Trust score (for selecting validators)
CREATE INDEX IF NOT EXISTS idx_users_trust 
ON nko_users(trust_score DESC) 
WHERE role IN ('contributor', 'validator', 'expert');

-- Corrections by status
CREATE INDEX IF NOT EXISTS idx_corrections_status 
ON nko_corrections(status);

-- Pending corrections (priority queue)
CREATE INDEX IF NOT EXISTS idx_corrections_pending 
ON nko_corrections(created_at) 
WHERE status = 'pending';

-- Corrections by user
CREATE INDEX IF NOT EXISTS idx_corrections_user 
ON nko_corrections(user_id);

-- ============================================
-- Trajectory Layer Indexes
-- ============================================

-- Sessions by user
CREATE INDEX IF NOT EXISTS idx_sessions_user 
ON nko_sessions(user_id);

-- Sessions by source
CREATE INDEX IF NOT EXISTS idx_sessions_source 
ON nko_sessions(source_id);

-- Active sessions
CREATE INDEX IF NOT EXISTS idx_sessions_active 
ON nko_sessions(started_at DESC) 
WHERE ended_at IS NULL;

-- Session phase
CREATE INDEX IF NOT EXISTS idx_sessions_phase 
ON nko_sessions(current_phase);

-- Learning events by session
CREATE INDEX IF NOT EXISTS idx_events_session 
ON nko_learning_events(session_id);

-- Learning events by vocabulary
CREATE INDEX IF NOT EXISTS idx_events_vocabulary 
ON nko_learning_events(vocabulary_id);

-- Event timeline
CREATE INDEX IF NOT EXISTS idx_events_timeline 
ON nko_learning_events(session_id, timestamp_ms);

-- Trajectories by session
CREATE INDEX IF NOT EXISTS idx_trajectories_session 
ON nko_trajectories(session_id);

-- Trajectories by user
CREATE INDEX IF NOT EXISTS idx_trajectories_user 
ON nko_trajectories(user_id);

-- Trajectory nodes by trajectory
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_trajectory 
ON nko_trajectory_nodes(trajectory_id);

-- Trajectory node phase
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_phase 
ON nko_trajectory_nodes(trajectory_phase);

-- High salience nodes
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_salience 
ON nko_trajectory_nodes(salience_score DESC) 
WHERE salience_score > 0.7;

-- Phase transitions
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_transitions 
ON nko_trajectory_nodes(trajectory_id) 
WHERE is_phase_transition = TRUE;

-- Terminal nodes
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_terminal 
ON nko_trajectory_nodes(trajectory_id) 
WHERE is_terminal = TRUE;

-- Welford stats lookup
CREATE INDEX IF NOT EXISTS idx_welford_vocab_user 
ON nko_welford_stats(vocabulary_id, user_id);

-- ============================================
-- Embedding Layer Indexes
-- (Vector indexes created in 007)
-- ============================================

-- Embeddings by vocabulary
CREATE INDEX IF NOT EXISTS idx_embeddings_vocabulary 
ON nko_embeddings(vocabulary_id) 
WHERE vocabulary_id IS NOT NULL;

-- Embeddings by translation
CREATE INDEX IF NOT EXISTS idx_embeddings_translation 
ON nko_embeddings(translation_id) 
WHERE translation_id IS NOT NULL;

-- Embeddings by model
CREATE INDEX IF NOT EXISTS idx_embeddings_model 
ON nko_embeddings(model_name);

-- Cluster members
CREATE INDEX IF NOT EXISTS idx_cluster_members_cluster 
ON nko_embedding_cluster_members(cluster_id);

CREATE INDEX IF NOT EXISTS idx_cluster_members_embedding 
ON nko_embedding_cluster_members(embedding_id);

