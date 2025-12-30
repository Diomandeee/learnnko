-- Migration 004: Linguistic Layer Tables
-- N'Ko Language Learning Database
--
-- Core language knowledge: vocabulary, translations, examples.
-- This is the heart of the linguistic database.

-- ============================================
-- nko_vocabulary: Master dictionary
-- ============================================
CREATE TABLE nko_vocabulary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core word data
    word TEXT NOT NULL UNIQUE,
    word_normalized TEXT NOT NULL, -- Canonical form with consistent ordering
    latin TEXT, -- Primary romanization
    latin_variants TEXT[] DEFAULT '{}', -- Alternative romanizations
    
    -- Meanings
    meaning_primary TEXT, -- Primary English meaning
    meanings TEXT[] DEFAULT '{}', -- All meanings
    definition TEXT, -- Extended definition/explanation
    
    -- Linguistic properties
    pos TEXT CHECK (pos IN (
        'noun', 'verb', 'adjective', 'adverb', 'pronoun',
        'conjunction', 'preposition', 'postposition', 'interjection', 
        'particle', 'determiner', 'number', 'letter', 'phrase', 'affix'
    )),
    
    -- Word relationships
    root_word_id UUID REFERENCES nko_vocabulary(id),
    plural_form TEXT,
    singular_form TEXT,
    
    -- Verb conjugations (if applicable)
    verb_conjugations JSONB, -- {tense: {person: form}}
    verb_class TEXT, -- Regular, irregular, etc.
    
    -- Noun properties
    noun_class TEXT, -- Manding noun class if applicable
    gender TEXT CHECK (gender IN ('masculine', 'feminine', 'neuter', 'none')),
    
    -- Dialectal information
    dialects TEXT[] DEFAULT '{}', -- ['bambara', 'dyula', 'mandinka', 'maninka']
    variants JSONB DEFAULT '{}', -- {dialect: variant_text}
    is_loanword BOOLEAN DEFAULT FALSE,
    loanword_source TEXT, -- Arabic, French, English, etc.
    
    -- Usage frequency
    frequency INTEGER DEFAULT 0, -- Occurrence count in corpus
    frequency_rank INTEGER, -- Rank by frequency
    category TEXT CHECK (category IN (
        'basic', 'common', 'intermediate', 'advanced', 
        'academic', 'technical', 'literary', 'colloquial', 'archaic'
    )),
    
    -- Learning metadata
    cefr_level TEXT CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
    difficulty_score FLOAT CHECK (difficulty_score BETWEEN 0.0 AND 1.0),
    topics TEXT[] DEFAULT '{}', -- ['greetings', 'family', 'numbers', 'food']
    
    -- Statistics (Welford algorithm for online mean/variance)
    learn_count INTEGER DEFAULT 0,
    learn_mean FLOAT DEFAULT 0.0,
    learn_m2 FLOAT DEFAULT 0.0,
    
    -- Audio/pronunciation
    ipa_transcription TEXT,
    audio_url TEXT,
    tone_pattern TEXT, -- Tonal information
    
    -- Status
    status TEXT DEFAULT 'unverified' CHECK (status IN (
        'unverified', 'verified', 'disputed', 'deprecated', 'merged'
    )),
    merged_into_id UUID REFERENCES nko_vocabulary(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE nko_vocabulary IS 'Master N''Ko vocabulary dictionary';
COMMENT ON COLUMN nko_vocabulary.word_normalized IS 'Canonical form with consistent Unicode normalization';
COMMENT ON COLUMN nko_vocabulary.learn_mean IS 'Welford running mean of learning scores';
COMMENT ON COLUMN nko_vocabulary.learn_m2 IS 'Welford M2 for variance calculation';

-- ============================================
-- nko_translations: Translation pairs
-- ============================================
CREATE TABLE nko_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Text content (multilingual)
    nko_text TEXT NOT NULL,
    nko_text_normalized TEXT,
    latin_text TEXT,
    english_text TEXT,
    french_text TEXT, -- Many N'Ko speakers are francophone
    arabic_text TEXT, -- Historical/religious context
    
    -- Relationship to vocabulary
    vocabulary_ids UUID[] DEFAULT '{}', -- Words involved in this translation
    
    -- Source tracking
    detection_id UUID REFERENCES nko_detections(id) ON DELETE SET NULL,
    source_id UUID REFERENCES nko_sources(id) ON DELETE SET NULL,
    frame_id UUID REFERENCES nko_frames(id) ON DELETE SET NULL,
    
    -- Classification
    text_type TEXT CHECK (text_type IN (
        'word', 'phrase', 'sentence', 'paragraph', 'dialogue', 'proverb'
    )),
    context_type TEXT,
    formality TEXT CHECK (formality IN ('formal', 'informal', 'neutral', 'literary')),
    register TEXT CHECK (register IN ('spoken', 'written', 'both')),
    
    -- Quality metrics
    confidence FLOAT DEFAULT 0.0,
    validated BOOLEAN DEFAULT FALSE,
    validation_score FLOAT, -- Average community validation score
    validation_count INTEGER DEFAULT 0,
    correction_count INTEGER DEFAULT 0,
    
    -- ML training flags
    is_training_sample BOOLEAN DEFAULT FALSE,
    is_validation_sample BOOLEAN DEFAULT FALSE,
    is_test_sample BOOLEAN DEFAULT FALSE,
    quality_tier TEXT CHECK (quality_tier IN ('gold', 'silver', 'bronze', 'raw')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_translations IS 'N''Ko translation pairs with multiple target languages';

-- ============================================
-- nko_examples: Example sentences
-- ============================================
CREATE TABLE nko_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    
    -- Example content
    nko_sentence TEXT NOT NULL,
    latin_sentence TEXT,
    english_sentence TEXT,
    french_sentence TEXT,
    
    -- Word highlighting (position of target word in sentence)
    word_start_pos INTEGER,
    word_end_pos INTEGER,
    
    -- Source
    source_id UUID REFERENCES nko_sources(id) ON DELETE SET NULL,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE SET NULL,
    context_note TEXT,
    
    -- Quality
    is_verified BOOLEAN DEFAULT FALSE,
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_examples IS 'Example sentences demonstrating vocabulary usage';

-- ============================================
-- nko_phonetics: Pronunciation data
-- ============================================
CREATE TABLE nko_phonetics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    
    -- Phonetic representations
    ipa TEXT NOT NULL, -- International Phonetic Alphabet
    ipa_broad TEXT, -- Broad transcription
    ipa_narrow TEXT, -- Narrow transcription
    
    -- Tone information (N'Ko is tonal)
    tone_pattern TEXT, -- e.g., 'HLH' for High-Low-High
    tone_marks TEXT, -- Unicode tone marks
    
    -- Audio
    audio_url TEXT,
    audio_duration_ms INTEGER,
    
    -- Syllable breakdown
    syllables TEXT[], -- Array of syllables
    syllable_count INTEGER,
    
    -- Dialect variation
    dialect TEXT,
    is_primary BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_phonetics IS 'Pronunciation and phonetic data for vocabulary';

-- ============================================
-- nko_grammar_rules: Grammar patterns
-- ============================================
CREATE TABLE nko_grammar_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rule identification
    rule_name TEXT NOT NULL,
    rule_category TEXT CHECK (rule_category IN (
        'morphology', 'syntax', 'phonology', 'tone', 
        'noun_class', 'verb_conjugation', 'word_order', 'agreement'
    )),
    
    -- Rule content
    description TEXT NOT NULL,
    pattern TEXT, -- Regex or template pattern
    pattern_nko TEXT, -- Pattern shown in N'Ko
    
    -- Examples
    examples JSONB DEFAULT '[]', -- [{nko, latin, english, explanation}]
    
    -- Exceptions
    exceptions JSONB DEFAULT '[]',
    
    -- Related vocabulary
    related_vocabulary_ids UUID[] DEFAULT '{}',
    
    -- Learning
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    prerequisite_rule_ids UUID[] DEFAULT '{}',
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_grammar_rules IS 'N''Ko grammatical rules and patterns';

-- ============================================
-- nko_word_relationships: Semantic relationships
-- ============================================
CREATE TABLE nko_word_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    word_id UUID NOT NULL REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    related_word_id UUID NOT NULL REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'synonym', 'antonym', 'hypernym', 'hyponym',
        'meronym', 'holonym', 'derived', 'compound',
        'related', 'see_also'
    )),
    
    -- Strength of relationship
    strength FLOAT DEFAULT 1.0 CHECK (strength BETWEEN 0.0 AND 1.0),
    
    -- Bidirectional?
    is_bidirectional BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate relationships
    UNIQUE(word_id, related_word_id, relationship_type)
);

COMMENT ON TABLE nko_word_relationships IS 'Semantic relationships between vocabulary words';

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE TRIGGER trigger_vocabulary_updated_at
BEFORE UPDATE ON nko_vocabulary
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_translations_updated_at
BEFORE UPDATE ON nko_translations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_grammar_rules_updated_at
BEFORE UPDATE ON nko_grammar_rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

