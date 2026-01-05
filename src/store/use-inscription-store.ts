/**
 * Zustand Store for N'Ko Inscription System
 *
 * Manages state for live inscription stream, session review,
 * filters, and WebSocket connection status.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RealtimeChannel } from '@supabase/supabase-js';
import {
  type Inscription,
  type ClaimType,
  type InscriptionFilters,
  type InscriptionStats,
} from '@/lib/inscription/types';
import { getSupabase, saveInscription, isSupabaseConfigured } from '@/lib/supabase/client';

// =====================================================
// CONNECTION STATUS
// =====================================================

export type ConnectionStatus =
  | 'disconnected' // Not connected
  | 'connecting'   // Attempting connection
  | 'connected'    // Active connection
  | 'error';       // Connection error

// =====================================================
// STORE STATE
// =====================================================

interface InscriptionState {
  // ============ Live Stream ============

  /** Live inscriptions from WebSocket (most recent 50) */
  liveInscriptions: Inscription[];

  /** Whether WebSocket is connected */
  isConnected: boolean;

  /** Current connection status */
  connectionStatus: ConnectionStatus;

  /** Last connection error message */
  connectionError: string | null;

  // ============ Session Review ============

  /** Currently selected session ID for review */
  currentSessionId: string | null;

  /** Inscriptions for the current session */
  sessionInscriptions: Inscription[];

  /** Loading state for session data */
  isLoadingSession: boolean;

  // ============ Filters ============

  /** Active filters for inscription display */
  filters: InscriptionFilters;

  // ============ Statistics ============

  /** Computed stats for current view */
  stats: InscriptionStats | null;

  // ============ UI State ============

  /** Whether live stream is paused (stops adding new inscriptions to UI) */
  isLivePaused: boolean;

  /** Selected inscription for detail view */
  selectedInscriptionId: string | null;

  // ============ Actions ============

  // Live stream actions
  addLiveInscription: (inscription: Inscription, skipPersist?: boolean) => void;
  clearLiveInscriptions: () => void;
  pauseLive: () => void;
  resumeLive: () => void;

  // Connection actions
  setConnectionStatus: (status: ConnectionStatus, error?: string) => void;

  // Session actions
  loadSessionInscriptions: (sessionId: string) => Promise<void>;
  clearSessionInscriptions: () => void;

  // Historical data actions
  loadRecentInscriptions: (limit?: number) => Promise<void>;
  isLoadingRecent: boolean;

  // Realtime subscription actions
  subscribeToLiveInscriptions: () => void;
  unsubscribeFromLiveInscriptions: () => void;
  isRealtimeSubscribed: boolean;

  // Filter actions
  setFilters: (filters: Partial<InscriptionFilters>) => void;
  toggleClaimTypeFilter: (claimType: ClaimType) => void;
  setMinConfidence: (minConfidence: number) => void;
  setPlaceFilter: (place: string | undefined) => void;
  resetFilters: () => void;

  // UI actions
  selectInscription: (id: string | null) => void;

  // Stats actions
  computeStats: () => void;
}

// =====================================================
// DEFAULT FILTERS
// =====================================================

const DEFAULT_FILTERS: InscriptionFilters = {
  claimTypes: new Set(), // Empty = show all
  minConfidence: 0.0,    // Show all confidence levels
  place: undefined,
  sessionId: undefined,
  dateRange: undefined,
};

// Module-level subscription channel (not persisted)
let realtimeChannel: RealtimeChannel | null = null;

// Claim type index for converting DB rows
const CLAIM_TYPE_INDEX: (
  | 'stabilize'
  | 'disperse'
  | 'transition'
  | 'return'
  | 'dwell'
  | 'oscillate'
  | 'recover'
  | 'novel'
  | 'placeShift'
  | 'echo'
)[] = [
  'stabilize',
  'disperse',
  'transition',
  'return',
  'dwell',
  'oscillate',
  'recover',
  'novel',
  'placeShift',
  'echo',
];

/**
 * Convert a database row to an Inscription object.
 */
