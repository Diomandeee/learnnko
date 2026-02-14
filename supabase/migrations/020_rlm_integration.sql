-- ============================================================================
-- Migration: 020_rlm_integration.sql
-- Description: Add RLM (Recursive Language Model) integration tables
-- Author: Claude Code
-- Date: 2026-01-10
-- ============================================================================

-- This migration adds tables for:
-- 1. Tracking RLM recursion operations
-- 2. Storing 5D trajectory coordinates for training items
-- 3. Recording self-improvement feedback signals
-- 4. Managing optimized curriculum paths

-- ============================================================================
-- Table: nko_rlm_recursions
-- Purpose: Track all RLM recursive operations for analysis and debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS nko_rlm_recursions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Context: which pass and parent recursion (for tree structure)
  pass_number INTEGER NOT NULL CHECK (pass_number BETWEEN 1 AND 4),
  parent_recursion_id UUID REFERENCES nko_rlm_recursions(id) ON DELETE CASCADE,

  -- Recursion depth and branch (for parallel recursions)
  depth INTEGER NOT NULL DEFAULT 0 CHECK (depth >= 0),
  branch INTEGER NOT NULL DEFAULT 0 CHECK (branch >= 0),

  -- Strategy used for this recursion
  strategy TEXT NOT NULL CHECK (strategy IN (
    'peeking', 'grepping', 'partition_map', 'summarize', 'programmatic', 'auto'
  )),

  -- Metrics
  input_context_size INTEGER,
  output_quality_score FLOAT CHECK (output_quality_score BETWEEN 0 AND 1),

  -- Anticipation state at decision time
  commitment_level FLOAT CHECK (commitment_level BETWEEN 0 AND 1),
  uncertainty_level FLOAT CHECK (uncertainty_level BETWEEN 0 AND 1),
  action_taken TEXT NOT NULL CHECK (action_taken IN (
    'commit', 'recurse_single', 'recurse_branch', 'abort'
  )),

  -- Cost tracking
  tokens_consumed INTEGER,
  execution_time_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient tree traversal
CREATE INDEX IF NOT EXISTS idx_rlm_recursions_parent
  ON nko_rlm_recursions(parent_recursion_id);

-- Index for pass-based queries
CREATE INDEX IF NOT EXISTS idx_rlm_recursions_pass
  ON nko_rlm_recursions(pass_number, created_at DESC);

-- Index for strategy analysis
CREATE INDEX IF NOT EXISTS idx_rlm_recursions_strategy
  ON nko_rlm_recursions(strategy, pass_number);

COMMENT ON TABLE nko_rlm_recursions IS
  'Tracks RLM recursive operations for analysis, debugging, and self-improvement';

-- ============================================================================
-- Table: nko_trajectory_coordinates
-- Purpose: Store 5D trajectory coordinates for training items
-- ============================================================================

CREATE TABLE IF NOT EXISTS nko_trajectory_coordinates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Entity reference (polymorphic)
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'source', 'frame', 'detection', 'phrase', 'world', 'lesson', 'audio_segment'
  )),
  entity_id UUID NOT NULL,

  -- 5D Trajectory Coordinates
  temporal FLOAT NOT NULL DEFAULT 0 CHECK (temporal BETWEEN 0 AND 1),
  semantic FLOAT NOT NULL DEFAULT 0 CHECK (semantic BETWEEN 0 AND 1),
  depth INTEGER NOT NULL DEFAULT 0 CHECK (depth >= 0),
  homogeneity FLOAT NOT NULL DEFAULT 0 CHECK (homogeneity BETWEEN 0 AND 1),
  salience FLOAT NOT NULL DEFAULT 0 CHECK (salience BETWEEN 0 AND 1),

  -- Computed composite score (for sorting/filtering)
  pedagogical_score FLOAT GENERATED ALWAYS AS (
    -- Default weights: temporal=0.1, semantic=0.3, depth=0.1, homogeneity=0.2, salience=0.3
    temporal * 0.1 + semantic * 0.3 + (1.0 - (depth::float / 5.0)) * 0.1 + homogeneity * 0.2 + salience * 0.3
  ) STORED,

  -- Metadata
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique constraint: one coordinate set per entity
  CONSTRAINT unique_entity_coordinates UNIQUE (entity_type, entity_id)
);

-- Index for entity lookups
CREATE INDEX IF NOT EXISTS idx_trajectory_coords_entity
  ON nko_trajectory_coordinates(entity_type, entity_id);

