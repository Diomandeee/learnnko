-- ============================================================================
-- Migration: 021_validation_pipeline.sql
-- Description: Add validation pipeline tables for quality assurance
-- Author: Claude Code
-- Date: 2026-01-10
-- ============================================================================

-- This migration adds:
-- 1. nko_validation_tasks table for human validation workflow
-- 2. Additional validation columns to nko_worlds
-- 3. RLS policies for validation tables

-- ============================================================================
-- Table: nko_validation_tasks
-- Purpose: Track human validation tasks for native speaker review
-- ============================================================================

CREATE TABLE IF NOT EXISTS nko_validation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to the world being validated
  world_id UUID NOT NULL,

  -- Copy of content for validation (preserves original even if world changes)
  nko_sentence TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  world_type TEXT NOT NULL CHECK (world_type IN (
    'everyday', 'formal', 'storytelling', 'proverbs', 'educational'
  )),

  -- Source phrase info for context
  source_word TEXT NOT NULL,
  source_word_meaning TEXT NOT NULL,

  -- Automated quality scores (pre-computed for validator reference)
  automated_scores JSONB DEFAULT '{}'::jsonb,

  -- Task management
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'skipped', 'expired'
  )),

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,

  -- Deadlines
  due_at TIMESTAMPTZ,

  -- Validation result
  validator_id UUID REFERENCES auth.users(id),
  validation_result JSONB,
  completed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for pending tasks (prioritized queue)
CREATE INDEX IF NOT EXISTS idx_validation_tasks_pending
  ON nko_validation_tasks(priority DESC, created_at ASC)
  WHERE status = 'pending';

-- Index for assigned tasks
CREATE INDEX IF NOT EXISTS idx_validation_tasks_assigned
  ON nko_validation_tasks(assigned_to, status)
  WHERE assigned_to IS NOT NULL;

-- Index for world lookups
CREATE INDEX IF NOT EXISTS idx_validation_tasks_world
  ON nko_validation_tasks(world_id);

-- Index for validator history
CREATE INDEX IF NOT EXISTS idx_validation_tasks_validator
  ON nko_validation_tasks(validator_id, completed_at DESC)
  WHERE validator_id IS NOT NULL;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_validation_task_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validation_task_updated
  BEFORE UPDATE ON nko_validation_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_validation_task_timestamp();

COMMENT ON TABLE nko_validation_tasks IS
  'Human validation tasks for N''Ko world quality assurance';

-- ============================================================================
-- Extend nko_worlds with validation columns
-- ============================================================================

DO $$
BEGIN
  -- Validation status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'validation_status'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN validation_status TEXT DEFAULT 'pending'
      CHECK (validation_status IN ('pending', 'approved', 'rejected', 'needs_revision'));
  END IF;

  -- When validated
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'validated_at'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN validated_at TIMESTAMPTZ;
  END IF;

  -- Who validated
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'validator_id'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN validator_id UUID REFERENCES auth.users(id);
  END IF;

  -- Was the content corrected by validator?
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'was_corrected'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN was_corrected BOOLEAN DEFAULT false;
  END IF;

  -- Original content (preserved before correction)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'original_nko_sentence'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN original_nko_sentence TEXT;
  END IF;

  -- Original translation (preserved before correction)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_worlds' AND column_name = 'original_english_translation'
  ) THEN
    ALTER TABLE nko_worlds ADD COLUMN original_english_translation TEXT;
  END IF;
END $$;

-- Index for validation status queries
CREATE INDEX IF NOT EXISTS idx_nko_worlds_validation_status
  ON nko_worlds(validation_status)
  WHERE validation_status IS NOT NULL;

-- Index for unvalidated worlds
CREATE INDEX IF NOT EXISTS idx_nko_worlds_pending_validation
  ON nko_worlds(created_at ASC)
  WHERE validation_status = 'pending';

-- ============================================================================
-- Table: nko_validator_stats
-- Purpose: Track validator performance for quality control
-- ============================================================================

CREATE TABLE IF NOT EXISTS nko_validator_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Validator
  validator_id UUID NOT NULL REFERENCES auth.users(id),

  -- Statistics (reset monthly)
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Counts
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  tasks_approved INTEGER NOT NULL DEFAULT 0,
  tasks_rejected INTEGER NOT NULL DEFAULT 0,
  tasks_corrected INTEGER NOT NULL DEFAULT 0,

  -- Quality metrics
  avg_time_per_task_ms INTEGER,
  agreement_rate FLOAT CHECK (agreement_rate BETWEEN 0 AND 1),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Unique per validator per period
  CONSTRAINT unique_validator_period UNIQUE (validator_id, period_start)
);