function rowToInscription(row: any): Inscription {
  return {
    id: row.id,
    claimType: typeof row.claim_type === 'number'
      ? CLAIM_TYPE_INDEX[row.claim_type] || 'stabilize'
      : row.claim_type,
    nkoText: row.nko_text,
    timestampMs: row.timestamp_ms,
    window:
      row.window_t0 && row.window_t1
        ? { t0: row.window_t0, t1: row.window_t1 }
        : null,
    confidence: row.confidence,
    place: row.place,
    basinId: row.basin_id,
    provenance: {
      fusionFrameId: row.fusion_frame_id || 0,
      sensorFrameIds: row.sensor_frame_ids || [],
      claimIr: row.claim_ir || {},
    },
    createdAt: row.created_at,
    sessionId: row.session_id,
  };
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Apply filters to a list of inscriptions.
 */
function applyFilters(
  inscriptions: Inscription[],
  filters: InscriptionFilters
): Inscription[] {
  return inscriptions.filter((inscription) => {
    // Claim type filter
    if (filters.claimTypes.size > 0 && !filters.claimTypes.has(inscription.claimType)) {
      return false;
    }

    // Confidence filter
    if (inscription.confidence < filters.minConfidence) {
      return false;
    }

    // Place filter
    if (filters.place && inscription.place !== filters.place) {
      return false;
    }

    // Session filter
    if (filters.sessionId && inscription.sessionId !== filters.sessionId) {
      return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const inscriptionDate = new Date(inscription.createdAt);
      if (
        inscriptionDate < filters.dateRange.start ||
        inscriptionDate > filters.dateRange.end
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Compute statistics for a list of inscriptions.
 */
function computeInscriptionStats(inscriptions: Inscription[]): InscriptionStats {
  if (inscriptions.length === 0) {
    return {
      total: 0,
      byClaimType: {} as Record<ClaimType, number>,
      avgConfidence: 0,
      confidenceDistribution: { low: 0, medium: 0, high: 0 },
      uniquePlaces: 0,
      uniqueBasins: 0,
      timeSpan: 0,
      detectionRate: 0,
    };
  }

  // Count by claim type
  const byClaimType: Record<string, number> = {};
  let totalConfidence = 0;
  const confidenceDistribution = { low: 0, medium: 0, high: 0 };
  const places = new Set<string>();
  const basins = new Set<string>();

  for (const inscription of inscriptions) {
    // Claim type count
    byClaimType[inscription.claimType] = (byClaimType[inscription.claimType] || 0) + 1;

    // Confidence stats
    totalConfidence += inscription.confidence;
    if (inscription.confidence < 0.5) {
      confidenceDistribution.low++;
    } else if (inscription.confidence < 0.8) {
      confidenceDistribution.medium++;
    } else {
      confidenceDistribution.high++;
    }

    // Unique places and basins
    if (inscription.place) places.add(inscription.place);
    if (inscription.basinId) basins.add(inscription.basinId);
  }

  // Time span
  const timestamps = inscriptions.map((i) => i.timestampMs);
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeSpan = maxTime - minTime;

  // Detection rate (inscriptions per second)
  const detectionRate = timeSpan > 0 ? (inscriptions.length / (timeSpan / 1000)) : 0;

  return {
    total: inscriptions.length,
    byClaimType: byClaimType as Record<ClaimType, number>,
    avgConfidence: totalConfidence / inscriptions.length,
    confidenceDistribution,
    uniquePlaces: places.size,
    uniqueBasins: basins.size,
    timeSpan,
    detectionRate,
  };
}

// =====================================================
// STORE CREATION
// =====================================================

export const useInscriptionStore = create<InscriptionState>()(
  persist(
    (set, get) => ({
      // ============ Initial State ============
      liveInscriptions: [],
      isConnected: false,
      connectionStatus: 'disconnected',
      connectionError: null,
      currentSessionId: null,
      sessionInscriptions: [],
      isLoadingSession: false,
      isLoadingRecent: false,
      isRealtimeSubscribed: false,
      filters: DEFAULT_FILTERS,
      stats: null,
      isLivePaused: false,
      selectedInscriptionId: null,

      // ============ Live Stream Actions ============

      addLiveInscription: (inscription, skipPersist = false) => {
        const { isLivePaused, liveInscriptions } = get();

        // Don't add if live is paused
        if (isLivePaused) return;

        // Check for duplicates
        if (liveInscriptions.some((i) => i.id === inscription.id)) {
          return; // Already have this inscription
        }

        set((state) => ({
          liveInscriptions: [inscription, ...state.liveInscriptions].slice(0, 50),
        }));

        // Persist to Supabase (fire and forget) unless skipPersist is true
        // skipPersist is true when the inscription comes from Supabase Realtime (already persisted)
        if (!skipPersist) {
          saveInscription(inscription).catch((err) => {
            console.error('Failed to persist inscription:', err);
          });
        }

        // Recompute stats
        get().computeStats();
      },

      clearLiveInscriptions: () => {
        set({ liveInscriptions: [], stats: null });
      },

      pauseLive: () => {
        set({ isLivePaused: true });
      },

      resumeLive: () => {
        set({ isLivePaused: false });
      },

      // ============ Connection Actions ============

      setConnectionStatus: (status, error) => {
        set({
          connectionStatus: status,
          isConnected: status === 'connected',
          connectionError: error ?? null,
        });
      },

      // ============ Session Actions ============

      loadSessionInscriptions: async (sessionId) => {
        set({ isLoadingSession: true, currentSessionId: sessionId });

        try {
          const supabase = getSupabase();

          const { data, error } = await supabase
            .from('nko_inscriptions')
            .select('*')
            .eq('session_id', sessionId)
            .order('timestamp_ms', { ascending: true });

          if (error) {
            console.error('Failed to load session inscriptions:', error);
            set({ isLoadingSession: false });
            return;
          }

          // Convert rows to Inscription objects
          const inscriptions: Inscription[] = (data || []).map((row: any) => ({
            id: row.id,
            claimType: row.claim_type,
            nkoText: row.nko_text,
            timestampMs: row.timestamp_ms,
            window: row.window_t0 && row.window_t1
              ? { t0: row.window_t0, t1: row.window_t1 }
              : null,
            confidence: row.confidence,
            place: row.place,
            basinId: row.basin_id,
            provenance: {
              fusionFrameId: row.fusion_frame_id || 0,
              sensorFrameIds: row.sensor_frame_ids || [],
              claimIr: row.claim_ir,
            },
            createdAt: row.created_at,
            sessionId: row.session_id,
          }));

          set({ sessionInscriptions: inscriptions, isLoadingSession: false });
          get().computeStats();
        } catch (error) {
          console.error('Error loading session inscriptions:', error);
          set({ isLoadingSession: false });
        }
      },

      clearSessionInscriptions: () => {
        set({ sessionInscriptions: [], currentSessionId: null, stats: null });
      },

      // ============ Historical Data Actions ============

      loadRecentInscriptions: async (limit = 50) => {
        // Don't reload if we already have data
        const { liveInscriptions, isLoadingRecent } = get();
        if (isLoadingRecent) return;

        set({ isLoadingRecent: true });

        try {
          const supabase = getSupabase();

          const { data, error } = await supabase
            .from('nko_inscriptions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (error) {
            console.error('Failed to load recent inscriptions:', error);
            set({ isLoadingRecent: false });
            return;
          }

          // Convert rows to Inscription objects (claim_type is stored as index 0-9)
          const claimTypeIndex: (
            | 'stabilize'
            | 'disperse'
            | 'transition'
            | 'return'
            | 'dwell'
            | 'oscillate'
            | 'recover'
            | 'novel'
            | 'placeShift'
            | 'echo'
          )[] = [
            'stabilize',
            'disperse',
            'transition',
            'return',
            'dwell',
            'oscillate',
            'recover',
            'novel',
            'placeShift',
            'echo',
          ];

          const inscriptions: Inscription[] = (data || []).map((row: any) => ({
            id: row.id,
            claimType: typeof row.claim_type === 'number'
              ? claimTypeIndex[row.claim_type] || 'stabilize'
              : row.claim_type,
            nkoText: row.nko_text,
            timestampMs: row.timestamp_ms,
            window:
              row.window_t0 && row.window_t1
                ? { t0: row.window_t0, t1: row.window_t1 }
                : null,
            confidence: row.confidence,
            place: row.place,
            basinId: row.basin_id,
            provenance: {
              fusionFrameId: row.fusion_frame_id || 0,
              sensorFrameIds: row.sensor_frame_ids || [],
              claimIr: row.claim_ir || {},
            },
            createdAt: row.created_at,
            sessionId: row.session_id,
          }));

          // Merge with existing live inscriptions (avoid duplicates)
          const existingIds = new Set(liveInscriptions.map((i) => i.id));
          const newInscriptions = inscriptions.filter((i) => !existingIds.has(i.id));

          // Prepend historical data (reversed to show newest first)
          set({
            liveInscriptions: [...liveInscriptions, ...newInscriptions].slice(0, limit),
            isLoadingRecent: false,
          });

          get().computeStats();
        } catch (error) {
          console.error('Error loading recent inscriptions:', error);
          set({ isLoadingRecent: false });
        }
      },

      // ============ Realtime Subscription Actions ============

      subscribeToLiveInscriptions: () => {
        // Check if already subscribed or not configured
        if (realtimeChannel || !isSupabaseConfigured()) {
          console.log('[InscriptionStore] Already subscribed or Supabase not configured');
          return;
        }

        try {
          const supabase = getSupabase();

          // Create a channel for nko_inscriptions INSERT events
          realtimeChannel = supabase
            .channel('nko_inscriptions_realtime')
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'nko_inscriptions',
              },
              (payload) => {
                console.log('[InscriptionStore] Realtime INSERT:', payload.new?.id);

                // Convert the database row to an Inscription
                const inscription = rowToInscription(payload.new);

                // Add to live inscriptions (skipPersist=true since it's already in DB)
                get().addLiveInscription(inscription, true);
              }
            )
            .subscribe((status) => {
              console.log('[InscriptionStore] Realtime subscription status:', status);
              if (status === 'SUBSCRIBED') {
                set({
                  isRealtimeSubscribed: true,
                  connectionStatus: 'connected',
                  isConnected: true,
                });
              } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                set({
                  isRealtimeSubscribed: false,
                  connectionStatus: 'disconnected',
                  isConnected: false,
                });
              }
            });

          console.log('[InscriptionStore] Subscribed to nko_inscriptions realtime');
        } catch (error) {
          console.error('[InscriptionStore] Failed to subscribe:', error);
          set({
            connectionStatus: 'error',
            connectionError: String(error),
          });
        }
      },

      unsubscribeFromLiveInscriptions: () => {
        if (realtimeChannel) {
          const supabase = getSupabase();
          supabase.removeChannel(realtimeChannel);
          realtimeChannel = null;

          set({
            isRealtimeSubscribed: false,
            connectionStatus: 'disconnected',
            isConnected: false,
          });

          console.log('[InscriptionStore] Unsubscribed from nko_inscriptions realtime');
        }
      },

      // ============ Filter Actions ============

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
        get().computeStats();
      },

      toggleClaimTypeFilter: (claimType) => {
        set((state) => {
          const newClaimTypes = new Set(state.filters.claimTypes);
          if (newClaimTypes.has(claimType)) {
            newClaimTypes.delete(claimType);
          } else {
            newClaimTypes.add(claimType);
          }
          return {
            filters: { ...state.filters, claimTypes: newClaimTypes },
          };
        });
        get().computeStats();
      },

      setMinConfidence: (minConfidence) => {
        set((state) => ({
          filters: { ...state.filters, minConfidence },
        }));
        get().computeStats();
      },

      setPlaceFilter: (place) => {
        set((state) => ({
          filters: { ...state.filters, place },
        }));
        get().computeStats();
      },

      resetFilters: () => {
        set({ filters: DEFAULT_FILTERS });
        get().computeStats();
      },

      // ============ UI Actions ============

      selectInscription: (id) => {
        set({ selectedInscriptionId: id });
      },

      // ============ Stats Actions ============

      computeStats: () => {
        const { liveInscriptions, sessionInscriptions, currentSessionId, filters } = get();

        // Determine which inscriptions to compute stats for
        const inscriptions = currentSessionId ? sessionInscriptions : liveInscriptions;

        // Apply filters
        const filtered = applyFilters(inscriptions, filters);

        // Compute stats
        const stats = computeInscriptionStats(filtered);

        set({ stats });
      },
    }),
    {
      name: 'inscription-state',
      // Only persist certain fields (not live data or connection status)
      partialize: (state) => ({
        filters: {
          ...state.filters,
          claimTypes: Array.from(state.filters.claimTypes), // Convert Set to Array for JSON
        },
        isLivePaused: state.isLivePaused,
      }),
      // Restore Set from Array
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.filters.claimTypes)) {
          state.filters.claimTypes = new Set(state.filters.claimTypes as unknown as ClaimType[]);
        }
      },
    }
  )
);

// =====================================================
// SELECTORS (for optimized re-renders)
// =====================================================

/**
 * Get filtered live inscriptions.
 */
export const useFilteredLiveInscriptions = () => {
  const liveInscriptions = useInscriptionStore((state) => state.liveInscriptions);
  const filters = useInscriptionStore((state) => state.filters);
  return applyFilters(liveInscriptions, filters);
};

/**
 * Get filtered session inscriptions.
 */
export const useFilteredSessionInscriptions = () => {
  const sessionInscriptions = useInscriptionStore((state) => state.sessionInscriptions);
  const filters = useInscriptionStore((state) => state.filters);
  return applyFilters(sessionInscriptions, filters);
};

/**
 * Get inscription by ID (from either live or session).
 */
export const useInscriptionById = (id: string | null) => {
  const liveInscriptions = useInscriptionStore((state) => state.liveInscriptions);
  const sessionInscriptions = useInscriptionStore((state) => state.sessionInscriptions);

  if (!id) return null;

  return (
    liveInscriptions.find((i) => i.id === id) ||
    sessionInscriptions.find((i) => i.id === id) ||
    null
  );
};
