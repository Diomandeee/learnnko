-- ============================================================================
-- Migration: 022_continuous_training.sql
-- Description: Add tables for cloud-based continuous training pipeline
-- Author: Claude Code
-- Date: 2026-01-10
-- ============================================================================

-- This migration adds:
-- 1. training_state - Distributed checkpoint storage
-- 2. video_manifests - Track video sources
-- 3. training_tasks - Individual task queue
-- 4. daily_budgets - Budget tracking by day
-- 5. Extensions to pipeline_runs

-- ============================================================================
-- Table: training_state
-- Purpose: Distributed state for checkpoint persistence (replaces local JSON)
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_training_state_key ON training_state(key);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_training_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER training_state_updated
  BEFORE UPDATE ON training_state
  FOR EACH ROW
  EXECUTE FUNCTION update_training_state_timestamp();

COMMENT ON TABLE training_state IS
  'Distributed state storage for cloud training pipeline checkpoints';

-- ============================================================================
-- Table: video_manifests
-- Purpose: Track video manifests from multiple sources
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,                    -- 'youtube_channel', 'playlist', 'manual'
  source_identifier TEXT NOT NULL,         -- Channel handle, playlist ID
  total_videos INTEGER NOT NULL DEFAULT 0,
  completed_videos INTEGER NOT NULL DEFAULT 0,
  failed_videos INTEGER NOT NULL DEFAULT 0,
  last_scraped_at TIMESTAMPTZ,
  manifest_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_source_identifier UNIQUE (source, source_identifier)
);

-- Index for source lookups
CREATE INDEX IF NOT EXISTS idx_video_manifests_source ON video_manifests(source);

COMMENT ON TABLE video_manifests IS
  'Track video manifests from YouTube channels, playlists, and manual imports';

-- ============================================================================
-- Table: training_tasks
-- Purpose: Individual task queue for incremental processing
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL,
  pass_number INTEGER NOT NULL,            -- 1=extraction, 2=consolidation, 3=worlds, 4=transcription
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, completed, failed, skipped
  priority INTEGER NOT NULL DEFAULT 100,   -- Lower = higher priority
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  result JSONB,
  cost_estimate NUMERIC(10,4),
  actual_cost NUMERIC(10,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CONSTRAINT unique_video_pass UNIQUE (video_id, pass_number)
);

-- Index for queue processing (pending tasks by priority)
CREATE INDEX IF NOT EXISTS idx_training_tasks_queue
  ON training_tasks(pass_number, priority, created_at)
  WHERE status = 'pending';

-- Index for failed tasks (for retry)
CREATE INDEX IF NOT EXISTS idx_training_tasks_failed
  ON training_tasks(pass_number, attempts)
  WHERE status = 'failed';

-- Index for video lookups
CREATE INDEX IF NOT EXISTS idx_training_tasks_video
  ON training_tasks(video_id);

COMMENT ON TABLE training_tasks IS
  'Individual training tasks for incremental processing';

-- ============================================================================
-- Table: daily_budgets
-- Purpose: Track spending by day for budget control
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_date DATE NOT NULL UNIQUE,
  budget_limit NUMERIC(10,4) NOT NULL DEFAULT 1.50,
  spent NUMERIC(10,4) NOT NULL DEFAULT 0,
  videos_processed INTEGER NOT NULL DEFAULT 0,
  frames_analyzed INTEGER NOT NULL DEFAULT 0,
  worlds_generated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for date lookups
CREATE INDEX IF NOT EXISTS idx_daily_budgets_date ON daily_budgets(budget_date DESC);

COMMENT ON TABLE daily_budgets IS
  'Daily budget tracking for cost-controlled training';

-- ============================================================================
-- Extend pipeline_runs for multi-pass tracking
-- ============================================================================

