/**
 * RLM Feedback Loop System
 *
 * Implements self-improvement through:
 * 1. Recording feedback signals (human validation, learner outcomes, metrics)
 * 2. Aggregating feedback statistics by strategy and pass
 * 3. Calibrating anticipation thresholds based on feedback
 * 4. Learning optimal recursion depth and strategy preferences
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  FeedbackSignal,
  FeedbackType,
  FeedbackStats,
  CalibrationAdjustment,
  RecursionStrategy,
  RecursionTrigger,
  TrainingPass,
  RLMRecursionRecord,
  RLMFeedbackRecord,
  DEFAULT_RECURSION_TRIGGERS,
} from './types';

// ============================================================================
// Feedback Loop Class
// ============================================================================

export class FeedbackLoop {
  private supabase: SupabaseClient;
  private calibrationHistory: CalibrationAdjustment[] = [];
  private currentTriggers: Record<TrainingPass, RecursionTrigger>;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    // Initialize with default triggers
    this.currentTriggers = {
      1: { uncertainty: 0.6, commitment: 0.8 },
      2: { uncertainty: 0.5, commitment: 0.9 },
      3: { uncertainty: 0.4, commitment: 0.85 },
      4: { uncertainty: 0.3, commitment: 0.95 },
    };
  }

  // ============================================================================
  // Feedback Recording
  // ============================================================================

  /**
   * Record a feedback signal for a recursion
   */
  async recordFeedback(params: {
    recursionId: string;
    feedbackType: FeedbackType;
    originalDecision: string;
    actualOutcome: string;
    improvementSignal: number;
  }): Promise<string> {
    // Clamp improvement signal to [-1, 1]
    const signal = Math.max(-1, Math.min(1, params.improvementSignal));

    const { data, error } = await this.supabase.rpc('record_rlm_feedback', {
      p_recursion_id: params.recursionId,
      p_feedback_type: params.feedbackType,
      p_original_decision: params.originalDecision,
      p_actual_outcome: params.actualOutcome,
      p_signal: signal,
    });

    if (error) {
      throw new Error(`Failed to record feedback: ${error.message}`);
    }

    return data as string;
  }

  /**
   * Record human validation feedback
   *
   * Used when a native speaker reviews generated content
   */
  async recordHumanValidation(
    recursionId: string,
    decision: string,
    isCorrect: boolean,
    notes?: string
  ): Promise<string> {
    return this.recordFeedback({
      recursionId,
      feedbackType: 'human_validation',
      originalDecision: decision,
      actualOutcome: isCorrect ? 'approved' : `rejected: ${notes || 'no notes'}`,
      improvementSignal: isCorrect ? 1 : -1,
    });
  }

  /**
   * Record learner outcome feedback
   *
   * Used when app analytics show learner engagement/success
   */
  async recordLearnerOutcome(
    recursionId: string,
    decision: string,
    engagementScore: number,  // 0-1
    completionRate: number    // 0-1
  ): Promise<string> {
    // Combine engagement and completion into improvement signal
    const signal = (engagementScore + completionRate) / 2 * 2 - 1;  // Map to [-1, 1]

    return this.recordFeedback({
      recursionId,
      feedbackType: 'learner_outcome',
      originalDecision: decision,
      actualOutcome: `engagement=${engagementScore.toFixed(2)}, completion=${completionRate.toFixed(2)}`,
      improvementSignal: signal,
    });
  }

  /**
   * Record quality metric feedback
   *
   * Used when automated quality checks run
   */
  async recordQualityMetric(
    recursionId: string,
    decision: string,
    metricName: string,
    metricValue: number,  // 0-1 where 1 is best
    threshold: number = 0.5
  ): Promise<string> {
    // Signal is positive if metric exceeds threshold, negative otherwise
    const signal = (metricValue - threshold) * 2;

    return this.recordFeedback({
      recursionId,
      feedbackType: 'quality_metric',
      originalDecision: decision,
      actualOutcome: `${metricName}=${metricValue.toFixed(3)}`,
      improvementSignal: signal,
    });
  }

  /**
   * Record RLM self-critique feedback
   *
   * Used when the RLM analyzes its own outputs
   */
  async recordSelfCritique(
    recursionId: string,
    decision: string,
    selfAssessment: string,
    confidenceCorrect: number  // 0-1 probability assessment was correct
  ): Promise<string> {
    // Signal based on confidence correction
    const signal = confidenceCorrect * 2 - 1;

    return this.recordFeedback({
      recursionId,
      feedbackType: 'rlm_self_critique',
      originalDecision: decision,
      actualOutcome: selfAssessment,
      improvementSignal: signal,
    });
  }

  // ============================================================================
  // Feedback Aggregation
  // ============================================================================

  /**
   * Get aggregated feedback statistics
   */
  async getFeedbackStats(): Promise<FeedbackStats> {
    const { data, error } = await this.supabase
      .from('vw_rlm_feedback_stats')
      .select('*');

    if (error) {
      throw new Error(`Failed to get feedback stats: ${error.message}`);
    }

    // Aggregate into FeedbackStats structure
    const stats: FeedbackStats = {
      totalSignals: 0,
      avgImprovement: 0,
      byDepth: {},
      byStrategy: {} as Record<RecursionStrategy, { count: number; avgImprovement: number }>,
    };

    for (const row of data || []) {
      stats.totalSignals += row.total_feedback || 0;
      stats.byStrategy[row.strategy as RecursionStrategy] = {
        count: row.total_feedback || 0,
        avgImprovement: row.avg_improvement || 0,
      };
    }

    // Calculate overall average
    if (stats.totalSignals > 0) {
      const totalImprovement = Object.values(stats.byStrategy).reduce(
        (sum, s) => sum + s.avgImprovement * s.count,
        0
      );
      stats.avgImprovement = totalImprovement / stats.totalSignals;
    }

    // Get depth statistics from raw data
    const { data: depthData } = await this.supabase
      .from('nko_rlm_feedback')
      .select(`
        improvement_signal,
        recursion:nko_rlm_recursions(depth)
      `)
      .limit(10000);

    if (depthData) {
      const depthGroups: Record<number, number[]> = {};
      for (const row of depthData) {
        const depth = (row.recursion as any)?.depth ?? 0;
        if (!depthGroups[depth]) depthGroups[depth] = [];
        depthGroups[depth].push(row.improvement_signal);
      }

      for (const [depth, signals] of Object.entries(depthGroups)) {
        const count = signals.length;
        const avg = signals.reduce((a, b) => a + b, 0) / count;
        stats.byDepth[parseInt(depth)] = { count, avgImprovement: avg };
      }
    }

    return stats;
  }

  /**
   * Get feedback statistics for a specific pass
   */
  async getFeedbackStatsForPass(pass: TrainingPass): Promise<FeedbackStats> {
    const { data, error } = await this.supabase
      .from('vw_rlm_feedback_stats')
      .select('*')
      .eq('pass_number', pass);

    if (error) {
      throw new Error(`Failed to get feedback stats for pass ${pass}: ${error.message}`);
    }

    // Similar aggregation as getFeedbackStats but filtered
    const stats: FeedbackStats = {
      totalSignals: 0,
      avgImprovement: 0,
      byDepth: {},
      byStrategy: {} as Record<RecursionStrategy, { count: number; avgImprovement: number }>,
    };

    for (const row of data || []) {
      stats.totalSignals += row.total_feedback || 0;
      stats.byStrategy[row.strategy as RecursionStrategy] = {
        count: row.total_feedback || 0,
        avgImprovement: row.avg_improvement || 0,
      };
    }

    if (stats.totalSignals > 0) {
      const totalImprovement = Object.values(stats.byStrategy).reduce(
        (sum, s) => sum + s.avgImprovement * s.count,
        0
      );
      stats.avgImprovement = totalImprovement / stats.totalSignals;
    }

    return stats;
  }

  // ============================================================================
  // Calibration
  // ============================================================================

  /**
   * Run calibration cycle to update anticipation thresholds
   *
   * Fetches unincorporated feedback, computes adjustments, and updates triggers
   */
  async runCalibrationCycle(batchSize: number = 100): Promise<CalibrationAdjustment> {
    // Get unincorporated feedback
    const { data: feedbackBatch, error } = await this.supabase.rpc(
      'get_unincorporated_feedback',
      { p_limit: batchSize }
    );

    if (error) {
      throw new Error(`Failed to get feedback batch: ${error.message}`);
    }

    if (!feedbackBatch || feedbackBatch.length === 0) {
      // No feedback to process
      return {
        commitmentDelta: 0,
        uncertaintyDelta: 0,
        depthPreferenceDelta: 0,
        strategyWeights: {} as Record<RecursionStrategy, number>,
      };
    }

    // Compute adjustment based on feedback
    const adjustment = this.computeCalibrationAdjustment(feedbackBatch);

    // Apply adjustment to current triggers
    this.applyCalibrationAdjustment(adjustment);

    // Mark feedback as incorporated
    const feedbackIds = feedbackBatch.map((f: any) => f.feedback_id);
    await this.supabase.rpc('mark_feedback_incorporated', {
      p_feedback_ids: feedbackIds,
    });

    // Store in history
    this.calibrationHistory.push(adjustment);

    return adjustment;
  }

  /**
   * Compute calibration adjustment from feedback batch
   */
  private computeCalibrationAdjustment(
    feedback: Array<{
      feedback_id: string;
      recursion_id: string;
      strategy: RecursionStrategy;
      pass_number: TrainingPass;
      feedback_type: FeedbackType;
      improvement_signal: number;
    }>
  ): CalibrationAdjustment {
    const learningRate = 0.05;

    // Aggregate signals by various dimensions
    let totalSignal = 0;
    let commitRelatedSignal = 0;
    let uncertaintyRelatedSignal = 0;
    let depthRelatedSignal = 0;
    const strategySignals: Record<RecursionStrategy, number[]> = {
      peeking: [],
      grepping: [],
      partition_map: [],
      summarize: [],
      programmatic: [],
      auto: [],
    };

    for (const f of feedback) {
      totalSignal += f.improvement_signal;
      strategySignals[f.strategy].push(f.improvement_signal);

      // Infer which dimension this feedback relates to
      // Negative signals on 'commit' actions suggest commitment threshold too low
      // Positive signals on 'recurse' actions suggest uncertainty threshold correct
      // This is a simplified heuristic
      commitRelatedSignal += f.improvement_signal * 0.5;
      uncertaintyRelatedSignal -= f.improvement_signal * 0.3;
      depthRelatedSignal += f.improvement_signal * 0.2;
    }

    // Normalize by batch size
    const n = feedback.length;
    const avgSignal = totalSignal / n;

    // Compute deltas
    const commitmentDelta = Math.max(
      -0.1,
      Math.min(0.1, learningRate * (commitRelatedSignal / n))
    );
    const uncertaintyDelta = Math.max(
      -0.1,
      Math.min(0.1, learningRate * (uncertaintyRelatedSignal / n))
    );
    const depthPreferenceDelta = Math.max(
      -0.5,
      Math.min(0.5, learningRate * (depthRelatedSignal / n) * 5)
    );

    // Compute strategy weights
    const strategyWeights: Record<RecursionStrategy, number> = {
      peeking: 1.0,
      grepping: 1.0,
      partition_map: 1.0,
      summarize: 1.0,
      programmatic: 1.0,
      auto: 1.0,
    };

    for (const [strategy, signals] of Object.entries(strategySignals)) {
      if (signals.length > 0) {
        const avgStrategySignal = signals.reduce((a, b) => a + b, 0) / signals.length;
        // Adjust weight based on average signal
        strategyWeights[strategy as RecursionStrategy] =
          1.0 + avgStrategySignal * learningRate * 2;
      }
    }

    return {
      commitmentDelta,
      uncertaintyDelta,
      depthPreferenceDelta,
      strategyWeights,
    };
  }

  /**
   * Apply calibration adjustment to current triggers
   */
  private applyCalibrationAdjustment(adjustment: CalibrationAdjustment): void {
    for (const pass of [1, 2, 3, 4] as TrainingPass[]) {
      // Update commitment threshold
      this.currentTriggers[pass].commitment = Math.max(
        0.5,
        Math.min(0.99, this.currentTriggers[pass].commitment + adjustment.commitmentDelta)
      );

      // Update uncertainty threshold
      this.currentTriggers[pass].uncertainty = Math.max(
        0.1,
        Math.min(0.9, this.currentTriggers[pass].uncertainty + adjustment.uncertaintyDelta)
      );
    }
  }

  /**
   * Get current recursion triggers (after calibration)
   */
  getCurrentTriggers(): Record<TrainingPass, RecursionTrigger> {
    return { ...this.currentTriggers };
  }

  /**
   * Get trigger for a specific pass
   */
  getTriggerForPass(pass: TrainingPass): RecursionTrigger {
    return { ...this.currentTriggers[pass] };
  }

  /**
   * Get calibration history
   */
  getCalibrationHistory(): CalibrationAdjustment[] {
    return [...this.calibrationHistory];
  }

  // ============================================================================
  // Analysis Methods
  // ============================================================================

  /**
   * Analyze which strategies work best for each pass
   */
  async analyzeStrategyEffectiveness(): Promise<
    Record<TrainingPass, { bestStrategy: RecursionStrategy; avgImprovement: number }[]>
  > {
    const result: Record<TrainingPass, { bestStrategy: RecursionStrategy; avgImprovement: number }[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    for (const pass of [1, 2, 3, 4] as TrainingPass[]) {
      const stats = await this.getFeedbackStatsForPass(pass);

      // Sort strategies by average improvement
      const sorted = Object.entries(stats.byStrategy)
        .filter(([_, s]) => s.count >= 5) // Minimum sample size
        .sort(([, a], [, b]) => b.avgImprovement - a.avgImprovement)
        .map(([strategy, s]) => ({
          bestStrategy: strategy as RecursionStrategy,
          avgImprovement: s.avgImprovement,
        }));

      result[pass] = sorted;
    }

    return result;
  }

  /**
   * Identify optimal recursion depth by pass
   */
  async analyzeOptimalDepth(): Promise<
    Record<TrainingPass, { optimalDepth: number; avgImprovement: number }>
  > {
    const result: Record<TrainingPass, { optimalDepth: number; avgImprovement: number }> = {
      1: { optimalDepth: 1, avgImprovement: 0 },
      2: { optimalDepth: 1, avgImprovement: 0 },
      3: { optimalDepth: 2, avgImprovement: 0 },
      4: { optimalDepth: 1, avgImprovement: 0 },
    };

    // Query recursions with their feedback
    const { data } = await this.supabase
      .from('nko_rlm_recursions')
      .select(`
        pass_number,
        depth,
        nko_rlm_feedback(improvement_signal)
      `)
      .limit(10000);

    if (!data) return result;

    // Group by pass and depth
    const groups: Record<TrainingPass, Record<number, number[]>> = {
      1: {},
      2: {},
      3: {},
      4: {},
    };

    for (const row of data) {
      const pass = row.pass_number as TrainingPass;
      const depth = row.depth;
      const feedback = (row.nko_rlm_feedback as any[]) || [];

      if (!groups[pass][depth]) groups[pass][depth] = [];

      for (const f of feedback) {
        groups[pass][depth].push(f.improvement_signal);
      }
    }

    // Find optimal depth for each pass
    for (const pass of [1, 2, 3, 4] as TrainingPass[]) {
      let bestDepth = 1;
      let bestAvg = -Infinity;

      for (const [depthStr, signals] of Object.entries(groups[pass])) {
        if (signals.length < 3) continue; // Minimum sample

        const avg = signals.reduce((a, b) => a + b, 0) / signals.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestDepth = parseInt(depthStr);
        }
      }

      result[pass] = {
        optimalDepth: bestDepth,
        avgImprovement: bestAvg === -Infinity ? 0 : bestAvg,
      };
    }

    return result;
  }

  /**
   * Generate a calibration report
   */
  async generateCalibrationReport(): Promise<{
    currentTriggers: Record<TrainingPass, RecursionTrigger>;
    feedbackSummary: FeedbackStats;
    strategyRankings: Record<TrainingPass, { bestStrategy: RecursionStrategy; avgImprovement: number }[]>;
    optimalDepths: Record<TrainingPass, { optimalDepth: number; avgImprovement: number }>;
    recommendations: string[];
  }> {
    const feedbackSummary = await this.getFeedbackStats();
    const strategyRankings = await this.analyzeStrategyEffectiveness();
    const optimalDepths = await this.analyzeOptimalDepth();

    const recommendations: string[] = [];

    // Generate recommendations based on analysis
    if (feedbackSummary.avgImprovement < 0) {
      recommendations.push(
        'Overall negative feedback trend. Consider increasing commitment thresholds to reduce over-recursion.'
      );
    }

    for (const pass of [1, 2, 3, 4] as TrainingPass[]) {
      if (strategyRankings[pass].length > 0) {
        const best = strategyRankings[pass][0];
        if (best.avgImprovement > 0.5) {
          recommendations.push(
            `Pass ${pass}: Strong preference for '${best.bestStrategy}' strategy (avg improvement: ${best.avgImprovement.toFixed(2)})`
          );
        }
      }

      const depthInfo = optimalDepths[pass];
      if (depthInfo.optimalDepth > 2) {
        recommendations.push(
          `Pass ${pass}: Deep recursion (depth ${depthInfo.optimalDepth}) showing positive results. Consider allowing deeper exploration.`
        );
      }
    }

    return {
      currentTriggers: this.getCurrentTriggers(),
      feedbackSummary,
      strategyRankings,
      optimalDepths,
      recommendations,
    };
  }
}

