-- Migration 009: Row Level Security Policies
-- N'Ko Language Learning Database
--
-- Security policies for all tables.
-- Enables fine-grained access control.

-- ============================================
-- Enable RLS on all tables
-- ============================================

ALTER TABLE nko_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_bounding_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_phonetics ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_grammar_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_word_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_trajectories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_trajectory_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_welford_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_embedding_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_embedding_cluster_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Helper function: Check user role
-- ============================================
CREATE OR REPLACE FUNCTION is_user_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM nko_users
    WHERE auth_id = auth.uid()::TEXT;
    
    RETURN user_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Helper function: Check if user is admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_user_role(ARRAY['admin', 'moderator']);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Source Layer Policies
-- ============================================

-- Public read access to sources
CREATE POLICY "Sources are viewable by everyone"
ON nko_sources FOR SELECT
USING (true);

-- Only admins can insert/update/delete sources
CREATE POLICY "Sources are manageable by admins"
ON nko_sources FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Public read access to frames
CREATE POLICY "Frames are viewable by everyone"
ON nko_frames FOR SELECT
USING (true);

-- Only admins can manage frames
CREATE POLICY "Frames are manageable by admins"
ON nko_frames FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- Detection Layer Policies
-- ============================================

-- Public read access to detections
CREATE POLICY "Detections are viewable by everyone"
ON nko_detections FOR SELECT
USING (true);

-- Only admins can manage detections
CREATE POLICY "Detections are manageable by admins"
ON nko_detections FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Public read access to characters
CREATE POLICY "Characters are viewable by everyone"
ON nko_characters FOR SELECT
USING (true);

-- Only admins can manage characters
CREATE POLICY "Characters are manageable by admins"
ON nko_characters FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Public read access to bounding boxes
CREATE POLICY "Bounding boxes are viewable by everyone"
ON nko_bounding_boxes FOR SELECT
USING (true);

-- Only admins can manage bounding boxes
CREATE POLICY "Bounding boxes are manageable by admins"
ON nko_bounding_boxes FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- Vocabulary Layer Policies
-- ============================================

-- Public read access to vocabulary
CREATE POLICY "Vocabulary is viewable by everyone"
ON nko_vocabulary FOR SELECT
USING (true);

