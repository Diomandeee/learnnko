/**
 * LearnN'Ko RLM Type Definitions
 *
 * Types for integrating Recursive Language Model capabilities
 * with the LearnN'Ko training pipeline.
 *
 * Extends the core RLM types with training-specific concepts:
 * - 5D trajectory coordinates for pedagogical content
 * - Self-improvement feedback loops
 * - World generation quality tracking
 */

// ============================================================================
// Core RLM Types (mirrored from cc-orchestrator-agent for standalone use)
// ============================================================================

/**
 * Execution environment type for RLM
 */
export type RLMEnvironment = 'local' | 'docker' | 'modal';

/**
 * Backend model provider
 */
export type RLMBackend = 'anthropic' | 'openai';

/**
 * Base RLM client configuration
 */
export interface RLMConfig {
  /** Model backend - default 'anthropic' */
  backend: RLMBackend;
  /** Primary model for reasoning */
  model?: string;
  /** Fast model for anticipation analysis */
  anticipationModel?: string;
  /** Execution environment - default 'local' */
  environment: RLMEnvironment;
  /** Maximum recursion depth - default 3 */
  maxDepth: number;
  /** Maximum iterations per level - default 30 */
  maxIterations: number;
  /** Custom system prompt for RLM */
  systemPrompt?: string;
  /** Working directory for file operations */
  workingDirectory?: string;
  /** Enable verbose logging */
  verbose: boolean;
}

/**
 * 5D Trajectory Coordinates
 *
 * Originally from RAG++, adapted for training data:
 * - temporal: recency of content
 * - semantic: relevance to learning objectives
 * - depth: recursion/nesting level in analysis
 * - homogeneity: consistency with peer items
 * - salience: pedagogical importance
 */
export interface TrajectoryCoordinates {
  /** Temporal dimension: recency score 0-1 */
  temporal: number;
  /** Semantic dimension: query/objective similarity 0-1 */
  semantic: number;
  /** Depth dimension: recursion/nesting level */
  depth: number;
  /** Homogeneity dimension: peer similarity 0-1 */
  homogeneity: number;
  /** Salience dimension: dynamic importance 0-1 */
  salience: number;
}

/**
 * Recursion metrics for tracking cost/depth
 */
export interface RecursionMetrics {
  currentDepth: number;
  totalBranches: number;
  totalTurns: number;
  totalTokensIn: number;
  totalTokensOut: number;
  strategyUsed: RecursionStrategy[];
  executionTimeMs: number;
}

/**
 * Recursion strategy hint
 */
export type RecursionStrategy =
  | 'peeking'        // Sample context to identify structure
  | 'grepping'       // Filter by patterns before deep analysis
  | 'partition_map'  // Chunk and process in parallel
  | 'summarize'      // Summarize subsets for synthesis
  | 'programmatic'   // Direct code execution
  | 'auto';          // Let the model decide

/**
 * Anticipation state for depth control
 */
export interface AnticipationState {
  /** Commitment level 0-1: how confident we are in the current answer */
  commitment: number;
  /** Uncertainty level 0-1: how much we still don't know */
  uncertainty: number;
  /** Suggested action based on commitment/uncertainty */
  suggestedAction: 'commit' | 'recurse_single' | 'recurse_branch' | 'abort';
}

// ============================================================================
// LearnN'Ko-Specific Types
// ============================================================================

/**
 * Training pipeline pass identifier
 */
export type TrainingPass = 1 | 2 | 3 | 4;

/**
 * The 5 contextual worlds for phrase generation
 */
export type WorldType =
  | 'everyday'      // Daily conversation contexts
  | 'formal'        // Business/official contexts
  | 'storytelling'  // Narrative/folktale contexts
  | 'proverbs'      // Traditional wisdom contexts
  | 'educational';  // Learning/teaching contexts

/**
 * Entity types that can have trajectory coordinates
 */
export type TrainingEntityType =
  | 'source'        // Video/audio source
  | 'frame'         // Extracted frame
  | 'detection'     // OCR detection
  | 'phrase'        // Vocabulary entry
  | 'world'         // Generated world variant
  | 'lesson'        // Curriculum unit
  | 'audio_segment'; // Audio segment

/**
 * LearnN'Ko-specific RLM configuration
 */
