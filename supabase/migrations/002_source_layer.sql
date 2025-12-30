-- Migration 002: Source Layer Tables
-- N'Ko Language Learning Database
--
-- Tables for tracking video/media sources and extracted frames.
-- This is the foundation layer - where all data originates.

-- ============================================
-- nko_sources: Video/media source metadata
-- ============================================
CREATE TABLE nko_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source identification
    source_type TEXT NOT NULL CHECK (source_type IN ('youtube', 'file', 'upload', 'stream')),
    url TEXT NOT NULL,
    external_id TEXT, -- YouTube video ID, file hash, etc.
    
    -- Media metadata
    title TEXT,
    description TEXT,
    channel_name TEXT,
    channel_id TEXT,
    duration_ms BIGINT,
    language TEXT DEFAULT 'nko',
    quality TEXT, -- '720p', '1080p', etc.
    
    -- Processing status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    
    -- Frame statistics
    frame_count INTEGER DEFAULT 0,
    nko_frame_count INTEGER DEFAULT 0, -- Frames with N'Ko detected
    total_detections INTEGER DEFAULT 0,
    
    -- Flexible metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- Unique constraint on source type + external ID
    UNIQUE(source_type, external_id)
);

-- Add comments for documentation
COMMENT ON TABLE nko_sources IS 'Video and media sources for N''Ko content extraction';
COMMENT ON COLUMN nko_sources.external_id IS 'External identifier (YouTube video ID, file hash, etc.)';
COMMENT ON COLUMN nko_sources.nko_frame_count IS 'Number of frames containing detected N''Ko text';

-- ============================================
-- nko_frames: Individual extracted frames
-- ============================================
CREATE TABLE nko_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES nko_sources(id) ON DELETE CASCADE,
    
    -- Frame identification
    frame_index INTEGER NOT NULL,
    timestamp_ms BIGINT NOT NULL,
    
    -- Frame properties
    width INTEGER,
    height INTEGER,
    format TEXT DEFAULT 'jpeg', -- 'jpeg', 'png', 'webp'
    
    -- N'Ko detection summary
    has_nko BOOLEAN DEFAULT FALSE,
    detection_count INTEGER DEFAULT 0,
    confidence FLOAT DEFAULT 0.0, -- Best detection confidence
    
    -- Frame quality metrics
    is_keyframe BOOLEAN DEFAULT FALSE,
    blur_score FLOAT, -- Lower = sharper
    brightness FLOAT, -- Average brightness
    
    -- Deduplication
    image_hash TEXT, -- Perceptual hash for dedup
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of_id UUID REFERENCES nko_frames(id),
    
    -- Storage
    storage_path TEXT, -- GCS path or local path
    storage_bucket TEXT,
    thumbnail_path TEXT,
    
    -- Flexible metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint on source + frame index
    UNIQUE(source_id, frame_index)
);

-- Add comments
COMMENT ON TABLE nko_frames IS 'Individual video frames extracted for N''Ko analysis';
COMMENT ON COLUMN nko_frames.image_hash IS 'Perceptual hash for duplicate detection';
COMMENT ON COLUMN nko_frames.blur_score IS 'Blur metric - lower values indicate sharper images';

-- ============================================
-- Trigger: Update source stats on frame insert
-- ============================================
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

-- ============================================
-- Trigger: Auto-update updated_at on sources
-- ============================================
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

