-- MIGRATION 015: Vocabulary Expansion Queue and Learning Stats
-- Enables organic, continuous vocabulary building through iterative learning

-----------------------------------------------------------
-- Vocabulary Expansion Queue
-- Words waiting to be enriched through cross-referencing
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS vocabulary_expansion_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Word to enrich
    word TEXT NOT NULL,
    word_normalized TEXT,  -- Lowercase, no diacritics
    
    -- Source tracking
    source_type TEXT NOT NULL,  -- 'video_detection', 'user_query', 'ai_suggestion', 'dictionary_variant', 'dictionary_synonym'
    source_id UUID,             -- Reference to source (frame_id, session_id, detection_id, etc.)
    
    -- Priority (1=highest, 10=lowest)
    priority INT DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    
    -- Processing status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
    error_message TEXT,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    
    -- Context for enrichment
    context JSONB DEFAULT '{}'::jsonb,
    
    -- Result tracking
    vocabulary_entry_id UUID REFERENCES nko_vocabulary(id),
    enrichment_sources JSONB DEFAULT '[]'::jsonb,  -- ['ankataa', 'gemini', 'existing']
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    processing_started_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ
);

-- Partial unique index to prevent duplicate pending entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_queue_unique_pending 
ON vocabulary_expansion_queue(word_normalized) 
WHERE status = 'pending';

-- Indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_queue_status_priority 
ON vocabulary_expansion_queue(status, priority, created_at) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_queue_source_type 
ON vocabulary_expansion_queue(source_type);

CREATE INDEX IF NOT EXISTS idx_queue_word_normalized 
ON vocabulary_expansion_queue(word_normalized);

COMMENT ON TABLE vocabulary_expansion_queue IS 'Queue of words awaiting enrichment through cross-referencing';
COMMENT ON COLUMN vocabulary_expansion_queue.source_type IS 'Origin of the word: video_detection, user_query, ai_suggestion, dictionary_variant, dictionary_synonym';
COMMENT ON COLUMN vocabulary_expansion_queue.priority IS 'Processing priority: 1=user_query (immediate), 2=video_detection, 3-5=suggestions';

-----------------------------------------------------------
-- Learning Statistics
-- Track organic vocabulary growth over time
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS learning_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Detection counts
    words_detected INT DEFAULT 0,
    unique_words_detected INT DEFAULT 0,
    
    -- Enrichment counts
    words_enriched INT DEFAULT 0,
    dictionary_matches INT DEFAULT 0,
    ai_enrichments INT DEFAULT 0,
    
    -- Queue metrics
    queue_items_added INT DEFAULT 0,
    queue_items_completed INT DEFAULT 0,
    queue_items_failed INT DEFAULT 0,
    
    -- Vocabulary totals (snapshot at end of day)
    vocabulary_total INT DEFAULT 0,
    vocabulary_verified INT DEFAULT 0,  -- With dictionary match
    
    -- Source breakdown
    sources_breakdown JSONB DEFAULT '{}'::jsonb,
    
    -- Cost tracking (Gemini API calls)
    api_calls_made INT DEFAULT 0,
    estimated_cost_usd DECIMAL(10, 4) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(stat_date)
);

CREATE INDEX IF NOT EXISTS idx_stats_date ON learning_stats(stat_date DESC);

COMMENT ON TABLE learning_stats IS 'Daily statistics tracking organic vocabulary growth';

-----------------------------------------------------------
-- Functions for Queue Management
-----------------------------------------------------------

