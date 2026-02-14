/**
 * Validation Pipeline for N'Ko World Generation
 *
 * Implements quality assurance workflow:
 * 1. Automated quality metrics (script validation, grammar check, etc.)
 * 2. Human validator interface for native speaker review
 * 3. Feedback collection and routing to calibration
 * 4. Batch validation support for training pipelines
 */

import type {
  WorldType,
  CoordinatedWorld,
  WorldSynthesisResult,
  FeedbackType,
  TrainingCoordinates,
} from './types';
import { FeedbackLoop, FeedbackRecorder } from './feedback-loop';
import { VALIDATION_PROMPT, SELF_CRITIQUE_PROMPT } from './prompts';

// ============================================================================
// Types
// ============================================================================

/**
 * Quality dimension scores (0-100)
 */
export interface QualityScores {
  /** N'Ko script correctness (proper characters, diacritics) */
  scriptCorrectness: number;
  /** Grammar accuracy for Manding languages */
  grammarAccuracy: number;
  /** Semantic accuracy (translation matches) */
  semanticAccuracy: number;
  /** Cultural appropriateness */
  culturalAppropriateness: number;
  /** Pedagogical value for learners */
  pedagogicalValue: number;
  /** Overall computed quality score */
  overallQuality: number;
}

/**
 * Validation result for a single world
 */
export interface ValidationResult {
  worldId: string;
  worldType: WorldType;
  scores: QualityScores;
  issues: string[];
  suggestions: string[];
  status: 'approved' | 'rejected' | 'needs_revision';
  validatedAt: Date;
  validatorId?: string;
  validatorType: 'automated' | 'human' | 'hybrid';
}

/**
 * Human validation task
 */
export interface HumanValidationTask {
  id: string;
  worldId: string;
  nkoSentence: string;
  englishTranslation: string;
  worldType: WorldType;
  sourceWord: string;
  sourceWordMeaning: string;
  automatedScores?: QualityScores;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  createdAt: Date;
  dueAt?: Date;
}

/**
 * Human validation response
 */
export interface HumanValidationResponse {
  taskId: string;
  validatorId: string;
  isApproved: boolean;
  correctedNkoSentence?: string;
  correctedEnglishTranslation?: string;
  notes?: string;
  scoreOverrides?: Partial<QualityScores>;
  timeSpentMs: number;
}

/**
 * Database query builder interface (chainable)
 */
interface QueryBuilder {
  eq(column: string, value: unknown): QueryBuilder & Promise<{ data: unknown[]; error: Error | null }>;
  single(): Promise<{ data: unknown; error: Error | null }>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder;
  limit(n: number): Promise<{ data: unknown[]; error: Error | null }>;
}

/**
 * Database client interface
 */
export interface ValidationDatabaseClient {
  from(table: string): {
    insert(data: unknown): Promise<{ data: unknown; error: Error | null }>;
    select(columns?: string): QueryBuilder;
    update(data: unknown): {
      eq(column: string, value: unknown): Promise<{ data: unknown; error: Error | null }>;
    };
  };
  rpc(
    fn: string,
    params: Record<string, unknown>
  ): Promise<{ data: unknown; error: Error | null }>;
}

/**
 * LLM client for automated validation
 */
export interface ValidationLLMClient {
  generateCompletion(params: {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
  }): Promise<{
    content: string;
    tokensUsed: { input: number; output: number };
  }>;
}

/**
 * Validation pipeline configuration
 */
export interface ValidationPipelineConfig {
  db: ValidationDatabaseClient;
  llm?: ValidationLLMClient;
  feedbackLoop: FeedbackLoop;
  /** Threshold for auto-approval (0-100) */
  autoApprovalThreshold?: number;
  /** Threshold for auto-rejection (0-100) */
  autoRejectionThreshold?: number;
  /** Enable LLM-based validation */
  enableLLMValidation?: boolean;
  /** Enable verbose logging */
  verbose?: boolean;
}

// ============================================================================
// N'Ko Script Validation
// ============================================================================

