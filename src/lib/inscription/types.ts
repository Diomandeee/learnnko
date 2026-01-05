/**
 * N'Ko Inscription System - TypeScript Types
 *
 * Types for the N'Ko inscription event spine, which compiles embodied dynamics
 * (z-trajectory from mocopi suit) into justified N'Ko text statements with
 * full cryptographic provenance.
 *
 * Architecture:
 * - Backend: GCP VM fusion system (136.114.76.114:8765) detects claims
 * - Frontend: Receives inscriptions via WebSocket + Supabase
 * - Detection: 6Hz (every 10 frames at 60fps)
 */

// =====================================================
// CLAIM TYPES
// =====================================================

/**
 * The 10 fundamental claim types in the inscription system.
 * Each claim represents a detectable pattern in embodied dynamics.
 *
 * Index mapping (CRITICAL - must match backend):
 * 0 = stabilize, 1 = disperse, 2 = transition, 3 = return, 4 = dwell,
 * 5 = oscillate, 6 = recover, 7 = novel, 8 = placeShift, 9 = echo
 */
export type ClaimType =
  | 'stabilize'   // 0: z(σ) decreases - settling into stability
  | 'disperse'    // 1: z(σ) increases - expanding variation
  | 'transition'  // 2: Place change - moving between locations
  | 'return'      // 3: Return to prior basin - revisiting known state
  | 'dwell'       // 4: Extended low σ - sustained stability
  | 'oscillate'   // 5: Periodic σ changes - rhythmic variation
  | 'recover'     // 6: σ reduction after spike - returning to calm
  | 'novel'       // 7: Never-before-seen basin - new discovery
  | 'placeShift'  // 8: New place first visit - spatial novelty
  | 'echo';       // 9: Similar to recent claim - pattern repetition

/**
 * N'Ko sigils (Unicode characters) for each claim type.
 * These are rendered at the start of each inscription line.
 */
export const CLAIM_SIGILS: Record<ClaimType, string> = {
  stabilize: 'ߛ',   // U+07DB ARABIC LETTER NYIN
  disperse: 'ߜ',    // U+07DC ARABIC LETTER YEN
  transition: 'ߕ',  // U+07D5 ARABIC LETTER RREN
  return: 'ߙ',      // U+07D9 ARABIC LETTER NNEN
  dwell: 'ߡ',       // U+07E1 ARABIC LETTER MBA
  oscillate: 'ߚ',   // U+07DA ARABIC LETTER IJEN
  recover: 'ߞ',     // U+07DE ARABIC LETTER KA
  novel: 'ߣ',       // U+07E3 ARABIC LETTER NYA
  placeShift: 'ߠ',  // U+07E0 ARABIC LETTER MA
  echo: 'ߥ',        // U+07E5 ARABIC LETTER LAN
};

/**
 * Human-readable descriptions for each claim type.
 */
export const CLAIM_DESCRIPTIONS: Record<ClaimType, string> = {
  stabilize: 'Embodied variance decreasing - settling into stability',
  disperse: 'Embodied variance increasing - expanding into exploration',
  transition: 'Transitioning between semantic places',
  return: 'Returning to a previously visited basin',
  dwell: 'Sustained period of low variance - dwelling in stability',
  oscillate: 'Periodic changes in variance - rhythmic pattern',
  recover: 'Variance reducing after a spike - recovering equilibrium',
  novel: 'First encounter with a new basin - discovery',
  placeShift: 'First visit to a new place - spatial novelty',
  echo: 'Pattern similar to a recent claim - echo or repetition',
};

/**
 * Color scheme for claim types (for UI visualization).
 */
export const CLAIM_COLORS: Record<ClaimType, string> = {
  stabilize: 'hsl(var(--green))',
  disperse: 'hsl(var(--orange))',
  transition: 'hsl(var(--blue))',
  return: 'hsl(var(--purple))',
  dwell: 'hsl(var(--teal))',
  oscillate: 'hsl(var(--pink))',
  recover: 'hsl(var(--lime))',
  novel: 'hsl(var(--amber))',
  placeShift: 'hsl(var(--cyan))',
  echo: 'hsl(var(--indigo))',
};

// =====================================================
// CORE INSCRIPTION TYPES
// =====================================================

/**
 * Time window for interval-based claims (stabilize, disperse, dwell, oscillate).
 * For instant claims (novel, placeShift), this is null.
 */
