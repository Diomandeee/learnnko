/**
 * 5D Trajectory Coordinate Calculator
 *
 * Computes trajectory coordinates for training data items:
 * - temporal: recency of content (newer = higher)
 * - semantic: relevance to learning objectives
 * - depth: recursion/nesting level
 * - homogeneity: consistency with peer items
 * - salience: pedagogical importance
 */

import type {
  TrainingCoordinates,
  TrainingEntityType,
  CoordinateWeights,
  TrainingPass,
  TrajectoryCoordinates,
  WorldType,
  DEFAULT_COORDINATE_WEIGHTS,
} from './types';

// ============================================================================
// Coordinate Calculator Class
// ============================================================================

export class CoordinateCalculator {
  private weights: CoordinateWeights;
  private pass: TrainingPass;

  constructor(pass: TrainingPass, weights?: CoordinateWeights) {
    this.pass = pass;
    this.weights = weights || this.getDefaultWeights(pass);
  }

  private getDefaultWeights(pass: TrainingPass): CoordinateWeights {
    const defaults: Record<TrainingPass, CoordinateWeights> = {
      1: { temporal: 0.3, semantic: 0.2, depth: 0.1, homogeneity: 0.1, salience: 0.3 },
      2: { temporal: 0.1, semantic: 0.3, depth: 0.1, homogeneity: 0.4, salience: 0.1 },
      3: { temporal: 0.1, semantic: 0.35, depth: 0.1, homogeneity: 0.15, salience: 0.3 },
      4: { temporal: 0.1, semantic: 0.2, depth: 0.3, homogeneity: 0.1, salience: 0.3 },
    };
    return defaults[pass];
  }