/**
 * N'Ko Unicode range: U+07C0 to U+07FF
 */
const NKO_UNICODE_RANGE = {
  start: 0x07c0,
  end: 0x07ff,
};

/**
 * Common N'Ko characters for quick validation
 */
const COMMON_NKO_CHARS = new Set([
  'ߊ', 'ߋ', 'ߌ', 'ߍ', 'ߎ', 'ߏ', 'ߐ', 'ߑ', 'ߒ', 'ߓ',
  'ߔ', 'ߕ', 'ߖ', 'ߗ', 'ߘ', 'ߙ', 'ߚ', 'ߛ', 'ߜ', 'ߝ',
  'ߞ', 'ߟ', 'ߠ', 'ߡ', 'ߢ', 'ߣ', 'ߤ', 'ߥ', 'ߦ', 'ߧ',
  '߫', '߬', '߭', '߮', '߯', '߰', '߱', '߲', '߳',  // Diacritics
  '߀', '߁', '߂', '߃', '߄', '߅', '߆', '߇', '߈', '߉',  // Numbers
]);

/**
 * Check if a character is in N'Ko Unicode range
 */
function isNkoChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= NKO_UNICODE_RANGE.start && code <= NKO_UNICODE_RANGE.end;
}

/**
 * Count N'Ko characters in a string
 */
function countNkoChars(text: string): number {
  let count = 0;
  for (const char of text) {
    if (isNkoChar(char)) count++;
  }
  return count;
}

/**
 * Calculate N'Ko script correctness score
 */
function calculateScriptScore(nkoText: string): {
  score: number;
  issues: string[];
} {
  const issues: string[] = [];

  // Remove whitespace for character analysis
  const textWithoutSpaces = nkoText.replace(/\s/g, '');

  if (textWithoutSpaces.length === 0) {
    return { score: 0, issues: ['Empty N\'Ko text'] };
  }

  // Count N'Ko vs non-N'Ko characters
  const nkoCount = countNkoChars(textWithoutSpaces);
  const totalCount = textWithoutSpaces.length;
  const nkoRatio = nkoCount / totalCount;

  // Check for common issues
  if (nkoRatio < 0.5) {
    issues.push(`Low N'Ko character ratio: ${(nkoRatio * 100).toFixed(1)}%`);
  }

  // Check for mixing with Latin script
  const latinPattern = /[a-zA-Z]/g;
  const latinMatches = textWithoutSpaces.match(latinPattern);
  if (latinMatches && latinMatches.length > 0) {
    issues.push(`Contains ${latinMatches.length} Latin characters`);
  }

  // Check for Arabic instead of N'Ko (common confusion)
  const arabicPattern = /[\u0600-\u06FF]/g;
  const arabicMatches = textWithoutSpaces.match(arabicPattern);
  if (arabicMatches && arabicMatches.length > 0) {
    issues.push(`Contains ${arabicMatches.length} Arabic characters (should be N'Ko)`);
  }

  // Calculate score
  let score = nkoRatio * 100;

  // Penalize for foreign characters
  if (latinMatches) score -= latinMatches.length * 5;
  if (arabicMatches) score -= arabicMatches.length * 10;

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
  };
}

// ============================================================================
// Quality Metrics Calculator
// ============================================================================