DO $$
BEGIN
  -- Pass number for multi-pass tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipeline_runs' AND column_name = 'pass_number'
  ) THEN
    ALTER TABLE pipeline_runs ADD COLUMN pass_number INTEGER DEFAULT 1;
  END IF;

  -- Daily budget tracking within run
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipeline_runs' AND column_name = 'daily_budget_used'
  ) THEN
    ALTER TABLE pipeline_runs ADD COLUMN daily_budget_used NUMERIC(10,4) DEFAULT 0;
  END IF;

  -- Budget limit for run
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipeline_runs' AND column_name = 'daily_budget_limit'
  ) THEN
    ALTER TABLE pipeline_runs ADD COLUMN daily_budget_limit NUMERIC(10,4) DEFAULT 2.00;
  END IF;

  -- Cost tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipeline_runs' AND column_name = 'cost_usd'
  ) THEN
    ALTER TABLE pipeline_runs ADD COLUMN cost_usd NUMERIC(10,4) DEFAULT 0;
  END IF;

  -- Config storage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipeline_runs' AND column_name = 'config'
  ) THEN
    ALTER TABLE pipeline_runs ADD COLUMN config JSONB DEFAULT '{}'::jsonb;
  END IF;

  -- Result storage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pipeline_runs' AND column_name = 'result'
  ) THEN
    ALTER TABLE pipeline_runs ADD COLUMN result JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ============================================================================
-- Extend nko_phrases with worlds tracking
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_phrases' AND column_name = 'worlds_generated'
  ) THEN
    ALTER TABLE nko_phrases ADD COLUMN worlds_generated BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nko_phrases' AND column_name = 'worlds_count'
  ) THEN
    ALTER TABLE nko_phrases ADD COLUMN worlds_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Index for phrases needing world generation
CREATE INDEX IF NOT EXISTS idx_nko_phrases_needs_worlds
  ON nko_phrases(occurrence_count DESC)
  WHERE worlds_generated = false;

-- ============================================================================
-- Views for pipeline monitoring
-- ============================================================================

-- View: Training progress summary
CREATE OR REPLACE VIEW vw_training_progress AS
SELECT
  (SELECT COUNT(*) FROM training_tasks WHERE status = 'completed' AND pass_number = 1) as extraction_completed,
  (SELECT COUNT(*) FROM training_tasks WHERE status = 'pending' AND pass_number = 1) as extraction_pending,
  (SELECT COUNT(*) FROM training_tasks WHERE status = 'failed' AND pass_number = 1) as extraction_failed,
  (SELECT COUNT(*) FROM training_tasks WHERE status = 'completed' AND pass_number = 2) as consolidation_completed,
  (SELECT COUNT(*) FROM training_tasks WHERE status = 'completed' AND pass_number = 3) as worlds_completed,
  (SELECT SUM(spent) FROM daily_budgets) as total_spent,
  (SELECT SUM(videos_processed) FROM daily_budgets) as total_videos,
  (SELECT SUM(frames_analyzed) FROM daily_budgets) as total_frames;

COMMENT ON VIEW vw_training_progress IS
  'Summary of training progress across all passes';

-- View: Recent pipeline runs
CREATE OR REPLACE VIEW vw_recent_runs AS
SELECT
  id,
  run_type,
  status,
  pass_number,
  videos_processed,
  cost_usd,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds
FROM pipeline_runs
ORDER BY started_at DESC
LIMIT 50;

COMMENT ON VIEW vw_recent_runs IS
  'Recent pipeline runs with duration';

-- View: Budget history
CREATE OR REPLACE VIEW vw_budget_history AS
SELECT
  budget_date,
  budget_limit,
  spent,
  budget_limit - spent as remaining,
  videos_processed,
  frames_analyzed,
  worlds_generated,
  CASE
    WHEN spent >= budget_limit THEN 'exhausted'
    WHEN spent >= budget_limit * 0.8 THEN 'high'
    ELSE 'normal'
  END as budget_status
FROM daily_budgets
ORDER BY budget_date DESC;

COMMENT ON VIEW vw_budget_history IS
  'Daily budget history with status';

-- ============================================================================
-- Functions for training operations
-- ============================================================================

