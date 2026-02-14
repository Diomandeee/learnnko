/**
 * Curriculum Visualization Types
 *
 * Type definitions for the training pipeline visualization system.
 * Supports both replay mode (historical data) and live SSE streaming.
 */

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * A frame extracted from the training pipeline.
 * Contains metadata about the frame and its processing status.
 */
export interface CurriculumFrame {
  id: string;
  runId: string;
  videoId: string;
  frameIndex: number;
  timestampMs: number;
  imagePath: string | null;
  thumbnailPath: string | null;
  width: number;
  height: number;
  hasNko: boolean;
  detectionCount: number;
  confidence: number;
  createdAt: string;
}

/**
 * Bounding box for detected N'Ko text in a frame.
 * Coordinates are normalized (0-1) relative to frame dimensions.
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

/**
 * A detection of N'Ko text within a frame.
 * Contains the extracted text, confidence, and location.
 */
export interface CurriculumDetection {
  id: string;
  frameId: string;
  nkoText: string;
  latinText: string | null;
  confidence: number;
  boundingBox: BoundingBox | null;
  status: 'raw' | 'validated' | 'corrected' | 'rejected';
  createdAt: string;
}

/**
 * A pipeline run representing a batch of video processing.
 */
export interface PipelineRun {
  id: string;
  videoId: string;
  videoTitle: string | null;
  channelId: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'completed_with_errors' | 'running';
  passNumber: 1 | 2 | 3 | 4;
  framesExtracted: number;
  detectionsFound: number;
  cost: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  error: string | null;
}

// ============================================================================
// Pipeline Pass Types
// ============================================================================

/**
 * The four passes in the training pipeline.
 */
export type PassNumber = 1 | 2 | 3 | 4;

export type PassName = 'Extraction' | 'Consolidation' | 'Worlds' | 'Transcription';

export type PassStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

/**
 * Status of a single pipeline pass.
 */
export interface PipelinePass {
  number: PassNumber;
  name: PassName;
  status: PassStatus;
  tasksCompleted: number;
  tasksTotal: number;
  currentVideoId: string | null;
  progress: number; // 0-100
}

/**
 * Maps pass numbers to their names.
 */
export const PASS_NAMES: Record<PassNumber, PassName> = {
  1: 'Extraction',
  2: 'Consolidation',
  3: 'Worlds',
  4: 'Transcription',
};

/**
 * Color scheme for each pass (Tailwind classes).
 */
export const PASS_COLORS: Record<PassNumber, { bg: string; text: string; border: string }> = {
  1: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  2: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  3: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  4: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
};

// ============================================================================
// Playback Types
// ============================================================================

export type PlaybackSpeed = 0.5 | 1 | 2 | 4;

/**
 * State for the replay playback system.
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  totalFrames: number;
  speed: PlaybackSpeed;
  loop: boolean;
}

/**
 * Default playback state.
 */
export const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  isPlaying: false,
  currentIndex: 0,
  totalFrames: 0,
  speed: 1,
  loop: false,
};

// ============================================================================
// Mode Types
// ============================================================================

/**
 * Data source mode for the curriculum view.
 */
export type DataMode = 'replay' | 'live';

/**
 * Visualization mode for the curriculum view.
 */
export type ViewMode = 'frames' | 'flow';

/**
 * Combined mode state for the curriculum hub.
 */
export interface CurriculumModeState {
  dataMode: DataMode;
  viewMode: ViewMode;
}

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Daily budget tracking.
 */
export interface DailyBudget {
  date: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  videosProcessed: number;
  framesAnalyzed: number;
  worldsGenerated: number;
}

/**
 * Overall training progress statistics.
 */
export interface TrainingProgress {
  totalVideos: number;
  completedVideos: number;
  inProgressVideos: number;
  failedVideos: number;
  remainingVideos: number;
  totalFrames: number;
  totalDetections: number;
  estimatedCompletion: string | null;
}

/**
 * Pipeline health status indicator.
 */
export type PipelineHealthStatus = 'healthy' | 'idle' | 'warning' | 'error';

/**
 * Pipeline health information for UI display.
 */
export interface PipelineHealth {
  status: PipelineHealthStatus;
  message: string;
  lastSuccessfulRun: string | null;
  errorCount: number;
}

/**
 * Recent pipeline run with error details.
 */
export interface RecentRun {
  id: string;
  status: string;
  runType: string;
  error: string | null;
  failedVideo: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

/**
 * Pipeline status including passes and budget.
 */
export interface PipelineStatus {
  state: 'idle' | 'running' | 'paused' | 'error';
  currentPass: PassNumber | null;
  passes: PipelinePass[];
  progress: TrainingProgress;
  dailyBudget: DailyBudget;
  pipelineHealth: PipelineHealth;
  recentRuns: RecentRun[];
  lastUpdated: string;
}

// ============================================================================
// SSE Event Types
// ============================================================================

/**
 * Types of events that can be streamed via SSE.
 */
export type StreamEventType =
  | 'frame_processed'
  | 'detection_found'
  | 'pass_started'
  | 'pass_completed'
  | 'video_started'
  | 'video_completed'
  | 'error'
  | 'heartbeat';

/**
 * Base SSE event structure.
 */
export interface StreamEvent<T = unknown> {
  type: StreamEventType;
  timestamp: string;
  data: T;
}

/**
 * Frame processed event data.
 */
export interface FrameProcessedEvent {
  frame: CurriculumFrame;
  detections: CurriculumDetection[];
}

/**
 * Detection found event data.
 */
export interface DetectionFoundEvent {
  detection: CurriculumDetection;
  frameId: string;
}

/**
 * Pass state change event data.
 */
export interface PassStateEvent {
  pass: PipelinePass;
  previousStatus: PassStatus;
}

/**
 * Video processing event data.
 */
export interface VideoProcessingEvent {
  runId: string;
  videoId: string;
  videoTitle: string | null;
  status: 'started' | 'completed' | 'failed';
  framesProcessed?: number;
  detectionsFound?: number;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Paginated list response.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * API error response.
 */
export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Frames list API response.
 */
export type FramesResponse = PaginatedResponse<CurriculumFrame>;

/**
 * Detections list API response.
 */
export type DetectionsResponse = PaginatedResponse<CurriculumDetection>;

/**
 * Runs list API response.
 */
export type RunsResponse = PaginatedResponse<PipelineRun>;

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for usePipelineStatus hook.
 */
export interface UsePipelineStatusReturn {
  status: PipelineStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Return type for useCurriculumReplay hook.
 */
export interface UseCurriculumReplayReturn {
  frames: CurriculumFrame[];
  detections: Map<string, CurriculumDetection[]>;
  currentFrame: CurriculumFrame | null;
  currentDetections: CurriculumDetection[];
  playback: PlaybackState;
  isLoading: boolean;
  error: Error | null;
  play: () => void;
  pause: () => void;
  seek: (index: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  loadRun: (runId: string) => Promise<void>;
}

/**
 * Return type for useCurriculumStream hook.
 */
export interface UseCurriculumStreamReturn {
  isConnected: boolean;
  lastEvent: StreamEvent | null;
  currentFrame: CurriculumFrame | null;
  recentDetections: CurriculumDetection[];
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}