export class QualityMetricsCalculator {
  /**
   * Calculate all quality scores for a generated world
   */
  calculateScores(world: {
    nkoSentence: string;
    englishTranslation: string;
    worldType: WorldType;
    confidence: number;
    coordinates?: TrainingCoordinates;
  }): QualityScores {
    // Script correctness
    const scriptResult = calculateScriptScore(world.nkoSentence);

    // Grammar accuracy (estimated from structure)
    const grammarScore = this.estimateGrammarScore(world.nkoSentence);

    // Semantic accuracy (estimated from length ratio)
    const semanticScore = this.estimateSemanticScore(
      world.nkoSentence,
      world.englishTranslation
    );

    // Cultural appropriateness (based on world type match)
    const culturalScore = this.estimateCulturalScore(
      world.nkoSentence,
      world.worldType
    );

    // Pedagogical value (from coordinates if available)
    const pedagogicalScore = world.coordinates
      ? (world.coordinates.pedagogicalScore ?? 0.5) * 100
      : world.confidence * 100;

    // Overall quality (weighted combination)
    const overallQuality = this.computeOverallScore({
      scriptCorrectness: scriptResult.score,
      grammarAccuracy: grammarScore,
      semanticAccuracy: semanticScore,
      culturalAppropriateness: culturalScore,
      pedagogicalValue: pedagogicalScore,
    });

    return {
      scriptCorrectness: scriptResult.score,
      grammarAccuracy: grammarScore,
      semanticAccuracy: semanticScore,
      culturalAppropriateness: culturalScore,
      pedagogicalValue: pedagogicalScore,
      overallQuality,
    };
  }

  /**
   * Estimate grammar score based on text structure
   */
  private estimateGrammarScore(nkoText: string): number {
    let score = 70; // Base score

    // Check for minimum length
    const words = nkoText.split(/\s+/).filter((w) => w.length > 0);
    if (words.length < 2) {
      score -= 20; // Too short for meaningful sentence
    } else if (words.length >= 3 && words.length <= 15) {
      score += 10; // Good sentence length
    } else if (words.length > 20) {
      score -= 10; // Possibly too complex
    }

    // Check for common structural markers
    // N'Ko typically has postpositions and verb-final structure
    const hasPostposition = /[ߠߊ߫|ߟߊ߫|ߘߐ߫|ߞߊ߲߬|ߡߊ߬|ߦߋ߫]/.test(nkoText);
    if (hasPostposition) {
      score += 10;
    }

    // Check for diacritics (important for tone)
    const diacriticPattern = /[߲߫߬߭߮߯߰߱߳]/g;
    const diacritics = nkoText.match(diacriticPattern);
    if (diacritics && diacritics.length > 0) {
      score += 5; // Has tone markers
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate semantic accuracy from length ratio
   */
  private estimateSemanticScore(nkoText: string, englishText: string): number {
    // N'Ko and English have different average word lengths
    // A rough heuristic is that translations should have similar information density

    const nkoWords = nkoText.split(/\s+/).filter((w) => w.length > 0);
    const englishWords = englishText.split(/\s+/).filter((w) => w.length > 0);

    if (nkoWords.length === 0 || englishWords.length === 0) {
      return 0;
    }

    // Typical ratio: N'Ko tends to be slightly more compact
    const ratio = nkoWords.length / englishWords.length;

    // Expected ratio range: 0.6 to 1.4
    let score = 80;

    if (ratio < 0.3 || ratio > 2.0) {
      score = 40; // Very different lengths - likely translation issue
    } else if (ratio < 0.5 || ratio > 1.8) {
      score = 60;
    } else if (ratio >= 0.7 && ratio <= 1.3) {
      score = 90; // Good length match
    }

    return score;
  }

  /**
   * Estimate cultural appropriateness based on world type
   */
  private estimateCulturalScore(nkoText: string, worldType: WorldType): number {
    let score = 75; // Base score

    // World-specific patterns
    switch (worldType) {
      case 'everyday':
        // Should be relatively simple and direct
        if (nkoText.split(/\s+/).length <= 10) score += 10;
        break;

      case 'formal':
        // Should be longer and more structured
        if (nkoText.split(/\s+/).length >= 5) score += 10;
        break;

      case 'storytelling':
        // Should have narrative elements
        if (nkoText.length > 30) score += 10;
        break;

      case 'proverbs':
        // Should be concise and memorable
        if (nkoText.split(/\s+/).length <= 12) score += 15;
        break;

      case 'educational':
        // Should be clear and not too complex
        if (nkoText.split(/\s+/).length >= 3 && nkoText.split(/\s+/).length <= 12) {
          score += 10;
        }
        break;
    }

    return Math.min(100, score);
  }

  /**
   * Compute overall quality score
   */
  private computeOverallScore(scores: Omit<QualityScores, 'overallQuality'>): number {
    // Weighted combination
    const weights = {
      scriptCorrectness: 0.25,
      grammarAccuracy: 0.2,
      semanticAccuracy: 0.25,
      culturalAppropriateness: 0.15,
      pedagogicalValue: 0.15,
    };

    let totalWeight = 0;
    let weightedSum = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const score = scores[key as keyof typeof scores];
      weightedSum += score * weight;
      totalWeight += weight;
    }

    return weightedSum / totalWeight;
  }
}

// ============================================================================
// Validation Pipeline
// ============================================================================

export class ValidationPipeline {
  private db: ValidationDatabaseClient;
  private llm?: ValidationLLMClient;
  private feedbackLoop: FeedbackLoop;
  private feedbackRecorder: FeedbackRecorder;
  private metricsCalculator: QualityMetricsCalculator;

