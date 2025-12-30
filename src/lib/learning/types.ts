/**
 * Types for the Real-Time N'Ko Learning System
 * 
 * These types match the backend API response format from:
 * https://cc-music-pipeline-owq2vk3wya-uc.a.run.app
 */

// ============================================================================
// Backend API Response Types (match the actual API)
// ============================================================================

/**
 * Backend LearningStats - statistics from the analyzer
 */
export interface BackendLearningStats {
  framesProcessed: number;
  framesWithNko: number;
  uniqueCharacters: number;
  uniqueWords: number;
  averageConfidence: number;
  processingTimeMs: number;
}

/**
 * Backend FrameData - individual frame analysis result
 */
export interface BackendFrameData {
  frameIndex: number;
  timestampMs: number;
  detectedText: DetectedText[];
  confidence: number;
  isKeyFrame: boolean;
  nkoContent: BackendNkoContent | null;
}

export interface DetectedText {
  text: string;
  boundingBox: BoundingBox | null;
  confidence: number;
  language: string | null;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BackendNkoContent {
  characters: string[];
  words: string[];
  confidence: number;
  validationStatus: 'valid' | 'partial' | 'invalid';
}

export interface BackendPhaseTransition {
  oldPhase: string;
  newPhase: string;
  reason: string;
}

export interface BackendCompletionData {
  totalFrames: number;
  framesWithNko: number;
  uniqueCharacters: string[];
  uniqueWords: string[];
  processingTimeMs: number;
}

/**
 * Backend SSE Message format
 */
export interface BackendStreamMessage {
  type: 'frame' | 'stats' | 'phase' | 'complete' | 'error';
  timestamp: number;
  session_id: string;
  data?: BackendFrameData | BackendLearningStats | BackendPhaseTransition | BackendCompletionData;
  message?: string; // For error type
}

// ============================================================================
// Frontend Display Types (derived from backend data)
// ============================================================================

/**
 * Frontend LearningStats - for UI display with Welford algorithm support
 */
export interface LearningStats {
  // Backend stats
  framesProcessed: number;
  framesWithNko: number;
  uniqueCharacters: number;
  uniqueWords: number;
  averageConfidence: number;
  processingTimeMs: number;
  // Welford algorithm stats (calculated locally)
  count: number;
  mean: number;
  m2: number;
  variance: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

export type LearningPhase =
  | 'exploration' // Initial exposure to new content
  | 'consolidation' // Reinforcing learned patterns
  | 'synthesis' // Combining knowledge
  | 'debugging' // Correcting errors
  | 'planning'; // Planning next learning steps

/**
 * Frontend FrameData - transformed for UI display
 */
export interface FrameData {
  frameId: string;
  frameIndex: number;
  timestampMs: number;
  content: NkoContent;
  confidence: number;
  isKeyFrame: boolean;
  validationStatus: 'valid' | 'partial' | 'invalid';
  detectedText: DetectedText[];
  adaptiveTiming: {
    suggestedDelay: number;
    reason: 'novel' | 'complex' | 'simple' | 'review';
  };
}

/**
 * Frontend NkoContent - for UI display
 */
export interface NkoContent {
  nkoText: string;
  latinText: string;
  translation: string;
  characters: string[];
  words: string[];
}

/**
 * Frontend LearningStreamMessage - unified message type
 */
export interface LearningStreamMessage {
  type: 'frame' | 'stats' | 'phase' | 'motif' | 'trajectory' | 'complete' | 'error';
  timestamp: number;
  sessionId: string;
  data?: FrameData | StatsUpdate | PhaseTransition | MotifDiscovery | TrajectoryNode | CompletionData;
  message?: string;
}

export interface TrajectoryWorld {
  worldId: string;
  context: string;
  baseContent: NkoContent;
  variants: TrajectoryVariant[];
}

export interface TrajectoryVariant {
  variantId: string;
  nkoText: string;
  latinText: string;
  englishTranslation: string;
  confidence: number;
  differentiator: string;
}

export interface TrajectoryNode {
  id: string;
  content: NkoContent;
  children: TrajectoryNode[];
  confidence: number;
  isSelected: boolean;
  worldContext: string;
}

// Stats Update
export type StatsUpdate = LearningStats;

// Phase Transition
export interface PhaseTransition {
  oldPhase: LearningPhase;
  newPhase: LearningPhase;
  previousPhase?: LearningPhase; // Alias for oldPhase (legacy)
  reason: string;
}

// Completion Data
export interface CompletionData {
  totalFrames: number;
  framesWithNko: number;
  uniqueCharacters: string[];
  uniqueWords: string[];
  processingTimeMs: number;
}

// Motif Discovery (Placeholder for now)
export interface MotifDiscovery {
  motifType: string;
  salienceScore: number;
  embedding?: number[];
}

export interface UserCorrection {
  frameId: string;
  originalNko: string;
  correctedNko: string;
  correctionType: 'spelling' | 'tone' | 'meaning' | 'other';
  timestamp: number;
}

// ============================================================================
// Transformation Helpers
// ============================================================================

/**
 * Transform backend frame data to frontend format
 */
export function transformBackendFrame(backend: BackendFrameData, sessionId: string): FrameData {
  const nkoText = backend.nkoContent?.words.join(' ') || 
                  backend.detectedText.map(t => t.text).join(' ') || '';
  
  return {
    frameId: `${sessionId}_frame_${backend.frameIndex}`,
    frameIndex: backend.frameIndex,
    timestampMs: backend.timestampMs,
    content: {
      nkoText,
      latinText: '', // Backend doesn't provide transliteration
      translation: '', // Backend doesn't provide translation
      characters: backend.nkoContent?.characters || [],
      words: backend.nkoContent?.words || [],
    },
    confidence: backend.confidence,
    isKeyFrame: backend.isKeyFrame,
    validationStatus: backend.nkoContent?.validationStatus || 'invalid',
    detectedText: backend.detectedText,
    adaptiveTiming: {
      // Calculate based on content novelty and confidence
      suggestedDelay: calculateAdaptiveDelay(backend),
      reason: backend.isKeyFrame ? 'novel' : 'simple',
    },
  };
}

/**
 * Calculate adaptive delay based on frame content
 */
function calculateAdaptiveDelay(frame: BackendFrameData): number {
  const baseDelay = 2000; // 2 seconds
  
  // Adjust based on confidence (lower confidence = more time)
  const confidenceFactor = 1 + (1 - frame.confidence) * 0.5;
  
  // Adjust for key frames (more time for key content)
  const keyFrameFactor = frame.isKeyFrame ? 1.5 : 1;
  
  // Adjust for N'Ko content presence
  const nkoFactor = frame.nkoContent ? 1.3 : 0.8;
  
  return Math.round(baseDelay * confidenceFactor * keyFrameFactor * nkoFactor);
}

/**
 * Transform backend stats to frontend format
 */
export function transformBackendStats(backend: BackendLearningStats): LearningStats {
  return {
    ...backend,
    // Add Welford algorithm fields
    count: backend.framesProcessed,
    mean: backend.averageConfidence,
    m2: 0, // Not tracked by backend
    variance: 0, // Not tracked by backend
    confidence: {
      lower: Math.max(0, backend.averageConfidence - 0.1),
      upper: Math.min(1, backend.averageConfidence + 0.1),
    },
  };
}

/**
 * Transform backend stream message to frontend format
 */
export function transformBackendMessage(backend: BackendStreamMessage): LearningStreamMessage {
  const base: LearningStreamMessage = {
    type: backend.type,
    timestamp: backend.timestamp,
    sessionId: backend.session_id,
  };

  switch (backend.type) {
    case 'frame':
      base.data = transformBackendFrame(backend.data as BackendFrameData, backend.session_id);
      break;
    case 'stats':
      base.data = transformBackendStats(backend.data as BackendLearningStats);
      break;
    case 'phase':
      const phaseData = backend.data as BackendPhaseTransition;
      base.data = {
        oldPhase: phaseData.oldPhase as LearningPhase,
        newPhase: phaseData.newPhase as LearningPhase,
        reason: phaseData.reason,
      } as PhaseTransition;
      break;
    case 'complete':
      base.data = backend.data as CompletionData;
      break;
    case 'error':
      base.message = backend.message;
      break;
  }

  return base;
}

/**
 * Create empty stats for initialization
 */
export function createEmptyStats(): LearningStats {
  return {
    framesProcessed: 0,
    framesWithNko: 0,
    uniqueCharacters: 0,
    uniqueWords: 0,
    averageConfidence: 0,
    processingTimeMs: 0,
    count: 0,
    mean: 0,
    m2: 0,
    variance: 0,
    confidence: { lower: 0, upper: 1 },
  };
}

/**
 * Infer learning phase from stats
 */
export function inferPhaseFromStats(stats: LearningStats): LearningPhase {
  if (stats.framesProcessed < 10) return 'exploration';
  if (stats.averageConfidence < 0.5) return 'debugging';
  if (stats.uniqueCharacters < 20) return 'consolidation';
  if (stats.uniqueWords < 50) return 'synthesis';
  return 'planning';
}

// ============================================================================
// UI Constants
// ============================================================================

/**
 * Phase colors for visualization
 */
export const PHASE_COLORS: Record<LearningPhase, string> = {
  exploration: '#3B82F6',   // Blue
  consolidation: '#10B981', // Green
  synthesis: '#8B5CF6',     // Purple
  debugging: '#F59E0B',     // Amber
  planning: '#6366F1',      // Indigo
};

/**
 * Phase labels for display
 */
export const PHASE_LABELS: Record<LearningPhase, string> = {
  exploration: 'Exploring',
  consolidation: 'Consolidating',
  synthesis: 'Synthesizing',
  debugging: 'Debugging',
  planning: 'Planning',
};

/**
 * Props for ProgressRing component
 */
export interface ProgressRingProps {
  stats: LearningStats;
  phase: LearningPhase;
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
}
