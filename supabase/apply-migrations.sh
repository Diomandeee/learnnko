#!/bin/bash
# Apply N'Ko Database Migrations to Supabase

PROJECT_ID="zceeunlfhcherokveyek"
ACCESS_TOKEN="sbp_c0396ffbcc98f16e1bfb59729b71584f3d712cbe"
API_URL="https://api.supabase.com/v1/projects/${PROJECT_ID}/database/query"

run_sql() {
    local sql="$1"
    local desc="$2"
    echo "Applying: $desc..."
    
    result=$(curl -s "$API_URL" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$sql" | jq -Rs .)}" 2>&1)
    
    if echo "$result" | grep -q "error"; then
        echo "  ERROR: $result"
        return 1
    else
        echo "  OK"
        return 0
    fi
}

echo "=== N'Ko Database Migration ==="
echo ""

# Migration 001: Extensions (already applied)
run_sql "SELECT 1 FROM pg_extension WHERE extname = 'vector';" "Checking extensions"

# Migration 002: Source Layer - nko_sources
run_sql "
CREATE TABLE IF NOT EXISTS nko_sources (
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
" "nko_sources table"

# nko_frames
run_sql "
CREATE TABLE IF NOT EXISTS nko_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES nko_sources(id) ON DELETE CASCADE,
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
    duplicate_of_id UUID,
    storage_path TEXT,
    storage_bucket TEXT,
    thumbnail_path TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_id, frame_index)
);
" "nko_frames table"

# Add foreign key for duplicate_of_id
run_sql "
DO \$\$ BEGIN
    ALTER TABLE nko_frames ADD CONSTRAINT fk_duplicate FOREIGN KEY (duplicate_of_id) REFERENCES nko_frames(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END \$\$;
" "nko_frames foreign key"

# Migration 003: Detection Layer
run_sql "
CREATE TABLE IF NOT EXISTS nko_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    frame_id UUID REFERENCES nko_frames(id) ON DELETE CASCADE,
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
" "nko_detections table"

run_sql "
CREATE TABLE IF NOT EXISTS nko_characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID REFERENCES nko_detections(id) ON DELETE CASCADE,
    char TEXT NOT NULL,
    code_point INTEGER NOT NULL,
    position INTEGER NOT NULL,
    char_type TEXT NOT NULL CHECK (char_type IN (
        'digit', 'vowel', 'consonant', 'combining', 'punctuation', 'whitespace', 'other'
    )),
    block_name TEXT,
    unicode_name TEXT,
    base_char_id UUID,
    is_combining BOOLEAN DEFAULT FALSE,
    combining_class INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
" "nko_characters table"

run_sql "
CREATE TABLE IF NOT EXISTS nko_bounding_boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detection_id UUID REFERENCES nko_detections(id) ON DELETE CASCADE,
    x_min FLOAT NOT NULL,
    y_min FLOAT NOT NULL,
    x_max FLOAT NOT NULL,
    y_max FLOAT NOT NULL,
    rotation_degrees FLOAT DEFAULT 0.0,
    confidence FLOAT,
    box_type TEXT CHECK (box_type IN ('text_block', 'line', 'word', 'character')),
    parent_box_id UUID,
    text_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
" "nko_bounding_boxes table"

echo ""
echo "Migration Part 1 (Source + Detection layers) complete!"
echo "Continuing with Linguistic layer..."

