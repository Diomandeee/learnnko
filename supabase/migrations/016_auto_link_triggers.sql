-- MIGRATION 016: Auto-Link Triggers for Cross-Referencing
-- Automatically links detections to vocabulary and dictionary entries
-- Uses actual nko_vocabulary schema: word, latin, meaning_primary

-----------------------------------------------------------
-- Function: Normalize Latin text for matching
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION normalize_latin_text(text_input TEXT)
RETURNS TEXT AS $$
BEGIN
    IF text_input IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN lower(regexp_replace(
        regexp_replace(text_input, '[̀́̂̃̄̆̇̈̉̊̋̌̍̎̏]', '', 'g'),  -- Remove combining diacritics
        '\s+', ' ', 'g'  -- Normalize whitespace
    ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION normalize_latin_text IS 'Normalize Latin text for vocabulary matching';

-----------------------------------------------------------
-- Add vocabulary_id column to detections if not exists
-----------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nko_detections' AND column_name = 'vocabulary_id'
    ) THEN
        ALTER TABLE nko_detections ADD COLUMN vocabulary_id UUID REFERENCES nko_vocabulary(id);
        CREATE INDEX IF NOT EXISTS idx_detections_vocabulary ON nko_detections(vocabulary_id);
    END IF;
END $$;

-----------------------------------------------------------
-- Add source_detection_id to vocabulary if not exists
-----------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'nko_vocabulary' AND column_name = 'source_detection_id'
    ) THEN
        ALTER TABLE nko_vocabulary ADD COLUMN source_detection_id UUID REFERENCES nko_detections(id);
    END IF;
END $$;

-----------------------------------------------------------
-- Function: Auto-link detection to vocabulary
-- Maps detection columns to vocabulary columns:
--   detection.nko_text    -> vocabulary.word
--   detection.latin_text  -> vocabulary.latin
--   detection.english_text -> vocabulary.meaning_primary
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION link_detection_to_vocabulary()
RETURNS TRIGGER AS $$
DECLARE
    v_normalized TEXT;
    v_vocab_id UUID;
    v_dict_entry_id UUID;
    v_english TEXT;
    v_french TEXT;
    v_word_class TEXT;
