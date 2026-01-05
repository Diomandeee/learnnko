-- =====================================================
-- Migration: 019_inscription_system
-- Description: N'Ko Inscription Event Spine
-- Created: 2026-01-04
-- =====================================================
--
-- This migration creates the infrastructure for the N'Ko Inscription
-- system, which compiles embodied dynamics (z-trajectory) into justified
-- N'Ko text statements with full cryptographic provenance.
--
-- Architecture:
--   - Backend: GCP VM fusion system (136.114.76.114:8765) detects claims
--   - Frontend: learnnko receives inscriptions via WebSocket + Supabase
--   - Detection: 6Hz (every 10 frames at 60fps)
--   - Claim Types: 10 types (0-9 index, see below)
--
-- =====================================================

-- =====================================================
-- TABLE: nko_inscriptions
-- =====================================================
-- Main table for storing N'Ko inscriptions derived from motion data
-- Each inscription represents a detected claim about embodied dynamics

CREATE TABLE IF NOT EXISTS nko_inscriptions (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Session tracking (nullable - sessions may not exist yet)
  -- TODO: Add foreign key constraint after nko_sessions table is created
  session_id UUID,

  -- Claim data
  -- Claim types (0-9):
  --   0 = stabilize (ߛ)  : z(σ) decreases
  --   1 = disperse   (ߜ)  : z(σ) increases
  --   2 = transition (ߕ)  : Place change
  --   3 = return     (ߙ)  : Return to prior basin
  --   4 = dwell      (ߡ)  : Extended low σ
  --   5 = oscillate  (ߚ)  : Periodic σ changes
  --   6 = recover    (ߞ)  : σ reduction after spike
  --   7 = novel      (ߣ)  : Never-before-seen basin
  --   8 = placeShift (ߠ)  : New place first visit
  --   9 = echo       (ߥ)  : Similar to recent claim
  claim_type SMALLINT NOT NULL CHECK (claim_type BETWEEN 0 AND 9),

  -- Rendered N'Ko text line (RTL, Unicode)
  -- Example: "ߛ ⟦100.0–200.0⟧ : z(σ) ↓ ; home ; c=0.85"
  nko_text TEXT NOT NULL,

  -- Timestamp in milliseconds (relative to session start)
  timestamp_ms DOUBLE PRECISION NOT NULL,

  -- Time window (for interval claims like stabilize, disperse)
  -- For instant claims (placeShift, novel), both are NULL
  window_t0 DOUBLE PRECISION,
  window_t1 DOUBLE PRECISION,

  -- Metadata
  confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  place TEXT,  -- Semantic place label (if known)
  basin_id TEXT,  -- Basin identifier from lexicon

  -- Provenance (cryptographic chain)
  fusion_frame_id BIGINT,  -- FusedFrame ID from fusion loop
  sensor_frame_ids BIGINT[],  -- Array of raw sensor frame IDs
  claim_ir JSONB NOT NULL  -- Typed IR (intermediate representation)
);

-- =====================================================
-- INDEXES: Performance optimization
-- =====================================================

-- Session-based queries (most common: "show me all inscriptions for this session")
CREATE INDEX idx_inscriptions_session
  ON nko_inscriptions(session_id);

-- Temporal queries (timeline playback)
CREATE INDEX idx_inscriptions_timestamp
  ON nko_inscriptions(timestamp_ms);

-- Claim type filtering
CREATE INDEX idx_inscriptions_claim_type
  ON nko_inscriptions(claim_type);

-- Recent inscriptions (dashboard)
CREATE INDEX idx_inscriptions_created
  ON nko_inscriptions(created_at DESC);

-- Composite index for session timeline queries
CREATE INDEX idx_inscriptions_session_time
  ON nko_inscriptions(session_id, timestamp_ms);

-- Place-based queries
CREATE INDEX idx_inscriptions_place
  ON nko_inscriptions(place)
  WHERE place IS NOT NULL;

-- Basin vocabulary lookups
CREATE INDEX idx_inscriptions_basin
  ON nko_inscriptions(basin_id)
  WHERE basin_id IS NOT NULL;

-- =====================================================
-- REALTIME: Enable Supabase Realtime subscriptions
-- =====================================================
-- Allows frontend to receive live inscriptions via Supabase Realtime
-- in addition to direct WebSocket connection to GCP VM

ALTER PUBLICATION supabase_realtime ADD TABLE nko_inscriptions;

-- =====================================================
-- TABLE: nko_basins
-- =====================================================
-- Vocabulary table for basin identifiers in the lexicon
-- Each basin represents a stable attractor state in z-space

CREATE TABLE IF NOT EXISTS nko_basins (
  -- Basin identifier (hash or semantic label)
  id TEXT PRIMARY KEY,

  -- N'Ko token representing this basin
  nko_token TEXT NOT NULL,

  -- Discovery metadata
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visit_count INTEGER NOT NULL DEFAULT 1,

  -- Optional semantic label
  semantic_label TEXT,

  -- Centroid in z-space (for distance calculations)
  z_centroid JSONB
);

-- Index for recent basin activity
CREATE INDEX idx_basins_last_seen
  ON nko_basins(last_seen DESC);

-- Index for discovery timeline
CREATE INDEX idx_basins_discovered
  ON nko_basins(discovered_at DESC);

-- =====================================================
-- RLS POLICIES: Row Level Security
-- =====================================================

-- Enable RLS
ALTER TABLE nko_inscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nko_basins ENABLE ROW LEVEL SECURITY;

-- Public read access (inscriptions are public performance data)
CREATE POLICY "nko_inscriptions_select_public"
  ON nko_inscriptions
  FOR SELECT
  USING (true);

-- Insert: Only authenticated service role (backend GCP VM)
CREATE POLICY "nko_inscriptions_insert_service"
  ON nko_inscriptions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Basins: Public read
CREATE POLICY "nko_basins_select_public"
  ON nko_basins
  FOR SELECT
  USING (true);

-- Basins: Service role write
CREATE POLICY "nko_basins_insert_service"
  ON nko_basins
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "nko_basins_update_service"
  ON nko_basins
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- =====================================================
-- COMMENTS: Documentation in database
-- =====================================================

COMMENT ON TABLE nko_inscriptions IS
  'N''Ko inscriptions derived from motion data via fusion system. Each row represents a detected claim about embodied dynamics with full provenance chain.';

COMMENT ON COLUMN nko_inscriptions.claim_type IS
  'Claim type index (0-9): 0=stabilize, 1=disperse, 2=transition, 3=return, 4=dwell, 5=oscillate, 6=recover, 7=novel, 8=placeShift, 9=echo';

COMMENT ON COLUMN nko_inscriptions.nko_text IS
  'Rendered N''Ko text line (RTL Unicode). Example: "ߛ ⟦100.0–200.0⟧ : z(σ) ↓ ; home ; c=0.85"';

COMMENT ON COLUMN nko_inscriptions.claim_ir IS
  'Typed intermediate representation (JSON) of the claim before N''Ko rendering. Contains dimensional data, deltas, thresholds, etc.';

COMMENT ON TABLE nko_basins IS
  'Vocabulary of basin identifiers discovered during motion sessions. Each basin represents a stable attractor state in z-space.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
--   1. Generate TypeScript types: npx supabase gen types typescript
--   2. Create frontend types (types.ts)
--   3. Create Zustand store (useInscriptionStore.ts)
--   4. Create WebSocket manager (websocket.ts)
-- =====================================================
