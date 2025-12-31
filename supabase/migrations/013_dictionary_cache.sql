-- MIGRATION 013: Dictionary Cache Table
-- Stores entries from the Ankataa Bambara/Dioula dictionary
-- https://dictionary.ankataa.com

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Dictionary entries table
CREATE TABLE IF NOT EXISTS dictionary_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Word and normalization
    word TEXT NOT NULL,
    word_normalized TEXT NOT NULL,  -- Lowercase, no diacritics for matching
    
    -- Classification
    word_class TEXT,  -- noun, verb_transitive, verb_intransitive, adjective, etc.
    
    -- Definitions (JSONB arrays)
    definitions_en JSONB DEFAULT '[]'::jsonb,  -- English definitions
    definitions_fr JSONB DEFAULT '[]'::jsonb,  -- French definitions
    
    -- Related content (JSONB arrays)
    examples JSONB DEFAULT '[]'::jsonb,        -- Usage examples: [{bambara, english, french}]
    variants JSONB DEFAULT '[]'::jsonb,        -- Jula/Bambara variants
    synonyms JSONB DEFAULT '[]'::jsonb,        -- Related words
    
    -- Metadata
    has_tone_marks BOOLEAN DEFAULT false,
    source_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_dict_word ON dictionary_entries(word);
CREATE INDEX IF NOT EXISTS idx_dict_normalized ON dictionary_entries(word_normalized);
CREATE INDEX IF NOT EXISTS idx_dict_word_class ON dictionary_entries(word_class);

-- Trigram index for fuzzy search
CREATE INDEX IF NOT EXISTS idx_dict_word_trgm ON dictionary_entries USING gin(word gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dict_normalized_trgm ON dictionary_entries USING gin(word_normalized gin_trgm_ops);

-- Full-text search on definitions
CREATE INDEX IF NOT EXISTS idx_dict_definitions_en ON dictionary_entries USING gin(definitions_en);
CREATE INDEX IF NOT EXISTS idx_dict_definitions_fr ON dictionary_entries USING gin(definitions_fr);

-- Unique constraint on word + word_class to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_dict_unique_entry 
ON dictionary_entries(word, COALESCE(word_class, ''));

-- Comments
COMMENT ON TABLE dictionary_entries IS 'Cache of Ankataa Bambara/Dioula dictionary entries';
COMMENT ON COLUMN dictionary_entries.word IS 'Original word with diacritics';
COMMENT ON COLUMN dictionary_entries.word_normalized IS 'Normalized word for matching (lowercase, no tone marks)';
COMMENT ON COLUMN dictionary_entries.word_class IS 'Part of speech: noun, verb_transitive, adjective, etc.';
COMMENT ON COLUMN dictionary_entries.definitions_en IS 'Array of English definitions';
COMMENT ON COLUMN dictionary_entries.definitions_fr IS 'Array of French definitions';
COMMENT ON COLUMN dictionary_entries.examples IS 'Usage examples: [{bambara, english, french}]';
COMMENT ON COLUMN dictionary_entries.variants IS 'Alternative spellings/dialects (Jula vs Bambara)';
COMMENT ON COLUMN dictionary_entries.has_tone_marks IS 'Whether word contains tone diacritical marks';

-- RLS Policies
ALTER TABLE dictionary_entries ENABLE ROW LEVEL SECURITY;

-- Public read access (dictionary is public knowledge)
CREATE POLICY "Public can read dictionary"
ON dictionary_entries FOR SELECT
TO public
USING (true);

-- Service role can insert/update
CREATE POLICY "Service role can manage dictionary"
ON dictionary_entries FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_dictionary_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dictionary_entries_updated
    BEFORE UPDATE ON dictionary_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_dictionary_timestamp();

-- Utility function for fuzzy word lookup
CREATE OR REPLACE FUNCTION search_dictionary(
    search_term TEXT,
    limit_count INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    word TEXT,
    word_class TEXT,
    definitions_en JSONB,
    definitions_fr JSONB,
    similarity REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.word,
        d.word_class,
        d.definitions_en,
        d.definitions_fr,
        similarity(d.word_normalized, lower(search_term)) AS similarity
    FROM dictionary_entries d
    WHERE d.word_normalized % lower(search_term)
       OR d.word ILIKE '%' || search_term || '%'
    ORDER BY similarity DESC, d.word
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_dictionary IS 'Fuzzy search dictionary entries by word';

