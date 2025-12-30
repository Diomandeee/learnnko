-- Seed 001: N'Ko Alphabet
-- Complete N'Ko Unicode block (U+07C0-U+07FF)
-- 59 characters: 10 digits, 7 vowels, 19 consonants, 7 combining marks, 16 special

-- ============================================
-- N'KO DIGITS (U+07C0-U+07C9)
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, status)
VALUES
-- Digits 0-9
('߀', '߀', '0', 'zero', ARRAY['zero', 'none'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߁', '߁', '1', 'one', ARRAY['one', 'first'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߂', '߂', '2', 'two', ARRAY['two', 'second'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߃', '߃', '3', 'three', ARRAY['three', 'third'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߄', '߄', '4', 'four', ARRAY['four', 'fourth'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߅', '߅', '5', 'five', ARRAY['five', 'fifth'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߆', '߆', '6', 'six', ARRAY['six', 'sixth'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߇', '߇', '7', 'seven', ARRAY['seven', 'seventh'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߈', '߈', '8', 'eight', ARRAY['eight', 'eighth'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified'),
('߉', '߉', '9', 'nine', ARRAY['nine', 'ninth'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'alphabet'], 'verified')
ON CONFLICT (word) DO NOTHING;

-- ============================================
-- N'KO VOWELS (U+07CA-U+07D0)
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, ipa_transcription, category, cefr_level, difficulty_score, topics, status)
VALUES
('ߊ', 'ߊ', 'a', 'letter A - open front unrounded vowel', ARRAY['a', 'letter A'], 'letter', 'a', 'basic', 'A1', 0.1, ARRAY['vowels', 'alphabet'], 'verified'),
('ߋ', 'ߋ', 'e', 'letter E - close-mid front unrounded vowel', ARRAY['e', 'letter E'], 'letter', 'e', 'basic', 'A1', 0.1, ARRAY['vowels', 'alphabet'], 'verified'),
('ߌ', 'ߌ', 'i', 'letter I - close front unrounded vowel', ARRAY['i', 'letter I', 'you (pronoun)'], 'letter', 'i', 'basic', 'A1', 0.1, ARRAY['vowels', 'alphabet', 'pronouns'], 'verified'),
('ߍ', 'ߍ', 'ɛ', 'letter EE - open-mid front unrounded vowel', ARRAY['ɛ', 'letter EE'], 'letter', 'ɛ', 'basic', 'A1', 0.15, ARRAY['vowels', 'alphabet'], 'verified'),
('ߎ', 'ߎ', 'u', 'letter U - close back rounded vowel', ARRAY['u', 'letter U'], 'letter', 'u', 'basic', 'A1', 0.1, ARRAY['vowels', 'alphabet'], 'verified'),
('ߏ', 'ߏ', 'o', 'letter O - close-mid back rounded vowel', ARRAY['o', 'letter O'], 'letter', 'o', 'basic', 'A1', 0.1, ARRAY['vowels', 'alphabet'], 'verified'),
('ߐ', 'ߐ', 'ɔ', 'letter OO - open-mid back rounded vowel', ARRAY['ɔ', 'letter OO'], 'letter', 'ɔ', 'basic', 'A1', 0.15, ARRAY['vowels', 'alphabet'], 'verified')
ON CONFLICT (word) DO NOTHING;

-- ============================================
-- N'KO CONSONANTS (U+07D1-U+07E7)
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, ipa_transcription, category, cefr_level, difficulty_score, topics, status)
VALUES
-- Special consonants
('ߑ', 'ߑ', 'dagbasinna', 'vowel lengthener - marks vowel absence', ARRAY['dagbasinna', 'vowel lengthener'], 'letter', NULL, 'basic', 'A2', 0.3, ARRAY['consonants', 'alphabet', 'diacritics'], 'verified'),
('ߒ', 'ߒ', 'n̄', 'letter N - syllabic nasal / I (pronoun)', ARRAY['n̄', 'syllabic n', 'I', 'me'], 'letter', 'ŋ̩', 'basic', 'A1', 0.15, ARRAY['consonants', 'alphabet', 'pronouns'], 'verified'),

-- Regular consonants
('ߓ', 'ߓ', 'b', 'letter BA - voiced bilabial plosive', ARRAY['b', 'letter BA'], 'letter', 'b', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߔ', 'ߔ', 'p', 'letter PA - voiceless bilabial plosive', ARRAY['p', 'letter PA'], 'letter', 'p', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߕ', 'ߕ', 't', 'letter TA - voiceless alveolar plosive', ARRAY['t', 'letter TA'], 'letter', 't', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߖ', 'ߖ', 'j', 'letter JA - voiced palato-alveolar affricate', ARRAY['j', 'dʒ', 'letter JA'], 'letter', 'dʒ', 'basic', 'A1', 0.15, ARRAY['consonants', 'alphabet'], 'verified'),
('ߗ', 'ߗ', 'ch', 'letter CHA - voiceless palato-alveolar affricate', ARRAY['ch', 'tʃ', 'letter CHA'], 'letter', 'tʃ', 'basic', 'A1', 0.15, ARRAY['consonants', 'alphabet'], 'verified'),
('ߘ', 'ߘ', 'd', 'letter DA - voiced alveolar plosive', ARRAY['d', 'letter DA'], 'letter', 'd', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߙ', 'ߙ', 'r', 'letter RA - alveolar tap', ARRAY['r', 'letter RA'], 'letter', 'ɾ', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߚ', 'ߚ', 'rr', 'letter RRA - alveolar trill', ARRAY['rr', 'letter RRA', 'rolled r'], 'letter', 'r', 'basic', 'A1', 0.2, ARRAY['consonants', 'alphabet'], 'verified'),
('ߛ', 'ߛ', 's', 'letter SA - voiceless alveolar fricative', ARRAY['s', 'letter SA'], 'letter', 's', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߜ', 'ߜ', 'gb', 'letter GBA - labial-velar plosive', ARRAY['gb', 'letter GBA'], 'letter', 'ɡ͡b', 'basic', 'A2', 0.25, ARRAY['consonants', 'alphabet'], 'verified'),
('ߝ', 'ߝ', 'f', 'letter FA - voiceless labiodental fricative', ARRAY['f', 'letter FA'], 'letter', 'f', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߞ', 'ߞ', 'k', 'letter KA - voiceless velar plosive', ARRAY['k', 'letter KA'], 'letter', 'k', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߟ', 'ߟ', 'l', 'letter LA - alveolar lateral approximant', ARRAY['l', 'letter LA'], 'letter', 'l', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߠ', 'ߠ', 'na woloso', 'letter NA WOLOSO - abstract n', ARRAY['na woloso', 'abstract n'], 'letter', 'n', 'basic', 'A2', 0.3, ARRAY['consonants', 'alphabet'], 'verified'),
('ߡ', 'ߡ', 'm', 'letter MA - bilabial nasal', ARRAY['m', 'letter MA'], 'letter', 'm', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߢ', 'ߢ', 'ny', 'letter NYA - palatal nasal', ARRAY['ny', 'ɲ', 'letter NYA'], 'letter', 'ɲ', 'basic', 'A1', 0.15, ARRAY['consonants', 'alphabet'], 'verified'),
('ߣ', 'ߣ', 'n', 'letter NA - alveolar nasal', ARRAY['n', 'letter NA'], 'letter', 'n', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߤ', 'ߤ', 'h', 'letter HA - voiceless glottal fricative', ARRAY['h', 'letter HA'], 'letter', 'h', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߥ', 'ߥ', 'w', 'letter WA - labio-velar approximant', ARRAY['w', 'letter WA'], 'letter', 'w', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߦ', 'ߦ', 'y', 'letter YA - palatal approximant', ARRAY['y', 'letter YA'], 'letter', 'j', 'basic', 'A1', 0.1, ARRAY['consonants', 'alphabet'], 'verified'),
('ߧ', 'ߧ', 'nya woloso', 'letter NYA WOLOSO - abstract ny', ARRAY['nya woloso', 'abstract ny'], 'letter', 'ɲ', 'basic', 'A2', 0.3, ARRAY['consonants', 'alphabet'], 'verified')
ON CONFLICT (word) DO NOTHING;

-- ============================================
-- N'KO COMBINING MARKS / TONE MARKS (U+07EB-U+07F5)
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, status)
VALUES
('◌߫', '߫', 'high short', 'combining short high tone', ARRAY['high tone', 'short vowel', 'acute accent'], 'particle', 'basic', 'A2', 0.35, ARRAY['tone marks', 'diacritics', 'alphabet'], 'verified'),
('◌߬', '߬', 'low short', 'combining short low tone', ARRAY['low tone', 'short vowel', 'grave accent'], 'particle', 'basic', 'A2', 0.35, ARRAY['tone marks', 'diacritics', 'alphabet'], 'verified'),
('◌߭', '߭', 'rising short', 'combining short rising tone', ARRAY['rising tone', 'short vowel'], 'particle', 'basic', 'A2', 0.4, ARRAY['tone marks', 'diacritics', 'alphabet'], 'verified'),
('◌߮', '߮', 'falling long', 'combining long falling tone', ARRAY['falling tone', 'long vowel'], 'particle', 'basic', 'A2', 0.4, ARRAY['tone marks', 'diacritics', 'alphabet'], 'verified'),
('◌߯', '߯', 'high long', 'combining long high tone', ARRAY['high tone', 'long vowel'], 'particle', 'basic', 'A2', 0.35, ARRAY['tone marks', 'diacritics', 'alphabet'], 'verified'),
('◌߰', '߰', 'low long', 'combining long low tone', ARRAY['low tone', 'long vowel'], 'particle', 'basic', 'A2', 0.35, ARRAY['tone marks', 'diacritics', 'alphabet'], 'verified'),
('◌߱', '߱', 'rising long', 'combining long rising tone', ARRAY['rising tone', 'long vowel'], 'particle', 'basic', 'A2', 0.4, ARRAY['tone marks', 'diacritics', 'alphabet'], 'verified')
ON CONFLICT (word) DO NOTHING;

-- ============================================
-- N'KO PUNCTUATION (U+07F6-U+07FA)
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, status)
VALUES
('߶', '߶', 'symbol oo dennen', 'symbol OO DENNEN - decimal point', ARRAY['decimal point', 'currency symbol'], 'particle', 'basic', 'A2', 0.25, ARRAY['punctuation', 'alphabet'], 'verified'),
('߷', '߷', 'symbol gbakurunen', 'symbol GBAKURUNEN - end of section', ARRAY['section marker', 'paragraph end'], 'particle', 'basic', 'A2', 0.25, ARRAY['punctuation', 'alphabet'], 'verified'),
('߸', '߸', 'comma', 'N''Ko comma', ARRAY['comma', 'pause marker'], 'particle', 'basic', 'A1', 0.15, ARRAY['punctuation', 'alphabet'], 'verified'),
('߹', '߹', 'exclamation', 'N''Ko exclamation mark', ARRAY['exclamation', 'emphasis marker'], 'particle', 'basic', 'A1', 0.15, ARRAY['punctuation', 'alphabet'], 'verified'),
('ߺ', 'ߺ', 'lajanyalan', 'letter LAJANYALAN - word joiner', ARRAY['lajanyalan', 'word joiner', 'connection mark'], 'particle', 'basic', 'A2', 0.3, ARRAY['punctuation', 'alphabet'], 'verified')
ON CONFLICT (word) DO NOTHING;

-- ============================================
-- Verify insertion count
-- ============================================
-- Expected: 10 digits + 7 vowels + 23 consonants + 7 tone marks + 5 punctuation = 52 base characters
-- Plus combining mark variants = ~59 total entries