  private autoApprovalThreshold: number;
  private autoRejectionThreshold: number;
  private enableLLMValidation: boolean;
  private verbose: boolean;

  constructor(config: ValidationPipelineConfig) {
    this.db = config.db;
    this.llm = config.llm;
    this.feedbackLoop = config.feedbackLoop;
    this.feedbackRecorder = new FeedbackRecorder(config.feedbackLoop);
    this.metricsCalculator = new QualityMetricsCalculator();

    this.autoApprovalThreshold = config.autoApprovalThreshold ?? 85;
    this.autoRejectionThreshold = config.autoRejectionThreshold ?? 40;
    this.enableLLMValidation = config.enableLLMValidation ?? false;
    this.verbose = config.verbose ?? false;
  }

  // ============================================================================
  // Automated Validation
  // ============================================================================

  /**
   * Run automated validation on a single world
   */
  async validateWorld(
    world: CoordinatedWorld,
    sourceWord: string,
    recursionId?: string
  ): Promise<ValidationResult> {
    // Calculate quality scores
    const scores = this.metricsCalculator.calculateScores({
      nkoSentence: world.nkoSentence,
      englishTranslation: world.englishTranslation,
      worldType: world.worldType,
      confidence: world.confidence,
      coordinates: world.coordinates,
    });

    // Get script-specific issues
    const scriptResult = calculateScriptScore(world.nkoSentence);
    const issues: string[] = [...scriptResult.issues];
    const suggestions: string[] = [];

    // Add score-based issues
    if (scores.grammarAccuracy < 60) {
      issues.push('Low grammar accuracy score');
      suggestions.push('Consider revising sentence structure');
    }

    if (scores.semanticAccuracy < 60) {
      issues.push('Translation length mismatch');
      suggestions.push('Review translation for completeness');
    }

    // Run LLM validation if enabled
    if (this.enableLLMValidation && this.llm) {
      const llmResult = await this.runLLMValidation(world, sourceWord);
      if (llmResult) {
        // Merge LLM results
        for (const key of Object.keys(llmResult.scores) as (keyof QualityScores)[]) {
          // Average with automated scores
          scores[key] = (scores[key] + llmResult.scores[key]) / 2;
        }
        issues.push(...llmResult.issues);
        suggestions.push(...llmResult.suggestions);
      }
    }

    // Determine status
    let status: ValidationResult['status'];
    if (scores.overallQuality >= this.autoApprovalThreshold) {
      status = 'approved';
    } else if (scores.overallQuality <= this.autoRejectionThreshold) {
      status = 'rejected';
    } else {
      status = 'needs_revision';
    }

    // Record feedback if recursion ID provided
    if (recursionId) {
      const signal = (scores.overallQuality - 50) / 50; // Map 0-100 to -1 to 1
      this.feedbackRecorder.queue(
        recursionId,
        'quality_metric',
        `Generated ${world.worldType} world`,
        `Quality score: ${scores.overallQuality.toFixed(1)}`,
        signal
      );
    }

    return {
      worldId: world.coordinates?.entityId ?? 'unknown',
      worldType: world.worldType,
      scores,
      issues,
      suggestions,
      status,
      validatedAt: new Date(),
      validatorType: this.enableLLMValidation ? 'hybrid' : 'automated',
    };
  }

