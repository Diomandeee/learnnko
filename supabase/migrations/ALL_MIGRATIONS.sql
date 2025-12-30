-- ============================================================
-- N'KO LANGUAGE LEARNING DATABASE - COMPLETE SCHEMA
-- ============================================================
-- 
-- This file combines all migrations for easy import into Supabase.
-- Run this in the Supabase SQL Editor to create all tables.
--
-- Order of execution:
-- 1. Extensions (pgvector, uuid-ossp)
-- 2. Source Layer (nko_sources, nko_frames)
-- 3. Detection Layer (nko_detections, nko_characters)
-- 4. Linguistic Layer (nko_vocabulary, nko_translations, etc.)
-- 5. User Layer (nko_users, nko_corrections)
-- 6. Trajectory Layer (nko_sessions, nko_trajectories)
-- 7. Embedding Layer (nko_embeddings)
-- 8. Indexes
-- 9. RLS Policies
-- ============================================================

-- ============================================================
-- MIGRATION 001: ENABLE EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- MIGRATION 002: SOURCE LAYER
-- ============================================================

CREATE TABLE nko_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'file', 'upload', 'stream')),
    url TEXT NOT NULL,
    external_id TEXT,
    title TEXT,
    description TEXT,
    channel_name TEXT,
    channel_id TEXT,
    duration_ms BIGINT,
    language TEXT DEFAULT 'nko',
    quality TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    frame_count INTEGER DEFAULT 0,
    nko_frame_count INTEGER DEFAULT 0,
    total_detections INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    UNIQUE(source_type, external_id)
);

COMMENT ON TABLE nko_sources IS 'Video and media sources for N''Ko content extraction';

CREATE TABLE nko_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES nko_sources(id) ON DELETE CASCADE,
    frame_index INTEGER NOT NULL,
    timestamp_ms BIGINT NOT NULL,
    width INTEGER,
    height INTEGER,
    format TEXT DEFAULT 'jpeg',
    has_nko BOOLEAN DEFAULT FALSE,
    detection_count INTEGER DEFAULT 0,
    confidence FLOAT DEFAULT 0.0,
    is_keyframe BOOLEAN DEFAULT FALSE,
    blur_score FLOAT,
    brightness FLOAT,
    image_hash TEXT,
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of_id UUID REFERENCES nko_frames(id),
    storage_path TEXT,
    storage_bucket TEXT,
    thumbnail_path TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, frame_index)
);

COMMENT ON TABLE nko_frames IS 'Individual video frames extracted for N''Ko analysis';

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sources_updated_at
BEFORE UPDATE ON nko_sources
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger to update source frame stats
CREATE OR REPLACE FUNCTION update_source_frame_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE nko_sources
    SET 
        frame_count = (SELECT COUNT(*) FROM nko_frames WHERE source_id = NEW.source_id),
        nko_frame_count = (SELECT COUNT(*) FROM nko_frames WHERE source_id = NEW.source_id AND has_nko = TRUE),
        updated_at = NOW()
    WHERE id = NEW.source_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_source_frame_stats
AFTER INSERT OR UPDATE ON nko_frames
FOR EACH ROW
EXECUTE FUNCTION update_source_frame_stats();

-- ============================================================
-- MIGRATION 003: DETECTION LAYER
-- ============================================================

CREATE TABLE nko_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frame_id UUID NOT NULL REFERENCES nko_frames(id) ON DELETE CASCADE,
    nko_text TEXT NOT NULL,
    nko_text_normalized TEXT,
    latin_text TEXT,
    english_text TEXT,
    char_count INTEGER NOT NULL DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    vowel_count INTEGER DEFAULT 0,
    consonant_count INTEGER DEFAULT 0,
    digit_count INTEGER DEFAULT 0,
    combining_mark_count INTEGER DEFAULT 0,
    punctuation_count INTEGER DEFAULT 0,
    confidence FLOAT NOT NULL DEFAULT 0.0,
    nko_coverage FLOAT DEFAULT 0.0,
    is_valid_structure BOOLEAN DEFAULT TRUE,
    validation_errors TEXT[] DEFAULT '{}',
    validation_warnings TEXT[] DEFAULT '{}',
    bounding_box JSONB,
    text_region TEXT CHECK (text_region IN ('title', 'body', 'caption', 'overlay', 'unknown')),
    context_type TEXT CHECK (context_type IN (
        'greeting', 'vocabulary', 'phrase', 'sentence', 
        'lesson_title', 'instruction', 'number', 'alphabet',
        'proverb', 'dialogue', 'other'
    )),
    gemini_response_id TEXT,
    gemini_model TEXT,
    raw_response JSONB,
    processing_time_ms INTEGER,
    status TEXT DEFAULT 'raw' CHECK (status IN ('raw', 'validated', 'corrected', 'rejected', 'disputed')),
    validated_by UUID,
    validated_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_detections IS 'OCR detection results from video frame analysis';

