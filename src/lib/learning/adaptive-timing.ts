import { LearningPhase } from './types';

interface TimingFactors {
  noveltyScore: number;      // 0-1, how new is this content?
  complexityScore: number;   // 0-1, how complex?
  confidenceScore: number;   // 0-1, how confident?
  currentPhase: LearningPhase;
}

const PHASE_MULTIPLIERS: Record<LearningPhase, number> = {
  exploration: 0.8,     // Faster during exploration
  consolidation: 1.5,   // Slower for consolidation
  synthesis: 1.2,       // Moderate for synthesis
  debugging: 2.0,       // Slowest for debugging
  planning: 1.0,        // Normal for planning
};

const BASE_INTERVAL_MS = 2000;  // 2 seconds base

export function calculateNextFrameDelay(factors: TimingFactors): number {
  const { noveltyScore, complexityScore, confidenceScore, currentPhase } = factors;

  // Higher novelty/complexity = longer delay
  const contentFactor = 1 + (noveltyScore * 0.5) + (complexityScore * 0.3);

  // Lower confidence = longer delay (more reflection time)
  const confidenceFactor = 1 + (1 - confidenceScore) * 0.5;

  // Phase-based adjustment
  const phaseFactor = PHASE_MULTIPLIERS[currentPhase];

  const delay = BASE_INTERVAL_MS * contentFactor * confidenceFactor * phaseFactor;

  // Clamp between 500ms and 10s
  return Math.max(500, Math.min(10000, delay));
}
