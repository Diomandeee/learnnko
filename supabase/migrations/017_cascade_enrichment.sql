-- MIGRATION 017: Cascade Enrichment for Related Words
-- When a word is enriched, automatically queue its variants and synonyms
-- Uses actual nko_vocabulary schema: word, latin, meaning_primary

-----------------------------------------------------------
-- Function: Queue related words when vocabulary is enriched
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION cascade_queue_related_words()
RETURNS TRIGGER AS $$
DECLARE
    v_variant TEXT;
    v_synonym TEXT;
    v_variants JSONB;
    v_synonyms JSONB;
BEGIN
    -- Only cascade when dictionary_entry_id is set (verified)
    IF NEW.dictionary_entry_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Only cascade on new verification (not updates to already verified)
    IF OLD IS NOT NULL AND OLD.dictionary_entry_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Get variants and synonyms from the dictionary entry
    SELECT variants, synonyms INTO v_variants, v_synonyms
    FROM dictionary_entries
    WHERE id = NEW.dictionary_entry_id;
    
    -- Check if queue function exists before proceeding
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'queue_word_for_enrichment') THEN
        RETURN NEW;
    END IF;
    
    -- Queue each variant for enrichment
    IF v_variants IS NOT NULL AND jsonb_array_length(v_variants) > 0 THEN
        FOR v_variant IN SELECT jsonb_array_elements_text(v_variants)
        LOOP
            IF v_variant IS NOT NULL AND length(v_variant) >= 2 THEN
                PERFORM queue_word_for_enrichment(
                    v_variant,
                    'dictionary_variant',
                    NEW.id::text,
                    4,  -- Priority 4 for variants
                    jsonb_build_object(
                        'parent_word', NEW.latin,
                        'parent_vocabulary_id', NEW.id,
                        'relationship', 'variant'
                    )
                );
            END IF;
        END LOOP;
    END IF;
    
    -- Queue each synonym for enrichment
    IF v_synonyms IS NOT NULL AND jsonb_array_length(v_synonyms) > 0 THEN
        FOR v_synonym IN SELECT jsonb_array_elements_text(v_synonyms)
        LOOP
            IF v_synonym IS NOT NULL AND length(v_synonym) >= 2 THEN
                PERFORM queue_word_for_enrichment(
                    v_synonym,
                    'dictionary_synonym',
                    NEW.id::text,
                    5,  -- Priority 5 for synonyms
                    jsonb_build_object(
                        'parent_word', NEW.latin,
                        'parent_vocabulary_id', NEW.id,
                        'relationship', 'synonym'
                    )
                );
            END IF;
        END LOOP;
    END IF;
    
    -- Update learning stats if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'learning_stats') THEN
        INSERT INTO learning_stats (stat_date, dictionary_matches)
        VALUES (CURRENT_DATE, 1)
        ON CONFLICT (stat_date) 
        DO UPDATE SET 
            dictionary_matches = learning_stats.dictionary_matches + 1,
            updated_at = now();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cascade_queue_related_words IS 'Queues variants and synonyms when vocabulary is dictionary-verified';

-----------------------------------------------------------
-- Trigger: Cascade on vocabulary update
-----------------------------------------------------------

DROP TRIGGER IF EXISTS trigger_cascade_related ON nko_vocabulary;

CREATE TRIGGER trigger_cascade_related
    AFTER INSERT OR UPDATE OF dictionary_entry_id ON nko_vocabulary
    FOR EACH ROW
    WHEN (NEW.dictionary_entry_id IS NOT NULL)
    EXECUTE FUNCTION cascade_queue_related_words();

COMMENT ON TRIGGER trigger_cascade_related ON nko_vocabulary IS 'Cascades enrichment to related words';

-----------------------------------------------------------
-- Function: Track word relationships
-----------------------------------------------------------