CREATE TABLE nko_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID NOT NULL REFERENCES nko_detections(id) ON DELETE CASCADE,
    char TEXT NOT NULL,
    code_point INTEGER NOT NULL,
    position INTEGER NOT NULL,
    char_type TEXT NOT NULL CHECK (char_type IN (
        'digit', 'vowel', 'consonant', 'combining', 'punctuation', 'whitespace', 'other'
    )),
    block_name TEXT,
    unicode_name TEXT,
    base_char_id UUID REFERENCES nko_characters(id),
    is_combining BOOLEAN DEFAULT FALSE,
    combining_class INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_characters IS 'Character-level breakdown of N''Ko text detections';

CREATE TABLE nko_bounding_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID NOT NULL REFERENCES nko_detections(id) ON DELETE CASCADE,
    x_min FLOAT NOT NULL,
    y_min FLOAT NOT NULL,
    x_max FLOAT NOT NULL,
    y_max FLOAT NOT NULL,
    rotation_degrees FLOAT DEFAULT 0.0,
    confidence FLOAT,
    box_type TEXT CHECK (box_type IN ('text_block', 'line', 'word', 'character')),
    parent_box_id UUID REFERENCES nko_bounding_boxes(id),
    text_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trigger_detections_updated_at
BEFORE UPDATE ON nko_detections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger to update frame detection stats
CREATE OR REPLACE FUNCTION update_frame_detection_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE nko_frames
    SET 
        has_nko = TRUE,
        detection_count = (SELECT COUNT(*) FROM nko_detections WHERE frame_id = NEW.frame_id),
        confidence = (SELECT MAX(confidence) FROM nko_detections WHERE frame_id = NEW.frame_id)
    WHERE id = NEW.frame_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_frame_detection_stats
AFTER INSERT OR UPDATE ON nko_detections
FOR EACH ROW
EXECUTE FUNCTION update_frame_detection_stats();

-- ============================================================
-- MIGRATION 004: LINGUISTIC LAYER
-- ============================================================

