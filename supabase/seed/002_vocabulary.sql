-- Seed 002: Core N'Ko Vocabulary
-- 100+ essential words organized by category
-- Based on nicolingua-0005 corpus and Manding dictionaries

-- ============================================
-- PRONOUNS
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߒ', 'ߒ', 'n', 'I, me', ARRAY['I', 'me', 'my'], 'pronoun', 'basic', 'A1', 0.1, ARRAY['pronouns', 'basic'], 1000, 'verified'),
('ߌ', 'ߌ', 'i', 'you (singular)', ARRAY['you', 'your'], 'pronoun', 'basic', 'A1', 0.1, ARRAY['pronouns', 'basic'], 950, 'verified'),
('ߊ߬', 'ߊ߬', 'a', 'he, she, it', ARRAY['he', 'she', 'it', 'his', 'her', 'its'], 'pronoun', 'basic', 'A1', 0.1, ARRAY['pronouns', 'basic'], 900, 'verified'),
('ߊ߲', 'ߊ߲', 'an', 'we', ARRAY['we', 'us', 'our'], 'pronoun', 'basic', 'A1', 0.15, ARRAY['pronouns', 'basic'], 800, 'verified'),
('ߊߟߎ߫', 'ߊߟߎ߫', 'alu', 'you (plural)', ARRAY['you all', 'your (plural)'], 'pronoun', 'basic', 'A1', 0.15, ARRAY['pronouns', 'basic'], 750, 'verified'),
('ߊ߬ߟߎ߬', 'ߊ߬ߟߎ߬', 'olu', 'they', ARRAY['they', 'them', 'their'], 'pronoun', 'basic', 'A1', 0.15, ARRAY['pronouns', 'basic'], 700, 'verified'),
('ߡߍ߲', 'ߡߍ߲', 'men', 'who, which, that', ARRAY['who', 'which', 'that', 'what'], 'pronoun', 'common', 'A2', 0.2, ARRAY['pronouns', 'questions'], 600, 'verified'),
('ߡߎ߲߬', 'ߡߎ߲߬', 'mun', 'what', ARRAY['what', 'which thing'], 'pronoun', 'common', 'A2', 0.2, ARRAY['pronouns', 'questions'], 550, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- NUMBERS (Written words, not digits)
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߞߋߟߋ߲', 'ߞߋߟߋ߲', 'kelen', 'one', ARRAY['one', 'single', 'alone'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'counting'], 800, 'verified'),
('ߝߌ߬ߟߊ', 'ߝߌ߬ߟߊ', 'fila', 'two', ARRAY['two', 'pair', 'both'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'counting'], 750, 'verified'),
('ߛߓߊ', 'ߛߓߊ', 'saba', 'three', ARRAY['three'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'counting'], 700, 'verified'),
('ߣߊ߯ߣߌ߲', 'ߣߊ߯ߣߌ߲', 'naani', 'four', ARRAY['four'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'counting'], 650, 'verified'),
('ߟߐ߯ߟߎ', 'ߟߐ߯ߟߎ', 'loolu', 'five', ARRAY['five'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'counting'], 600, 'verified'),
('ߥߐ߯ߙߐ', 'ߥߐ߯ߙߐ', 'wooro', 'six', ARRAY['six'], 'number', 'basic', 'A1', 0.15, ARRAY['numbers', 'counting'], 550, 'verified'),
('ߥߐ߬ߙߐ߲ߥߎߟߊ', 'ߥߐ߬ߙߐ߲ߥߎߟߊ', 'woronwula', 'seven', ARRAY['seven'], 'number', 'basic', 'A1', 0.2, ARRAY['numbers', 'counting'], 500, 'verified'),
('ߛߋߜߌ߲', 'ߛߋߜߌ߲', 'segin', 'eight', ARRAY['eight'], 'number', 'basic', 'A1', 0.15, ARRAY['numbers', 'counting'], 500, 'verified'),
('ߞߐ߬ߣߐ߲߬ߕߐ߲', 'ߞߐ߬ߣߐ߲߬ߕߐ߲', 'konondon', 'nine', ARRAY['nine'], 'number', 'basic', 'A1', 0.2, ARRAY['numbers', 'counting'], 450, 'verified'),
('ߕߊ߲߬', 'ߕߊ߲߬', 'tan', 'ten', ARRAY['ten'], 'number', 'basic', 'A1', 0.1, ARRAY['numbers', 'counting'], 600, 'verified'),
('ߡߎ߰ߜߊ߲', 'ߡߎ߰ߜߊ߲', 'mugan', 'twenty', ARRAY['twenty'], 'number', 'basic', 'A2', 0.2, ARRAY['numbers', 'counting'], 400, 'verified'),
('ߞߍ߬ߡߍ', 'ߞߍ߬ߡߍ', 'keme', 'hundred', ARRAY['hundred', '100'], 'number', 'common', 'A2', 0.2, ARRAY['numbers', 'counting'], 350, 'verified'),
('ߥߊ߯', 'ߥߊ߯', 'waa', 'thousand', ARRAY['thousand', '1000'], 'number', 'common', 'A2', 0.2, ARRAY['numbers', 'counting'], 300, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- FAMILY
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߝߊ߬', 'ߝߊ߬', 'fa', 'father', ARRAY['father', 'dad', 'papa'], 'noun', 'basic', 'A1', 0.1, ARRAY['family', 'basic'], 700, 'verified'),
('ߓߊ߬', 'ߓߊ߬', 'ba', 'mother', ARRAY['mother', 'mom', 'mama'], 'noun', 'basic', 'A1', 0.1, ARRAY['family', 'basic'], 700, 'verified'),
('ߘߋ߲߬', 'ߘߋ߲߬', 'den', 'child', ARRAY['child', 'kid', 'son', 'daughter'], 'noun', 'basic', 'A1', 0.1, ARRAY['family', 'basic'], 650, 'verified'),
('ߓߊ߬ߘߋ߲', 'ߓߊ߬ߘߋ߲', 'baden', 'sibling (same mother)', ARRAY['sibling', 'brother', 'sister'], 'noun', 'basic', 'A1', 0.15, ARRAY['family', 'basic'], 500, 'verified'),
('ߡߏ߬ߛߏ', 'ߡߏ߬ߛߏ', 'muso', 'woman, wife', ARRAY['woman', 'wife', 'female'], 'noun', 'basic', 'A1', 0.1, ARRAY['family', 'people'], 600, 'verified'),
('ߗߍ߬', 'ߗߍ߬', 'ce', 'man, husband', ARRAY['man', 'husband', 'male'], 'noun', 'basic', 'A1', 0.1, ARRAY['family', 'people'], 600, 'verified'),
('ߡߊ߬ߡߊ', 'ߡߊ߬ߡߊ', 'mama', 'grandmother', ARRAY['grandmother', 'grandma'], 'noun', 'basic', 'A1', 0.15, ARRAY['family', 'basic'], 400, 'verified'),
('ߝߊ߬ߝߊ', 'ߝߊ߬ߝߊ', 'fafa', 'grandfather', ARRAY['grandfather', 'grandpa'], 'noun', 'basic', 'A1', 0.15, ARRAY['family', 'basic'], 400, 'verified'),
('ߓߊߟߌߡߊ', 'ߓߊߟߌߡߊ', 'balima', 'relative', ARRAY['relative', 'family member'], 'noun', 'common', 'A2', 0.2, ARRAY['family'], 350, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- COMMON VERBS
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߞߊ߬', 'ߞߊ߬', 'ka', 'to go', ARRAY['to go', 'to leave', 'to travel'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'movement'], 900, 'verified'),
('ߣߊ߬', 'ߣߊ߬', 'na', 'to come', ARRAY['to come', 'to arrive'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'movement'], 850, 'verified'),
('ߛߓߍ߬', 'ߛߓߍ߬', 'sɛbɛ', 'to write', ARRAY['to write', 'writing'], 'verb', 'basic', 'A1', 0.15, ARRAY['verbs', 'literacy'], 700, 'verified'),
('ߞߊ߬ߙߊ߲߬', 'ߞߊ߬ߙߊ߲߬', 'karan', 'to read, to learn', ARRAY['to read', 'to learn', 'to study'], 'verb', 'basic', 'A1', 0.15, ARRAY['verbs', 'literacy', 'education'], 700, 'verified'),
('ߝߐ߬', 'ߝߐ߬', 'fo', 'to say, to speak', ARRAY['to say', 'to speak', 'to tell'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'communication'], 800, 'verified'),
('ߦߋ߫', 'ߦߋ߫', 'ye', 'to see', ARRAY['to see', 'to look', 'to watch'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'senses'], 750, 'verified'),
('ߡߍ߲߬', 'ߡߍ߲߬', 'men', 'to hear', ARRAY['to hear', 'to listen'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'senses'], 700, 'verified'),
('ߘߏ߲߬', 'ߘߏ߲߬', 'don', 'to enter', ARRAY['to enter', 'to go in'], 'verb', 'common', 'A2', 0.15, ARRAY['verbs', 'movement'], 550, 'verified'),
('ߓߐ߬', 'ߓߐ߬', 'bo', 'to exit, to leave', ARRAY['to exit', 'to leave', 'to go out'], 'verb', 'common', 'A2', 0.15, ARRAY['verbs', 'movement'], 550, 'verified'),
('ߞߍ߬', 'ߞߍ߬', 'ke', 'to do, to make', ARRAY['to do', 'to make', 'to create'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'actions'], 900, 'verified'),
('ߛߐ߬ߘߐ߲߬', 'ߛߐ߬ߘߐ߲߬', 'sodon', 'to buy', ARRAY['to buy', 'to purchase'], 'verb', 'common', 'A2', 0.2, ARRAY['verbs', 'commerce'], 450, 'verified'),
('ߝߙߋ߬', 'ߝߙߋ߬', 'fere', 'to sell', ARRAY['to sell'], 'verb', 'common', 'A2', 0.2, ARRAY['verbs', 'commerce'], 450, 'verified'),
('ߘߎ߲߬ߘߎ߬', 'ߘߎ߲߬ߘߎ߬', 'dundu', 'to eat', ARRAY['to eat', 'to consume'], 'verb', 'basic', 'A1', 0.15, ARRAY['verbs', 'food'], 600, 'verified'),
('ߡߌ߲߬', 'ߡߌ߲߬', 'min', 'to drink', ARRAY['to drink'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'food'], 550, 'verified'),
('ߛߎ߲߬', 'ߛߎ߲߬', 'sun', 'to sleep', ARRAY['to sleep', 'to rest'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'daily life'], 500, 'verified'),
('ߥߎ߬ߟߌ߬', 'ߥߎ߬ߟߌ߬', 'wuli', 'to wake up, to stand', ARRAY['to wake up', 'to stand up', 'to rise'], 'verb', 'basic', 'A1', 0.15, ARRAY['verbs', 'daily life'], 500, 'verified'),
('ߘߌ߬', 'ߘߌ߬', 'di', 'to give', ARRAY['to give', 'to offer'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'actions'], 700, 'verified'),
('ߕߊ߬', 'ߕߊ߬', 'ta', 'to take', ARRAY['to take', 'to get'], 'verb', 'basic', 'A1', 0.1, ARRAY['verbs', 'actions'], 700, 'verified'),
('ߓߊ߯ߙߊ߫', 'ߓߊ߯ߙߊ߫', 'baara', 'to work', ARRAY['to work', 'work', 'job'], 'verb', 'common', 'A2', 0.15, ARRAY['verbs', 'work'], 550, 'verified'),
('ߞߊ߬ߣߌ߲߬', 'ߞߊ߬ߣߌ߲߬', 'kanin', 'to love', ARRAY['to love', 'to like'], 'verb', 'common', 'A2', 0.2, ARRAY['verbs', 'emotions'], 450, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- TIME WORDS
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߕߟߋ߬', 'ߕߟߋ߬', 'tile', 'day, sun', ARRAY['day', 'sun', 'daytime'], 'noun', 'basic', 'A1', 0.1, ARRAY['time', 'nature'], 650, 'verified'),
('ߛߎ', 'ߛߎ', 'su', 'night', ARRAY['night', 'evening'], 'noun', 'basic', 'A1', 0.1, ARRAY['time'], 600, 'verified'),
('ߛߐ߱', 'ߛߐ߱', 'son', 'now, today', ARRAY['now', 'today', 'presently'], 'noun', 'basic', 'A1', 0.1, ARRAY['time'], 700, 'verified'),
('ߛߌ߬ߣߌ߲߬', 'ߛߌ߬ߣߌ߲߬', 'sinin', 'tomorrow', ARRAY['tomorrow'], 'noun', 'basic', 'A1', 0.15, ARRAY['time'], 500, 'verified'),
('ߞߎ߲߬', 'ߞߎ߲߬', 'kun', 'yesterday', ARRAY['yesterday'], 'noun', 'basic', 'A1', 0.15, ARRAY['time'], 500, 'verified'),
('ߛߊ߲߬', 'ߛߊ߲߬', 'san', 'year', ARRAY['year'], 'noun', 'common', 'A2', 0.15, ARRAY['time'], 450, 'verified'),
('ߞߊ߬ߟߏ', 'ߞߊ߬ߟߏ', 'kalo', 'month, moon', ARRAY['month', 'moon'], 'noun', 'common', 'A2', 0.15, ARRAY['time', 'nature'], 450, 'verified'),
('ߟߐ߬ߞߎ', 'ߟߐ߬ߞߎ', 'loku', 'week', ARRAY['week'], 'noun', 'common', 'A2', 0.2, ARRAY['time'], 400, 'verified'),
('ߥߊ߬ߕߌ', 'ߥߊ߬ߕߌ', 'wati', 'time, moment', ARRAY['time', 'moment', 'hour'], 'noun', 'common', 'A2', 0.15, ARRAY['time'], 500, 'verified'),
('ߛߐ߬ߜߐ߬ߡߊ', 'ߛߐ߬ߜߐ߬ߡߊ', 'sogoma', 'morning', ARRAY['morning'], 'noun', 'basic', 'A1', 0.15, ARRAY['time'], 450, 'verified'),
('ߕߟߋ߬ ߝߍ߬', 'ߕߟߋ߬ ߝߍ߬', 'tile fe', 'afternoon', ARRAY['afternoon', 'midday'], 'noun', 'common', 'A2', 0.2, ARRAY['time'], 400, 'verified'),
('ߥߎ߬ߙߊ', 'ߥߎ߬ߙߊ', 'wura', 'evening', ARRAY['evening', 'dusk'], 'noun', 'common', 'A2', 0.15, ARRAY['time'], 400, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- BODY PARTS
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߞߎ߲', 'ߞߎ߲', 'kun', 'head', ARRAY['head'], 'noun', 'basic', 'A1', 0.1, ARRAY['body', 'basic'], 500, 'verified'),
('ߓߟߏ', 'ߓߟߏ', 'bolo', 'hand, arm', ARRAY['hand', 'arm'], 'noun', 'basic', 'A1', 0.1, ARRAY['body', 'basic'], 550, 'verified'),
('ߛߍ߲', 'ߛߍ߲', 'sen', 'foot, leg', ARRAY['foot', 'leg'], 'noun', 'basic', 'A1', 0.1, ARRAY['body', 'basic'], 500, 'verified'),
('ߢߊ', 'ߢߊ', 'nya', 'eye, face', ARRAY['eye', 'face'], 'noun', 'basic', 'A1', 0.1, ARRAY['body', 'basic'], 550, 'verified'),
('ߕߟߏ', 'ߕߟߏ', 'tulo', 'ear', ARRAY['ear'], 'noun', 'basic', 'A1', 0.1, ARRAY['body', 'basic'], 400, 'verified'),
('ߣߎ߲', 'ߣߎ߲', 'nun', 'nose', ARRAY['nose'], 'noun', 'basic', 'A1', 0.1, ARRAY['body', 'basic'], 350, 'verified'),
('ߘߊ', 'ߘߊ', 'da', 'mouth', ARRAY['mouth'], 'noun', 'basic', 'A1', 0.1, ARRAY['body', 'basic'], 450, 'verified'),
('ߞߐ߲ߛߐ߲', 'ߞߐ߲ߛߐ߲', 'konson', 'heart', ARRAY['heart'], 'noun', 'common', 'A2', 0.15, ARRAY['body'], 400, 'verified'),
('ߝߊ߬ߙߌ', 'ߝߊ߬ߙߌ', 'fari', 'body, skin', ARRAY['body', 'skin'], 'noun', 'common', 'A2', 0.15, ARRAY['body'], 400, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- COMMON NOUNS
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߛߓߍ', 'ߛߓߍ', 'sɛbɛ', 'book, writing', ARRAY['book', 'writing', 'letter'], 'noun', 'basic', 'A1', 0.1, ARRAY['literacy', 'objects'], 600, 'verified'),
('ߒߞߏ', 'ߒߞߏ', 'nko', 'N''Ko (script name)', ARRAY['N''Ko', 'I say', 'our language'], 'noun', 'basic', 'A1', 0.1, ARRAY['literacy', 'language'], 800, 'verified'),
('ߞߊ߲', 'ߞߊ߲', 'kan', 'language, voice', ARRAY['language', 'voice', 'speech'], 'noun', 'basic', 'A1', 0.1, ARRAY['language', 'communication'], 600, 'verified'),
('ߖߊ߬ߡߊߣߊ', 'ߖߊ߬ߡߊߣߊ', 'jamana', 'country, land', ARRAY['country', 'nation', 'land'], 'noun', 'common', 'A2', 0.15, ARRAY['geography', 'politics'], 450, 'verified'),
('ߛߏ', 'ߛߏ', 'so', 'house, home', ARRAY['house', 'home', 'building'], 'noun', 'basic', 'A1', 0.1, ARRAY['places', 'home'], 650, 'verified'),
('ߘߎ߱', 'ߘߎ߱', 'dugu', 'town, village', ARRAY['town', 'village', 'city'], 'noun', 'common', 'A2', 0.15, ARRAY['places', 'geography'], 500, 'verified'),
('ߖߌ', 'ߖߌ', 'ji', 'water', ARRAY['water'], 'noun', 'basic', 'A1', 0.1, ARRAY['nature', 'food'], 600, 'verified'),
('ߘߎ߲߬ߠߌ߲', 'ߘߎ߲߬ߠߌ߲', 'dunulen', 'food', ARRAY['food', 'meal'], 'noun', 'basic', 'A1', 0.15, ARRAY['food'], 550, 'verified'),
('ߥߊ߬ߙߌ', 'ߥߊ߬ߙߌ', 'wari', 'money', ARRAY['money', 'currency'], 'noun', 'common', 'A2', 0.15, ARRAY['commerce', 'daily life'], 500, 'verified'),
('ߟߊ߬ߞߊ߬ߙߊ߲߬ߠߌ߲', 'ߟߊ߬ߞߊ߬ߙߊ߲߬ߠߌ߲', 'lakaranli', 'school, education', ARRAY['school', 'education', 'learning'], 'noun', 'common', 'A2', 0.2, ARRAY['education'], 400, 'verified'),
('ߡߐ߱', 'ߡߐ߱', 'mɔgɔ', 'person, human', ARRAY['person', 'human', 'people'], 'noun', 'basic', 'A1', 0.1, ARRAY['people'], 700, 'verified'),
('ߓߊ߯ߙߊ', 'ߓߊ߯ߙߊ', 'baara', 'work, job', ARRAY['work', 'job', 'task'], 'noun', 'common', 'A2', 0.15, ARRAY['work'], 500, 'verified'),
('ߊߟߊ߫', 'ߊߟߊ߫', 'Ala', 'God, Allah', ARRAY['God', 'Allah'], 'noun', 'common', 'A1', 0.1, ARRAY['religion', 'greetings'], 600, 'verified'),
('ߛߌ߬ߟߊ߬ߡߊ', 'ߛߌ߬ߟߊ߬ߡߊ', 'Silama', 'Islam, Muslim', ARRAY['Islam', 'Muslim', 'peace'], 'noun', 'common', 'A2', 0.2, ARRAY['religion'], 400, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- ADJECTIVES
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߓߟߋ߬ߓߊ', 'ߓߟߋ߬ߓߊ', 'belebaa', 'big, large', ARRAY['big', 'large', 'great'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'size'], 450, 'verified'),
('ߝߌ߬ߕߌ߲', 'ߝߌ߬ߕߌ߲', 'fitin', 'small, little', ARRAY['small', 'little', 'tiny'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'size'], 450, 'verified'),
('ߘߌ߬ߡߊ߲', 'ߘߌ߬ߡߊ߲', 'diman', 'good, nice', ARRAY['good', 'nice', 'well'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'quality'], 500, 'verified'),
('ߖߎ߮', 'ߖߎ߮', 'jugu', 'bad, evil', ARRAY['bad', 'evil', 'wicked'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'quality'], 400, 'verified'),
('ߞߎ߬ߙߊ', 'ߞߎ߬ߙߊ', 'kura', 'new', ARRAY['new', 'fresh', 'recent'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'quality'], 450, 'verified'),
('ߞߘߐ߬', 'ߞߘߐ߬', 'kodo', 'old (things)', ARRAY['old', 'ancient', 'former'], 'adjective', 'basic', 'A1', 0.15, ARRAY['adjectives', 'quality'], 400, 'verified'),
('ߜߊ߬', 'ߜߊ߬', 'gba', 'hot, warm', ARRAY['hot', 'warm'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'temperature'], 350, 'verified'),
('ߛߎ߬ߡߊ߲', 'ߛߎ߬ߡߊ߲', 'suman', 'cold', ARRAY['cold', 'cool'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'temperature'], 350, 'verified'),
('ߖߊ߲', 'ߖߊ߲', 'jan', 'long, tall', ARRAY['long', 'tall', 'high'], 'adjective', 'common', 'A2', 0.15, ARRAY['adjectives', 'size'], 350, 'verified'),
('ߛߎ߬ߙߎ߲', 'ߛߎ߬ߙߎ߲', 'surun', 'short', ARRAY['short', 'brief'], 'adjective', 'common', 'A2', 0.15, ARRAY['adjectives', 'size'], 350, 'verified'),
('ߜߍ', 'ߜߍ', 'gbe', 'white', ARRAY['white', 'light'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'colors'], 350, 'verified'),
('ߝߌ߲', 'ߝߌ߲', 'fin', 'black', ARRAY['black', 'dark'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'colors'], 350, 'verified'),
('ߥߎ߬ߟߋ߲', 'ߥߎ߬ߟߋ߲', 'wulen', 'red', ARRAY['red'], 'adjective', 'basic', 'A1', 0.1, ARRAY['adjectives', 'colors'], 300, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- ADVERBS & PARTICLES
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߤߍ߲', 'ߤߍ߲', 'hɛn', 'yes', ARRAY['yes', 'indeed'], 'adverb', 'basic', 'A1', 0.1, ARRAY['responses', 'basic'], 800, 'verified'),
('ߊ߬ߦߋ', 'ߊ߬ߦߋ', 'aye', 'no', ARRAY['no', 'not'], 'adverb', 'basic', 'A1', 0.1, ARRAY['responses', 'basic'], 750, 'verified'),
('ߕߎ߲߯', 'ߕߎ߲߯', 'tun', 'still, yet', ARRAY['still', 'yet', 'again'], 'adverb', 'common', 'A2', 0.15, ARRAY['time', 'adverbs'], 400, 'verified'),
('ߓߊ߲߬ߞߋ', 'ߓߊ߲߬ߞߋ', 'banke', 'already', ARRAY['already', 'done'], 'adverb', 'common', 'A2', 0.15, ARRAY['time', 'adverbs'], 350, 'verified'),
('ߖߎ߰ߡߊ', 'ߖߎ߰ߡߊ', 'juma', 'quickly', ARRAY['quickly', 'fast', 'hurry'], 'adverb', 'common', 'A2', 0.15, ARRAY['adverbs'], 300, 'verified'),
('ߘߐ߰ߡߊ', 'ߘߐ߰ߡߊ', 'doma', 'slowly', ARRAY['slowly', 'carefully'], 'adverb', 'common', 'A2', 0.15, ARRAY['adverbs'], 300, 'verified'),
('ߞߏ߫', 'ߞߏ߫', 'ko', 'that (conjunction)', ARRAY['that', 'so that', 'in order to'], 'conjunction', 'common', 'A2', 0.2, ARRAY['grammar', 'conjunctions'], 700, 'verified'),
('ߣߌ߫', 'ߣߌ߫', 'ni', 'and, with', ARRAY['and', 'with', 'if'], 'conjunction', 'basic', 'A1', 0.1, ARRAY['grammar', 'conjunctions'], 900, 'verified'),
('ߥߊ߬ߟߋ', 'ߥߊ߬ߟߋ', 'wale', 'or', ARRAY['or', 'either'], 'conjunction', 'common', 'A2', 0.15, ARRAY['grammar', 'conjunctions'], 400, 'verified'),
('ߓߊ߬ߙߌ߬', 'ߓߊ߬ߙߌ߬', 'bari', 'but', ARRAY['but', 'however'], 'conjunction', 'common', 'A2', 0.15, ARRAY['grammar', 'conjunctions'], 450, 'verified'),
('ߓߊߏ߬', 'ߓߊߏ߬', 'bao', 'because', ARRAY['because', 'since'], 'conjunction', 'common', 'A2', 0.2, ARRAY['grammar', 'conjunctions'], 400, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- QUESTION WORDS
-- ============================================

INSERT INTO nko_vocabulary (word, word_normalized, latin, meaning_primary, meanings, pos, category, cefr_level, difficulty_score, topics, frequency, status)
VALUES
('ߡߎ߲߬', 'ߡߎ߲߬', 'mun', 'what', ARRAY['what', 'which'], 'pronoun', 'basic', 'A1', 0.1, ARRAY['questions', 'basic'], 600, 'verified'),
('ߖߐ߲߬', 'ߖߐ߲߬', 'jon', 'who', ARRAY['who', 'whom'], 'pronoun', 'basic', 'A1', 0.1, ARRAY['questions', 'basic'], 500, 'verified'),
('ߡߌ߲߬', 'ߡߌ߲߬', 'min', 'where', ARRAY['where', 'which place'], 'adverb', 'basic', 'A1', 0.1, ARRAY['questions', 'basic'], 550, 'verified'),
('ߕߎ߲߬ߡߌ߲', 'ߕߎ߲߬ߡߌ߲', 'tunmin', 'when', ARRAY['when', 'what time'], 'adverb', 'common', 'A2', 0.15, ARRAY['questions', 'time'], 400, 'verified'),
('ߡߎ߲ ߞߏ߫', 'ߡߎ߲ ߞߏ߫', 'mun ko', 'why', ARRAY['why', 'for what reason'], 'adverb', 'common', 'A2', 0.2, ARRAY['questions'], 350, 'verified'),
('ߘߌ߫', 'ߘߌ߫', 'di', 'how', ARRAY['how', 'in what way'], 'adverb', 'common', 'A2', 0.15, ARRAY['questions'], 400, 'verified'),
('ߖߏ߬ߟߌ', 'ߖߏ߬ߟߌ', 'joli', 'how many, how much', ARRAY['how many', 'how much'], 'adverb', 'common', 'A2', 0.15, ARRAY['questions', 'numbers'], 350, 'verified')
ON CONFLICT (word) DO UPDATE SET frequency = EXCLUDED.frequency;

-- ============================================
-- Update frequency ranks
-- ============================================
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY frequency DESC) as rank
  FROM nko_vocabulary
)
UPDATE nko_vocabulary v
SET frequency_rank = r.rank
FROM ranked r
WHERE v.id = r.id;

-- Verify insertion
SELECT 
    pos,
    COUNT(*) as count,
    AVG(frequency) as avg_frequency
FROM nko_vocabulary 
WHERE pos != 'letter'
GROUP BY pos
ORDER BY count DESC;

