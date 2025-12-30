-- Seed 003: N'Ko Greetings and Common Phrases
-- Essential conversational expressions with translations

-- ============================================
-- GREETINGS
-- ============================================

-- First, insert the greeting phrases as vocabulary
INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
-- Basic greetings
('ߌ ߛߋ߲߬ߓߊ', 'ߌ ߛߋ߲߬ߓߊ', 'i sɛnba', 'hello (I greet you)', ARRAY['hello', 'greetings', 'I greet you'], 'phrase', 'basic', 'A1', 0.1, ARRAY['greetings', 'basic'], 900, 'verified'),
('ߌ ߣߌ߫ ߛߐ߬ߜߐ߬ߡߊ', 'ߌ ߣߌ߫ ߛߐ߬ߜߐ߬ߡߊ', 'i ni sogoma', 'good morning', ARRAY['good morning'], 'phrase', 'basic', 'A1', 0.15, ARRAY['greetings', 'time'], 700, 'verified'),
('ߌ ߣߌ߫ ߕߟߋ߬', 'ߌ ߣߌ߫ ߕߟߋ߬', 'i ni tile', 'good afternoon', ARRAY['good afternoon', 'good day'], 'phrase', 'basic', 'A1', 0.15, ARRAY['greetings', 'time'], 650, 'verified'),
('ߌ ߣߌ߫ ߥߎ߬ߙߊ', 'ߌ ߣߌ߫ ߥߎ߬ߙߊ', 'i ni wura', 'good evening', ARRAY['good evening'], 'phrase', 'basic', 'A1', 0.15, ARRAY['greetings', 'time'], 600, 'verified'),
('ߌ ߣߌ߫ ߛߎ', 'ߌ ߣߌ߫ ߛߎ', 'i ni su', 'good night', ARRAY['good night', 'goodnight'], 'phrase', 'basic', 'A1', 0.15, ARRAY['greetings', 'time'], 600, 'verified'),
('ߊ ߣߌ߫ ߛߐ߲ߜߐ߲', 'ߊ ߣߌ߫ ߛߐ߲ߜߐ߲', 'a ni songon', 'welcome', ARRAY['welcome', 'you are welcome'], 'phrase', 'basic', 'A1', 0.15, ARRAY['greetings'], 550, 'verified'),

-- Responses to greetings
('ߒ߬ߛߋ', 'ߒ߬ߛߋ', 'nsɛ', 'response to greeting', ARRAY['and you too', 'same to you'], 'phrase', 'basic', 'A1', 0.1, ARRAY['greetings', 'responses'], 800, 'verified'),
('ߒ߬ߓߊ', 'ߒ߬ߓߊ', 'nba', 'thank you (response)', ARRAY['thank you', 'thanks'], 'phrase', 'basic', 'A1', 0.1, ARRAY['greetings', 'responses'], 750, 'verified'),