CREATE TABLE nko_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word TEXT NOT NULL UNIQUE,
    word_normalized TEXT NOT NULL,
    latin TEXT,
    latin_variants TEXT[] DEFAULT '{}',
    meaning_primary TEXT,
    meanings TEXT[] DEFAULT '{}',
    definition TEXT,
    pos TEXT CHECK (pos IN (
        'noun', 'verb', 'adjective', 'adverb', 'pronoun',
        'conjunction', 'preposition', 'postposition', 'interjection', 
        'particle', 'determiner', 'number', 'letter', 'phrase', 'affix'
    )),
    root_word_id UUID REFERENCES nko_vocabulary(id),
    plural_form TEXT,
    singular_form TEXT,
    verb_conjugations JSONB,
    verb_class TEXT,
    noun_class TEXT,
    gender TEXT CHECK (gender IN ('masculine', 'feminine', 'neuter', 'none')),
    dialects TEXT[] DEFAULT '{}',
    variants JSONB DEFAULT '{}',
    is_loanword BOOLEAN DEFAULT FALSE,
    loanword_source TEXT,
    frequency INTEGER DEFAULT 0,
    frequency_rank INTEGER,
    category TEXT CHECK (category IN (
        'basic', 'common', 'intermediate', 'advanced', 
        'academic', 'technical', 'literary', 'colloquial', 'archaic'
    )),
    cefr_level TEXT CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    difficulty_score FLOAT CHECK (difficulty_score BETWEEN 0.0 AND 1.0),
    topics TEXT[] DEFAULT '{}',
    learn_count INTEGER DEFAULT 0,
    learn_mean FLOAT DEFAULT 0.0,
    learn_m2 FLOAT DEFAULT 0.0,
    ipa_transcription TEXT,
    audio_url TEXT,
    tone_pattern TEXT,
    status TEXT DEFAULT 'unverified' CHECK (status IN (
        'unverified', 'verified', 'disputed', 'deprecated', 'merged'
    )),
    merged_into_id UUID REFERENCES nko_vocabulary(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_vocabulary IS 'Master N''Ko vocabulary dictionary';

CREATE TABLE nko_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nko_text TEXT NOT NULL,
    nko_text_normalized TEXT,
    latin_text TEXT,
    english_text TEXT,
    french_text TEXT,
    arabic_text TEXT,
    vocabulary_ids UUID[] DEFAULT '{}',
    detection_id UUID REFERENCES nko_detections(id) ON DELETE SET NULL,
    source_id UUID REFERENCES nko_sources(id) ON DELETE SET NULL,
    frame_id UUID REFERENCES nko_frames(id) ON DELETE SET NULL,
    text_type TEXT CHECK (text_type IN (
        'word', 'phrase', 'sentence', 'paragraph', 'dialogue', 'proverb'
    )),
    context_type TEXT,
    formality TEXT CHECK (formality IN ('formal', 'informal', 'neutral', 'literary')),
    register TEXT CHECK (register IN ('spoken', 'written', 'both')),
    confidence FLOAT DEFAULT 0.0,
    validated BOOLEAN DEFAULT FALSE,
    validation_score FLOAT,
    validation_count INTEGER DEFAULT 0,
    correction_count INTEGER DEFAULT 0,
    is_training_sample BOOLEAN DEFAULT FALSE,
    is_validation_sample BOOLEAN DEFAULT FALSE,
    is_test_sample BOOLEAN DEFAULT FALSE,
    quality_tier TEXT CHECK (quality_tier IN ('gold', 'silver', 'bronze', 'raw')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_translations IS 'N''Ko translation pairs with multiple target languages';

CREATE TABLE nko_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    nko_sentence TEXT NOT NULL,
    latin_sentence TEXT,
    english_sentence TEXT,
    french_sentence TEXT,
    word_start_pos INTEGER,
    word_end_pos INTEGER,
    source_id UUID REFERENCES nko_sources(id) ON DELETE SET NULL,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE SET NULL,
    context_note TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nko_phonetics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    ipa TEXT NOT NULL,
    ipa_broad TEXT,
    ipa_narrow TEXT,
    tone_pattern TEXT,
    tone_marks TEXT,
    audio_url TEXT,
    audio_duration_ms INTEGER,
    syllables TEXT[],
    syllable_count INTEGER,
    dialect TEXT,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nko_grammar_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    rule_category TEXT CHECK (rule_category IN (
        'morphology', 'syntax', 'phonology', 'tone', 
        'noun_class', 'verb_conjugation', 'word_order', 'agreement'
    )),
    description TEXT NOT NULL,
    pattern TEXT,
    pattern_nko TEXT,
    examples JSONB DEFAULT '[]',
    exceptions JSONB DEFAULT '[]',
    related_vocabulary_ids UUID[] DEFAULT '{}',
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    prerequisite_rule_ids UUID[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nko_word_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    word_id UUID NOT NULL REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    related_word_id UUID NOT NULL REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'synonym', 'antonym', 'hypernym', 'hyponym',
        'meronym', 'holonym', 'derived', 'compound',
        'related', 'see_also'
    )),
    strength FLOAT DEFAULT 1.0 CHECK (strength BETWEEN 0.0 AND 1.0),
    is_bidirectional BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(word_id, related_word_id, relationship_type)
);

CREATE TRIGGER trigger_vocabulary_updated_at
BEFORE UPDATE ON nko_vocabulary
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_translations_updated_at
BEFORE UPDATE ON nko_translations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_grammar_rules_updated_at
BEFORE UPDATE ON nko_grammar_rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- MIGRATION 005: USER LAYER
-- ============================================================

CREATE TABLE nko_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,
    anonymous_id TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    native_language TEXT,
    native_languages TEXT[] DEFAULT '{}',
    learning_languages TEXT[] DEFAULT '{}',
    nko_proficiency TEXT CHECK (nko_proficiency IN (
        'none', 'beginner', 'elementary', 'intermediate', 
        'upper_intermediate', 'advanced', 'native'
    )),
    manding_dialects TEXT[] DEFAULT '{}',
    role TEXT DEFAULT 'learner' CHECK (role IN (
        'learner', 'contributor', 'validator', 'expert', 'moderator', 'admin'
    )),
    trust_score FLOAT DEFAULT 0.5 CHECK (trust_score BETWEEN 0.0 AND 1.0),
    reputation_points INTEGER DEFAULT 0,
    corrections_submitted INTEGER DEFAULT 0,
    corrections_accepted INTEGER DEFAULT 0,
    corrections_rejected INTEGER DEFAULT 0,
    validations_count INTEGER DEFAULT 0,
    validations_correct INTEGER DEFAULT 0,
    vocabulary_learned INTEGER DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    total_learning_time_ms BIGINT DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    banned_until TIMESTAMPTZ,
    ban_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_users IS 'User profiles for learners and contributors';