-- Contributors and above can insert vocabulary
CREATE POLICY "Vocabulary insertable by contributors"
ON nko_vocabulary FOR INSERT
WITH CHECK (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']));

-- Validators and above can update vocabulary
CREATE POLICY "Vocabulary updatable by validators"
ON nko_vocabulary FOR UPDATE
USING (is_user_role(ARRAY['validator', 'expert', 'moderator', 'admin']))
WITH CHECK (is_user_role(ARRAY['validator', 'expert', 'moderator', 'admin']));

-- Only admins can delete vocabulary
CREATE POLICY "Vocabulary deletable by admins"
ON nko_vocabulary FOR DELETE
USING (is_admin());

-- Public read access to translations
CREATE POLICY "Translations are viewable by everyone"
ON nko_translations FOR SELECT
USING (true);

-- Contributors can manage translations
CREATE POLICY "Translations manageable by contributors"
ON nko_translations FOR ALL
USING (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']))
WITH CHECK (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']));

-- Public read access to examples
CREATE POLICY "Examples are viewable by everyone"
ON nko_examples FOR SELECT
USING (true);

-- Contributors can manage examples
CREATE POLICY "Examples manageable by contributors"
ON nko_examples FOR ALL
USING (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']))
WITH CHECK (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']));

-- Public read access to phonetics
CREATE POLICY "Phonetics viewable by everyone"
ON nko_phonetics FOR SELECT
USING (true);

-- Contributors can manage phonetics
CREATE POLICY "Phonetics manageable by contributors"
ON nko_phonetics FOR ALL
USING (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']))
WITH CHECK (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']));

-- Public read access to grammar rules
CREATE POLICY "Grammar rules viewable by everyone"
ON nko_grammar_rules FOR SELECT
USING (true);

-- Validators can manage grammar rules
CREATE POLICY "Grammar rules manageable by validators"
ON nko_grammar_rules FOR ALL
USING (is_user_role(ARRAY['validator', 'expert', 'moderator', 'admin']))
WITH CHECK (is_user_role(ARRAY['validator', 'expert', 'moderator', 'admin']));

-- Public read access to word relationships
CREATE POLICY "Word relationships viewable by everyone"
ON nko_word_relationships FOR SELECT
USING (true);

-- Contributors can manage word relationships
CREATE POLICY "Word relationships manageable by contributors"
ON nko_word_relationships FOR ALL
USING (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']))
WITH CHECK (is_user_role(ARRAY['contributor', 'validator', 'expert', 'moderator', 'admin']));

-- ============================================
-- User Layer Policies
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON nko_users FOR SELECT
USING (auth.uid()::TEXT = auth_id OR is_admin());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON nko_users FOR UPDATE
USING (auth.uid()::TEXT = auth_id)
WITH CHECK (auth.uid()::TEXT = auth_id);

-- Public read for basic user info (for attributions)
CREATE POLICY "Basic user info is public"
ON nko_users FOR SELECT
USING (true);

-- Only the service role can insert users (via auth trigger)
CREATE POLICY "Users insertable by service"
ON nko_users FOR INSERT
WITH CHECK (true);

-- Admins can manage all users
CREATE POLICY "Users manageable by admins"
ON nko_users FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Anyone authenticated can submit corrections
CREATE POLICY "Authenticated users can submit corrections"
ON nko_corrections FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can view all corrections
CREATE POLICY "Corrections are viewable by everyone"
ON nko_corrections FOR SELECT
USING (true);

-- Users can update their own pending corrections
CREATE POLICY "Users can update own pending corrections"
ON nko_corrections FOR UPDATE
USING (
    user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    AND status = 'pending'
)
WITH CHECK (
    user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    AND status IN ('pending', 'withdrawn')
);

-- Validators can review corrections
CREATE POLICY "Validators can review corrections"
ON nko_corrections FOR UPDATE
USING (is_user_role(ARRAY['validator', 'expert', 'moderator', 'admin']))
WITH CHECK (is_user_role(ARRAY['validator', 'expert', 'moderator', 'admin']));

-- Authenticated users can submit validations
CREATE POLICY "Authenticated users can validate"
ON nko_validations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Public read for validations
CREATE POLICY "Validations are viewable by everyone"
ON nko_validations FOR SELECT
USING (true);

-- Users can delete their own validations
CREATE POLICY "Users can delete own validations"
ON nko_validations FOR DELETE
USING (user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT));

-- Authenticated users can submit feedback
CREATE POLICY "Authenticated users can submit feedback"
ON nko_feedback FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Public read for feedback
CREATE POLICY "Feedback is viewable by everyone"
ON nko_feedback FOR SELECT
USING (true);

-- Admins can manage feedback
CREATE POLICY "Feedback manageable by admins"
ON nko_feedback FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Authenticated users can submit reports
CREATE POLICY "Authenticated users can report"
ON nko_reports FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can view/manage reports
CREATE POLICY "Reports manageable by admins"
ON nko_reports FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- Session Layer Policies
-- ============================================

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON nko_sessions FOR SELECT
USING (
    user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    OR anonymous_id IS NOT NULL
    OR is_admin()
);

-- Users can create sessions
CREATE POLICY "Users can create sessions"
ON nko_sessions FOR INSERT
WITH CHECK (true);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON nko_sessions FOR UPDATE
USING (
    user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    OR is_admin()
);

-- Users can view their own learning events
CREATE POLICY "Users can view own events"
ON nko_learning_events FOR SELECT
USING (
    session_id IN (
        SELECT id FROM nko_sessions 
        WHERE user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    )
    OR is_admin()
);

-- Users can create learning events
CREATE POLICY "Users can create events"
ON nko_learning_events FOR INSERT
WITH CHECK (true);

-- Users can view their own trajectories
CREATE POLICY "Users can view own trajectories"
ON nko_trajectories FOR SELECT
USING (
    user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    OR is_admin()
);

-- Users can create trajectories
CREATE POLICY "Users can create trajectories"
ON nko_trajectories FOR INSERT
WITH CHECK (true);

-- Users can update their own trajectories
CREATE POLICY "Users can update own trajectories"
ON nko_trajectories FOR UPDATE
USING (
    user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    OR is_admin()
);

-- Users can view trajectory nodes in their trajectories
CREATE POLICY "Users can view own trajectory nodes"
ON nko_trajectory_nodes FOR SELECT
USING (
    trajectory_id IN (
        SELECT id FROM nko_trajectories 
        WHERE user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    )
    OR is_admin()
);

-- Users can create trajectory nodes
CREATE POLICY "Users can create trajectory nodes"
ON nko_trajectory_nodes FOR INSERT
WITH CHECK (true);

-- Users can view their own Welford stats
CREATE POLICY "Users can view own welford stats"
ON nko_welford_stats FOR SELECT
USING (
    user_id = (SELECT id FROM nko_users WHERE auth_id = auth.uid()::TEXT)
    OR is_admin()
);

-- System can manage welford stats
CREATE POLICY "System can manage welford stats"
ON nko_welford_stats FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- Embedding Layer Policies
-- ============================================

-- Public read access to embeddings
CREATE POLICY "Embeddings are viewable by everyone"
ON nko_embeddings FOR SELECT
USING (true);

-- Only admins can manage embeddings
CREATE POLICY "Embeddings manageable by admins"
ON nko_embeddings FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Public read access to clusters
CREATE POLICY "Clusters are viewable by everyone"
ON nko_embedding_clusters FOR SELECT
USING (true);

-- Only admins can manage clusters
CREATE POLICY "Clusters manageable by admins"
ON nko_embedding_clusters FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Public read access to cluster members
CREATE POLICY "Cluster members are viewable by everyone"
ON nko_embedding_cluster_members FOR SELECT
USING (true);

-- Only admins can manage cluster members
CREATE POLICY "Cluster members manageable by admins"
ON nko_embedding_cluster_members FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- Service Role Bypass
-- ============================================
-- Note: The service role automatically bypasses RLS.
-- This is used for server-side operations like
-- batch processing and automated updates.

