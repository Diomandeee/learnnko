-- ============================================================
-- MIGRATION 011: PIPELINE INSERT POLICIES
-- ============================================================
-- Allow the analysis pipeline to insert data using service role key.
-- These policies enable INSERT for authenticated service calls.
-- The service role key bypasses RLS, so these policies are for
-- completeness and future API access patterns.
-- ============================================================

-- Allow service role to insert sources
CREATE POLICY "Pipeline can insert sources"
ON nko_sources
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- Allow service role to insert frames
CREATE POLICY "Pipeline can insert frames"
ON nko_frames
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- Allow service role to insert detections
CREATE POLICY "Pipeline can insert detections"
ON nko_detections
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- Allow service role to insert characters
CREATE POLICY "Pipeline can insert characters"
ON nko_characters
FOR INSERT
TO authenticated, service_role
WITH CHECK (true);

-- Allow service role to update sources
CREATE POLICY "Pipeline can update sources"
ON nko_sources
FOR UPDATE
TO authenticated, service_role
USING (true)
WITH CHECK (true);

-- ============================================================
-- GRANT PERMISSIONS TO SERVICE ROLE
-- ============================================================
-- Note: The service_role key automatically bypasses RLS.
-- These grants ensure the role has table-level permissions.

GRANT INSERT, UPDATE ON nko_sources TO service_role;
GRANT INSERT ON nko_frames TO service_role;
GRANT INSERT ON nko_detections TO service_role;
GRANT INSERT ON nko_characters TO service_role;
GRANT INSERT ON nko_trajectories TO service_role;
GRANT INSERT ON nko_trajectory_nodes TO service_role;