  /**
   * Calculate temporal coordinate based on timestamp
   *
   * Uses exponential decay: more recent items score higher
   * Decay half-life is configurable (default: 30 days)
   */
  calculateTemporal(
    timestamp: Date,
    referenceTime: Date = new Date(),
    halfLifeDays: number = 30
  ): number {
    const ageMs = referenceTime.getTime() - timestamp.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    // Exponential decay: score = 2^(-age/halfLife)
    const score = Math.pow(2, -ageDays / halfLifeDays);

    // Clamp to [0, 1]
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate semantic coordinate based on query similarity
   *
   * Uses cosine similarity between embeddings if available,
   * or keyword overlap as fallback
   */
  calculateSemantic(
    itemText: string,
    queryText: string,
    itemEmbedding?: number[],
    queryEmbedding?: number[]
  ): number {
    // If embeddings provided, use cosine similarity
    if (itemEmbedding && queryEmbedding) {
      return this.cosineSimilarity(itemEmbedding, queryEmbedding);
    }

    // Fallback: keyword overlap (Jaccard similarity)
    return this.jaccardSimilarity(
      this.tokenize(itemText),
      this.tokenize(queryText)
    );
  }

  /**
   * Calculate depth coordinate based on recursion level
   *
   * Normalized to [0, 1] where 0 = root level, 1 = max depth
   */
  calculateDepth(currentDepth: number, maxDepth: number = 5): number {
    return Math.min(1, currentDepth / maxDepth);
  }

  /**
   * Calculate homogeneity coordinate based on peer similarity
   *
   * Measures how consistent this item is with its peer group
   */
  calculateHomogeneity(
    itemFeatures: number[],
    peerFeatures: number[][]
  ): number {
    if (peerFeatures.length === 0) return 0.5; // No peers = neutral

    // Calculate average similarity to all peers
    const similarities = peerFeatures.map((peer) =>
      this.cosineSimilarity(itemFeatures, peer)
    );

    return similarities.reduce((a, b) => a + b, 0) / similarities.length;
  }

  /**
   * Calculate salience coordinate based on pedagogical importance
   *
   * Combines multiple signals:
   * - Corpus frequency (common words = more important to learn)
   * - Coverage breadth (appears in multiple contexts)
   * - Learner interaction (highly engaged content)
   */
  calculateSalience(
    corpusFrequency: number,
    maxFrequency: number,
    coverageBreadth: number = 1,
    maxCoverage: number = 5,
    learnerEngagement: number = 0.5
  ): number {
    // Normalize frequency (log scale to handle power law distribution)
    const freqScore =
      maxFrequency > 0
        ? Math.log(1 + corpusFrequency) / Math.log(1 + maxFrequency)
        : 0;

    // Normalize coverage
    const coverageScore = Math.min(1, coverageBreadth / maxCoverage);

    // Weighted combination
    const salience =
      freqScore * 0.4 + coverageScore * 0.3 + learnerEngagement * 0.3;

    return Math.max(0, Math.min(1, salience));
  }

  /**
   * Calculate all 5D coordinates for a training item
   */
  calculateCoordinates(params: {
    entityType: TrainingEntityType;
    entityId: string;
    timestamp: Date;
    text: string;
    query?: string;
    embedding?: number[];
    queryEmbedding?: number[];
    depth?: number;
    peerFeatures?: number[][];
    corpusFrequency?: number;
    maxFrequency?: number;
    coverageBreadth?: number;
    maxCoverage?: number;
    learnerEngagement?: number;
  }): TrainingCoordinates {
    const {
      entityType,
      entityId,
      timestamp,
      text,
      query = '',
      embedding,
      queryEmbedding,
      depth = 0,
      peerFeatures = [],
      corpusFrequency = 1,
      maxFrequency = 100,
      coverageBreadth = 1,
      maxCoverage = 5,
      learnerEngagement = 0.5,
    } = params;

    const temporal = this.calculateTemporal(timestamp);
    const semantic = this.calculateSemantic(text, query, embedding, queryEmbedding);
    const depthCoord = this.calculateDepth(depth);

    // For homogeneity, use text embedding or fallback to zero vector
    const itemFeatures = embedding || this.simpleFeatures(text);
    const homogeneity = this.calculateHomogeneity(itemFeatures, peerFeatures);

    const salience = this.calculateSalience(
      corpusFrequency,
      maxFrequency,
      coverageBreadth,
      maxCoverage,
      learnerEngagement
    );

    // Calculate composite pedagogical score
    const pedagogicalScore = this.calculatePedagogicalScore({
      temporal,
      semantic,
      depth: depthCoord,
      homogeneity,
      salience,
    });

    return {
      entityType,
      entityId,
      temporal,
      semantic,
      depth: depthCoord,
      homogeneity,
      salience,
      pedagogicalScore,
    };
  }

  /**
   * Calculate composite pedagogical score using weighted combination
   */
  calculatePedagogicalScore(coords: TrajectoryCoordinates): number {
    return (
      coords.temporal * this.weights.temporal +
      coords.semantic * this.weights.semantic +
      coords.depth * this.weights.depth +
      coords.homogeneity * this.weights.homogeneity +
      coords.salience * this.weights.salience
    );
  }

  /**
   * Update weights based on feedback signals
   *
   * Uses simple gradient update:
   * weight += learningRate * feedbackSignal * currentValue
   */
  updateWeights(
    feedbackSignal: number,
    activeCoords: TrajectoryCoordinates,
    learningRate: number = 0.01
  ): void {
    // Update each weight proportionally to its contribution
    this.weights.temporal +=
      learningRate * feedbackSignal * activeCoords.temporal;
    this.weights.semantic +=
      learningRate * feedbackSignal * activeCoords.semantic;
    this.weights.depth += learningRate * feedbackSignal * activeCoords.depth;
    this.weights.homogeneity +=
      learningRate * feedbackSignal * activeCoords.homogeneity;
    this.weights.salience +=
      learningRate * feedbackSignal * activeCoords.salience;

    // Renormalize weights to sum to 1
    this.normalizeWeights();
  }

  private normalizeWeights(): void {
    const sum =
      this.weights.temporal +
      this.weights.semantic +
      this.weights.depth +
      this.weights.homogeneity +
      this.weights.salience;

    if (sum > 0) {
      this.weights.temporal /= sum;
      this.weights.semantic /= sum;
      this.weights.depth /= sum;
      this.weights.homogeneity /= sum;
      this.weights.salience /= sum;
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  private jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    // Convert sets to arrays for ES5 compatibility
    const arrayA = Array.from(setA);
    const arrayB = Array.from(setB);

    const intersection = arrayA.filter((x) => setB.has(x));
    const unionSet = new Set(arrayA.concat(arrayB));
    const unionSize = unionSet.size;

    return unionSize > 0 ? intersection.length / unionSize : 0;
  }

  private tokenize(text: string): Set<string> {
    // Simple tokenization: lowercase, remove punctuation, split on whitespace
    const normalized = text
      .toLowerCase()
      .replace(/[^\w\s\u07C0-\u07FF]/g, ' ') // Keep N'Ko Unicode range
      .split(/\s+/)
      .filter((t) => t.length > 0);

    return new Set(normalized);
  }

  /**
   * Generate simple features from text (fallback when no embedding)
   *
   * Uses character n-gram frequency as feature vector
   */
  private simpleFeatures(text: string, ngramSize: number = 3): number[] {
    const features = new Array(256).fill(0); // ASCII + common Unicode buckets

    for (let i = 0; i <= text.length - ngramSize; i++) {
      const ngram = text.substring(i, i + ngramSize);
      // Hash ngram to feature bucket
      const hash = this.hashString(ngram) % features.length;
      features[hash] += 1;
    }

    // Normalize
    const sum = features.reduce((a, b) => a + b, 0);
    return sum > 0 ? features.map((f) => f / sum) : features;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // ============================================================================
  // Getters
  // ============================================================================

  getWeights(): CoordinateWeights {
    return { ...this.weights };
  }

  getPass(): TrainingPass {
    return this.pass;
  }
}

// ============================================================================
// Specialized Calculators for Each Pass
// ============================================================================

/**
 * Pass 1: Catalog Navigator
 *
 * Calculates coordinates for video sources to prioritize extraction
 */
export class CatalogCoordinateCalculator extends CoordinateCalculator {
  constructor() {
    super(1);
  }

  /**
   * Calculate coordinates for a video source
   */
  calculateSourceCoordinates(source: {
    id: string;
    uploadDate: Date;
    title: string;
    description: string;
    channelName: string;
    extractionSuccessRate?: number;
    nkoKeywordDensity?: number;
    peerSources?: Array<{ title: string; description: string }>;
  }): TrainingCoordinates {
    // Combine title and description for text analysis
    const text = `${source.title} ${source.description}`;
    const query = 'N\'Ko language lesson tutorial learning ߒߞߏ';

    // Peer features from similar sources
    const peerFeatures = source.peerSources?.map((peer) =>
      this['simpleFeatures'](`${peer.title} ${peer.description}`)
    ) || [];

    return this.calculateCoordinates({
      entityType: 'source',
      entityId: source.id,
      timestamp: source.uploadDate,
      text,
      query,
      peerFeatures,
      // Use extraction success rate as engagement proxy
      learnerEngagement: source.extractionSuccessRate ?? 0.5,
      // Use keyword density as frequency proxy
      corpusFrequency: (source.nkoKeywordDensity ?? 0.1) * 100,
      maxFrequency: 10,
    });
  }
}

/**
 * Pass 2: Quality Analyzer
 *
 * Calculates coordinates for OCR detections during consolidation
 */
export class QualityCoordinateCalculator extends CoordinateCalculator {
  constructor() {
    super(2);
  }

  /**
   * Calculate coordinates for an OCR detection
   */
  calculateDetectionCoordinates(detection: {
    id: string;
    detectedAt: Date;
    nkoText: string;
    ocrConfidence: number;
    occurrenceCount: number;
    maxOccurrences: number;
    peerDetections?: Array<{ nkoText: string }>;
  }): TrainingCoordinates {
    const peerFeatures = detection.peerDetections?.map((peer) =>
      this['simpleFeatures'](peer.nkoText)
    ) || [];

    return this.calculateCoordinates({
      entityType: 'detection',
      entityId: detection.id,
      timestamp: detection.detectedAt,
      text: detection.nkoText,
      peerFeatures,
      // OCR confidence as engagement proxy
      learnerEngagement: detection.ocrConfidence,
      corpusFrequency: detection.occurrenceCount,
      maxFrequency: detection.maxOccurrences,
    });
  }
}

/**
 * Pass 3: World Synthesizer
 *
 * Calculates coordinates for generated world variants
 */
export class WorldCoordinateCalculator extends CoordinateCalculator {
  constructor() {
    super(3);
  }

  /**
   * Calculate coordinates for a generated world
   */
  calculateWorldCoordinates(world: {
    id: string;
    generatedAt: Date;
    worldType: WorldType;
    nkoSentence: string;
    englishTranslation: string;
    generationConfidence: number;
    recursionDepth: number;
    peerWorlds?: Array<{ nkoSentence: string; worldType: WorldType }>;
  }): TrainingCoordinates {
    // Only compare with peers of same world type
    const samTypePeers = world.peerWorlds?.filter(
      (p) => p.worldType === world.worldType
    ) || [];

    const peerFeatures = samTypePeers.map((peer) =>
      this['simpleFeatures'](peer.nkoSentence)
    );

    // Combine N'Ko and English for semantic analysis
    const text = `${world.nkoSentence} ${world.englishTranslation}`;

    return this.calculateCoordinates({
      entityType: 'world',
      entityId: world.id,
      timestamp: world.generatedAt,
      text,
      depth: world.recursionDepth,
      peerFeatures,
      learnerEngagement: world.generationConfidence,
      // World variants don't have corpus frequency - use coverage instead
      corpusFrequency: 1,
      maxFrequency: 1,
      coverageBreadth: samTypePeers.length,
      maxCoverage: 10,
    });
  }
}

/**
 * Pass 4: Curriculum Optimizer
 *
 * Calculates coordinates for curriculum lessons
 */
export class CurriculumCoordinateCalculator extends CoordinateCalculator {
  constructor() {
    super(4);
  }

  /**
   * Calculate coordinates for a curriculum lesson
   */
  calculateLessonCoordinates(lesson: {
    id: string;
    createdAt: Date;
    title: string;
    content: string;
    prerequisiteDepth: number;
    vocabularyCount: number;
    maxVocabulary: number;
    completionRate?: number;
    peerLessons?: Array<{ title: string; content: string }>;
  }): TrainingCoordinates {
    const peerFeatures = lesson.peerLessons?.map((peer) =>
      this['simpleFeatures'](`${peer.title} ${peer.content}`)
    ) || [];

    const text = `${lesson.title} ${lesson.content}`;

    return this.calculateCoordinates({
      entityType: 'lesson',
      entityId: lesson.id,
      timestamp: lesson.createdAt,
      text,
      depth: lesson.prerequisiteDepth,
      peerFeatures,
      // Completion rate as engagement
      learnerEngagement: lesson.completionRate ?? 0.5,
      corpusFrequency: lesson.vocabularyCount,
      maxFrequency: lesson.maxVocabulary,
    });
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create appropriate coordinate calculator for a training pass
 */
export function createCoordinateCalculator(
  pass: TrainingPass
): CoordinateCalculator {
  switch (pass) {
    case 1:
      return new CatalogCoordinateCalculator();
    case 2:
      return new QualityCoordinateCalculator();
    case 3:
      return new WorldCoordinateCalculator();
    case 4:
      return new CurriculumCoordinateCalculator();
    default:
      return new CoordinateCalculator(pass);
  }
}