CREATE TABLE IF NOT EXISTS vocabulary_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_vocabulary_id UUID NOT NULL REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    target_vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE SET NULL,
    target_word TEXT NOT NULL,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('variant', 'synonym', 'related', 'antonym', 'derived')),
    confidence FLOAT DEFAULT 0.5,
    source TEXT DEFAULT 'dictionary',  -- 'dictionary', 'ai', 'user'
    created_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(source_vocabulary_id, target_word, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_vocab_rel_source ON vocabulary_relationships(source_vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_vocab_rel_target ON vocabulary_relationships(target_vocabulary_id);
CREATE INDEX IF NOT EXISTS idx_vocab_rel_word ON vocabulary_relationships(target_word);

COMMENT ON TABLE vocabulary_relationships IS 'Tracks relationships between vocabulary entries';

-----------------------------------------------------------
-- Function: Record vocabulary relationships
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION record_vocabulary_relationship(
    p_source_vocab_id UUID,
    p_target_word TEXT,
    p_relationship_type TEXT,
    p_source TEXT DEFAULT 'dictionary'
)
RETURNS UUID AS $$
DECLARE
    v_target_vocab_id UUID;
    v_rel_id UUID;
BEGIN
    -- Find target vocabulary if exists (using correct column name)
    SELECT id INTO v_target_vocab_id
    FROM nko_vocabulary
    WHERE word_normalized = normalize_latin_text(p_target_word)
       OR latin = normalize_latin_text(p_target_word)
    LIMIT 1;
    
    -- Insert or update relationship
    INSERT INTO vocabulary_relationships (
        source_vocabulary_id,
        target_vocabulary_id,
        target_word,
        relationship_type,
        source
    ) VALUES (
        p_source_vocab_id,
        v_target_vocab_id,
        normalize_latin_text(p_target_word),
        p_relationship_type,
        p_source
    )
    ON CONFLICT (source_vocabulary_id, target_word, relationship_type)
    DO UPDATE SET
        target_vocabulary_id = COALESCE(vocabulary_relationships.target_vocabulary_id, EXCLUDED.target_vocabulary_id),
        confidence = vocabulary_relationships.confidence + 0.1  -- Increase confidence on re-discovery
    RETURNING id INTO v_rel_id;
    
    RETURN v_rel_id;
END;
$$ LANGUAGE plpgsql;

-----------------------------------------------------------
-- Function: Auto-link relationship targets when vocabulary created
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION link_vocabulary_relationships()
RETURNS TRIGGER AS $$
BEGIN
    -- Update any relationships pointing to this word (using correct column)
    UPDATE vocabulary_relationships
    SET target_vocabulary_id = NEW.id
    WHERE target_word = NEW.word_normalized
       OR target_word = NEW.latin
    AND target_vocabulary_id IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_link_vocab_rel ON nko_vocabulary;

CREATE TRIGGER trigger_link_vocab_rel
    AFTER INSERT ON nko_vocabulary
    FOR EACH ROW
    EXECUTE FUNCTION link_vocabulary_relationships();

-----------------------------------------------------------
-- View: Vocabulary with relationships
-----------------------------------------------------------

CREATE OR REPLACE VIEW vocabulary_with_relationships AS
SELECT 
    v.id,
    v.word,
    v.latin,
    v.meaning_primary,
    v.is_dictionary_verified,
    v.status,
    v.frequency,
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object(
            'word', vr.target_word,
            'type', vr.relationship_type,
            'linked', vr.target_vocabulary_id IS NOT NULL
        ))
        FROM vocabulary_relationships vr
        WHERE vr.source_vocabulary_id = v.id),
        '[]'::jsonb
    ) AS related_words,
    (SELECT COUNT(*) FROM vocabulary_relationships WHERE source_vocabulary_id = v.id) AS relationship_count
FROM nko_vocabulary v;

COMMENT ON VIEW vocabulary_with_relationships IS 'Vocabulary entries with their related words';

-----------------------------------------------------------
-- RLS Policies
-----------------------------------------------------------

ALTER TABLE vocabulary_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read relationships" ON vocabulary_relationships;
CREATE POLICY "Public can read relationships"
ON vocabulary_relationships FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Service role can manage relationships" ON vocabulary_relationships;
CREATE POLICY "Service role can manage relationships"
ON vocabulary_relationships FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