  /**
   * Run LLM-based validation
   */
  private async runLLMValidation(
    world: CoordinatedWorld,
    sourceWord: string
  ): Promise<{
    scores: QualityScores;
    issues: string[];
    suggestions: string[];
  } | null> {
    if (!this.llm) return null;

    const prompt = VALIDATION_PROMPT.userPromptTemplate
      .replace('{{nkoSentence}}', world.nkoSentence)
      .replace('{{englishTranslation}}', world.englishTranslation)
      .replace('{{worldType}}', world.worldType)
      .replace('{{nkoWord}}', sourceWord)
      .replace('{{englishMeaning}}', '(source word)');

    try {
      const response = await this.llm.generateCompletion({
        model: 'claude-sonnet-4-20250514',
        systemPrompt: VALIDATION_PROMPT.systemPrompt,
        userPrompt: prompt,
        temperature: 0.3,
        maxTokens: 800,
      });

      const parsed = JSON.parse(response.content);

      return {
        scores: {
          scriptCorrectness: parsed.scriptCorrectness ?? 50,
          grammarAccuracy: parsed.grammarAccuracy ?? 50,
          semanticAccuracy: parsed.semanticAccuracy ?? 50,
          culturalAppropriateness: parsed.culturalAppropriateness ?? 50,
          pedagogicalValue: parsed.pedagogicalValue ?? 50,
          overallQuality: parsed.overallQuality ?? 50,
        },
        issues: parsed.issues ?? [],
        suggestions: parsed.suggestions ?? [],
      };
    } catch (error) {
      if (this.verbose) {
        console.error('[ValidationPipeline] LLM validation failed:', error);
      }
      return null;
    }
  }

  /**
   * Validate all worlds from a synthesis result
   */
  async validateSynthesisResult(
    result: WorldSynthesisResult,
    sourceWord: string
  ): Promise<ValidationResult[]> {
    const validationResults: ValidationResult[] = [];

    for (const world of result.worlds) {
      const validation = await this.validateWorld(world, sourceWord);
      validationResults.push(validation);
    }

    // Flush feedback
    await this.feedbackRecorder.flush();

    return validationResults;
  }

  // ============================================================================
  // Human Validation
  // ============================================================================

  /**
   * Create a human validation task
   */
  async createHumanValidationTask(
    world: CoordinatedWorld,
    sourceWord: string,
    sourceWordMeaning: string,
    priority: HumanValidationTask['priority'] = 'medium'
  ): Promise<HumanValidationTask> {
    const automatedScores = this.metricsCalculator.calculateScores({
      nkoSentence: world.nkoSentence,
      englishTranslation: world.englishTranslation,
      worldType: world.worldType,
      confidence: world.confidence,
      coordinates: world.coordinates,
    });

    const task: HumanValidationTask = {
      id: crypto.randomUUID(),
      worldId: world.coordinates?.entityId ?? crypto.randomUUID(),
      nkoSentence: world.nkoSentence,
      englishTranslation: world.englishTranslation,
      worldType: world.worldType,
      sourceWord,
      sourceWordMeaning,
      automatedScores,
      priority,
      status: 'pending',
      createdAt: new Date(),
    };

    // Store in database
    await this.db.from('nko_validation_tasks').insert({
      id: task.id,
      world_id: task.worldId,
      nko_sentence: task.nkoSentence,
      english_translation: task.englishTranslation,
      world_type: task.worldType,
      source_word: task.sourceWord,
      source_word_meaning: task.sourceWordMeaning,
      automated_scores: task.automatedScores,
      priority: task.priority,
      status: task.status,
      created_at: task.createdAt.toISOString(),
    });

    return task;
  }