export interface LearnNKoRLMConfig extends RLMConfig {
  /** Which pass this RLM is operating on */
  pass: TrainingPass;
  /** Supabase client for database operations */
  supabaseUrl: string;
  supabaseKey: string;
  /** Enable self-improvement feedback loop */
  feedbackEnabled: boolean;
  /** Coordinate weights for scoring */
  coordinateWeights: CoordinateWeights;
}

/**
 * Weights for combining 5D coordinates into a single score
 */
export interface CoordinateWeights {
  temporal: number;
  semantic: number;
  depth: number;
  homogeneity: number;
  salience: number;
}

/**
 * Default coordinate weights by training pass
 */
export const DEFAULT_COORDINATE_WEIGHTS: Record<TrainingPass, CoordinateWeights> = {
  // Pass 1: Extraction - prioritize temporal (recent videos) and salience (quality sources)
  1: { temporal: 0.3, semantic: 0.2, depth: 0.1, homogeneity: 0.1, salience: 0.3 },
  // Pass 2: Consolidation - prioritize homogeneity (clustering) and semantic (dedup)
  2: { temporal: 0.1, semantic: 0.3, depth: 0.1, homogeneity: 0.4, salience: 0.1 },
  // Pass 3: World Generation - prioritize semantic (fit) and salience (pedagogical value)
  3: { temporal: 0.1, semantic: 0.35, depth: 0.1, homogeneity: 0.15, salience: 0.3 },
  // Pass 4: Curriculum - prioritize depth (prerequisites) and salience (core vocab)
  4: { temporal: 0.1, semantic: 0.2, depth: 0.3, homogeneity: 0.1, salience: 0.3 },
};

/**
 * Extended trajectory coordinates with training-specific metadata
 */
export interface TrainingCoordinates extends TrajectoryCoordinates {
  /** Entity type this coordinate set belongs to */
  entityType: TrainingEntityType;
  /** Entity ID in the database */
  entityId: string;
  /** Composite pedagogical score (weighted combination) */
  pedagogicalScore?: number;
  /** Difficulty level estimate (0-1, where 1 is most difficult) */
  difficultyLevel?: number;
  /** Frequency in corpus (for vocabulary items) */
  corpusFrequency?: number;
}

/**
 * Recursion trigger configuration for anticipation-driven depth control
 */
export interface RecursionTrigger {
  /** Minimum uncertainty to trigger recursion */
  uncertainty: number;
  /** Minimum commitment to finalize without recursion */
  commitment: number;
}

/**
 * Default recursion triggers by pass
 */
export const DEFAULT_RECURSION_TRIGGERS: Record<TrainingPass, RecursionTrigger> = {
  1: { uncertainty: 0.6, commitment: 0.8 },  // More exploration for catalog navigation
  2: { uncertainty: 0.5, commitment: 0.9 },  // Conservative for deduplication
  3: { uncertainty: 0.4, commitment: 0.85 }, // Moderate for world generation
  4: { uncertainty: 0.3, commitment: 0.95 }, // Very conservative for curriculum
};

// ============================================================================
// World Generation Types
// ============================================================================

/**
 * A single world variant generation
 */
export interface WorldGeneration {
  /** World type (everyday, formal, etc.) */
  worldType: WorldType;
  /** Generated N'Ko sentence */
  nkoSentence: string;
  /** English translation */
  englishTranslation: string;
  /** Cultural/contextual notes */
  culturalNotes?: string;
  /** Model's confidence in this generation (0-1) */
  confidence: number;
  /** Recursion depth required to generate this */
  recursionDepth: number;
}

/**
 * Coordinated world with 5D trajectory data
 */
export interface CoordinatedWorld extends WorldGeneration {
  /** 5D trajectory coordinates */
  coordinates: TrainingCoordinates;
  /** Quality score from validation (0-1) */
  qualityScore?: number;
  /** Validation status */
  validationStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
}

/**
 * Result from world synthesis for a phrase
 */
export interface WorldSynthesisResult {
  /** Source phrase ID */
  phraseId: string;
  /** Generated worlds with coordinates */
  worlds: CoordinatedWorld[];
  /** Maximum recursion depth reached */
  recursionDepth: number;
  /** Total tokens consumed */
  totalTokens: number;
  /** Execution time in milliseconds */
  executionTimeMs: number;
  /** Strategies used during generation */
  strategiesUsed: RecursionStrategy[];
}

// ============================================================================
// Self-Improvement / Feedback Types
// ============================================================================

/**
 * Types of feedback that can improve the RLM
 */