export interface TimeWindow {
  /** Start time in milliseconds (relative to session start) */
  t0: number;
  /** End time in milliseconds (relative to session start) */
  t1: number;
}

/**
 * Provenance chain for an inscription.
 * Traces the data flow: sensors → fusion → claim → N'Ko
 */
export interface InscriptionProvenance {
  /** Fusion frame ID from the 60Hz fusion loop */
  fusionFrameId: number;

  /** Array of sensor frame IDs that contributed to this fusion frame */
  sensorFrameIds: number[];

  /** Typed intermediate representation (claim data before N'Ko rendering) */
  claimIr: {
    /** Which dimensions were analyzed (e.g., [0, 1, 2] for x, y, z) */
    dims?: number[];

    /** Delta value for stabilize/disperse (negative = stabilize, positive = disperse) */
    delta?: number;

    /** Threshold used for detection */
    threshold?: number;

    /** Basin identifier (if applicable) */
    basinId?: string;

    /** Place labels (before/after for transitions) */
    places?: string[];

    /** Any additional claim-specific data */
    [key: string]: unknown;
  };
}

/**
 * A single N'Ko inscription - the core data structure.
 * Represents one detected claim about embodied dynamics.
 */
export interface Inscription {
  /** Unique identifier (UUID) */
  id: string;

  /** Claim type (0-9 index mapped to string) */
  claimType: ClaimType;

  /** Rendered N'Ko text line (RTL Unicode)
   * Example: "ߛ ⟦100.0–200.0⟧ : z(σ) ↓ ; home ; c=0.85"
   */
  nkoText: string;

  /** Timestamp in milliseconds (relative to session start) */
  timestampMs: number;

  /** Time window (for interval claims) or null (for instant claims) */
  window: TimeWindow | null;

  /** Detection confidence (0.0-1.0) */
  confidence: number;

  /** Semantic place label (if known) */
  place?: string;

  /** Basin identifier from lexicon */
  basinId?: string;

  /** Full provenance chain */
  provenance: InscriptionProvenance;

  /** Database creation timestamp (ISO 8601) */
  createdAt: string;

  /** Optional session ID (may be null if sessions aren't set up yet) */
  sessionId?: string;
}

/**
 * Basin vocabulary entry.
 * Represents a stable attractor state in z-space.
 */
export interface Basin {
  /** Basin identifier (hash or semantic label) */
  id: string;

  /** N'Ko token representing this basin */
  nkoToken: string;

  /** When this basin was first discovered */
  discoveredAt: string;

  /** When this basin was last visited */
  lastSeen: string;

  /** Total number of visits to this basin */
  visitCount: number;

  /** Optional human-readable label */
  semanticLabel?: string;

  /** Centroid coordinates in z-space (for distance calculations) */
  zCentroid?: {
    dims: number[];
    values: number[];
  };
}

// =====================================================
// DATABASE ROW TYPES (from Supabase)
// =====================================================

/**
 * Raw database row for nko_inscriptions table.
 * Used for type-safe Supabase queries.
 */
export interface InscriptionRow {
  id: string;
  created_at: string;
  session_id: string | null;
  claim_type: number; // 0-9
  nko_text: string;
  timestamp_ms: number;
  window_t0: number | null;
  window_t1: number | null;
  confidence: number;
  place: string | null;
  basin_id: string | null;
  fusion_frame_id: number | null;
  sensor_frame_ids: number[] | null;
  claim_ir: Record<string, unknown>;
}

/**
 * Raw database row for nko_basins table.
 */
export interface BasinRow {
  id: string;
  nko_token: string;
  discovered_at: string;
  last_seen: string;
  visit_count: number;
  semantic_label: string | null;
  z_centroid: Record<string, unknown> | null;
}

// =====================================================
// TYPE CONVERSIONS
// =====================================================

/**
 * Claim type index to string mapping.
 * CRITICAL: This order MUST match the backend enum order exactly.
 */
const CLAIM_TYPE_INDEX: ClaimType[] = [
  'stabilize',   // 0
  'disperse',    // 1
  'transition',  // 2
  'return',      // 3
  'dwell',       // 4
  'oscillate',   // 5
  'recover',     // 6
  'novel',       // 7
  'placeShift',  // 8
  'echo',        // 9
];

/**
 * Convert claim type index (0-9) to ClaimType string.
 */
export function claimTypeFromIndex(index: number): ClaimType {
  if (index < 0 || index > 9) {
    throw new Error(`Invalid claim type index: ${index}. Must be 0-9.`);
  }
  return CLAIM_TYPE_INDEX[index];
}