-- Index for validator performance queries
CREATE INDEX IF NOT EXISTS idx_validator_stats_validator
  ON nko_validator_stats(validator_id, period_start DESC);

COMMENT ON TABLE nko_validator_stats IS
  'Validator performance statistics for quality control';

-- ============================================================================
-- Views for validation analysis
-- ============================================================================

-- View: Validation task queue
CREATE OR REPLACE VIEW vw_validation_queue AS
SELECT
  vt.id,
  vt.world_id,
  vt.nko_sentence,
  vt.english_translation,
  vt.world_type,
  vt.source_word,
  vt.priority,
  vt.status,
  vt.assigned_to,
  vt.due_at,
  vt.created_at,
  (vt.automated_scores->>'overallQuality')::float as auto_score,
  CASE
    WHEN vt.due_at IS NOT NULL AND vt.due_at < now() THEN true
    ELSE false
  END as is_overdue
FROM nko_validation_tasks vt
WHERE vt.status IN ('pending', 'in_progress')
ORDER BY
  CASE vt.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
  vt.created_at ASC;

COMMENT ON VIEW vw_validation_queue IS
  'Prioritized queue of pending validation tasks';

-- View: Validation statistics
CREATE OR REPLACE VIEW vw_validation_stats AS
SELECT
  COUNT(*) as total_tasks,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'completed' AND (validation_result->>'status') = 'approved' THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN status = 'completed' AND (validation_result->>'status') = 'rejected' THEN 1 ELSE 0 END) as rejected,
  AVG((automated_scores->>'overallQuality')::float) as avg_auto_score
FROM nko_validation_tasks;

COMMENT ON VIEW vw_validation_stats IS
  'Aggregate validation statistics';

-- View: Worlds pending validation
CREATE OR REPLACE VIEW vw_worlds_pending_validation AS
SELECT
  w.id,
  w.nko_sentence,
  w.english_translation,
  w.world_type,
  w.quality_score,
  w.created_at,
  tc.pedagogical_score,
  tc.salience
FROM nko_worlds w
LEFT JOIN nko_trajectory_coordinates tc ON tc.entity_type = 'world' AND tc.entity_id = w.id
WHERE w.validation_status = 'pending'
ORDER BY w.quality_score ASC, w.created_at ASC;

COMMENT ON VIEW vw_worlds_pending_validation IS
  'Worlds awaiting validation, ordered by quality (lowest first)';

-- ============================================================================
-- Functions for validation operations
-- ============================================================================

