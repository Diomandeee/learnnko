-- Migration 005: User Layer Tables
-- N'Ko Language Learning Database
--
-- User profiles, corrections, validations, and feedback.
-- Enables community-driven improvement of language data.

-- ============================================
-- nko_users: User profiles
-- ============================================
CREATE TABLE nko_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication (links to Supabase Auth)
    auth_id UUID UNIQUE, -- Supabase auth.users.id
    anonymous_id TEXT UNIQUE, -- For unauthenticated users (device fingerprint)
    
    -- Profile
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    
    -- Language background
    native_language TEXT,
    native_languages TEXT[] DEFAULT '{}',
    learning_languages TEXT[] DEFAULT '{}',
    nko_proficiency TEXT CHECK (nko_proficiency IN (
        'none', 'beginner', 'elementary', 'intermediate', 
        'upper_intermediate', 'advanced', 'native'
    )),
    manding_dialects TEXT[] DEFAULT '{}', -- Which Manding dialects they speak
    
    -- Permissions
    role TEXT DEFAULT 'learner' CHECK (role IN (
        'learner',      -- Basic user
        'contributor',  -- Can submit corrections
        'validator',    -- Can approve corrections
        'expert',       -- Language expert, high trust
        'moderator',    -- Can manage content
        'admin'         -- Full access
    )),
    
    -- Trust and reputation
    trust_score FLOAT DEFAULT 0.5 CHECK (trust_score BETWEEN 0.0 AND 1.0),
    reputation_points INTEGER DEFAULT 0,
    
    -- Activity statistics
    corrections_submitted INTEGER DEFAULT 0,
    corrections_accepted INTEGER DEFAULT 0,
    corrections_rejected INTEGER DEFAULT 0,
    validations_count INTEGER DEFAULT 0,
    validations_correct INTEGER DEFAULT 0,
    
    -- Learning statistics
    vocabulary_learned INTEGER DEFAULT 0,
    sessions_completed INTEGER DEFAULT 0,
    total_learning_time_ms BIGINT DEFAULT 0,
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- Email/phone verified
    banned_until TIMESTAMPTZ,
    ban_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_active_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_users IS 'User profiles for learners and contributors';
COMMENT ON COLUMN nko_users.trust_score IS 'Reputation score based on correction accuracy (0.0-1.0)';

-- ============================================
-- nko_corrections: User-submitted corrections
-- ============================================
CREATE TABLE nko_corrections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What is being corrected (one of these should be set)
    detection_id UUID REFERENCES nko_detections(id) ON DELETE CASCADE,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE CASCADE,
    vocabulary_id UUID REFERENCES nko_vocabulary(id) ON DELETE CASCADE,
    example_id UUID REFERENCES nko_examples(id) ON DELETE CASCADE,
    
    -- Correction details
    field_corrected TEXT NOT NULL, -- 'nko_text', 'english_text', 'latin_text', etc.
    original_value TEXT NOT NULL,
    corrected_value TEXT NOT NULL,
    correction_note TEXT, -- Explanation of the correction
    correction_type TEXT CHECK (correction_type IN (
        'typo', 'mistranslation', 'missing_content', 'wrong_content',
        'formatting', 'grammar', 'spelling', 'tone_mark', 'other'
    )),
    
    -- Submitter
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    
    -- Review status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'under_review', 'approved', 'rejected', 
        'superseded', 'withdrawn'
    )),
    
    -- Review information
    reviewed_by UUID REFERENCES nko_users(id),
    reviewed_at TIMESTAMPTZ,
    review_note TEXT,
    rejection_reason TEXT,
    
    -- Quality metrics
    confidence FLOAT, -- Submitter's confidence in the correction
    community_votes INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Applied?
    is_applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_corrections IS 'User-submitted corrections to language data';

-- ============================================
-- nko_validations: Community validation votes
-- ============================================
CREATE TABLE nko_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What is being validated
    detection_id UUID REFERENCES nko_detections(id) ON DELETE CASCADE,
    translation_id UUID REFERENCES nko_translations(id) ON DELETE CASCADE,
    correction_id UUID REFERENCES nko_corrections(id) ON DELETE CASCADE,
    
    -- Validator
    user_id UUID NOT NULL REFERENCES nko_users(id) ON DELETE CASCADE,
    
    -- Vote
    vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject', 'unsure')),
    confidence FLOAT DEFAULT 0.5, -- How confident in the vote
    
    -- Feedback
    feedback_note TEXT,
    issues_found TEXT[] DEFAULT '{}', -- Specific issues noted
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One vote per user per item
    UNIQUE(detection_id, user_id),
    UNIQUE(translation_id, user_id),
    UNIQUE(correction_id, user_id)
);

COMMENT ON TABLE nko_validations IS 'Community validation votes on content accuracy';

-- ============================================
-- nko_feedback: General quality feedback
-- ============================================
CREATE TABLE nko_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What the feedback is about
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'source', 'frame', 'detection', 'vocabulary', 
        'translation', 'example', 'session'
    )),
    entity_id UUID NOT NULL,
    
    -- Submitter
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    
    -- Feedback content
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_type TEXT CHECK (feedback_type IN (
        'quality', 'accuracy', 'usefulness', 'difficulty', 'bug', 'suggestion'
    )),
    feedback_text TEXT,
    
    -- Status
    is_addressed BOOLEAN DEFAULT FALSE,
    addressed_by UUID REFERENCES nko_users(id),
    addressed_at TIMESTAMPTZ,
    response_text TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_feedback IS 'General user feedback on content quality';

-- ============================================
-- nko_reports: Content reports/flags
-- ============================================
CREATE TABLE nko_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- What is being reported
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Reporter
    user_id UUID REFERENCES nko_users(id) ON DELETE SET NULL,
    
    -- Report details
    report_type TEXT NOT NULL CHECK (report_type IN (
        'inappropriate', 'incorrect', 'duplicate', 'spam',
        'copyright', 'offensive', 'other'
    )),
    description TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'investigating', 'resolved', 'dismissed'
    )),
    resolved_by UUID REFERENCES nko_users(id),
    resolved_at TIMESTAMPTZ,
    resolution_note TEXT,
    action_taken TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE nko_reports IS 'Content reports and flags from users';

-- ============================================
-- Trigger: Update user stats on correction
-- ============================================
CREATE OR REPLACE FUNCTION update_user_correction_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE nko_users
        SET corrections_submitted = corrections_submitted + 1,
            updated_at = NOW()
        WHERE id = NEW.user_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        IF NEW.status = 'approved' THEN
            UPDATE nko_users
            SET corrections_accepted = corrections_accepted + 1,
                trust_score = LEAST(1.0, trust_score + 0.01),
                reputation_points = reputation_points + 10,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        ELSIF NEW.status = 'rejected' THEN
            UPDATE nko_users
            SET corrections_rejected = corrections_rejected + 1,
                trust_score = GREATEST(0.0, trust_score - 0.02),
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_correction_stats
AFTER INSERT OR UPDATE ON nko_corrections
FOR EACH ROW
EXECUTE FUNCTION update_user_correction_stats();

-- ============================================
-- Trigger: Auto-update updated_at
-- ============================================
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON nko_users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_corrections_updated_at
BEFORE UPDATE ON nko_corrections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

