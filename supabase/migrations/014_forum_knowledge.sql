-- MIGRATION 014: Forum Knowledge Base Table
-- Stores extracted knowledge from the Ankataa Forum
-- https://ankataa.discourse.group

-- Forum knowledge table
CREATE TABLE IF NOT EXISTS forum_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Topic identification
    topic_id TEXT UNIQUE NOT NULL,  -- Discourse topic ID
    category TEXT,                   -- Category name
    
    -- Content
    title TEXT NOT NULL,
    content TEXT,                    -- Full topic content
    
    -- Structured data
    answers JSONB DEFAULT '[]'::jsonb,       -- Expert responses
    related_words JSONB DEFAULT '[]'::jsonb,  -- Words discussed in topic
    tags JSONB DEFAULT '[]'::jsonb,           -- Topic tags
    
    -- Metadata
    author TEXT,
    url TEXT,
    views INT DEFAULT 0,
    replies INT DEFAULT 0,
    
    -- Timestamps
    forum_created_at TIMESTAMPTZ,    -- When topic was created on forum
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forum_category ON forum_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_forum_tags ON forum_knowledge USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_forum_related_words ON forum_knowledge USING gin(related_words);

-- Full-text search on title and content
CREATE INDEX IF NOT EXISTS idx_forum_title_fts 
ON forum_knowledge USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_forum_content_fts 
ON forum_knowledge USING gin(to_tsvector('english', COALESCE(content, '')));

-- Comments
COMMENT ON TABLE forum_knowledge IS 'Knowledge extracted from Ankataa Discourse forum';
COMMENT ON COLUMN forum_knowledge.topic_id IS 'Unique topic ID from Discourse';
COMMENT ON COLUMN forum_knowledge.category IS 'Forum category: Word Questions, Word Not in Dictionary, etc.';
COMMENT ON COLUMN forum_knowledge.answers IS 'Expert/community answers as structured data';
COMMENT ON COLUMN forum_knowledge.related_words IS 'Bambara/Dioula words discussed in topic';

-- RLS Policies
ALTER TABLE forum_knowledge ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read forum knowledge"
ON forum_knowledge FOR SELECT
TO public
USING (true);

-- Service role can manage
CREATE POLICY "Service role can manage forum knowledge"
ON forum_knowledge FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Update trigger
CREATE TRIGGER forum_knowledge_updated
    BEFORE UPDATE ON forum_knowledge
    FOR EACH ROW
    EXECUTE FUNCTION update_dictionary_timestamp();

-----------------------------------------------------------
-- Extend nko_vocabulary with dictionary cross-reference
-----------------------------------------------------------

-- Add dictionary reference columns to nko_vocabulary
ALTER TABLE nko_vocabulary 
ADD COLUMN IF NOT EXISTS dictionary_entry_id UUID REFERENCES dictionary_entries(id),
ADD COLUMN IF NOT EXISTS word_class TEXT,
ADD COLUMN IF NOT EXISTS verified_english TEXT,
ADD COLUMN IF NOT EXISTS verified_french TEXT,
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_dictionary_verified BOOLEAN DEFAULT false;

-- Index for dictionary lookups
CREATE INDEX IF NOT EXISTS idx_vocab_dict_entry 
ON nko_vocabulary(dictionary_entry_id) 
WHERE dictionary_entry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_vocab_verified 
ON nko_vocabulary(is_dictionary_verified) 
WHERE is_dictionary_verified = true;

COMMENT ON COLUMN nko_vocabulary.dictionary_entry_id IS 'Reference to verified dictionary entry';
COMMENT ON COLUMN nko_vocabulary.is_dictionary_verified IS 'Whether this word has been verified against the dictionary';
COMMENT ON COLUMN nko_vocabulary.verified_english IS 'Verified English translation from dictionary';
COMMENT ON COLUMN nko_vocabulary.verified_french IS 'Verified French translation from dictionary';

-----------------------------------------------------------
-- Function to link vocabulary to dictionary
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION link_vocabulary_to_dictionary()
RETURNS INT AS $$
DECLARE
    linked_count INT := 0;
BEGIN
    -- Update vocabulary entries with matching dictionary entries
    WITH matches AS (
        SELECT 
            v.id AS vocab_id,
            d.id AS dict_id,
            d.word_class,
            d.definitions_en->>0 AS en_def,
            d.definitions_fr->>0 AS fr_def,
            d.variants
        FROM nko_vocabulary v
        JOIN dictionary_entries d 
            ON lower(v.latin_text) = d.word_normalized
        WHERE v.dictionary_entry_id IS NULL
    )
    UPDATE nko_vocabulary v
    SET 
        dictionary_entry_id = m.dict_id,
        word_class = m.word_class,
        verified_english = m.en_def,
        verified_french = m.fr_def,
        variants = m.variants,
        is_dictionary_verified = true
    FROM matches m
    WHERE v.id = m.vocab_id;
    
    GET DIAGNOSTICS linked_count = ROW_COUNT;
    RETURN linked_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION link_vocabulary_to_dictionary IS 'Links vocabulary entries to matching dictionary entries';