CREATE TABLE nko_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID REFERENCES nko_detections(id) ON DELETE CASCADE,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    example_id UUID REFERENCES nko_examples(id) ON DELETE CASCADE,
    field_corrected TEXT NOT NULL,
    original_value TEXT NOT NULL,
    corrected_value TEXT NOT NULL,
    correction_note TEXT,
    correction_type TEXT CHECK (correction_type IN (
        'typo', 'mistranslation', 'missing_content', 'wrong_content',
        'formatting', 'grammar', 'spelling', 'tone_mark', 'other'
    )),
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'approved', 'rejected', 
        'superseded', 'withdrawn'
    )),
    reviewed_by UUID REFERENCES nko_users(id),
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    rejection_reason TEXT,
    confidence FLOAT,
    community_votes INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_corrections IS 'User-submitted corrections to language data';

CREATE TABLE nko_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID REFERENCES nko_detections(id) ON DELETE CASCADE,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE CASCADE,
    correction_id UUID REFERENCES nko_corrections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES nko_users(id) ON DELETE CASCADE,
    vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'unsure')),
    confidence FLOAT DEFAULT 0.5,
    feedback_note TEXT,
    issues_found TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(detection_id, user_id),
    UNIQUE(translation_id, user_id),
    UNIQUE(correction_id, user_id)
);

CREATE TABLE nko_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'source', 'frame', 'detection', 'vocabulary', 
        'translation', 'example', 'session'
    )),
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_type TEXT CHECK (feedback_type IN (
        'quality', 'accuracy', 'usefulness', 'difficulty', 'bug', 'suggestion'
    )),
    feedback_text TEXT,
    is_addressed BOOLEAN DEFAULT FALSE,
    addressed_by UUID REFERENCES nko_users(id),
    addressed_at TIMESTAMPTZ,
    response_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nko_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    report_type TEXT NOT NULL CHECK (report_type IN (
        'inappropriate', 'incorrect', 'duplicate', 'spam',
        'copyright', 'offensive', 'other'
    )),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'investigating', 'resolved', 'dismissed'
    )),
    resolved_by UUID REFERENCES nko_users(id),
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON nko_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_corrections_updated_at
BEFORE UPDATE ON nko_corrections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger to update user stats on corrections
CREATE OR REPLACE FUNCTION update_user_correction_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE nko_users
        SET corrections_submitted = corrections_submitted + 1,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        IF NEW.status = 'approved' THEN
            UPDATE nko_users
            SET corrections_accepted = corrections_accepted + 1,
                trust_score = LEAST(1.0, trust_score + 0.01),
                reputation_points = reputation_points + 10,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        ELSIF NEW.status = 'rejected' THEN
            UPDATE nko_users
            SET corrections_rejected = corrections_rejected + 1,
                trust_score = GREATEST(0.0, trust_score - 0.02),
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_correction_stats
AFTER INSERT OR UPDATE ON nko_corrections
FOR EACH ROW
EXECUTE FUNCTION update_user_correction_stats();

-- ============================================================
-- MIGRATION 006: TRAJECTORY LAYER
-- ============================================================

CREATE TABLE nko_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    anonymous_id TEXT,
    session_type TEXT NOT NULL CHECK (session_type IN (
        'realtime_learning', 'batch_review', 'practice', 'assessment', 'exploration', 'correction'
    )),
    source_id UUID REFERENCES nko_sources(id) ON DELETE SET NULL,
    vocabulary_focus_ids UUID[] DEFAULT '{}',
    topic_focus TEXT[] DEFAULT '{}',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_ms BIGINT,
    active_time_ms BIGINT,
    frames_processed INTEGER DEFAULT 0,
    detections_viewed INTEGER DEFAULT 0,
    vocabulary_encountered INTEGER DEFAULT 0,
    vocabulary_learned INTEGER DEFAULT 0,
    vocabulary_reviewed INTEGER DEFAULT 0,
    corrections_made INTEGER DEFAULT 0,
    confidence_count INTEGER DEFAULT 0,
    confidence_mean FLOAT DEFAULT 0.0,
    confidence_m2 FLOAT DEFAULT 0.0,
    current_phase TEXT CHECK (current_phase IN (
        'exploration', 'consolidation', 'synthesis', 'debugging', 'planning'
    )),
    phase_transitions JSONB DEFAULT '[]',
    engagement_score FLOAT,
    completion_rate FLOAT,
    device_type TEXT,
    platform TEXT,
    app_version TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_sessions IS 'Learning sessions tracking user study activities';

