-- Migration 006: Trajectory Layer Tables
-- N'Ko Language Learning Database
--
-- Learning sessions, trajectories, and trajectory nodes.
-- Compatible with cc-rag++ 4D/5D DLM coordinate system.

-- ============================================
-- nko_sessions: Learning sessions
-- ============================================
CREATE TABLE nko_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User (optional - can be anonymous)
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    anonymous_id TEXT, -- For unauthenticated users
    
    -- Session type
    session_type TEXT NOT NULL CHECK (session_type IN (
        'realtime_learning',  -- Watching AI learn in real-time
        'batch_review',       -- Reviewing batch processing results
        'practice',           -- Interactive practice session
        'assessment',         -- Testing/quiz session
        'exploration',        -- Free exploration
        'correction'          -- Correction/validation session
    )),
    
    -- What is being studied
    source_id UUID REFERENCES nko_sources(id) ON DELETE SET NULL,
    vocabulary_focus_ids UUID[] DEFAULT '{}', -- Specific vocabulary being studied
    topic_focus TEXT[] DEFAULT '{}', -- Topics being covered
    
    -- Session timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_ms BIGINT,
    active_time_ms BIGINT, -- Time actively engaged (not idle)
    
    -- Frame/content statistics
    frames_processed INTEGER DEFAULT 0,
    detections_viewed INTEGER DEFAULT 0,
    vocabulary_encountered INTEGER DEFAULT 0,
    vocabulary_learned INTEGER DEFAULT 0, -- New words learned
    vocabulary_reviewed INTEGER DEFAULT 0, -- Known words reviewed
    corrections_made INTEGER DEFAULT 0,
    
    -- Welford stats for confidence tracking
    confidence_count INTEGER DEFAULT 0,
    confidence_mean FLOAT DEFAULT 0.0,
    confidence_m2 FLOAT DEFAULT 0.0,
    
    -- Phase tracking (cc-rag++ compatible)
    current_phase TEXT CHECK (current_phase IN (
        'exploration',    -- Discovering new content
        'consolidation',  -- Reinforcing learned content
        'synthesis',      -- Connecting concepts
        'debugging',      -- Correcting errors
        'planning'        -- Organizing learning path
    )),
    phase_transitions JSONB DEFAULT '[]', -- [{phase, timestamp_ms, trigger, confidence}]
    
    -- Session quality
    engagement_score FLOAT, -- 0-1, based on interactions
    completion_rate FLOAT, -- % of intended content covered
    
    -- Device/context
    device_type TEXT,
    platform TEXT,
    app_version TEXT,
    
    -- Session metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_sessions IS 'Learning sessions tracking user study activities';
COMMENT ON COLUMN nko_sessions.confidence_m2 IS 'Welford M2 value for computing variance';
COMMENT ON COLUMN nko_sessions.phase_transitions IS 'Array of phase changes during session';

-- ============================================
-- nko_learning_events: Individual interactions
-- ============================================
CREATE TABLE nko_learning_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES nko_sessions(id) ON DELETE CASCADE,
    
    -- What was interacted with
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE SET NULL,
    detection_id UUID REFERENCES nko_detections(id) ON DELETE SET NULL,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE SET NULL,
    
    -- Event type
    event_type TEXT NOT NULL CHECK (event_type IN (
        'view',           -- Content was viewed
        'learn',          -- New content learned
        'review',         -- Known content reviewed
        'correct',        -- User made a correction
        'validate',       -- User validated content
        'quiz_correct',   -- Answered quiz correctly
        'quiz_incorrect', -- Answered quiz incorrectly
        'skip',           -- Skipped content
        'bookmark',       -- Bookmarked for later
        'share'           -- Shared content
    )),
    
    -- Timing
    timestamp_ms BIGINT NOT NULL,
    duration_ms INTEGER, -- How long spent on this item
    
    -- Outcome
    was_correct BOOLEAN,
    confidence FLOAT, -- User's reported confidence
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_learning_events IS 'Individual learning interactions within sessions';

-- ============================================
-- nko_trajectories: cc-rag++ compatible trajectories
-- ============================================
CREATE TABLE nko_trajectories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES nko_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    
    -- Trajectory identification
    name TEXT,
    description TEXT,
    trajectory_type TEXT CHECK (trajectory_type IN (
        'learning_path',   -- User's learning journey
        'content_flow',    -- How content was consumed
        'error_pattern',   -- Pattern of mistakes
        'mastery_path'     -- Path to mastery
    )),
    
    -- 4D/5D DLM coordinates (aggregated for trajectory)
    max_depth INTEGER DEFAULT 0,
    total_nodes INTEGER DEFAULT 0,
    avg_homogeneity FLOAT DEFAULT 1.0,
    total_complexity INTEGER DEFAULT 0,
    avg_temporal FLOAT DEFAULT 0.5,
    
    -- Phase summary
    dominant_phase TEXT CHECK (dominant_phase IN (
        'exploration', 'consolidation', 'synthesis', 'debugging', 'planning'
    )),
    phase_distribution JSONB DEFAULT '{}', -- {exploration: 0.3, consolidation: 0.5, ...}
    phase_transition_count INTEGER DEFAULT 0,
    
    -- Salience metrics
    avg_salience FLOAT DEFAULT 0.5,
    high_salience_count INTEGER DEFAULT 0,
    terminal_node_count INTEGER DEFAULT 0,
    
    -- Quality metrics
    coherence_score FLOAT, -- How well nodes connect
    coverage_score FLOAT, -- Content coverage
    efficiency_score FLOAT, -- Learning efficiency
    
    -- Status
    is_complete BOOLEAN DEFAULT FALSE,
    is_successful BOOLEAN, -- Did user achieve goals?
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_trajectories IS 'Learning trajectories compatible with cc-rag++ 4D/5D DLM';