// ============================================================================
// Feedback Recorder (Utility Class)
// ============================================================================

/**
 * Simplified feedback recorder for use during generation
 */
export class FeedbackRecorder {
  private feedbackLoop: FeedbackLoop;
  private pendingFeedback: Array<{
    recursionId: string;
    feedbackType: FeedbackType;
    originalDecision: string;
    actualOutcome: string;
    improvementSignal: number;
  }> = [];

  constructor(feedbackLoop: FeedbackLoop) {
    this.feedbackLoop = feedbackLoop;
  }

  /**
   * Queue feedback for batch recording
   */
  queue(
    recursionId: string,
    feedbackType: FeedbackType,
    originalDecision: string,
    actualOutcome: string,
    improvementSignal: number
  ): void {
    this.pendingFeedback.push({
      recursionId,
      feedbackType,
      originalDecision,
      actualOutcome,
      improvementSignal,
    });
  }

  /**
   * Flush all pending feedback to database
   */
  async flush(): Promise<number> {
    let recorded = 0;

    for (const feedback of this.pendingFeedback) {
      try {
        await this.feedbackLoop.recordFeedback(feedback);
        recorded++;
      } catch (error) {
        console.error('Failed to record feedback:', error);
      }
    }

    this.pendingFeedback = [];
    return recorded;
  }

  /**
   * Get pending feedback count
   */
  getPendingCount(): number {
    return this.pendingFeedback.length;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a feedback loop instance
 */
export function createFeedbackLoop(
  supabaseUrl: string,
  supabaseKey: string
): FeedbackLoop {
  return new FeedbackLoop(supabaseUrl, supabaseKey);
}