-- Index for sorting by pedagogical score
CREATE INDEX IF NOT EXISTS idx_trajectory_coords_score
  ON nko_trajectory_coordinates(pedagogical_score DESC);

-- Index for high-salience items (frequently queried)
CREATE INDEX IF NOT EXISTS idx_trajectory_coords_salience
  ON nko_trajectory_coordinates(salience DESC) WHERE salience > 0.5;

COMMENT ON TABLE nko_trajectory_coordinates IS
  '5D trajectory coordinates for training items (temporal, semantic, depth, homogeneity, salience)';

-- ============================================================================
-- Table: nko_rlm_feedback
-- Purpose: Store feedback signals for self-improvement
-- ============================================================================

CREATE TABLE IF NOT EXISTS nko_rlm_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to the recursion that produced the decision
  recursion_id UUID NOT NULL REFERENCES nko_rlm_recursions(id) ON DELETE CASCADE,

  -- Feedback type
  feedback_type TEXT NOT NULL CHECK (feedback_type IN (
    'human_validation', 'learner_outcome', 'quality_metric', 'rlm_self_critique'
  )),

  -- The decision that was made
  original_decision TEXT NOT NULL,

  -- What actually happened / correct answer
  actual_outcome TEXT NOT NULL,

  -- Improvement signal: -1 (wrong) to +1 (right)
  improvement_signal FLOAT NOT NULL CHECK (improvement_signal BETWEEN -1 AND 1),

  -- Whether this feedback has been incorporated into calibration
  incorporated BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for unincorporated feedback (for batch processing)
CREATE INDEX IF NOT EXISTS idx_rlm_feedback_unincorporated
  ON nko_rlm_feedback(incorporated, created_at) WHERE NOT incorporated;

-- Index for feedback by recursion
CREATE INDEX IF NOT EXISTS idx_rlm_feedback_recursion
  ON nko_rlm_feedback(recursion_id);

-- Index for feedback type analysis
CREATE INDEX IF NOT EXISTS idx_rlm_feedback_type
  ON nko_rlm_feedback(feedback_type, improvement_signal);

COMMENT ON TABLE nko_rlm_feedback IS
  'Feedback signals for RLM self-improvement and calibration';

-- ============================================================================
-- Table: nko_curriculum_paths
-- Purpose: Store optimized curriculum learning paths
-- ============================================================================

CREATE TABLE IF NOT EXISTS nko_curriculum_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Path metadata
  path_name TEXT NOT NULL,
  description TEXT,

  -- Lesson sequence (ordered list of lesson IDs)
  sequence_json JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Difficulty progression curve
  difficulty_curve JSONB,

  -- Prerequisite graph (DAG: lessonId -> prerequisite IDs)
  prerequisite_graph JSONB,

  -- RLM optimization info
  rlm_optimized BOOLEAN NOT NULL DEFAULT false,
  optimization_recursion_id UUID REFERENCES nko_rlm_recursions(id),

  -- Statistics
  total_lessons INTEGER GENERATED ALWAYS AS (
    jsonb_array_length(sequence_json)
  ) STORED,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for finding optimized paths
CREATE INDEX IF NOT EXISTS idx_curriculum_paths_optimized
  ON nko_curriculum_paths(rlm_optimized) WHERE rlm_optimized = true;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_curriculum_path_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER curriculum_path_updated
  BEFORE UPDATE ON nko_curriculum_paths
  FOR EACH ROW
  EXECUTE FUNCTION update_curriculum_path_timestamp();

COMMENT ON TABLE nko_curriculum_paths IS
  'Optimized learning paths through the curriculum';

-- ============================================================================
-- Extend existing tables with RLM metadata
-- ============================================================================

-- Add RLM columns to nko_sources (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_sources' AND column_name = 'rlm_coordinates_id'
  ) THEN
    ALTER TABLE nko_sources ADD COLUMN rlm_coordinates_id UUID
      REFERENCES nko_trajectory_coordinates(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_sources' AND column_name = 'extraction_recursion_id'
  ) THEN
    ALTER TABLE nko_sources ADD COLUMN extraction_recursion_id UUID
      REFERENCES nko_rlm_recursions(id);
  END IF;
END $$;

-- Add RLM columns to nko_vocabulary (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_vocabulary' AND column_name = 'rlm_coordinates_id'
  ) THEN
    ALTER TABLE nko_vocabulary ADD COLUMN rlm_coordinates_id UUID
      REFERENCES nko_trajectory_coordinates(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_vocabulary' AND column_name = 'consolidation_recursion_id'
  ) THEN
    ALTER TABLE nko_vocabulary ADD COLUMN consolidation_recursion_id UUID
      REFERENCES nko_rlm_recursions(id);
  END IF;