-- Farewell
('ߊ߲ ߓߍ߯ ߓߊ߲߫ ߓߐ߫ ߞߏ ߘߐ߫', 'ߊ߲ ߓߍ߯ ߓߊ߲߫ ߓߐ߫ ߞߏ ߘߐ߫', 'an bɛ ka bo ko do', 'goodbye', ARRAY['goodbye', 'farewell', 'see you later'], 'phrase', 'basic', 'A1', 0.25, ARRAY['greetings', 'farewell'], 500, 'verified'),
('ߊ߲ ߓߍ߲߬ ߛߌ߬ߣߌ߲߬', 'ߊ߲ ߓߍ߲߬ ߛߌ߬ߣߌ߲߬', 'an bɛn sinin', 'see you tomorrow', ARRAY['see you tomorrow', 'until tomorrow'], 'phrase', 'basic', 'A1', 0.2, ARRAY['greetings', 'farewell'], 400, 'verified'),
('ߊ߲ ߓߍ߲߬ ߞߐ', 'ߊ߲ ߓߍ߲߬ ߞߐ', 'an bɛn ko', 'see you later', ARRAY['see you later', 'until later'], 'phrase', 'basic', 'A1', 0.15, ARRAY['greetings', 'farewell'], 450, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- COURTESY EXPRESSIONS
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߌ߬ ߣߌ߬ ߓߊ߬ߙߌ߬ ߞߊ', 'ߌ߬ ߣߌ߬ ߓߊ߬ߙߌ߬ ߞߊ', 'i ni baraka', 'thank you', ARRAY['thank you', 'thanks', 'I appreciate it'], 'phrase', 'basic', 'A1', 0.15, ARRAY['courtesy', 'basic'], 800, 'verified'),
('ߊ߲ ߠߊ ߓߊ߬ߙߌ߬ ߞߊ', 'ߊ߲ ߠߊ ߓߊ߬ߙߌ߬ ߞߊ', 'an la baraka', 'thank you very much', ARRAY['thank you very much', 'many thanks'], 'phrase', 'basic', 'A1', 0.2, ARRAY['courtesy'], 500, 'verified'),
('ߒ ߓߊ߬ ߖߊ߬ߓߌ', 'ߒ ߓߊ߬ ߖߊ߬ߓߌ', 'n ba jabi', 'you''re welcome', ARRAY['you''re welcome', 'don''t mention it'], 'phrase', 'basic', 'A1', 0.15, ARRAY['courtesy'], 550, 'verified'),
('ߒ ߓߊ߬ ߡߊ߬ߞߐ߬ߣߐ߲', 'ߒ ߓߊ߬ ߡߊ߬ߞߐ߬ߣߐ߲', 'n ba makɔnɔn', 'excuse me', ARRAY['excuse me', 'pardon me', 'sorry'], 'phrase', 'basic', 'A1', 0.2, ARRAY['courtesy'], 400, 'verified'),
('ߒ ߓߊ߬ ߛߓߌ߬', 'ߒ ߓߊ߬ ߛߓߌ߬', 'n ba sabi', 'I''m sorry', ARRAY['I''m sorry', 'forgive me', 'my apologies'], 'phrase', 'basic', 'A1', 0.15, ARRAY['courtesy'], 450, 'verified'),
('ߊߟߊ߫ ߌ ߛߊ߬ߙߊ', 'ߊߟߊ߫ ߌ ߛߊ߬ߙߊ', 'Ala i sara', 'may God reward you', ARRAY['may God reward you', 'God bless you', 'thank you (religious)'], 'phrase', 'common', 'A2', 0.25, ARRAY['courtesy', 'religion'], 400, 'verified'),
('ߊ߬ߡߌ߬ߣߊ', 'ߊ߬ߡߌ߬ߣߊ', 'amina', 'amen', ARRAY['amen', 'so be it'], 'phrase', 'basic', 'A1', 0.1, ARRAY['religion', 'responses'], 500, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- COMMON CONVERSATIONAL PHRASES
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
-- Self-introduction
('ߒ ߕߐ߯ ߦߋ߫...', 'ߒ ߕߐ߯ ߦߋ߫', 'n tɔgɔ ye...', 'my name is...', ARRAY['my name is', 'I am called'], 'phrase', 'basic', 'A1', 0.15, ARRAY['introduction', 'basic'], 600, 'verified'),
('ߌ ߕߐ߮ ߖߏ߬ߟߌ', 'ߌ ߕߐ߮ ߖߏ߬ߟߌ', 'i tɔgɔ joli', 'what is your name?', ARRAY['what is your name', 'your name is what'], 'phrase', 'basic', 'A1', 0.2, ARRAY['introduction', 'questions'], 550, 'verified'),
('ߒ ߓߐ߫ ߥߊ ߦߋ߫...', 'ߒ ߓߐ߫ ߥߊ ߦߋ߫', 'n bɔ wa ye...', 'I am from...', ARRAY['I am from', 'I come from'], 'phrase', 'basic', 'A1', 0.2, ARRAY['introduction', 'geography'], 500, 'verified'),
('ߌ ߓߐ߫ ߥߊ ߡߌ߲߬', 'ߌ ߓߐ߫ ߥߊ ߡߌ߲߬', 'i bɔ wa min', 'where are you from?', ARRAY['where are you from', 'where do you come from'], 'phrase', 'basic', 'A1', 0.2, ARRAY['introduction', 'questions'], 450, 'verified'),

-- How are you
('ߌ ߞߊ߫ ߞߍ߲ߘߌ', 'ߌ ߞߊ߫ ߞߍ߲ߘߌ', 'i ka kendi', 'how are you?', ARRAY['how are you', 'are you well'], 'phrase', 'basic', 'A1', 0.15, ARRAY['greetings', 'health'], 700, 'verified'),
('ߕߐ߯ߙߐ ߛߌ߫ ߕߍ߫', 'ߕߐ߯ߙߐ ߛߌ߫ ߕߍ߫', 'tɔrɔ si te', 'I am fine, no problem', ARRAY['I am fine', 'no problem', 'all is well'], 'phrase', 'basic', 'A1', 0.2, ARRAY['greetings', 'responses'], 650, 'verified'),
('ߤߊ߰ߟߌ ߕߍ߫', 'ߤߊ߰ߟߌ ߕߍ߫', 'hali te', 'I am fine', ARRAY['I am fine', 'I am well', 'no complaints'], 'phrase', 'basic', 'A1', 0.15, ARRAY['greetings', 'responses'], 600, 'verified'),
('ߊߟߊ߫ ߣߌ ߞߍ', 'ߊߟߊ߫ ߣߌ ߞߍ', 'Ala ni ke', 'thank God', ARRAY['thank God', 'by God''s grace', 'alhamdulillah'], 'phrase', 'basic', 'A1', 0.15, ARRAY['religion', 'responses'], 550, 'verified'),

-- N'Ko learning
('ߒ ߓߊ߯ ߒߞߏ ߞߊ߬ߙߊ߲ ߠߊ߫', 'ߒ ߓߊ߯ ߒߞߏ ߞߊ߬ߙߊ߲ ߠߊ߫', 'n bɛ Nko karan na', 'I am learning N''Ko', ARRAY['I am learning N''Ko', 'I study N''Ko'], 'phrase', 'basic', 'A1', 0.25, ARRAY['learning', 'language'], 400, 'verified'),
('ߒ ߧߴߊ߬ ߝߍ߬ ߒ ߞߊ߬ ߒߞߏ ߞߊ߬ߙߊ߲', 'ߒ ߧߴߊ߬ ߝߍ߬ ߒ ߞߊ߬ ߒߞߏ ߞߊ߬ߙߊ߲', 'n ye a fe n ka Nko karan', 'I want to learn N''Ko', ARRAY['I want to learn N''Ko'], 'phrase', 'common', 'A2', 0.3, ARRAY['learning', 'language'], 350, 'verified'),
('ߒ ߕߍ߫ ߒߞߏ ߞߊ߲ ߡߍ߲ ߠߊ߫', 'ߒ ߕߍ߫ ߒߞߏ ߞߊ߲ ߡߍ߲ ߠߊ߫', 'n te Nko kan men na', 'I don''t understand N''Ko', ARRAY['I don''t understand N''Ko', 'I don''t speak N''Ko'], 'phrase', 'common', 'A2', 0.3, ARRAY['learning', 'language'], 300, 'verified'),
('ߊ߬ ߝߐ߫ ߕߎ߲߯', 'ߊ߬ ߝߐ߫ ߕߎ߲߯', 'a fo tun', 'say it again', ARRAY['say it again', 'please repeat'], 'phrase', 'basic', 'A1', 0.15, ARRAY['learning', 'requests'], 400, 'verified'),
('ߊ߬ ߝߐ߫ ߘߐ߰ߡߊ', 'ߊ߬ ߝߐ߫ ߘߐ߰ߡߊ', 'a fo doma', 'say it slowly', ARRAY['say it slowly', 'speak slowly'], 'phrase', 'basic', 'A1', 0.15, ARRAY['learning', 'requests'], 350, 'verified'),
('ߊ߬ ߘߌ߫ ߟߊ߬ߕߊ߲߬ߞߊ߬', 'ߊ߬ ߘߌ߫ ߟߊ߬ߕߊ߲߬ߞߊ߬', 'a di latankara', 'how do you write it?', ARRAY['how do you write it', 'how is it written'], 'phrase', 'common', 'A2', 0.25, ARRAY['learning', 'writing'], 300, 'verified'),

-- Understanding
('ߒ ߧߴߊ߬ ߝߊ߬ߤߊ߬ߡߎ ߠߊ߫', 'ߒ ߧߴߊ߬ ߝߊ߬ߤߊ߬ߡߎ ߠߊ߫', 'n ye a fahamu na', 'I understand', ARRAY['I understand', 'I get it'], 'phrase', 'basic', 'A1', 0.2, ARRAY['responses', 'learning'], 500, 'verified'),
('ߒ ߕߍ߫ ߊ߬ ߝߊ߬ߤߊ߬ߡߎ ߠߊ߫', 'ߒ ߕߍ߫ ߊ߬ ߝߊ߬ߤߊ߬ߡߎ ߠߊ߫', 'n te a fahamu na', 'I don''t understand', ARRAY['I don''t understand'], 'phrase', 'basic', 'A1', 0.2, ARRAY['responses', 'learning'], 450, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- CREATE TRANSLATIONS FOR KEY PHRASES
-- ============================================

-- Insert translations using the correct nko_translations schema
INSERT INTO nko_translations (nko_text, nko_text_normalized, latin_text, english_text, french_text, vocabulary_ids, text_type, context_type, formality, confidence, validated, quality_tier)
SELECT 
    v.word,
    v.word_normalized,
    v.latin,
    v.meaning_primary,
    CASE 
        WHEN v.latin = 'i sɛnba' THEN 'Bonjour (je te salue)'
        WHEN v.latin = 'i ni sogoma' THEN 'Bonjour (le matin)'
        WHEN v.latin = 'i ni tile' THEN 'Bon après-midi'
        WHEN v.latin = 'i ni wura' THEN 'Bonsoir'
        WHEN v.latin = 'i ni su' THEN 'Bonne nuit'
        WHEN v.latin = 'i ni baraka' THEN 'Merci'
        WHEN v.latin = 'n tɔgɔ ye...' THEN 'Je m''appelle...'
        WHEN v.latin = 'i ka kendi' THEN 'Comment vas-tu?'
        WHEN v.latin = 'n bɛ Nko karan na' THEN 'J''apprends le N''Ko'
        WHEN v.latin = 'n ye a fahamu na' THEN 'Je comprends'
        WHEN v.latin = 'n te a fahamu na' THEN 'Je ne comprends pas'
        ELSE NULL
    END,
    ARRAY[v.id],
    'phrase',
    CASE 
        WHEN 'greetings' = ANY(v.topics) THEN 'greeting'
        WHEN 'courtesy' = ANY(v.topics) THEN 'courtesy'
        WHEN 'introduction' = ANY(v.topics) THEN 'introduction'
        ELSE 'general'
    END,
    'informal',
    0.95,
    true,
    'gold'
FROM nko_vocabulary v
WHERE v.pos = 'phrase'
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE EXAMPLE SENTENCES
-- ============================================

-- Add example sentences for key vocabulary items using correct schema
INSERT INTO nko_examples (vocabulary_id, nko_sentence, latin_sentence, english_sentence, french_sentence, is_verified, difficulty_level)
SELECT 
    v.id,
    CASE 
        WHEN v.word = 'ߒ' THEN 'ߒ ߧߋ߫ ߒߞߏ ߞߊ߬ߙߊ߲ ߠߊ߫'
        WHEN v.word = 'ߌ' THEN 'ߌ ߕߐ߮ ߖߏ߬ߟߌ؟'
        WHEN v.word = 'ߞߊ߬' THEN 'ߒ ߧߋ߫ ߞߊ߬ ߛߏ ߞߣߐ߫'
        WHEN v.word = 'ߛߓߍ߬' THEN 'ߊ߬ ߧߋ߫ ߛߓߍ ߞߊ߲ ߛߓߍ߬ ߟߊ߫'
        WHEN v.word = 'ߛߏ' THEN 'ߒ ߛߏ ߦߋ߫ ߖߌ߬ߣߍ ߘߐ߫'
        ELSE NULL
    END,
    CASE 
        WHEN v.word = 'ߒ' THEN 'N ye Nko karan na'
        WHEN v.word = 'ߌ' THEN 'I tɔgɔ joli?'
        WHEN v.word = 'ߞߊ߬' THEN 'N ye ka so kono'
        WHEN v.word = 'ߛߓߍ߬' THEN 'A ye sɛbɛ kan sɛbɛ la'
        WHEN v.word = 'ߛߏ' THEN 'N so ye Jine do'
        ELSE NULL
    END,
    CASE 
        WHEN v.word = 'ߒ' THEN 'I am learning N''Ko'
        WHEN v.word = 'ߌ' THEN 'What is your name?'
        WHEN v.word = 'ߞߊ߬' THEN 'I went to town'
        WHEN v.word = 'ߛߓߍ߬' THEN 'He is writing a letter'
        WHEN v.word = 'ߛߏ' THEN 'My home is in Guinea'
        ELSE NULL
    END,
    CASE 
        WHEN v.word = 'ߒ' THEN 'J''apprends le N''Ko'
        WHEN v.word = 'ߌ' THEN 'Comment t''appelles-tu?'
        WHEN v.word = 'ߞߊ߬' THEN 'Je suis allé en ville'
        WHEN v.word = 'ߛߓߍ߬' THEN 'Il écrit une lettre'
        WHEN v.word = 'ߛߏ' THEN 'Ma maison est en Guinée'
        ELSE NULL
    END,
    true,
    'beginner'
FROM nko_vocabulary v
WHERE v.word IN ('ߒ', 'ߌ', 'ߞߊ߬', 'ߛߓߍ߬', 'ߛߏ')
  AND v.pos != 'letter'
ON CONFLICT DO NOTHING;

-- ============================================
-- CREATE PHONETIC DATA FOR KEY WORDS
-- ============================================

INSERT INTO nko_phonetics (vocabulary_id, ipa, ipa_broad, tone_pattern, syllables, syllable_count, dialect, is_primary)
SELECT 
    v.id,
    v.ipa_transcription,
    v.ipa_transcription,
    'level', -- Default tone pattern, to be refined
    CASE 
        WHEN v.word = 'ߒ' THEN ARRAY['ŋ̩']
        WHEN v.word = 'ߌ' THEN ARRAY['i']
        WHEN v.word = 'ߊ߬' THEN ARRAY['a']
        WHEN v.latin = 'sɛbɛ' THEN ARRAY['sɛ', 'bɛ']
        WHEN v.latin = 'karan' THEN ARRAY['ka', 'ran']
        WHEN v.latin = 'tile' THEN ARRAY['ti', 'le']
        WHEN v.latin = 'so' THEN ARRAY['so']
        WHEN v.latin = 'mɔgɔ' THEN ARRAY['mɔ', 'ɡɔ']
        ELSE ARRAY[v.latin]
    END,
    CASE 
        WHEN v.word IN ('ߒ', 'ߌ', 'ߊ߬') THEN 1
        WHEN v.latin IN ('sɛbɛ', 'karan', 'tile', 'mɔgɔ') THEN 2
        ELSE 1
    END,
    'standard',
    true
FROM nko_vocabulary v
WHERE v.ipa_transcription IS NOT NULL
  AND v.pos IN ('letter', 'noun', 'verb', 'pronoun')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY SEEDED DATA (using correct schema)
-- ============================================

-- Summary statistics
SELECT 
    'Vocabulary' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN pos = 'letter' THEN 1 END) as letters,
    COUNT(CASE WHEN pos = 'phrase' THEN 1 END) as phrases,
    COUNT(CASE WHEN 'greetings' = ANY(topics) THEN 1 END) as greetings
FROM nko_vocabulary;

SELECT 
    'Translations' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN english_text IS NOT NULL THEN 1 END) as with_english,
    COUNT(CASE WHEN french_text IS NOT NULL THEN 1 END) as with_french
FROM nko_translations;

SELECT 
    'Examples' as table_name,
    COUNT(*) as total_rows
FROM nko_examples;

SELECT 
    'Phonetics' as table_name,
    COUNT(*) as total_rows
FROM nko_phonetics;