-- Add word to queue (with deduplication)
CREATE OR REPLACE FUNCTION queue_word_for_enrichment(
    p_word TEXT,
    p_source_type TEXT,
    p_source_id UUID DEFAULT NULL,
    p_priority INT DEFAULT 5,
    p_context JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_normalized TEXT;
    v_queue_id UUID;
    v_existing_id UUID;
BEGIN
    -- Normalize word
    v_normalized := lower(regexp_replace(p_word, '[̀́̂̃̄̆̇̈̉̊̋̌̍̎̏]', '', 'g'));
    
    -- Check if word already in pending queue
    SELECT id INTO v_existing_id
    FROM vocabulary_expansion_queue
    WHERE word_normalized = v_normalized AND status = 'pending';
    
    IF v_existing_id IS NOT NULL THEN
        -- Update priority if new one is higher
        UPDATE vocabulary_expansion_queue
        SET priority = LEAST(priority, p_priority),
            context = context || p_context
        WHERE id = v_existing_id;
        RETURN v_existing_id;
    END IF;
    
    -- Check if word already in vocabulary with high confidence
    IF EXISTS (
        SELECT 1 FROM nko_vocabulary 
        WHERE latin_text = v_normalized 
        AND is_dictionary_verified = true
    ) THEN
        RETURN NULL;  -- Already known, don't queue
    END IF;
    
    -- Insert new queue item
    INSERT INTO vocabulary_expansion_queue (
        word, word_normalized, source_type, source_id, priority, context
    ) VALUES (
        p_word, v_normalized, p_source_type, p_source_id, p_priority, p_context
    )
    ON CONFLICT (word_normalized) WHERE status = 'pending'
    DO UPDATE SET 
        priority = LEAST(vocabulary_expansion_queue.priority, EXCLUDED.priority),
        context = vocabulary_expansion_queue.context || EXCLUDED.context
    RETURNING id INTO v_queue_id;
    
    -- Update daily stats
    INSERT INTO learning_stats (stat_date, queue_items_added)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (stat_date) 
    DO UPDATE SET 
        queue_items_added = learning_stats.queue_items_added + 1,
        updated_at = now();
    
    RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION queue_word_for_enrichment IS 'Add a word to the enrichment queue with deduplication';

-- Get next batch of words to process
CREATE OR REPLACE FUNCTION get_pending_enrichments(
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    word TEXT,
    word_normalized TEXT,
    source_type TEXT,
    source_id UUID,
    priority INT,
    context JSONB
) AS $$
BEGIN
    RETURN QUERY
    UPDATE vocabulary_expansion_queue q
    SET 
        status = 'processing',
        processing_started_at = now()
    WHERE q.id IN (
        SELECT sq.id
        FROM vocabulary_expansion_queue sq
        WHERE sq.status = 'pending'
          AND sq.retry_count < sq.max_retries
        ORDER BY sq.priority ASC, sq.created_at ASC
        LIMIT p_limit
        FOR UPDATE SKIP LOCKED
    )
    RETURNING q.id, q.word, q.word_normalized, q.source_type, q.source_id, q.priority, q.context;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_pending_enrichments IS 'Get and lock next batch of words for enrichment processing';

-- Mark enrichment complete
CREATE OR REPLACE FUNCTION complete_enrichment(
    p_queue_id UUID,
    p_vocabulary_id UUID,
    p_sources JSONB DEFAULT '[]'::jsonb
)
RETURNS VOID AS $$
BEGIN
    UPDATE vocabulary_expansion_queue
    SET 
        status = 'completed',
        vocabulary_entry_id = p_vocabulary_id,
        enrichment_sources = p_sources,
        processed_at = now()
    WHERE id = p_queue_id;
    
    -- Update daily stats
    INSERT INTO learning_stats (stat_date, queue_items_completed, words_enriched)
    VALUES (CURRENT_DATE, 1, 1)
    ON CONFLICT (stat_date) 
    DO UPDATE SET 
        queue_items_completed = learning_stats.queue_items_completed + 1,
        words_enriched = learning_stats.words_enriched + 1,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Mark enrichment failed
CREATE OR REPLACE FUNCTION fail_enrichment(
    p_queue_id UUID,
    p_error TEXT
)
RETURNS VOID AS $$
DECLARE
    v_retry_count INT;
    v_max_retries INT;
BEGIN
    SELECT retry_count, max_retries INTO v_retry_count, v_max_retries
    FROM vocabulary_expansion_queue WHERE id = p_queue_id;
    
    IF v_retry_count + 1 >= v_max_retries THEN
        -- Max retries reached, mark as failed
        UPDATE vocabulary_expansion_queue
        SET 
            status = 'failed',
            error_message = p_error,
            retry_count = retry_count + 1,
            processed_at = now()
        WHERE id = p_queue_id;
        
        -- Update stats
        INSERT INTO learning_stats (stat_date, queue_items_failed)
        VALUES (CURRENT_DATE, 1)
        ON CONFLICT (stat_date) 
        DO UPDATE SET 
            queue_items_failed = learning_stats.queue_items_failed + 1,
            updated_at = now();
    ELSE
        -- Put back in queue for retry
        UPDATE vocabulary_expansion_queue
        SET 
            status = 'pending',
            error_message = p_error,
            retry_count = retry_count + 1,
            processing_started_at = NULL
        WHERE id = p_queue_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-----------------------------------------------------------
-- View for Queue Status
-----------------------------------------------------------

CREATE OR REPLACE VIEW queue_status AS
SELECT
    status,
    source_type,
    COUNT(*) as count,
    AVG(priority) as avg_priority,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM vocabulary_expansion_queue
GROUP BY status, source_type
ORDER BY status, source_type;

COMMENT ON VIEW queue_status IS 'Summary of expansion queue status by type';

-----------------------------------------------------------
-- RLS Policies
-----------------------------------------------------------

ALTER TABLE vocabulary_expansion_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_stats ENABLE ROW LEVEL SECURITY;

-- Service role can manage queue
CREATE POLICY "Service role can manage queue"
ON vocabulary_expansion_queue FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public can read queue status
CREATE POLICY "Public can read queue"
ON vocabulary_expansion_queue FOR SELECT
TO public
USING (true);

-- Service role can manage stats
CREATE POLICY "Service role can manage stats"
ON learning_stats FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Public can read stats
CREATE POLICY "Public can read stats"
ON learning_stats FOR SELECT
TO public
USING (true);

