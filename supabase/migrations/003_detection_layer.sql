-- Migration 003: Detection Layer Tables
-- N'Ko Language Learning Database
--
-- Tables for OCR detection results and character-level analysis.
-- This layer captures the raw output from Gemini analysis.

-- ============================================
-- nko_detections: OCR detection results
-- ============================================
CREATE TABLE nko_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frame_id UUID NOT NULL REFERENCES nko_frames(id) ON DELETE CASCADE,
    
    -- Raw detected text
    nko_text TEXT NOT NULL,
    nko_text_normalized TEXT, -- Canonicalized/normalized form
    latin_text TEXT, -- Romanized transliteration
    english_text TEXT, -- English translation
    
    -- N'Ko character analysis
    char_count INTEGER NOT NULL DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    vowel_count INTEGER DEFAULT 0,
    consonant_count INTEGER DEFAULT 0,
    digit_count INTEGER DEFAULT 0,
    combining_mark_count INTEGER DEFAULT 0,
    punctuation_count INTEGER DEFAULT 0,
    
    -- Quality metrics
    confidence FLOAT NOT NULL DEFAULT 0.0,
    nko_coverage FLOAT DEFAULT 0.0, -- % of chars that are N'Ko Unicode
    is_valid_structure BOOLEAN DEFAULT TRUE, -- Passes structural validation
    validation_errors TEXT[] DEFAULT '{}',
    validation_warnings TEXT[] DEFAULT '{}',
    
    -- Spatial information
    bounding_box JSONB, -- {x, y, width, height, rotation}
    text_region TEXT CHECK (text_region IN ('title', 'body', 'caption', 'overlay', 'unknown')),
    
    -- Classification
    context_type TEXT CHECK (context_type IN (
        'greeting', 'vocabulary', 'phrase', 'sentence', 
        'lesson_title', 'instruction', 'number', 'alphabet',
        'proverb', 'dialogue', 'other'
    )),
    
    -- Gemini response tracking
    gemini_response_id TEXT,
    gemini_model TEXT,
    raw_response JSONB,
    processing_time_ms INTEGER,
    
    -- Validation status
    status TEXT DEFAULT 'raw' CHECK (status IN ('raw', 'validated', 'corrected', 'rejected', 'disputed')),
    validated_by UUID,
    validated_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE nko_detections IS 'OCR detection results from video frame analysis';
COMMENT ON COLUMN nko_detections.nko_text_normalized IS 'Canonicalized form with consistent combining mark ordering';
COMMENT ON COLUMN nko_detections.nko_coverage IS 'Percentage of characters that are valid N''Ko Unicode (0.0-1.0)';
COMMENT ON COLUMN nko_detections.context_type IS 'Semantic category of the detected text';

-- ============================================
-- nko_characters: Character-level breakdown
-- ============================================
CREATE TABLE nko_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID NOT NULL REFERENCES nko_detections(id) ON DELETE CASCADE,
    
    -- Character data
    char TEXT NOT NULL,
    code_point INTEGER NOT NULL, -- Unicode code point (e.g., 1984 for ߀)
    position INTEGER NOT NULL, -- Position in the string (0-indexed)
    
    -- Classification based on Unicode block
    char_type TEXT NOT NULL CHECK (char_type IN (
        'digit',      -- U+07C0-U+07C9 (߀-߉)
        'vowel',      -- U+07CA-U+07D0 (ߊ-ߐ)
        'consonant',  -- U+07D1-U+07E7 (ߑ-ߧ)
        'combining',  -- U+07EB-U+07F5 (combining marks)
        'punctuation',-- U+07F6-U+07FF (߶-߿)
        'whitespace', -- Space, etc.
        'other'       -- Non-N'Ko characters
    )),
    
    -- N'Ko Unicode block info
    block_name TEXT, -- 'NKO_DIGIT', 'NKO_VOWEL', etc.
    unicode_name TEXT, -- Official Unicode name like 'NKO LETTER A'
    
    -- Combining mark relationships
    base_char_id UUID REFERENCES nko_characters(id),
    is_combining BOOLEAN DEFAULT FALSE,
    combining_class INTEGER, -- Unicode combining class
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE nko_characters IS 'Character-level breakdown of N''Ko text detections';
COMMENT ON COLUMN nko_characters.code_point IS 'Unicode code point value (U+07C0 = 1984)';
COMMENT ON COLUMN nko_characters.base_char_id IS 'For combining marks, references the base character';

-- ============================================
-- nko_bounding_boxes: Detailed spatial data
-- ============================================
CREATE TABLE nko_bounding_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID NOT NULL REFERENCES nko_detections(id) ON DELETE CASCADE,
    
    -- Bounding box coordinates (normalized 0-1)
    x_min FLOAT NOT NULL,
    y_min FLOAT NOT NULL,
    x_max FLOAT NOT NULL,
    y_max FLOAT NOT NULL,
    
    -- Rotation
    rotation_degrees FLOAT DEFAULT 0.0,
    
    -- Confidence for this specific box
    confidence FLOAT,
    
    -- Word/line level boxes
    box_type TEXT CHECK (box_type IN ('text_block', 'line', 'word', 'character')),
    parent_box_id UUID REFERENCES nko_bounding_boxes(id),
    
    -- Text content for this box
    text_content TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_bounding_boxes IS 'Spatial location of text within frames';

-- ============================================
-- Trigger: Update frame detection stats
-- ============================================
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

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE TRIGGER trigger_detections_updated_at
BEFORE UPDATE ON nko_detections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

