-- ============================================================================
-- Migration: 010_prompts_table.sql
-- Description: Create nko_prompts table for dynamic prompt management
-- Date: 2025-01-01
-- ============================================================================

-- Create prompt category enum
CREATE TYPE prompt_category AS ENUM (
    'world_exploration',
    'frame_analysis',
    'live_api',
    'audio_analysis',
    'text_extraction',
    'custom'
);

-- Create cost tier enum
CREATE TYPE prompt_cost_tier AS ENUM (
    'text_only',      -- Cheap: ~$0.0001 per call
    'multimodal',     -- Expensive: ~$0.01 per call
    'live'            -- Medium: ~$0.005 per call
);

-- ============================================================================
-- Table: nko_prompts
-- ============================================================================
-- Stores prompt templates that can be loaded dynamically at runtime.
-- Allows A/B testing, versioning, and updates without redeployment.

CREATE TABLE IF NOT EXISTS nko_prompts (
    -- Primary key
    id TEXT PRIMARY KEY,
    
    -- Metadata
    name TEXT NOT NULL,
    description TEXT,
    category prompt_category NOT NULL DEFAULT 'custom',
    
    -- Model configuration
    model_preference TEXT DEFAULT 'gemini-2.0-flash',
    cost_tier prompt_cost_tier NOT NULL DEFAULT 'text_only',
    
    -- The actual prompt template with {variable} placeholders
    template TEXT NOT NULL,
    
    -- JSON schema for expected output (optional)
    output_schema JSONB,
    
    -- Versioning
    version TEXT NOT NULL DEFAULT '1.0.0',
    
    -- Status
    active BOOLEAN NOT NULL DEFAULT true,
    
    -- Organization
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Custom metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- A/B testing
    experiment_group TEXT,
    weight FLOAT DEFAULT 1.0,
    
    -- Analytics
    usage_count BIGINT DEFAULT 0,
    success_count BIGINT DEFAULT 0,
    total_cost_usd FLOAT DEFAULT 0.0,
    avg_latency_ms FLOAT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'system',
    updated_by TEXT DEFAULT 'system'
);

-- Create indexes for common queries
CREATE INDEX idx_nko_prompts_category ON nko_prompts(category);
CREATE INDEX idx_nko_prompts_active ON nko_prompts(active);
CREATE INDEX idx_nko_prompts_tags ON nko_prompts USING GIN(tags);
CREATE INDEX idx_nko_prompts_experiment ON nko_prompts(experiment_group) WHERE experiment_group IS NOT NULL;

-- ============================================================================
-- Table: nko_prompt_history
-- ============================================================================
-- Tracks changes to prompts for auditing and rollback.

CREATE TABLE IF NOT EXISTS nko_prompt_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prompt_id TEXT NOT NULL REFERENCES nko_prompts(id) ON DELETE CASCADE,
    
    -- Previous state
    previous_template TEXT NOT NULL,
    previous_version TEXT NOT NULL,
    
    -- New state
    new_template TEXT NOT NULL,
    new_version TEXT NOT NULL,
    
    -- Change metadata
    change_reason TEXT,
    changed_by TEXT DEFAULT 'system',
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nko_prompt_history_prompt ON nko_prompt_history(prompt_id);
CREATE INDEX idx_nko_prompt_history_time ON nko_prompt_history(changed_at DESC);

-- ============================================================================
-- Table: nko_prompt_experiments
-- ============================================================================
-- Manages A/B testing experiments for prompts.

CREATE TABLE IF NOT EXISTS nko_prompt_experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Experiment metadata
    name TEXT NOT NULL,
    description TEXT,
    
    -- Configuration
    baseline_prompt_id TEXT NOT NULL REFERENCES nko_prompts(id),
    variant_prompt_id TEXT NOT NULL REFERENCES nko_prompts(id),
    
    -- Traffic split (0.0 to 1.0, percentage going to variant)
    traffic_split FLOAT NOT NULL DEFAULT 0.5 CHECK (traffic_split >= 0 AND traffic_split <= 1),
    
    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'cancelled')),
    
    -- Metrics
    baseline_usage_count BIGINT DEFAULT 0,
    variant_usage_count BIGINT DEFAULT 0,
    baseline_success_rate FLOAT,
    variant_success_rate FLOAT,
    
    -- Duration
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT DEFAULT 'system'
);