-- Function: Create validation task for a world
CREATE OR REPLACE FUNCTION create_validation_task(
  p_world_id UUID,
  p_source_word TEXT,
  p_source_word_meaning TEXT,
  p_priority TEXT DEFAULT 'medium'
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_world RECORD;
BEGIN
  -- Get world data
  SELECT nko_sentence, english_translation, world_type, quality_score
  INTO v_world
  FROM nko_worlds WHERE id = p_world_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'World not found: %', p_world_id;
  END IF;

  -- Create task
  INSERT INTO nko_validation_tasks (
    world_id, nko_sentence, english_translation, world_type,
    source_word, source_word_meaning, priority,
    automated_scores
  ) VALUES (
    p_world_id, v_world.nko_sentence, v_world.english_translation, v_world.world_type,
    p_source_word, p_source_word_meaning, p_priority,
    jsonb_build_object('overallQuality', COALESCE(v_world.quality_score, 0) * 100)
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_validation_task IS
  'Create a human validation task for a world';

-- Function: Assign task to validator
CREATE OR REPLACE FUNCTION assign_validation_task(
  p_task_id UUID,
  p_validator_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE nko_validation_tasks
  SET
    assigned_to = p_validator_id,
    assigned_at = now(),
    status = 'in_progress'
  WHERE id = p_task_id AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION assign_validation_task IS
  'Assign a validation task to a validator';

-- Function: Submit validation result
CREATE OR REPLACE FUNCTION submit_validation_result(
  p_task_id UUID,
  p_validator_id UUID,
  p_is_approved BOOLEAN,
  p_corrected_nko TEXT DEFAULT NULL,
  p_corrected_english TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_score_overrides JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_task RECORD;
  v_status TEXT;
BEGIN
  -- Get task
  SELECT * INTO v_task FROM nko_validation_tasks WHERE id = p_task_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found: %', p_task_id;
  END IF;

  -- Determine status
  IF p_is_approved THEN
    v_status := 'approved';
  ELSIF p_corrected_nko IS NOT NULL OR p_corrected_english IS NOT NULL THEN
    v_status := 'needs_revision';
  ELSE
    v_status := 'rejected';
  END IF;

  -- Update task
  UPDATE nko_validation_tasks
  SET
    status = 'completed',
    validator_id = p_validator_id,
    validation_result = jsonb_build_object(
      'status', v_status,
      'isApproved', p_is_approved,
      'notes', p_notes,
      'scoreOverrides', p_score_overrides
    ),
    completed_at = now()
  WHERE id = p_task_id;

  -- Update world
  UPDATE nko_worlds
  SET
    validation_status = v_status,
    validated_at = now(),
    validator_id = p_validator_id,
    was_corrected = (p_corrected_nko IS NOT NULL OR p_corrected_english IS NOT NULL),
    original_nko_sentence = CASE WHEN p_corrected_nko IS NOT NULL THEN nko_sentence ELSE original_nko_sentence END,
    original_english_translation = CASE WHEN p_corrected_english IS NOT NULL THEN english_translation ELSE original_english_translation END,
    nko_sentence = COALESCE(p_corrected_nko, nko_sentence),
    english_translation = COALESCE(p_corrected_english, english_translation)
  WHERE id = v_task.world_id;

  RETURN v_task.world_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION submit_validation_result IS
  'Submit a validation result and update the world accordingly';

-- Function: Get next validation task for a validator
CREATE OR REPLACE FUNCTION get_next_validation_task(
  p_validator_id UUID DEFAULT NULL
)
RETURNS TABLE (
  task_id UUID,
  world_id UUID,
  nko_sentence TEXT,
  english_translation TEXT,
  world_type TEXT,
  source_word TEXT,
  source_word_meaning TEXT,
  priority TEXT,
  auto_score FLOAT
) AS $$
BEGIN
  -- Try to find already assigned task first
  IF p_validator_id IS NOT NULL THEN
    RETURN QUERY
    SELECT
      vt.id as task_id,
      vt.world_id,
      vt.nko_sentence,
      vt.english_translation,
      vt.world_type,
      vt.source_word,
      vt.source_word_meaning,
      vt.priority,
      (vt.automated_scores->>'overallQuality')::float as auto_score
    FROM nko_validation_tasks vt
    WHERE vt.assigned_to = p_validator_id AND vt.status = 'in_progress'
    LIMIT 1;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  -- Get next pending task (highest priority, oldest first)
  RETURN QUERY
  SELECT
    vt.id as task_id,
    vt.world_id,
    vt.nko_sentence,
    vt.english_translation,
    vt.world_type,
    vt.source_word,
    vt.source_word_meaning,
    vt.priority,
    (vt.automated_scores->>'overallQuality')::float as auto_score
  FROM nko_validation_tasks vt
  WHERE vt.status = 'pending'
  ORDER BY
    CASE vt.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
    vt.created_at ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_validation_task IS
  'Get the next validation task for a validator';

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE nko_validation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_validator_stats ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on validation_tasks"
  ON nko_validation_tasks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on validator_stats"
  ON nko_validator_stats FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Validators can view and update their assigned tasks
CREATE POLICY "Validators can view assigned tasks"
  ON nko_validation_tasks FOR SELECT
  USING (auth.uid() = assigned_to OR status = 'pending');

CREATE POLICY "Validators can update assigned tasks"
  ON nko_validation_tasks FOR UPDATE
  USING (auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = assigned_to);

-- Validators can view their own stats
CREATE POLICY "Validators can view own stats"
  ON nko_validator_stats FOR SELECT
  USING (auth.uid() = validator_id);

-- ============================================================================
-- Grants
-- ============================================================================

-- Grant select to authenticated users on views
GRANT SELECT ON vw_validation_queue TO authenticated;
GRANT SELECT ON vw_validation_stats TO authenticated;
GRANT SELECT ON vw_worlds_pending_validation TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_validation_task TO service_role;
GRANT EXECUTE ON FUNCTION assign_validation_task TO authenticated;
GRANT EXECUTE ON FUNCTION submit_validation_result TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_validation_task TO authenticated;

-- Grant table access
GRANT SELECT, INSERT ON nko_validation_tasks TO authenticated;
GRANT UPDATE (status, assigned_to, assigned_at, validator_id, validation_result, completed_at)
  ON nko_validation_tasks TO authenticated;
GRANT ALL ON nko_validation_tasks TO service_role;
GRANT ALL ON nko_validator_stats TO service_role;
GRANT SELECT ON nko_validator_stats TO authenticated;

-- ============================================================================
-- Migration complete
-- ============================================================================

COMMENT ON SCHEMA public IS 'LearnN''Ko training pipeline with RLM integration and validation';