-- Function: Get next batch of tasks for processing
CREATE OR REPLACE FUNCTION get_next_training_tasks(
  p_pass_number INTEGER,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  task_id UUID,
  video_id TEXT,
  priority INTEGER,
  attempts INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id as task_id,
    t.video_id,
    t.priority,
    t.attempts
  FROM training_tasks t
  WHERE t.pass_number = p_pass_number
    AND t.status = 'pending'
    AND t.attempts < t.max_attempts
  ORDER BY t.priority ASC, t.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_training_tasks IS
  'Get the next batch of training tasks for a specific pass';

-- Function: Start a training task
CREATE OR REPLACE FUNCTION start_training_task(p_task_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE training_tasks
  SET
    status = 'processing',
    started_at = now(),
    attempts = attempts + 1
  WHERE id = p_task_id AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Complete a training task
CREATE OR REPLACE FUNCTION complete_training_task(
  p_task_id UUID,
  p_result JSONB DEFAULT NULL,
  p_cost NUMERIC DEFAULT 0
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE training_tasks
  SET
    status = 'completed',
    completed_at = now(),
    result = p_result,
    actual_cost = p_cost
  WHERE id = p_task_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Fail a training task
CREATE OR REPLACE FUNCTION fail_training_task(
  p_task_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_task RECORD;
BEGIN
  SELECT * INTO v_task FROM training_tasks WHERE id = p_task_id;

  IF v_task.attempts >= v_task.max_attempts THEN
    -- Max attempts reached, mark as permanently failed
    UPDATE training_tasks
    SET
      status = 'failed',
      last_error = p_error
    WHERE id = p_task_id;
  ELSE
    -- Can retry, set back to pending
    UPDATE training_tasks
    SET
      status = 'pending',
      last_error = p_error
    WHERE id = p_task_id;
  END IF;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Record daily budget spend
CREATE OR REPLACE FUNCTION record_budget_spend(
  p_amount NUMERIC,
  p_videos INTEGER DEFAULT 0,
  p_frames INTEGER DEFAULT 0,
  p_worlds INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
BEGIN
  INSERT INTO daily_budgets (budget_date, spent, videos_processed, frames_analyzed, worlds_generated)
  VALUES (v_today, p_amount, p_videos, p_frames, p_worlds)
  ON CONFLICT (budget_date) DO UPDATE SET
    spent = daily_budgets.spent + p_amount,
    videos_processed = daily_budgets.videos_processed + p_videos,
    frames_analyzed = daily_budgets.frames_analyzed + p_frames,
    worlds_generated = daily_budgets.worlds_generated + p_worlds,
    updated_at = now();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE training_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_budgets ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on training_state"
  ON training_state FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on video_manifests"
  ON video_manifests FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on training_tasks"
  ON training_tasks FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access on daily_budgets"
  ON daily_budgets FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Authenticated users can read
CREATE POLICY "Authenticated users can read training_state"
  ON training_state FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read video_manifests"
  ON video_manifests FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read training_tasks"
  ON training_tasks FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read daily_budgets"
  ON daily_budgets FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- Grants
-- ============================================================================

-- Grant select to authenticated users on views
GRANT SELECT ON vw_training_progress TO authenticated;
GRANT SELECT ON vw_recent_runs TO authenticated;
GRANT SELECT ON vw_budget_history TO authenticated;

-- Grant execute on functions to service_role
GRANT EXECUTE ON FUNCTION get_next_training_tasks TO service_role;
GRANT EXECUTE ON FUNCTION start_training_task TO service_role;
GRANT EXECUTE ON FUNCTION complete_training_task TO service_role;
GRANT EXECUTE ON FUNCTION fail_training_task TO service_role;
GRANT EXECUTE ON FUNCTION record_budget_spend TO service_role;

-- Grant table access
GRANT ALL ON training_state TO service_role;
GRANT ALL ON video_manifests TO service_role;
GRANT ALL ON training_tasks TO service_role;
GRANT ALL ON daily_budgets TO service_role;

GRANT SELECT ON training_state TO authenticated;
GRANT SELECT ON video_manifests TO authenticated;
GRANT SELECT ON training_tasks TO authenticated;
GRANT SELECT ON daily_budgets TO authenticated;

-- ============================================================================
-- Migration complete
-- ============================================================================

COMMENT ON SCHEMA public IS 'LearnN''Ko training pipeline with continuous cloud-based training support';