CREATE TABLE nko_learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES nko_sessions(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE SET NULL,
    detection_id UUID REFERENCES nko_detections(id) ON DELETE SET NULL,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'view', 'learn', 'review', 'correct', 'validate',
        'quiz_correct', 'quiz_incorrect', 'skip', 'bookmark', 'share'
    )),
    timestamp_ms BIGINT NOT NULL,
    duration_ms INTEGER,
    was_correct BOOLEAN,
    confidence FLOAT,
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nko_trajectories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES nko_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    name TEXT,
    description TEXT,
    trajectory_type TEXT CHECK (trajectory_type IN (
        'learning_path', 'content_flow', 'error_pattern', 'mastery_path'
    )),
    max_depth INTEGER DEFAULT 0,
    total_nodes INTEGER DEFAULT 0,
    avg_homogeneity FLOAT DEFAULT 1.0,
    total_complexity INTEGER DEFAULT 0,
    avg_temporal FLOAT DEFAULT 0.5,
    dominant_phase TEXT CHECK (dominant_phase IN (
        'exploration', 'consolidation', 'synthesis', 'debugging', 'planning'
    )),
    phase_distribution JSONB DEFAULT '{}',
    phase_transition_count INTEGER DEFAULT 0,
    avg_salience FLOAT DEFAULT 0.5,
    high_salience_count INTEGER DEFAULT 0,
    terminal_node_count INTEGER DEFAULT 0,
    coherence_score FLOAT,
    coverage_score FLOAT,
    efficiency_score FLOAT,
    is_complete BOOLEAN DEFAULT FALSE,
    is_successful BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_trajectories IS 'Learning trajectories compatible with cc-rag++ 4D/5D DLM';

CREATE TABLE nko_trajectory_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trajectory_id UUID NOT NULL REFERENCES nko_trajectories(id) ON DELETE CASCADE,
    learning_event_id UUID REFERENCES nko_learning_events(id) ON DELETE SET NULL,
    detection_id UUID REFERENCES nko_detections(id) ON DELETE SET NULL,
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE SET NULL,
    node_index INTEGER NOT NULL,
    trajectory_depth INTEGER DEFAULT 0,
    trajectory_sibling_order INTEGER DEFAULT 0,
    trajectory_homogeneity FLOAT DEFAULT 1.0 CHECK (trajectory_homogeneity BETWEEN 0.0 AND 1.0),
    trajectory_temporal FLOAT DEFAULT 0.0 CHECK (trajectory_temporal BETWEEN 0.0 AND 1.0),
    trajectory_complexity INTEGER DEFAULT 1,
    trajectory_phase TEXT CHECK (trajectory_phase IN (
        'exploration', 'consolidation', 'synthesis', 'debugging', 'planning'
    )),
    trajectory_phase_confidence FLOAT DEFAULT 0.0 CHECK (trajectory_phase_confidence BETWEEN 0.0 AND 1.0),
    salience_score FLOAT DEFAULT 0.5 CHECK (salience_score BETWEEN 0.0 AND 1.0),
    is_phase_transition BOOLEAN DEFAULT FALSE,
    is_terminal BOOLEAN DEFAULT FALSE,
    parent_node_id UUID REFERENCES nko_trajectory_nodes(id),
    child_count INTEGER DEFAULT 0,
    content_preview TEXT,
    content_type TEXT,
    outcome TEXT CHECK (outcome IN ('success', 'partial', 'failure', 'skip', 'unknown')),
    timestamp_ms BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_trajectory_nodes IS 'Individual nodes in learning trajectories (cc-rag++ 4D/5D DLM)';

CREATE TABLE nko_welford_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    user_id UUID REFERENCES nko_users(id) ON DELETE CASCADE,
    stat_type TEXT NOT NULL CHECK (stat_type IN (
        'confidence', 'response_time', 'accuracy', 'retention'
    )),
    count INTEGER DEFAULT 0,
    mean FLOAT DEFAULT 0.0,
    m2 FLOAT DEFAULT 0.0,
    variance FLOAT DEFAULT 0.0,
    std_dev FLOAT DEFAULT 0.0,
    ci_lower FLOAT,
    ci_upper FLOAT,
    min_value FLOAT,
    max_value FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vocabulary_id, user_id, stat_type)
);

COMMENT ON TABLE nko_welford_stats IS 'Running statistics using Welford algorithm';

CREATE TRIGGER trigger_sessions_updated_at
BEFORE UPDATE ON nko_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_trajectories_updated_at
BEFORE UPDATE ON nko_trajectories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_welford_stats_updated_at
BEFORE UPDATE ON nko_welford_stats
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Function to update Welford stats
CREATE OR REPLACE FUNCTION update_welford_stats(
    p_vocabulary_id UUID,
    p_user_id UUID,
    p_stat_type TEXT,
    p_new_value FLOAT
) RETURNS void AS $$
DECLARE
    v_count INTEGER;
    v_mean FLOAT;
    v_m2 FLOAT;
    v_delta FLOAT;
    v_delta2 FLOAT;
    v_variance FLOAT;
    v_std_dev FLOAT;