BEGIN
    -- Only process if we have latin_text from the detection
    IF NEW.latin_text IS NULL OR NEW.latin_text = '' THEN
        RETURN NEW;
    END IF;
    
    -- Normalize the latin text for matching
    v_normalized := normalize_latin_text(NEW.latin_text);
    
    -- Check if vocabulary entry exists (match on latin column)
    SELECT id INTO v_vocab_id
    FROM nko_vocabulary
    WHERE word_normalized = v_normalized
       OR latin = v_normalized
    LIMIT 1;
    
    IF v_vocab_id IS NULL THEN
        -- Look up in dictionary for verified data
        SELECT 
            id,
            definitions_en->0,
            definitions_fr->0,
            word_class
        INTO v_dict_entry_id, v_english, v_french, v_word_class
        FROM dictionary_entries
        WHERE word_normalized = v_normalized
        LIMIT 1;
        
        -- Create new vocabulary entry using correct column names
        INSERT INTO nko_vocabulary (
            word,
            word_normalized,
            latin,
            meaning_primary,
            dictionary_entry_id,
            verified_english,
            verified_french,
            is_dictionary_verified,
            source_detection_id,
            status
        ) VALUES (
            NEW.nko_text,
            v_normalized,
            NEW.latin_text,
            COALESCE(v_english::text, NEW.english_text),
            v_dict_entry_id,
            v_english::text,
            v_french::text,
            v_dict_entry_id IS NOT NULL,
            NEW.id,
            CASE WHEN v_dict_entry_id IS NOT NULL THEN 'verified' ELSE 'unverified' END
        )
        ON CONFLICT (word) DO UPDATE SET
            -- Update if this is a new detection with potentially better data
            latin = COALESCE(nko_vocabulary.latin, EXCLUDED.latin),
            meaning_primary = COALESCE(nko_vocabulary.meaning_primary, EXCLUDED.meaning_primary),
            dictionary_entry_id = COALESCE(nko_vocabulary.dictionary_entry_id, EXCLUDED.dictionary_entry_id),
            verified_english = COALESCE(nko_vocabulary.verified_english, EXCLUDED.verified_english),
            verified_french = COALESCE(nko_vocabulary.verified_french, EXCLUDED.verified_french),
            is_dictionary_verified = nko_vocabulary.is_dictionary_verified OR EXCLUDED.is_dictionary_verified,
            frequency = nko_vocabulary.frequency + 1,
            updated_at = now()
        RETURNING id INTO v_vocab_id;
    ELSE
        -- Update existing vocabulary frequency
        UPDATE nko_vocabulary
        SET 
            frequency = COALESCE(frequency, 0) + 1,
            updated_at = now()
        WHERE id = v_vocab_id;
    END IF;
    
    -- Link detection to vocabulary
    NEW.vocabulary_id := v_vocab_id;
    
    -- Queue for enrichment if not dictionary verified
    IF v_dict_entry_id IS NULL THEN
        -- Check if queue function exists before calling
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'queue_word_for_enrichment') THEN
            PERFORM queue_word_for_enrichment(
                v_normalized,
                'video_detection',
                NEW.id::text,
                2,  -- Priority 2 for video detections
                jsonb_build_object(
                    'nko_text', NEW.nko_text,
                    'english_text', NEW.english_text,
                    'frame_id', NEW.frame_id
                )
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION link_detection_to_vocabulary IS 'Auto-links detections to vocabulary and queues for enrichment';

-----------------------------------------------------------
-- Create the trigger
-----------------------------------------------------------

DROP TRIGGER IF EXISTS trigger_link_detection ON nko_detections;

CREATE TRIGGER trigger_link_detection
    BEFORE INSERT ON nko_detections
    FOR EACH ROW
    EXECUTE FUNCTION link_detection_to_vocabulary();

COMMENT ON TRIGGER trigger_link_detection ON nko_detections IS 'Auto-links new detections to vocabulary';

-----------------------------------------------------------
-- Function: Cascade dictionary verification to vocabulary
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION cascade_dictionary_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- When a dictionary entry is inserted/updated, update matching vocabulary entries
    UPDATE nko_vocabulary
    SET 
        dictionary_entry_id = NEW.id,
        verified_english = COALESCE(NEW.definitions_en->0)::text,
        verified_french = COALESCE(NEW.definitions_fr->0)::text,
        is_dictionary_verified = true,
        status = 'verified',
        updated_at = now()
    WHERE word_normalized = NEW.word_normalized
      AND (dictionary_entry_id IS NULL OR dictionary_entry_id = NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cascade_dict ON dictionary_entries;

CREATE TRIGGER trigger_cascade_dict
    AFTER INSERT OR UPDATE ON dictionary_entries
    FOR EACH ROW
    EXECUTE FUNCTION cascade_dictionary_verification();

COMMENT ON TRIGGER trigger_cascade_dict ON dictionary_entries IS 'Cascades dictionary data to vocabulary entries';

-----------------------------------------------------------
-- Backfill: Link existing detections to vocabulary
-----------------------------------------------------------

CREATE OR REPLACE FUNCTION link_existing_detections()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_detection RECORD;
    v_vocab_id UUID;
    v_normalized TEXT;
BEGIN
    FOR v_detection IN 
        SELECT id, nko_text, latin_text, english_text, frame_id
        FROM nko_detections
        WHERE latin_text IS NOT NULL 
        AND latin_text != ''
        AND vocabulary_id IS NULL
    LOOP
        v_normalized := normalize_latin_text(v_detection.latin_text);
        
        -- Find or create vocabulary entry
        SELECT id INTO v_vocab_id
        FROM nko_vocabulary
        WHERE word_normalized = v_normalized
           OR latin = v_normalized
        LIMIT 1;
        
        IF v_vocab_id IS NULL THEN
            -- Create new vocabulary entry
            INSERT INTO nko_vocabulary (
                word,
                word_normalized,
                latin,
                meaning_primary,
                source_detection_id,
                status
            ) VALUES (
                v_detection.nko_text,
                v_normalized,
                v_detection.latin_text,
                v_detection.english_text,
                v_detection.id,
                'unverified'
            )
            ON CONFLICT (word) DO UPDATE SET
                frequency = nko_vocabulary.frequency + 1
            RETURNING id INTO v_vocab_id;
        END IF;
        
        -- Link detection
        UPDATE nko_detections
        SET vocabulary_id = v_vocab_id
        WHERE id = v_detection.id;
        
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION link_existing_detections IS 'Backfill: Links existing detections to vocabulary';

-----------------------------------------------------------
-- View: Detection-Vocabulary-Dictionary join
-----------------------------------------------------------

CREATE OR REPLACE VIEW detection_vocabulary_view AS
SELECT 
    d.id AS detection_id,
    d.nko_text AS detected_nko,
    d.latin_text AS detected_latin,
    d.english_text AS detected_english,
    d.confidence AS detection_confidence,
    v.id AS vocabulary_id,
    v.word AS vocab_word,
    v.latin AS vocab_latin,
    v.meaning_primary AS vocab_meaning,
    v.is_dictionary_verified,
    v.status AS vocab_status,
    v.frequency AS vocab_frequency,
    de.word AS dict_word,
    de.word_class,
    de.definitions_en AS dict_english,
    de.definitions_fr AS dict_french,
    de.variants,
    de.synonyms
FROM nko_detections d
LEFT JOIN nko_vocabulary v ON d.vocabulary_id = v.id
LEFT JOIN dictionary_entries de ON v.dictionary_entry_id = de.id;

COMMENT ON VIEW detection_vocabulary_view IS 'Joined view of detections with vocabulary and dictionary data';