-- ============================================
-- nko_trajectory_nodes: Individual trajectory points
-- ============================================
CREATE TABLE nko_trajectory_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trajectory_id UUID NOT NULL REFERENCES nko_trajectories(id) ON DELETE CASCADE,
    
    -- What this node represents
    learning_event_id UUID REFERENCES nko_learning_events(id) ON DELETE SET NULL,
    detection_id UUID REFERENCES nko_detections(id) ON DELETE SET NULL,
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE SET NULL,
    
    -- Node ordering
    node_index INTEGER NOT NULL, -- Position in trajectory
    
    -- 4D DLM Coordinates (cc-rag++ compatible)
    trajectory_depth INTEGER DEFAULT 0,
    trajectory_sibling_order INTEGER DEFAULT 0,
    trajectory_homogeneity FLOAT DEFAULT 1.0 
        CHECK (trajectory_homogeneity BETWEEN 0.0 AND 1.0),
    trajectory_temporal FLOAT DEFAULT 0.0 
        CHECK (trajectory_temporal BETWEEN 0.0 AND 1.0),
    
    -- 5D Extension
    trajectory_complexity INTEGER DEFAULT 1,
    
    -- Phase inference
    trajectory_phase TEXT CHECK (trajectory_phase IN (
        'exploration', 'consolidation', 'synthesis', 'debugging', 'planning'
    )),
    trajectory_phase_confidence FLOAT DEFAULT 0.0 
        CHECK (trajectory_phase_confidence BETWEEN 0.0 AND 1.0),
    
    -- Salience (importance for bounded forgetting)
    salience_score FLOAT DEFAULT 0.5 
        CHECK (salience_score BETWEEN 0.0 AND 1.0),
    is_phase_transition BOOLEAN DEFAULT FALSE,
    is_terminal BOOLEAN DEFAULT FALSE,
    
    -- Graph structure
    parent_node_id UUID REFERENCES nko_trajectory_nodes(id),
    child_count INTEGER DEFAULT 0,
    
    -- Content summary
    content_preview TEXT, -- First 100 chars of content
    content_type TEXT, -- 'vocabulary', 'detection', 'translation'
    
    -- Outcome at this node
    outcome TEXT CHECK (outcome IN (
        'success', 'partial', 'failure', 'skip', 'unknown'
    )),
    
    -- Timestamps
    timestamp_ms BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_trajectory_nodes IS 'Individual nodes in learning trajectories (cc-rag++ 4D/5D DLM)';
COMMENT ON COLUMN nko_trajectory_nodes.trajectory_depth IS 'Distance from root (0 = starting point)';
COMMENT ON COLUMN nko_trajectory_nodes.trajectory_homogeneity IS 'Semantic similarity to parent (1.0 = continuation)';
COMMENT ON COLUMN nko_trajectory_nodes.trajectory_temporal IS 'Normalized timestamp within trajectory (0.0-1.0)';
COMMENT ON COLUMN nko_trajectory_nodes.salience_score IS 'Importance weight for bounded forgetting';

-- ============================================
-- nko_welford_stats: Running statistics per item
-- ============================================
CREATE TABLE nko_welford_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What these stats are for
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    user_id UUID REFERENCES nko_users(id) ON DELETE CASCADE,
    
    -- Stat type
    stat_type TEXT NOT NULL CHECK (stat_type IN (
        'confidence', 'response_time', 'accuracy', 'retention'
    )),
    
    -- Welford algorithm values
    count INTEGER DEFAULT 0,
    mean FLOAT DEFAULT 0.0,
    m2 FLOAT DEFAULT 0.0,
    
    -- Derived values (computed on update)
    variance FLOAT DEFAULT 0.0,
    std_dev FLOAT DEFAULT 0.0,
    
    -- Confidence interval (95%)
    ci_lower FLOAT,
    ci_upper FLOAT,
    
    -- Bounds
    min_value FLOAT,
    max_value FLOAT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One stat per user per vocabulary per type
    UNIQUE(vocabulary_id, user_id, stat_type)
);

COMMENT ON TABLE nko_welford_stats IS 'Running statistics using Welford algorithm';

-- ============================================
-- Function: Update Welford stats
-- ============================================
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
    -- Get or create the stats row
    INSERT INTO nko_welford_stats (vocabulary_id, user_id, stat_type)
    VALUES (p_vocabulary_id, p_user_id, p_stat_type)
    ON CONFLICT (vocabulary_id, user_id, stat_type) DO NOTHING;
    
    -- Get current values
    SELECT count, mean, m2 INTO v_count, v_mean, v_m2
    FROM nko_welford_stats
    WHERE vocabulary_id = p_vocabulary_id 
      AND user_id = p_user_id 
      AND stat_type = p_stat_type;
    
    -- Welford update
    v_count := v_count + 1;
    v_delta := p_new_value - v_mean;
    v_mean := v_mean + v_delta / v_count;
    v_delta2 := p_new_value - v_mean;
    v_m2 := v_m2 + v_delta * v_delta2;
    
    -- Compute derived values
    IF v_count > 1 THEN
        v_variance := v_m2 / (v_count - 1);
        v_std_dev := SQRT(v_variance);
    ELSE
        v_variance := 0;
        v_std_dev := 0;
    END IF;
    
    -- Update the row
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

-- ============================================
-- Trigger: Update session on learning event
-- ============================================
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

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
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

