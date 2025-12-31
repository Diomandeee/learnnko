-- MIGRATION 012: AUDIO SEGMENTS TABLE
-- Stores audio segments corresponding to scenes/slides for future ASR transcription
-- Links audio to frames for curriculum building: audio explanation + visual slide

-- ============================================================================
-- AUDIO SEGMENTS TABLE
-- ============================================================================
-- Each segment represents a portion of audio corresponding to a scene/slide

CREATE TABLE IF NOT EXISTS nko_audio_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to source video
    source_id UUID NOT NULL REFERENCES nko_sources(id) ON DELETE CASCADE,
    
    -- Link to corresponding frame (optional, for N'Ko slides)
    frame_id UUID REFERENCES nko_frames(id) ON DELETE SET NULL,
    
    -- Segment metadata
    segment_index INTEGER NOT NULL,           -- Order in video
    start_ms INTEGER NOT NULL,                -- Start timestamp in milliseconds
    end_ms INTEGER NOT NULL,                  -- End timestamp in milliseconds
    duration_ms INTEGER GENERATED ALWAYS AS (end_ms - start_ms) STORED,
    
    -- Storage
    audio_path TEXT,                          -- Local path to audio file
    audio_url TEXT,                           -- Cloud storage URL (future)
    audio_format VARCHAR(10) DEFAULT 'm4a',   -- m4a, mp3, wav
    
    -- ASR Transcription (populated by Pass 4 when ready)
    transcription TEXT,                       -- Full transcription text
    transcription_language VARCHAR(10),       -- Language code (e.g., 'nko', 'fr', 'en')
    transcription_confidence FLOAT,           -- ASR confidence score
    transcription_model VARCHAR(50),          -- Model used (e.g., 'whisper-1')
    transcribed_at TIMESTAMPTZ,               -- When transcription was done
    
    -- N'Ko content from corresponding frame
    has_nko BOOLEAN DEFAULT false,            -- Does this segment have N'Ko slides
    nko_text TEXT,                            -- Cached from frame detection
    latin_text TEXT,                          -- Cached transliteration
    english_text TEXT,                        -- Cached translation
    
    -- Curriculum metadata (for lesson building)
    is_reviewed BOOLEAN DEFAULT false,        -- Has been human-reviewed
    lesson_notes TEXT,                        -- Teacher/curriculum notes
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_timestamps CHECK (end_ms > start_ms),
    CONSTRAINT valid_segment_index CHECK (segment_index >= 0)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fast lookup by source
CREATE INDEX idx_audio_segments_source ON nko_audio_segments(source_id);

-- Fast lookup by frame
CREATE INDEX idx_audio_segments_frame ON nko_audio_segments(frame_id);

-- Find segments with N'Ko content
CREATE INDEX idx_audio_segments_has_nko ON nko_audio_segments(has_nko) WHERE has_nko = true;

-- Find untranscribed segments
CREATE INDEX idx_audio_segments_needs_transcription ON nko_audio_segments(source_id) 
    WHERE transcription IS NULL AND audio_path IS NOT NULL;

-- Timeline queries
CREATE INDEX idx_audio_segments_timeline ON nko_audio_segments(source_id, segment_index);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE nko_audio_segments ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Audio segments are publicly readable"
ON nko_audio_segments FOR SELECT
TO public
USING (true);

-- Service role can insert (pipeline)
CREATE POLICY "Pipeline can insert audio segments"
ON nko_audio_segments FOR INSERT
TO service_role
WITH CHECK (true);

-- Service role can update (ASR pipeline)
CREATE POLICY "Pipeline can update audio segments"
ON nko_audio_segments FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_audio_segments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audio_segments_updated_at
    BEFORE UPDATE ON nko_audio_segments
    FOR EACH ROW
    EXECUTE FUNCTION update_audio_segments_updated_at();

-- ============================================================================
-- HELPER VIEW: CURRICULUM SEGMENTS
-- ============================================================================
-- View for curriculum building: segments with N'Ko content + transcription

CREATE OR REPLACE VIEW nko_curriculum_segments AS
SELECT 
    seg.id,
    seg.source_id,
    src.title as video_title,
    src.external_id as video_id,
    seg.segment_index,
    seg.start_ms,
    seg.end_ms,
    seg.duration_ms,
    seg.audio_path,
    seg.nko_text,
    seg.latin_text,
    seg.english_text,
    seg.transcription,
    seg.transcription_language,
    seg.difficulty_level,
    seg.lesson_notes,
    seg.is_reviewed,
    frm.frame_index,
    frm.confidence as detection_confidence
FROM nko_audio_segments seg
JOIN nko_sources src ON seg.source_id = src.id
LEFT JOIN nko_frames frm ON seg.frame_id = frm.id
WHERE seg.has_nko = true
ORDER BY src.title, seg.segment_index;

-- ============================================================================
-- HELPER FUNCTION: GET SEGMENTS NEEDING TRANSCRIPTION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_untranscribed_segments(
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    source_id UUID,
    video_id TEXT,
    segment_index INTEGER,
    start_ms INTEGER,
    end_ms INTEGER,
    audio_path TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        seg.id,
        seg.source_id,
        src.external_id as video_id,
        seg.segment_index,
        seg.start_ms,
        seg.end_ms,
        seg.audio_path
    FROM nko_audio_segments seg
    JOIN nko_sources src ON seg.source_id = src.id
    WHERE seg.transcription IS NULL 
      AND seg.audio_path IS NOT NULL
    ORDER BY src.created_at, seg.segment_index
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE nko_audio_segments IS 'Audio segments from N''Ko educational videos, linked to frames and ready for ASR transcription';
COMMENT ON COLUMN nko_audio_segments.transcription IS 'ASR transcription of the audio segment, populated by Pass 4 when ready';
COMMENT ON COLUMN nko_audio_segments.nko_text IS 'N''Ko text visible in the corresponding frame (cached from nko_frames)';
COMMENT ON VIEW nko_curriculum_segments IS 'Pre-joined view for building N''Ko lessons from video segments';