export type FeedbackType =
  | 'human_validation'   // Native speaker review
  | 'learner_outcome'    // App usage analytics
  | 'quality_metric'     // Automated quality checks
  | 'rlm_self_critique'; // Recursive self-analysis

/**
 * A feedback signal for self-improvement
 */
export interface FeedbackSignal {
  /** Unique feedback ID */
  id: string;
  /** Associated recursion ID (for tracing) */
  recursionId: string;
  /** Type of feedback */
  feedbackType: FeedbackType;
  /** The decision that was made */
  originalDecision: string;
  /** What actually happened / correct answer */
  actualOutcome: string;
  /** Improvement signal: -1 (wrong) to +1 (right) */
  improvementSignal: number;
  /** Whether this feedback has been incorporated */
  incorporated: boolean;
  /** Timestamp */
  createdAt: Date;
}

/**
 * Aggregated feedback statistics for calibration
 */
export interface FeedbackStats {
  /** Total feedback signals received */
  totalSignals: number;
  /** Average improvement signal */
  avgImprovement: number;
  /** Signals by recursion depth */
  byDepth: Record<number, { count: number; avgImprovement: number }>;
  /** Signals by strategy */
  byStrategy: Record<RecursionStrategy, { count: number; avgImprovement: number }>;
  /** Signals by world type (for Pass 3) */
  byWorldType?: Record<WorldType, { count: number; avgImprovement: number }>;
}

/**
 * Calibration adjustments based on feedback
 */
export interface CalibrationAdjustment {
  /** Commitment threshold adjustment (-0.1 to +0.1) */
  commitmentDelta: number;
  /** Uncertainty threshold adjustment (-0.1 to +0.1) */
  uncertaintyDelta: number;
  /** Depth preference adjustment (negative = shallower, positive = deeper) */
  depthPreferenceDelta: number;
  /** Per-strategy weight adjustments */
  strategyWeights: Record<RecursionStrategy, number>;
}

// ============================================================================
// Database Record Types (matching Supabase schema)
// ============================================================================

/**
 * Database record for nko_rlm_recursions table
 */
export interface RLMRecursionRecord {
  id: string;
  pass_number: TrainingPass;
  parent_recursion_id: string | null;
  depth: number;
  branch: number;
  strategy: RecursionStrategy;
  input_context_size: number | null;
  output_quality_score: number | null;
  commitment_level: number | null;
  uncertainty_level: number | null;
  action_taken: AnticipationState['suggestedAction'];
  tokens_consumed: number | null;
  execution_time_ms: number | null;
  created_at: string;
}

/**
 * Database record for nko_trajectory_coordinates table
 */
export interface TrajectoryCoordinateRecord {
  id: string;
  entity_type: TrainingEntityType;
  entity_id: string;
  temporal: number;
  semantic: number;
  depth: number;
  homogeneity: number;
  salience: number;
  computed_at: string;
}

/**
 * Database record for nko_rlm_feedback table
 */
export interface RLMFeedbackRecord {
  id: string;
  recursion_id: string;
  feedback_type: FeedbackType;
  original_decision: string;
  actual_outcome: string;
  improvement_signal: number;
  incorporated: boolean;
  created_at: string;
}

/**
 * Database record for nko_curriculum_paths table
 */
export interface CurriculumPathRecord {
  id: string;
  path_name: string;
  sequence_json: string[];  // Ordered lesson IDs
  difficulty_curve: { lessonId: string; difficulty: number }[] | null;
  prerequisite_graph: Record<string, string[]> | null;  // DAG: lessonId -> prerequisite IDs
  rlm_optimized: boolean;
  optimization_recursion_id: string | null;
  created_at: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Context item for RLM processing
 */
export interface RLMContextItem {
  id: string;
  content: string;
  type: 'file' | 'memory' | 'web' | 'custom' | 'training_data';
  source?: string;
  coordinates?: TrainingCoordinates;
  metadata?: Record<string, unknown>;
}

/**
 * Structured context for RLM
 */
export interface RLMContext {
  /** Raw content (for flat context) */
  raw?: string;
  /** Structured items (for coordinate-aware context) */
  items?: RLMContextItem[];
  /** Total token count estimate */
  tokenCount?: number;
}

/**
 * RLM completion result
 */
export interface RLMCompletion {
  success: boolean;
  output: string;
  metrics: RecursionMetrics;
  error?: string;
}