END $$;

-- Add RLM columns to nko_worlds (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'rlm_coordinates_id'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN rlm_coordinates_id UUID
      REFERENCES nko_trajectory_coordinates(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'generation_recursion_id'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN generation_recursion_id UUID
      REFERENCES nko_rlm_recursions(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'quality_score'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN quality_score FLOAT
      CHECK (quality_score BETWEEN 0 AND 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'recursion_depth_required'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN recursion_depth_required INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================================
-- Views for RLM analysis
-- ============================================================================

-- View: RLM recursion tree with depth
CREATE OR REPLACE VIEW vw_rlm_recursion_tree AS
WITH RECURSIVE recursion_tree AS (
  -- Base case: root recursions (no parent)
  SELECT
    id,
    pass_number,
    parent_recursion_id,
    depth,
    branch,
    strategy,
    action_taken,
    tokens_consumed,
    execution_time_ms,
    created_at,
    ARRAY[id] as path,
    1 as tree_level
  FROM nko_rlm_recursions
  WHERE parent_recursion_id IS NULL

  UNION ALL

  -- Recursive case: child recursions
  SELECT
    r.id,
    r.pass_number,
    r.parent_recursion_id,
    r.depth,
    r.branch,
    r.strategy,
    r.action_taken,
    r.tokens_consumed,
    r.execution_time_ms,
    r.created_at,
    rt.path || r.id,
    rt.tree_level + 1
  FROM nko_rlm_recursions r
  INNER JOIN recursion_tree rt ON r.parent_recursion_id = rt.id
)
SELECT * FROM recursion_tree;

COMMENT ON VIEW vw_rlm_recursion_tree IS
  'Hierarchical view of RLM recursions with path and tree level';

-- View: Feedback statistics by strategy
CREATE OR REPLACE VIEW vw_rlm_feedback_stats AS
SELECT
  r.strategy,
  r.pass_number,
  COUNT(f.id) as total_feedback,
  AVG(f.improvement_signal) as avg_improvement,
  SUM(CASE WHEN f.improvement_signal > 0 THEN 1 ELSE 0 END) as positive_feedback,
  SUM(CASE WHEN f.improvement_signal < 0 THEN 1 ELSE 0 END) as negative_feedback,
  SUM(CASE WHEN f.incorporated THEN 1 ELSE 0 END) as incorporated_count
FROM nko_rlm_recursions r
LEFT JOIN nko_rlm_feedback f ON r.id = f.recursion_id
GROUP BY r.strategy, r.pass_number
ORDER BY r.pass_number, avg_improvement DESC;

COMMENT ON VIEW vw_rlm_feedback_stats IS
  'Aggregated feedback statistics by RLM strategy and pass';

-- View: High-quality training items
CREATE OR REPLACE VIEW vw_high_quality_training_items AS
SELECT
  tc.entity_type,
  tc.entity_id,
  tc.temporal,
  tc.semantic,
  tc.depth,
  tc.homogeneity,
  tc.salience,
  tc.pedagogical_score,
  tc.computed_at
FROM nko_trajectory_coordinates tc
WHERE tc.pedagogical_score > 0.7
ORDER BY tc.pedagogical_score DESC;

COMMENT ON VIEW vw_high_quality_training_items IS
  'Training items with high pedagogical scores (>0.7)';

-- ============================================================================
-- Functions for RLM operations
-- ============================================================================

-- Function: Record a recursion and return its ID
CREATE OR REPLACE FUNCTION record_rlm_recursion(
  p_pass_number INTEGER,
  p_parent_id UUID,
  p_depth INTEGER,
  p_branch INTEGER,
  p_strategy TEXT,
  p_action TEXT,
  p_commitment FLOAT,
  p_uncertainty FLOAT,
  p_tokens INTEGER DEFAULT NULL,
  p_time_ms INTEGER DEFAULT NULL,
  p_context_size INTEGER DEFAULT NULL,
  p_quality_score FLOAT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO nko_rlm_recursions (
    pass_number, parent_recursion_id, depth, branch, strategy, action_taken,
    commitment_level, uncertainty_level, tokens_consumed, execution_time_ms,
    input_context_size, output_quality_score
  ) VALUES (
    p_pass_number, p_parent_id, p_depth, p_branch, p_strategy, p_action,
    p_commitment, p_uncertainty, p_tokens, p_time_ms,
    p_context_size, p_quality_score
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_rlm_recursion IS
  'Record an RLM recursion operation and return its ID';

-- Function: Record feedback signal
CREATE OR REPLACE FUNCTION record_rlm_feedback(
  p_recursion_id UUID,
  p_feedback_type TEXT,
  p_original_decision TEXT,
  p_actual_outcome TEXT,
  p_signal FLOAT
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO nko_rlm_feedback (
    recursion_id, feedback_type, original_decision, actual_outcome, improvement_signal
  ) VALUES (
    p_recursion_id, p_feedback_type, p_original_decision, p_actual_outcome, p_signal
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION record_rlm_feedback IS
  'Record a feedback signal for RLM self-improvement';

-- Function: Get unincorporated feedback for calibration
CREATE OR REPLACE FUNCTION get_unincorporated_feedback(
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  feedback_id UUID,
  recursion_id UUID,
  strategy TEXT,
  pass_number INTEGER,
  feedback_type TEXT,
  improvement_signal FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id as feedback_id,
    f.recursion_id,
    r.strategy,
    r.pass_number,
    f.feedback_type,
    f.improvement_signal
  FROM nko_rlm_feedback f
  INNER JOIN nko_rlm_recursions r ON f.recursion_id = r.id
  WHERE NOT f.incorporated
  ORDER BY f.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_unincorporated_feedback IS
  'Get unincorporated feedback signals for calibration batch processing';

-- Function: Mark feedback as incorporated
CREATE OR REPLACE FUNCTION mark_feedback_incorporated(
  p_feedback_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE nko_rlm_feedback
  SET incorporated = true
  WHERE id = ANY(p_feedback_ids);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_feedback_incorporated IS
  'Mark feedback signals as incorporated into calibration';

-- Function: Calculate and store coordinates for an entity
CREATE OR REPLACE FUNCTION upsert_trajectory_coordinates(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_temporal FLOAT,
  p_semantic FLOAT,
  p_depth INTEGER,
  p_homogeneity FLOAT,
  p_salience FLOAT
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO nko_trajectory_coordinates (
    entity_type, entity_id, temporal, semantic, depth, homogeneity, salience
  ) VALUES (
    p_entity_type, p_entity_id, p_temporal, p_semantic, p_depth, p_homogeneity, p_salience
  )
  ON CONFLICT (entity_type, entity_id) DO UPDATE SET
    temporal = EXCLUDED.temporal,
    semantic = EXCLUDED.semantic,
    depth = EXCLUDED.depth,
    homogeneity = EXCLUDED.homogeneity,
    salience = EXCLUDED.salience,
    computed_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upsert_trajectory_coordinates IS
  'Insert or update 5D trajectory coordinates for a training entity';

-- ============================================================================
-- RLS Policies (if RLS is enabled)
-- ============================================================================

-- Note: These tables are internal to the training pipeline and typically
-- accessed by service accounts, not end users. RLS may not be needed,
-- but we include basic policies for completeness.

-- Enable RLS on new tables
ALTER TABLE nko_rlm_recursions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_trajectory_coordinates ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_rlm_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_curriculum_paths ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on recursions"
  ON nko_rlm_recursions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on coordinates"
  ON nko_trajectory_coordinates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on feedback"
  ON nko_rlm_feedback FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on curriculum"
  ON nko_curriculum_paths FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can read curriculum paths
CREATE POLICY "Authenticated users can read curriculum paths"
  ON nko_curriculum_paths FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Grants
-- ============================================================================

-- Grant usage to authenticated users for reading
GRANT SELECT ON nko_curriculum_paths TO authenticated;
GRANT SELECT ON vw_high_quality_training_items TO authenticated;

-- Grant full access to service role
GRANT ALL ON nko_rlm_recursions TO service_role;
GRANT ALL ON nko_trajectory_coordinates TO service_role;
GRANT ALL ON nko_rlm_feedback TO service_role;
GRANT ALL ON nko_curriculum_paths TO service_role;
GRANT ALL ON vw_rlm_recursion_tree TO service_role;
GRANT ALL ON vw_rlm_feedback_stats TO service_role;
GRANT ALL ON vw_high_quality_training_items TO service_role;

-- ============================================================================
-- Migration complete
-- ============================================================================

COMMENT ON SCHEMA public IS 'LearnN''Ko training pipeline with RLM integration';
