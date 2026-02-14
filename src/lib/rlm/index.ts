/**
 * LearnN'Ko RLM Integration
 *
 * Recursive Language Model integration for the N'Ko training pipeline.
 *
 * Features:
 * - 5D trajectory coordinate calculation for training data
 * - Self-improvement feedback loop with calibration
 * - Pass-specific coordinate calculators
 * - Database integration for recursion tracking
 * - World synthesizer for generating contextual N'Ko examples
 * - N'Ko-specific prompts optimized for language learning
 * - Validation pipeline for quality assurance (automated + human)
 *
 * Usage:
 * ```typescript
 * import {
 *   createCoordinateCalculator,
 *   createFeedbackLoop,
 *   createWorldSynthesizer,
 *   createValidationPipeline,
 *   WorldCoordinateCalculator,
 * } from '@/lib/rlm';
 *
 * // Calculate coordinates for Pass 3 (World Generation)
 * const calculator = createCoordinateCalculator(3);
 * const coords = calculator.calculateCoordinates({
 *   entityType: 'world',
 *   entityId: 'uuid',
 *   timestamp: new Date(),
 *   text: 'ߞߊ߬ ߒ ߘߐ߫',
 *   // ... other params
 * });
 *
 * // Generate contextual worlds for a phrase
 * const synthesizer = createWorldSynthesizer(db, apiKey);
 * const result = await synthesizer.synthesizeWorlds({
 *   id: 'phrase-uuid',
 *   nkoWord: 'ߖߍ߬ߟߍ',
 *   englishMeaning: 'money',
 * });
 * // result.worlds contains 5 contextual variants
 *
 * // Validate generated worlds
 * const feedback = createFeedbackLoop(supabaseUrl, supabaseKey);
 * const validation = createValidationPipeline({
 *   db,
 *   feedbackLoop: feedback,
 *   autoApprovalThreshold: 85,
 * });
 * const results = await validation.validateSynthesisResult(result, 'ߖߍ߬ߟߍ');
 * // results contain quality scores and approval status
 *
 * // Run calibration cycle after batch validation
 * const { adjustment, report } = await validation.runCalibration();
 * ```
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core RLM types
  RLMEnvironment,
  RLMBackend,
  RLMConfig,
  TrajectoryCoordinates,
  RecursionMetrics,
  RecursionStrategy,
  AnticipationState,

  // LearnN'Ko-specific types
  TrainingPass,
  WorldType,
  TrainingEntityType,
  LearnNKoRLMConfig,
  CoordinateWeights,
  TrainingCoordinates,
  RecursionTrigger,

  // World generation types
  WorldGeneration,
  CoordinatedWorld,
  WorldSynthesisResult,

  // Feedback types
  FeedbackType,
  FeedbackSignal,
  FeedbackStats,
  CalibrationAdjustment,

  // Database record types
  RLMRecursionRecord,
  TrajectoryCoordinateRecord,
  RLMFeedbackRecord,
  CurriculumPathRecord,

  // Context types
  RLMContextItem,
  RLMContext,
  RLMCompletion,
} from './types';

// ============================================================================
// Constant Exports
// ============================================================================

export {
  DEFAULT_COORDINATE_WEIGHTS,
  DEFAULT_RECURSION_TRIGGERS,
} from './types';

// ============================================================================
// Coordinate Calculator Exports
// ============================================================================

export {
  CoordinateCalculator,
  CatalogCoordinateCalculator,
  QualityCoordinateCalculator,
  WorldCoordinateCalculator,
  CurriculumCoordinateCalculator,
  createCoordinateCalculator,
} from './coordinate-calculator';

// ============================================================================
// Feedback Loop Exports
// ============================================================================

export {
  FeedbackLoop,
  FeedbackRecorder,
  createFeedbackLoop,
} from './feedback-loop';

// ============================================================================
// World Synthesizer Exports
// ============================================================================

export type {
  PhraseInput,
  WorldPromptConfig,
  DatabaseClient,
  LLMClient,
  WorldSynthesizerConfig,
} from './world-synthesizer';

export {
  WorldSynthesizer,
  createWorldSynthesizer,
  DEFAULT_WORLD_PROMPTS,
} from './world-synthesizer';

// ============================================================================
// Prompts Exports
// ============================================================================

export type {
  WorldPrompt,
  PromptExample,
} from './prompts';

export {
  NKO_WORLD_PROMPTS,
  getWorldPrompt,
  getAllWorldPrompts,
  customizePrompt,
  buildUserPrompt,
  VALIDATION_PROMPT,
  SELF_CRITIQUE_PROMPT,
} from './prompts';

// ============================================================================
// Validation Pipeline Exports
// ============================================================================

export type {
  QualityScores,
  ValidationResult,
  HumanValidationTask,
  HumanValidationResponse,
  ValidationDatabaseClient,
  ValidationLLMClient,
  ValidationPipelineConfig,
} from './validation-pipeline';

export {
  QualityMetricsCalculator,
  ValidationPipeline,
  createValidationPipeline,
  calculateScriptScore,
  countNkoChars,
  isNkoChar,
} from './validation-pipeline';