  /**
   * Get pending human validation tasks
   */
  async getPendingTasks(limit: number = 20): Promise<HumanValidationTask[]> {
    const { data, error } = await this.db
      .from('nko_validation_tasks')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get pending tasks: ${error.message}`);
    }

    return (data ?? []).map((row: any) => ({
      id: row.id,
      worldId: row.world_id,
      nkoSentence: row.nko_sentence,
      englishTranslation: row.english_translation,
      worldType: row.world_type,
      sourceWord: row.source_word,
      sourceWordMeaning: row.source_word_meaning,
      automatedScores: row.automated_scores,
      priority: row.priority,
      status: row.status,
      assignedTo: row.assigned_to,
      createdAt: new Date(row.created_at),
      dueAt: row.due_at ? new Date(row.due_at) : undefined,
    }));
  }

  /**
   * Submit human validation response
   */
  async submitHumanValidation(
    response: HumanValidationResponse,
    recursionId?: string
  ): Promise<ValidationResult> {
    // Get the task
    const { data: taskData, error: taskError } = await this.db
      .from('nko_validation_tasks')
      .select('*')
      .eq('id', response.taskId)
      .single();

    if (taskError || !taskData) {
      throw new Error(`Task not found: ${response.taskId}`);
    }

    const task = taskData as any;

    // Calculate final scores
    const baseScores = task.automated_scores as QualityScores;
    const finalScores: QualityScores = {
      ...baseScores,
      ...response.scoreOverrides,
    };

    // Adjust overall based on human decision
    if (response.isApproved) {
      finalScores.overallQuality = Math.max(finalScores.overallQuality, 80);
    } else {
      finalScores.overallQuality = Math.min(finalScores.overallQuality, 50);
    }

    // Create validation result
    const result: ValidationResult = {
      worldId: task.world_id,
      worldType: task.world_type,
      scores: finalScores,
      issues: response.notes ? [response.notes] : [],
      suggestions: response.correctedNkoSentence
        ? [`Corrected: ${response.correctedNkoSentence}`]
        : [],
      status: response.isApproved ? 'approved' : 'rejected',
      validatedAt: new Date(),
      validatorId: response.validatorId,
      validatorType: 'human',
    };

    // Update task status
    await this.db
      .from('nko_validation_tasks')
      .update({
        status: 'completed',
        validator_id: response.validatorId,
        validation_result: result,
        completed_at: new Date().toISOString(),
      })
      .eq('id', response.taskId);

    // Update world status in database
    await this.db
      .from('nko_worlds')
      .update({
        validation_status: result.status,
        quality_score: finalScores.overallQuality / 100,
        validated_at: new Date().toISOString(),
        validator_id: response.validatorId,
      })
      .eq('id', task.world_id);

    // Apply corrections if provided
    if (response.correctedNkoSentence || response.correctedEnglishTranslation) {
      await this.db
        .from('nko_worlds')
        .update({
          nko_sentence: response.correctedNkoSentence ?? task.nko_sentence,
          english_translation:
            response.correctedEnglishTranslation ?? task.english_translation,
          was_corrected: true,
        })
        .eq('id', task.world_id);
    }

    // Record feedback for calibration
    if (recursionId) {
      await this.feedbackLoop.recordHumanValidation(
        recursionId,
        `Generated ${task.world_type} world: "${task.nko_sentence}"`,
        response.isApproved,
        response.notes
      );
    }

    return result;
  }

  // ============================================================================
  // Batch Validation
  // ============================================================================

  /**
   * Run batch validation on multiple synthesis results
   */
  async validateBatch(
    results: Array<{
      synthesis: WorldSynthesisResult;
      sourceWord: string;
    }>,
    options?: {
      createHumanTasks?: boolean;
      humanTaskPriority?: HumanValidationTask['priority'];
    }
  ): Promise<{
    validated: number;
    approved: number;
    rejected: number;
    needsRevision: number;
    humanTasksCreated: number;
  }> {
    const stats = {
      validated: 0,
      approved: 0,
      rejected: 0,
      needsRevision: 0,
      humanTasksCreated: 0,
    };

    for (const { synthesis, sourceWord } of results) {
      const validations = await this.validateSynthesisResult(
        synthesis,
        sourceWord
      );

      for (const validation of validations) {
        stats.validated++;

        switch (validation.status) {
          case 'approved':
            stats.approved++;
            break;
          case 'rejected':
            stats.rejected++;
            break;
          case 'needs_revision':
            stats.needsRevision++;

            // Create human task if requested
            if (options?.createHumanTasks) {
              const world = synthesis.worlds.find(
                (w) => w.worldType === validation.worldType
              );
              if (world) {
                await this.createHumanValidationTask(
                  world,
                  sourceWord,
                  '(see source)',
                  options.humanTaskPriority ?? 'medium'
                );
                stats.humanTasksCreated++;
              }
            }
            break;
        }
      }
    }

    return stats;
  }

  // ============================================================================
  // Calibration Integration
  // ============================================================================

  /**
   * Run calibration cycle after batch validation
   */
  async runCalibration(): Promise<{
    adjustment: import('./types').CalibrationAdjustment;
    report: Awaited<ReturnType<FeedbackLoop['generateCalibrationReport']>>;
  }> {
    // Flush any pending feedback
    await this.feedbackRecorder.flush();

    // Run calibration cycle
    const adjustment = await this.feedbackLoop.runCalibrationCycle();

    // Generate report
    const report = await this.feedbackLoop.generateCalibrationReport();

    if (this.verbose) {
      console.log('[ValidationPipeline] Calibration complete');
      console.log('  Adjustment:', adjustment);
      console.log('  Recommendations:', report.recommendations);
    }

    return { adjustment, report };
  }

  // ============================================================================
  // Self-Critique
  // ============================================================================

  /**
   * Run RLM self-critique on a world
   */
  async runSelfCritique(
    world: CoordinatedWorld,
    sourceWord: string,
    recursionId: string
  ): Promise<{
    isAcceptable: boolean;
    confidence: number;
    shouldRegenerate: boolean;
    feedback: string;
  }> {
    if (!this.llm) {
      return {
        isAcceptable: world.confidence >= 0.7,
        confidence: world.confidence,
        shouldRegenerate: world.confidence < 0.5,
        feedback: 'LLM validation not enabled',
      };
    }

    const prompt = SELF_CRITIQUE_PROMPT.userPromptTemplate
      .replace(/\{\{nkoSentence\}\}/g, world.nkoSentence)
      .replace(/\{\{englishTranslation\}\}/g, world.englishTranslation)
      .replace(/\{\{nkoWord\}\}/g, sourceWord)
      .replace(/\{\{worldType\}\}/g, world.worldType);

    try {
      const response = await this.llm.generateCompletion({
        model: 'claude-sonnet-4-20250514',
        systemPrompt: SELF_CRITIQUE_PROMPT.systemPrompt,
        userPrompt: prompt,
        temperature: 0.2,
        maxTokens: 600,
      });

      const parsed = JSON.parse(response.content);

      // Record self-critique feedback
      await this.feedbackLoop.recordSelfCritique(
        recursionId,
        `Generated ${world.worldType} world`,
        JSON.stringify({
          strengths: parsed.strengths,
          weaknesses: parsed.weaknesses,
        }),
        parsed.confidence ?? 0.5
      );

      return {
        isAcceptable: parsed.isAcceptable ?? false,
        confidence: parsed.confidence ?? 0.5,
        shouldRegenerate: parsed.shouldRegenerate ?? false,
        feedback: (parsed.improvementSuggestions ?? []).join('; '),
      };
    } catch (error) {
      if (this.verbose) {
        console.error('[ValidationPipeline] Self-critique failed:', error);
      }
      return {
        isAcceptable: world.confidence >= 0.7,
        confidence: world.confidence,
        shouldRegenerate: false,
        feedback: 'Self-critique failed',
      };
    }
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a validation pipeline
 */
export function createValidationPipeline(
  config: ValidationPipelineConfig
): ValidationPipeline {
  return new ValidationPipeline(config);
}

// ============================================================================
// Named Utility Exports
// ============================================================================

export { calculateScriptScore, countNkoChars, isNkoChar };