-- ============================================================================
-- Functions
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nko_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nko_prompts_updated_at
    BEFORE UPDATE ON nko_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_nko_prompts_updated_at();

-- Track prompt history on update
CREATE OR REPLACE FUNCTION track_nko_prompt_history()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.template IS DISTINCT FROM NEW.template OR OLD.version IS DISTINCT FROM NEW.version THEN
        INSERT INTO nko_prompt_history (
            prompt_id,
            previous_template,
            previous_version,
            new_template,
            new_version,
            changed_by
        ) VALUES (
            OLD.id,
            OLD.template,
            OLD.version,
            NEW.template,
            NEW.version,
            NEW.updated_by
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_nko_prompt_history
    AFTER UPDATE ON nko_prompts
    FOR EACH ROW
    EXECUTE FUNCTION track_nko_prompt_history();

-- Increment usage counter
CREATE OR REPLACE FUNCTION increment_prompt_usage(
    p_prompt_id TEXT,
    p_success BOOLEAN DEFAULT true,
    p_cost_usd FLOAT DEFAULT 0.0,
    p_latency_ms FLOAT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE nko_prompts
    SET 
        usage_count = usage_count + 1,
        success_count = success_count + CASE WHEN p_success THEN 1 ELSE 0 END,
        total_cost_usd = total_cost_usd + p_cost_usd,
        avg_latency_ms = CASE 
            WHEN p_latency_ms IS NOT NULL THEN
                COALESCE((avg_latency_ms * usage_count + p_latency_ms) / (usage_count + 1), p_latency_ms)
            ELSE avg_latency_ms
        END
    WHERE id = p_prompt_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE nko_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_prompt_experiments ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated users
CREATE POLICY "prompts_read_all" ON nko_prompts
    FOR SELECT USING (true);

-- Write access only for admin/service role
CREATE POLICY "prompts_write_admin" ON nko_prompts
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "prompt_history_read_all" ON nko_prompt_history
    FOR SELECT USING (true);

CREATE POLICY "prompt_history_write_admin" ON nko_prompt_history
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "prompt_experiments_read_all" ON nko_prompt_experiments
    FOR SELECT USING (true);

CREATE POLICY "prompt_experiments_write_admin" ON nko_prompt_experiments
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- Seed Default Prompts
-- ============================================================================

INSERT INTO nko_prompts (id, name, description, category, cost_tier, template, version, tags) VALUES

-- World Exploration Prompts
('world_everyday', 'Everyday Conversation', 'Generate casual, everyday usage variants', 'world_exploration', 'text_only',
'You are generating N''Ko language learning content for everyday conversation.

Given the following N''Ko text and translation:
N''Ko: {nko_text}
Latin: {latin_text}
English: {translation}

Generate a natural everyday conversation that uses this text. Show how a Manding speaker would use it casually with family or friends.

Respond in JSON format:
{
  "world": "everyday",
  "variants": [
    {
      "nko_text": "N''Ko script text",
      "latin_text": "romanized version",
      "english": "English translation",
      "context": "when/where this would be used",
      "register": "informal|casual|friendly"
    }
  ],
  "colloquial_forms": ["alternative casual forms"],
  "common_responses": ["typical replies one might give"],
  "cultural_note": "any cultural context for usage"
}

Generate 2-3 variants showing different casual usages.',
'1.0.0', ARRAY['world', 'everyday', 'conversation']),

('world_formal', 'Formal Writing', 'Generate formal/official usage variants', 'world_exploration', 'text_only',
'You are generating N''Ko language learning content for formal contexts.

Given the following N''Ko text and translation:
N''Ko: {nko_text}
Latin: {latin_text}
English: {translation}

Generate formal versions of this text as it would appear in official documents, letters, or speeches.

Respond in JSON format:
{
  "world": "formal",
  "variants": [...]
}

Generate 2-3 variants showing different formal usages.',
'1.0.0', ARRAY['world', 'formal', 'official']),

('world_storytelling', 'Storytelling (Griot)', 'Generate storytelling/griot tradition variants', 'world_exploration', 'text_only',
'You are a griot (jeli), a traditional West African storyteller.

Given the following N''Ko text and translation:
N''Ko: {nko_text}
Latin: {latin_text}
English: {translation}

Weave this text into a traditional Mande storytelling context.

Respond in JSON format:
{
  "world": "storytelling",
  "story_context": {...},
  "variants": [...]
}

Generate 2-3 variants showing different storytelling contexts.',
'1.0.0', ARRAY['world', 'storytelling', 'griot', 'tradition']),

('world_proverbs', 'Proverbs & Wisdom', 'Connect to Mande proverb traditions', 'world_exploration', 'text_only',
'Connect this N''Ko text to Mande wisdom traditions.

Given:
N''Ko: {nko_text}
Latin: {latin_text}
English: {translation}

Respond in JSON format:
{
  "world": "proverbs",
  "related_proverbs": [...],
  "wisdom_connections": {...}
}

Generate 2-3 related proverbs that connect thematically.',
'1.0.0', ARRAY['world', 'proverbs', 'wisdom', 'culture']),

('world_educational', 'Educational', 'Generate teaching/lesson content', 'world_exploration', 'text_only',
'You are a N''Ko language teacher.

Given:
N''Ko: {nko_text}
Latin: {latin_text}
English: {translation}

Create teaching materials for this text.

Respond in JSON format:
{
  "world": "educational",
  "lesson_content": {...},
  "breakdown": {...},
  "exercises": [...],
  "example_sentences": [...]
}

Generate comprehensive teaching content.',
'1.0.0', ARRAY['world', 'educational', 'teaching', 'lesson']),

-- Frame Analysis Prompts
('nko_frame', 'N''Ko Frame Analysis', 'Analyze video frames for N''Ko educational content', 'frame_analysis', 'multimodal',
'Analyze this frame from an N''Ko educational video. Provide a structured analysis in JSON format:

{
  "frame_type": "lesson|title|diagram|handwriting|speaker|other",
  "nko_text": {
    "visible": true/false,
    "content": "transcribed N''Ko text if visible",
    "script_quality": "clear|partial|unclear"
  },
  "topic": {
    "category": "alphabet|grammar|vocabulary|reading|writing|culture",
    "specific_topic": "description of what is being taught"
  },
  "visual_elements": {
    "teaching_aids": ["list of visual aids"],
    "speaker_visible": true/false,
    "gestures": "description of any teaching gestures"
  },
  "educational_value": 1-10,
  "summary": "brief description of the frame content"
}

Focus on extracting N''Ko script text accurately.',
'1.0.0', ARRAY['frame', 'analysis', 'multimodal', 'video'])

ON CONFLICT (id) DO UPDATE SET
    template = EXCLUDED.template,
    version = EXCLUDED.version,
    updated_at = NOW();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE nko_prompts IS 'Dynamic prompt templates for N''Ko content generation';
COMMENT ON TABLE nko_prompt_history IS 'Audit trail for prompt changes';
COMMENT ON TABLE nko_prompt_experiments IS 'A/B testing configuration for prompts';
COMMENT ON COLUMN nko_prompts.template IS 'Prompt text with {variable} placeholders';
COMMENT ON COLUMN nko_prompts.output_schema IS 'JSON Schema for validating model output';
COMMENT ON COLUMN nko_prompts.weight IS 'Weight for probabilistic selection within category';