/**
 * Convert ClaimType string to index (0-9).
 */
export function claimTypeToIndex(claimType: ClaimType): number {
  const index = CLAIM_TYPE_INDEX.indexOf(claimType);
  if (index === -1) {
    throw new Error(`Invalid claim type: ${claimType}`);
  }
  return index;
}

/**
 * Convert database row to Inscription object.
 */
export function inscriptionFromRow(row: InscriptionRow): Inscription {
  return {
    id: row.id,
    claimType: claimTypeFromIndex(row.claim_type),
    nkoText: row.nko_text,
    timestampMs: row.timestamp_ms,
    window: row.window_t0 !== null && row.window_t1 !== null
      ? { t0: row.window_t0, t1: row.window_t1 }
      : null,
    confidence: row.confidence,
    place: row.place ?? undefined,
    basinId: row.basin_id ?? undefined,
    provenance: {
      fusionFrameId: row.fusion_frame_id ?? 0,
      sensorFrameIds: row.sensor_frame_ids ?? [],
      claimIr: row.claim_ir,
    },
    createdAt: row.created_at,
    sessionId: row.session_id ?? undefined,
  };
}

/**
 * Convert database row to Basin object.
 */
export function basinFromRow(row: BasinRow): Basin {
  return {
    id: row.id,
    nkoToken: row.nko_token,
    discoveredAt: row.discovered_at,
    lastSeen: row.last_seen,
    visitCount: row.visit_count,
    semanticLabel: row.semantic_label ?? undefined,
    zCentroid: row.z_centroid as Basin['zCentroid'],
  };
}

// =====================================================
// WEBSOCKET MESSAGE TYPES
// =====================================================

/**
 * Inner data structure for inscription events from backend.
 */
export interface InscriptionEventData {
  id: string;
  claim_type: number; // 0-9
  nko_text: string;
  timestamp_ms: number;
  window?: { t0: number; t1: number } | null;
  confidence: number;
  place?: string;
  basin_id?: string;
  provenance: {
    fusion_frame_id: number;
    sensor_frame_ids: number[];
    claim_ir: Record<string, unknown>;
  };
}

/**
 * WebSocket message envelope from backend fusion system.
 * Backend wraps all messages in MessageEnvelope<T> structure:
 * { type: "inscription", timestamp: number, data: InscriptionEventData }
 */
export interface InscriptionWebSocketMessage {
  type: 'inscription';
  timestamp: number;
  data: InscriptionEventData;
}

/**
 * Convert WebSocket message to Inscription object.
 */
export function inscriptionFromWebSocket(msg: InscriptionWebSocketMessage): Inscription {
  const data = msg.data;
  return {
    id: data.id,
    claimType: claimTypeFromIndex(data.claim_type),
    nkoText: data.nko_text,
    timestampMs: data.timestamp_ms,
    window: data.window ?? null,
    confidence: data.confidence,
    place: data.place,
    basinId: data.basin_id,
    provenance: {
      fusionFrameId: data.provenance.fusion_frame_id,
      sensorFrameIds: data.provenance.sensor_frame_ids,
      claimIr: data.provenance.claim_ir,
    },
    createdAt: new Date().toISOString(),
  };
}

// =====================================================
// FILTER TYPES
// =====================================================

/**
 * Filters for inscription queries.
 */
export interface InscriptionFilters {
  /** Filter by claim types (empty set = show all) */
  claimTypes: Set<ClaimType>;

  /** Minimum confidence threshold (0.0-1.0) */
  minConfidence: number;

  /** Filter by place (undefined = show all) */
  place?: string;

  /** Filter by session (undefined = show all) */
  sessionId?: string;

  /** Date range filter */
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Statistics for a set of inscriptions.
 */
export interface InscriptionStats {
  /** Total count */
  total: number;

  /** Count by claim type */
  byClaimType: Record<ClaimType, number>;

  /** Average confidence */
  avgConfidence: number;

  /** Confidence distribution */
  confidenceDistribution: {
    low: number;    // 0.0-0.5
    medium: number; // 0.5-0.8
    high: number;   // 0.8-1.0
  };

  /** Unique places visited */
  uniquePlaces: number;

  /** Unique basins discovered */
  uniqueBasins: number;

  /** Time span (ms) */
  timeSpan: number;

  /** Detection rate (inscriptions per second) */
  detectionRate: number;
}