BEGIN
    INSERT INTO nko_welford_stats (vocabulary_id, user_id, stat_type)
    VALUES (p_vocabulary_id, p_user_id, p_stat_type)
    ON CONFLICT (vocabulary_id, user_id, stat_type) DO NOTHING;
    
    SELECT count, mean, m2 INTO v_count, v_mean, v_m2
    FROM nko_welford_stats
    WHERE vocabulary_id = p_vocabulary_id 
      AND user_id = p_user_id 
      AND stat_type = p_stat_type;
    
    v_count := v_count + 1;
    v_delta := p_new_value - v_mean;
    v_mean := v_mean + v_delta / v_count;
    v_delta2 := p_new_value - v_mean;
    v_m2 := v_m2 + v_delta * v_delta2;
    
    IF v_count > 1 THEN
        v_variance := v_m2 / (v_count - 1);
        v_std_dev := SQRT(v_variance);
    ELSE
        v_variance := 0;
        v_std_dev := 0;
    END IF;
    
    UPDATE nko_welford_stats
    SET 
        count = v_count,
        mean = v_mean,
        m2 = v_m2,
        variance = v_variance,
        std_dev = v_std_dev,
        ci_lower = v_mean - 1.96 * v_std_dev / SQRT(v_count),
        ci_upper = v_mean + 1.96 * v_std_dev / SQRT(v_count),
        min_value = LEAST(COALESCE(min_value, p_new_value), p_new_value),
        max_value = GREATEST(COALESCE(max_value, p_new_value), p_new_value),
        updated_at = NOW()
    WHERE vocabulary_id = p_vocabulary_id 
      AND user_id = p_user_id 
      AND stat_type = p_stat_type;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session on learning event
CREATE OR REPLACE FUNCTION update_session_on_event()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE nko_sessions
    SET 
        vocabulary_encountered = vocabulary_encountered + CASE WHEN NEW.vocabulary_id IS NOT NULL THEN 1 ELSE 0 END,
        vocabulary_learned = vocabulary_learned + CASE WHEN NEW.event_type = 'learn' THEN 1 ELSE 0 END,
        vocabulary_reviewed = vocabulary_reviewed + CASE WHEN NEW.event_type = 'review' THEN 1 ELSE 0 END,
        corrections_made = corrections_made + CASE WHEN NEW.event_type = 'correct' THEN 1 ELSE 0 END,
        updated_at = NOW()
    WHERE id = NEW.session_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_on_event
AFTER INSERT ON nko_learning_events
FOR EACH ROW
EXECUTE FUNCTION update_session_on_event();

-- ============================================================
-- MIGRATION 007: EMBEDDING LAYER
-- ============================================================

CREATE TABLE nko_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE CASCADE,
    detection_id UUID REFERENCES nko_detections(id) ON DELETE CASCADE,
    example_id UUID REFERENCES nko_examples(id) ON DELETE CASCADE,
    embedding vector(768),
    model_name TEXT NOT NULL,
    model_version TEXT,
    model_dimensions INTEGER DEFAULT 768,
    content_type TEXT CHECK (content_type IN (
        'word', 'phrase', 'sentence', 'paragraph', 
        'detection', 'definition', 'example'
    )),
    content_text TEXT,
    content_language TEXT DEFAULT 'nko',
    is_valid BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_embeddings IS 'Vector embeddings for semantic search and RAG';

-- Vector similarity indexes
CREATE INDEX idx_embeddings_vector 
ON nko_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

CREATE INDEX idx_embeddings_vector_exact
ON nko_embeddings
USING hnsw (embedding vector_cosine_ops);

CREATE TABLE nko_embedding_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_name TEXT,
    cluster_description TEXT,
    centroid vector(768),
    member_count INTEGER DEFAULT 0,
    avg_distance FLOAT,
    max_distance FLOAT,
    semantic_category TEXT,
    auto_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nko_embedding_cluster_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id UUID NOT NULL REFERENCES nko_embedding_clusters(id) ON DELETE CASCADE,
    embedding_id UUID NOT NULL REFERENCES nko_embeddings(id) ON DELETE CASCADE,
    distance FLOAT,
    confidence FLOAT DEFAULT 1.0,
    is_core_member BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cluster_id, embedding_id)
);

