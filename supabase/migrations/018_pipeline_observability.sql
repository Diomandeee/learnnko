-- Pipeline Observability Tables
-- Tracks pipeline runs and real-time events for dashboard visibility

-- =============================================================================
-- PIPELINE RUNS TABLE
-- =============================================================================
-- Tracks each pipeline execution (extraction, transcription, world generation)

CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_type TEXT NOT NULL, -- 'extraction', 'transcription', 'worlds', 'enrichment'
    channel_name TEXT,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'stopped')),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    
    -- Progress counters
    videos_total INT DEFAULT 0,
    videos_completed INT DEFAULT 0,
    videos_failed INT DEFAULT 0,
    frames_extracted INT DEFAULT 0,
    detections_found INT DEFAULT 0,
    audio_segments INT DEFAULT 0,
    
    -- Cost tracking
    cost_estimate DECIMAL(10,4) DEFAULT 0,
    
    -- Error handling
    error_message TEXT,
    
    -- Flexible metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- PIPELINE EVENTS TABLE
-- =============================================================================
-- Real-time event log for live activity feed

CREATE TABLE IF NOT EXISTS pipeline_events (
    id BIGSERIAL PRIMARY KEY,
    run_id UUID REFERENCES pipeline_runs(id) ON DELETE CASCADE,
    
    -- Event details
    event_type TEXT NOT NULL CHECK (event_type IN (
        'run_start', 'run_complete', 'run_failed', 'run_stopped',
        'video_start', 'video_complete', 'video_failed', 'video_skipped',
        'frame_extracted', 'detection_found', 'audio_extracted',
        'checkpoint_saved', 'error', 'warning', 'info'
    )),
    video_id TEXT,
    message TEXT,
    
    -- Event data (N'Ko text, frame info, etc.)
    data JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- REALTIME CONFIGURATION
-- =============================================================================
-- Enable Supabase Realtime for live updates

DO $$
BEGIN
    -- Check if tables are already in the publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'pipeline_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE pipeline_events;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'pipeline_runs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE pipeline_runs;
    END IF;
END $$;

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_type ON pipeline_runs(run_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_started ON pipeline_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_run ON pipeline_events(run_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_created ON pipeline_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_events_type ON pipeline_events(event_type);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE pipeline_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_events ENABLE ROW LEVEL SECURITY;

-- Read policies (everyone can view)
DROP POLICY IF EXISTS "Pipeline runs readable" ON pipeline_runs;
CREATE POLICY "Pipeline runs readable" ON pipeline_runs 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pipeline events readable" ON pipeline_events;
CREATE POLICY "Pipeline events readable" ON pipeline_events 
    FOR SELECT USING (true);

-- Write policies (pipeline can insert/update)
DROP POLICY IF EXISTS "Pipeline runs insertable" ON pipeline_runs;
CREATE POLICY "Pipeline runs insertable" ON pipeline_runs 
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Pipeline runs updatable" ON pipeline_runs;
CREATE POLICY "Pipeline runs updatable" ON pipeline_runs 
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Pipeline events insertable" ON pipeline_events;
CREATE POLICY "Pipeline events insertable" ON pipeline_events 
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pipeline_runs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_pipeline_runs_updated_at ON pipeline_runs;
CREATE TRIGGER trigger_pipeline_runs_updated_at
    BEFORE UPDATE ON pipeline_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_pipeline_runs_updated_at();

-- =============================================================================
-- VIEWS
-- =============================================================================

-- Current/recent pipeline status view
CREATE OR REPLACE VIEW pipeline_status AS
SELECT 
    pr.id,
    pr.run_type,
    pr.channel_name,
    pr.status,
    pr.started_at,
    pr.ended_at,
    pr.videos_total,
    pr.videos_completed,
    pr.videos_failed,
    pr.frames_extracted,
    pr.detections_found,
    pr.audio_segments,
    pr.cost_estimate,
    pr.error_message,
    CASE 
        WHEN pr.videos_total > 0 THEN 
            ROUND((pr.videos_completed::DECIMAL / pr.videos_total) * 100, 1)
        ELSE 0 
    END AS progress_percent,
    CASE 
        WHEN pr.status = 'running' AND pr.videos_completed > 0 THEN
            pr.started_at + (
                (now() - pr.started_at) * pr.videos_total / NULLIF(pr.videos_completed, 0)
            )
        ELSE NULL
    END AS estimated_completion,
    (SELECT COUNT(*) FROM pipeline_events pe WHERE pe.run_id = pr.id) AS event_count
FROM pipeline_runs pr
ORDER BY pr.started_at DESC;

-- Recent events view with run info
CREATE OR REPLACE VIEW recent_pipeline_events AS
SELECT 
    pe.id,
    pe.run_id,
    pr.run_type,
    pr.channel_name,
    pe.event_type,
    pe.video_id,
    pe.message,
    pe.data,
    pe.created_at
FROM pipeline_events pe
LEFT JOIN pipeline_runs pr ON pe.run_id = pr.id
ORDER BY pe.created_at DESC
LIMIT 100;