-- Function to find similar embeddings
CREATE OR REPLACE FUNCTION find_similar_embeddings(
    query_embedding vector(768),
    match_count INTEGER DEFAULT 10,
    similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    embedding_id UUID,
    vocabulary_id UUID,
    translation_id UUID,
    content_text TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id as embedding_id,
        e.vocabulary_id,
        e.translation_id,
        e.content_text,
        1 - (e.embedding <=> query_embedding) as similarity
    FROM nko_embeddings e
    WHERE 1 - (e.embedding <=> query_embedding) >= similarity_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to find similar vocabulary
CREATE OR REPLACE FUNCTION find_similar_vocabulary(
    query_text TEXT,
    query_embedding vector(768),
    match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    vocabulary_id UUID,
    word TEXT,
    latin TEXT,
    meaning TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id as vocabulary_id,
        v.word,
        v.latin,
        v.meaning_primary as meaning,
        1 - (e.embedding <=> query_embedding) as similarity
    FROM nko_embeddings e
    JOIN nko_vocabulary v ON e.vocabulary_id = v.id
    WHERE e.vocabulary_id IS NOT NULL
    ORDER BY e.embedding <=> query_embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_embeddings_updated_at
BEFORE UPDATE ON nko_embeddings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_clusters_updated_at
BEFORE UPDATE ON nko_embedding_clusters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- MIGRATION 008: INDEXES
-- ============================================================

-- Source Layer Indexes
CREATE INDEX IF NOT EXISTS idx_sources_status ON nko_sources(status);
CREATE INDEX IF NOT EXISTS idx_sources_type_external ON nko_sources(source_type, external_id);
CREATE INDEX IF NOT EXISTS idx_sources_with_nko ON nko_sources(nko_frame_count DESC) WHERE nko_frame_count > 0;
CREATE INDEX IF NOT EXISTS idx_sources_created ON nko_sources(created_at DESC);

-- Frame Layer Indexes
CREATE INDEX IF NOT EXISTS idx_frames_source ON nko_frames(source_id);
CREATE INDEX IF NOT EXISTS idx_frames_has_nko ON nko_frames(source_id, frame_index) WHERE has_nko = TRUE;
CREATE INDEX IF NOT EXISTS idx_frames_timestamp ON nko_frames(source_id, timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_frames_confidence ON nko_frames(confidence DESC) WHERE has_nko = TRUE AND confidence > 0.8;

-- Detection Layer Indexes
CREATE INDEX IF NOT EXISTS idx_detections_frame ON nko_detections(frame_id);
CREATE INDEX IF NOT EXISTS idx_detections_confidence ON nko_detections(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_detections_nko_text ON nko_detections USING gin(to_tsvector('simple', nko_text));
CREATE INDEX IF NOT EXISTS idx_detections_status ON nko_detections(status);
CREATE INDEX IF NOT EXISTS idx_detections_validated ON nko_detections(validated_at DESC) WHERE status = 'validated';
CREATE INDEX IF NOT EXISTS idx_detections_context ON nko_detections(context_type) WHERE context_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_characters_detection ON nko_characters(detection_id);
CREATE INDEX IF NOT EXISTS idx_characters_type ON nko_characters(char_type);

-- Vocabulary Layer Indexes
CREATE INDEX IF NOT EXISTS idx_vocabulary_word ON nko_vocabulary(word);
CREATE INDEX IF NOT EXISTS idx_vocabulary_latin ON nko_vocabulary(latin);
CREATE INDEX IF NOT EXISTS idx_vocabulary_frequency ON nko_vocabulary(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_vocabulary_pos ON nko_vocabulary(pos) WHERE pos IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vocabulary_cefr ON nko_vocabulary(cefr_level) WHERE cefr_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vocabulary_status ON nko_vocabulary(status);
CREATE INDEX IF NOT EXISTS idx_vocabulary_meaning ON nko_vocabulary USING gin(to_tsvector('english', COALESCE(meaning_primary, '') || ' ' || COALESCE(definition, '')));

-- Translation Layer Indexes
CREATE INDEX IF NOT EXISTS idx_translations_quality ON nko_translations(quality_tier);
CREATE INDEX IF NOT EXISTS idx_translations_training ON nko_translations(id) WHERE is_training_sample = TRUE;
CREATE INDEX IF NOT EXISTS idx_translations_validated ON nko_translations(validation_score DESC) WHERE validated = TRUE;
CREATE INDEX IF NOT EXISTS idx_translations_english ON nko_translations USING gin(to_tsvector('english', english_text));
CREATE INDEX IF NOT EXISTS idx_examples_vocabulary ON nko_examples(vocabulary_id);

-- User Layer Indexes
CREATE INDEX IF NOT EXISTS idx_users_auth ON nko_users(auth_id) WHERE auth_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_anonymous ON nko_users(anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON nko_users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON nko_users(last_active_at DESC) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_trust ON nko_users(trust_score DESC) WHERE role IN ('contributor', 'validator', 'expert');
CREATE INDEX IF NOT EXISTS idx_corrections_status ON nko_corrections(status);
CREATE INDEX IF NOT EXISTS idx_corrections_pending ON nko_corrections(created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_corrections_user ON nko_corrections(user_id);

-- Trajectory Layer Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user ON nko_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_source ON nko_sessions(source_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON nko_sessions(started_at DESC) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_phase ON nko_sessions(current_phase);
CREATE INDEX IF NOT EXISTS idx_events_session ON nko_learning_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_vocabulary ON nko_learning_events(vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_events_timeline ON nko_learning_events(session_id, timestamp_ms);
CREATE INDEX IF NOT EXISTS idx_trajectories_session ON nko_trajectories(session_id);
CREATE INDEX IF NOT EXISTS idx_trajectories_user ON nko_trajectories(user_id);
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_trajectory ON nko_trajectory_nodes(trajectory_id);
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_phase ON nko_trajectory_nodes(trajectory_phase);
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_salience ON nko_trajectory_nodes(salience_score DESC) WHERE salience_score > 0.7;
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_transitions ON nko_trajectory_nodes(trajectory_id) WHERE is_phase_transition = TRUE;
CREATE INDEX IF NOT EXISTS idx_trajectory_nodes_terminal ON nko_trajectory_nodes(trajectory_id) WHERE is_terminal = TRUE;
CREATE INDEX IF NOT EXISTS idx_welford_vocab_user ON nko_welford_stats(vocabulary_id, user_id);

-- Embedding Layer Indexes
CREATE INDEX IF NOT EXISTS idx_embeddings_vocabulary ON nko_embeddings(vocabulary_id) WHERE vocabulary_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_embeddings_translation ON nko_embeddings(translation_id) WHERE translation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_embeddings_model ON nko_embeddings(model_name);
CREATE INDEX IF NOT EXISTS idx_cluster_members_cluster ON nko_embedding_cluster_members(cluster_id);
CREATE INDEX IF NOT EXISTS idx_cluster_members_embedding ON nko_embedding_cluster_members(embedding_id);

-- ============================================================
-- MIGRATION 009: ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE nko_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_bounding_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_phonetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_grammar_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_word_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_trajectories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_trajectory_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_welford_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_embedding_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_embedding_cluster_members ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_user_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM nko_users
    WHERE auth_id = auth.uid()::TEXT;
    RETURN user_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_user_role(ARRAY['admin', 'moderator']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public read access policies
CREATE POLICY "Sources are viewable by everyone" ON nko_sources FOR SELECT USING (true);
CREATE POLICY "Frames are viewable by everyone" ON nko_frames FOR SELECT USING (true);
CREATE POLICY "Detections are viewable by everyone" ON nko_detections FOR SELECT USING (true);
CREATE POLICY "Characters are viewable by everyone" ON nko_characters FOR SELECT USING (true);
CREATE POLICY "Bounding boxes are viewable by everyone" ON nko_bounding_boxes FOR SELECT USING (true);
CREATE POLICY "Vocabulary is viewable by everyone" ON nko_vocabulary FOR SELECT USING (true);
CREATE POLICY "Translations are viewable by everyone" ON nko_translations FOR SELECT USING (true);
CREATE POLICY "Examples are viewable by everyone" ON nko_examples FOR SELECT USING (true);
CREATE POLICY "Phonetics viewable by everyone" ON nko_phonetics FOR SELECT USING (true);
CREATE POLICY "Grammar rules viewable by everyone" ON nko_grammar_rules FOR SELECT USING (true);
CREATE POLICY "Word relationships viewable by everyone" ON nko_word_relationships FOR SELECT USING (true);
CREATE POLICY "Corrections are viewable by everyone" ON nko_corrections FOR SELECT USING (true);
CREATE POLICY "Validations are viewable by everyone" ON nko_validations FOR SELECT USING (true);
CREATE POLICY "Feedback is viewable by everyone" ON nko_feedback FOR SELECT USING (true);
CREATE POLICY "Embeddings are viewable by everyone" ON nko_embeddings FOR SELECT USING (true);
CREATE POLICY "Clusters are viewable by everyone" ON nko_embedding_clusters FOR SELECT USING (true);
CREATE POLICY "Cluster members are viewable by everyone" ON nko_embedding_cluster_members FOR SELECT USING (true);

-- User self-access policies
CREATE POLICY "Basic user info is public" ON nko_users FOR SELECT USING (true);
CREATE POLICY "Users can create sessions" ON nko_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can create events" ON nko_learning_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can create trajectories" ON nko_trajectories FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can create trajectory nodes" ON nko_trajectory_nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "System can manage welford stats" ON nko_welford_stats FOR ALL USING (true) WITH CHECK (true);

-- Authenticated user policies
CREATE POLICY "Authenticated users can submit corrections" ON nko_corrections FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can validate" ON nko_validations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can submit feedback" ON nko_feedback FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can report" ON nko_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users insertable by service" ON nko_users FOR INSERT WITH CHECK (true);

-- ============================================================
-- COMPLETE! Schema created successfully.
-- ============================================================

