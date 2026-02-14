/**
 * World Synthesizer for N'Ko Training Data
 *
 * Generates contextual world variants for vocabulary phrases using
 * recursive language model capabilities with 5D coordinate tracking.
 *
 * Features:
 * - Generates 5 contextual worlds (everyday, formal, storytelling, proverbs, educational)
 * - Uses anticipation-driven depth control for recursion
 * - Tracks all operations to the database for self-improvement
 * - Computes 5D trajectory coordinates for quality ranking
 */

import type {
  WorldType,
  WorldGeneration,
  CoordinatedWorld,
  WorldSynthesisResult,
  TrainingCoordinates,
  RecursionMetrics,
  RecursionStrategy,
  AnticipationState,
  RLMRecursionRecord,
} from './types';
import { DEFAULT_RECURSION_TRIGGERS } from './types';
import { WorldCoordinateCalculator } from './coordinate-calculator';

// ============================================================================
// Types
// ============================================================================

/**
 * Input phrase for world generation
 */
export interface PhraseInput {
  id: string;
  nkoWord: string;
  englishMeaning: string;
  partOfSpeech?: string;
  examples?: string[];
  culturalContext?: string;
}

/**
 * World generation prompt configuration
 */
export interface WorldPromptConfig {
  worldType: WorldType;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature: number;
  maxTokens: number;
}

/**
 * Database client interface (matches Supabase client shape)
 */
export interface DatabaseClient {
  from(table: string): {
    insert(data: unknown): Promise<{ data: unknown; error: Error | null }>;
    select(columns?: string): {
      eq(column: string, value: unknown): Promise<{ data: unknown[]; error: Error | null }>;
      single(): Promise<{ data: unknown; error: Error | null }>;
    };
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
 * LLM client interface for world generation
 */
export interface LLMClient {
  generateCompletion(params: {
    model: string;
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
  }): Promise<{
    content: string;
    tokensUsed: { input: number; output: number };
    confidence?: number;
  }>;
}

/**
 * World synthesizer configuration
 */
export interface WorldSynthesizerConfig {
  /** Database client for storing results */
  db: DatabaseClient;
  /** LLM client for generation */
  llm: LLMClient;
  /** Maximum recursion depth */
  maxDepth?: number;
  /** Enable verbose logging */
  verbose?: boolean;
  /** Custom world prompts */
  customPrompts?: Partial<Record<WorldType, WorldPromptConfig>>;
}

// ============================================================================
// Default World Prompts
// ============================================================================

const DEFAULT_WORLD_PROMPTS: Record<WorldType, WorldPromptConfig> = {
  everyday: {
    worldType: 'everyday',
    systemPrompt: `You are an expert in N'Ko (ߒߞߏ) language and West African culture.
Generate natural, everyday conversation sentences using the given N'Ko vocabulary word.
Focus on common daily situations: greetings, shopping, family conversations, asking for directions, etc.
Always provide both the N'Ko sentence and English translation.
Ensure the N'Ko uses proper script and diacritics.`,
    userPromptTemplate: `Create a natural everyday sentence using this N'Ko word:
Word: {{nkoWord}}
Meaning: {{englishMeaning}}
{{#if partOfSpeech}}Part of Speech: {{partOfSpeech}}{{/if}}
{{#if culturalContext}}Cultural Context: {{culturalContext}}{{/if}}

Respond in JSON format:
{
  "nkoSentence": "...",
  "englishTranslation": "...",
  "context": "Brief description of the everyday situation",
  "confidence": 0.0-1.0
}`,
    temperature: 0.7,
    maxTokens: 500,
  },

  formal: {
    worldType: 'formal',
    systemPrompt: `You are an expert in N'Ko (ߒߞߏ) language and formal communication in Manding cultures.
Generate formal, professional sentences using the given N'Ko vocabulary word.
Focus on business, official, educational, or respectful contexts.
Use appropriate formal register and honorifics when relevant.
Always provide both the N'Ko sentence and English translation.`,
    userPromptTemplate: `Create a formal/professional sentence using this N'Ko word:
Word: {{nkoWord}}
Meaning: {{englishMeaning}}
{{#if partOfSpeech}}Part of Speech: {{partOfSpeech}}{{/if}}

Generate a sentence suitable for:
- Business meetings
- Official documents
- Formal correspondence
- Educational settings

Respond in JSON format:
{
  "nkoSentence": "...",
  "englishTranslation": "...",
  "context": "Brief description of the formal situation",
  "confidence": 0.0-1.0
}`,
    temperature: 0.5,
    maxTokens: 500,
  },

  storytelling: {
    worldType: 'storytelling',
    systemPrompt: `You are a West African griot (storyteller) fluent in N'Ko (ߒߞߏ).
Generate narrative sentences using the given N'Ko vocabulary word.
Draw from Manding folktales, legends, and oral traditions.
Use vivid, descriptive language appropriate for storytelling.
Always provide both the N'Ko sentence and English translation.`,
    userPromptTemplate: `Create a storytelling/narrative sentence using this N'Ko word:
Word: {{nkoWord}}
Meaning: {{englishMeaning}}
{{#if culturalContext}}Cultural Context: {{culturalContext}}{{/if}}

Generate a sentence that could appear in:
- A folktale about Sundiata Keita
- A story about clever animals (like the spider or hare)
- A legend about village history
- A narrative about family or community

Respond in JSON format:
{
  "nkoSentence": "...",
  "englishTranslation": "...",
  "context": "Brief description of the story context",
  "confidence": 0.0-1.0
}`,
    temperature: 0.8,
    maxTokens: 600,
  },

  proverbs: {
    worldType: 'proverbs',
    systemPrompt: `You are an elder wise in Manding proverbs and traditional wisdom.
Generate proverbial or wisdom-based sentences using the given N'Ko (ߒߞߏ) vocabulary word.
Draw from traditional Manding wisdom, proverbs (ߞߎ߲ߡߊ), and sayings.
If possible, use or adapt an existing proverb; otherwise, create one in traditional style.
Always provide both the N'Ko sentence and English translation with cultural explanation.`,
    userPromptTemplate: `Create a proverb or wisdom saying using this N'Ko word:
Word: {{nkoWord}}
Meaning: {{englishMeaning}}
{{#if culturalContext}}Cultural Context: {{culturalContext}}{{/if}}

Generate either:
- An authentic Manding proverb using this word
- A wisdom saying in traditional proverbial style
- A teaching phrase elders might use

Respond in JSON format:
{
  "nkoSentence": "...",
  "englishTranslation": "...",
  "culturalNotes": "Explain the cultural meaning and when this would be used",
  "confidence": 0.0-1.0
}`,
    temperature: 0.6,
    maxTokens: 600,
  },

  educational: {
    worldType: 'educational',
    systemPrompt: `You are an N'Ko (ߒߞߏ) language teacher creating educational materials.
Generate instructional sentences using the given N'Ko vocabulary word.
Focus on clear, didactic examples that help learners understand usage.
Include grammar notes or learning tips when helpful.
Always provide both the N'Ko sentence and English translation.`,
    userPromptTemplate: `Create an educational example sentence using this N'Ko word:
Word: {{nkoWord}}
Meaning: {{englishMeaning}}
{{#if partOfSpeech}}Part of Speech: {{partOfSpeech}}{{/if}}

Generate a sentence optimized for language learning:
- Clear and not too complex
- Demonstrates typical word usage
- Suitable for a learner at intermediate level

Respond in JSON format:
{
  "nkoSentence": "...",
  "englishTranslation": "...",
  "learningNote": "Grammar or usage tip for learners",
  "confidence": 0.0-1.0
}`,
    temperature: 0.4,
    maxTokens: 500,
  },
};

// ============================================================================
// World Synthesizer Class
// ============================================================================

export class WorldSynthesizer {
  private db: DatabaseClient;
  private llm: LLMClient;
  private maxDepth: number;
  private verbose: boolean;
  private worldPrompts: Record<WorldType, WorldPromptConfig>;
  private coordinateCalculator: WorldCoordinateCalculator;

  constructor(config: WorldSynthesizerConfig) {
    this.db = config.db;
    this.llm = config.llm;
    this.maxDepth = config.maxDepth ?? 3;
    this.verbose = config.verbose ?? false;
    this.worldPrompts = {
      ...DEFAULT_WORLD_PROMPTS,
      ...config.customPrompts,
    };
    this.coordinateCalculator = new WorldCoordinateCalculator();
  }

  /**
   * Generate all 5 contextual worlds for a phrase
   */
  async synthesizeWorlds(phrase: PhraseInput): Promise<WorldSynthesisResult> {
    const startTime = Date.now();
    const worldTypes: WorldType[] = [
      'everyday',
      'formal',
      'storytelling',
      'proverbs',
      'educational',
    ];

    const worlds: CoordinatedWorld[] = [];
    const strategiesUsed: RecursionStrategy[] = [];
    let maxDepthReached = 0;
    let totalTokens = 0;

    // Record root recursion
    const rootRecursionId = await this.recordRecursion({
      passNumber: 3,
      parentId: null,
      depth: 0,
      branch: 0,
      strategy: 'partition_map', // We're splitting by world type
      action: 'recurse_branch',
      commitment: 0.3, // Low initial commitment
      uncertainty: 0.7, // High initial uncertainty
    });

    // Generate worlds in parallel (partitioned by world type)
    const worldPromises = worldTypes.map(async (worldType, branchIndex) => {
      return this.generateWorldWithRecursion(
        phrase,
        worldType,
        rootRecursionId,
        branchIndex,
        0 // Starting depth
      );
    });

    const results = await Promise.all(worldPromises);

    // Aggregate results
    for (const result of results) {
      if (result.world) {
        worlds.push(result.world);
      }
      if (result.depth > maxDepthReached) {
        maxDepthReached = result.depth;
      }
      totalTokens += result.tokens;
      if (!strategiesUsed.includes(result.strategy)) {
        strategiesUsed.push(result.strategy);
      }
    }

    const executionTimeMs = Date.now() - startTime;

    // Update root recursion with final metrics
    await this.updateRecursionMetrics(rootRecursionId, {
      tokensConsumed: totalTokens,
      executionTimeMs,
      qualityScore:
        worlds.reduce((sum, w) => sum + (w.qualityScore ?? 0), 0) / worlds.length,
    });

    if (this.verbose) {
      console.log(
        `[WorldSynthesizer] Generated ${worlds.length} worlds for phrase ${phrase.id}`
      );
      console.log(`  Max depth: ${maxDepthReached}, Tokens: ${totalTokens}`);
    }

    return {
      phraseId: phrase.id,
      worlds,
      recursionDepth: maxDepthReached,
      totalTokens,
      executionTimeMs,
      strategiesUsed,
    };
  }

  /**
   * Generate a single world with recursive refinement
   */
  private async generateWorldWithRecursion(
    phrase: PhraseInput,
    worldType: WorldType,
    parentRecursionId: string,
    branch: number,
    depth: number
  ): Promise<{
    world: CoordinatedWorld | null;
    depth: number;
    tokens: number;
    strategy: RecursionStrategy;
  }> {
    // Check depth limit
    if (depth >= this.maxDepth) {
      return { world: null, depth, tokens: 0, strategy: 'auto' };
    }

    const promptConfig = this.worldPrompts[worldType];
    const strategy: RecursionStrategy = depth === 0 ? 'auto' : 'summarize';

    // Generate the world using LLM
    const prompt = this.buildPrompt(promptConfig.userPromptTemplate, phrase);

    try {
      const response = await this.llm.generateCompletion({
        model: 'claude-sonnet-4-20250514',
        systemPrompt: promptConfig.systemPrompt,
        userPrompt: prompt,
        temperature: promptConfig.temperature,
        maxTokens: promptConfig.maxTokens,
      });

      const tokensUsed = response.tokensUsed.input + response.tokensUsed.output;

      // Parse the response
      const parsed = this.parseWorldResponse(response.content, worldType);
      if (!parsed) {
        // Failed to parse - try recursive refinement
        return this.handleParseFailure(
          phrase,
          worldType,
          parentRecursionId,
          branch,
          depth,
          tokensUsed
        );
      }

      // Calculate anticipation state
      const anticipation = this.calculateAnticipation(parsed, depth);

      // Record this recursion
      const recursionId = await this.recordRecursion({
        passNumber: 3,
        parentId: parentRecursionId,
        depth,
        branch,
        strategy,
        action: anticipation.suggestedAction,
        commitment: anticipation.commitment,
        uncertainty: anticipation.uncertainty,
        tokensConsumed: tokensUsed,
        qualityScore: parsed.confidence,
      });

      // Decide whether to recurse or commit
      if (anticipation.suggestedAction === 'commit') {
        // Commit: create the coordinated world
        const world = await this.createCoordinatedWorld(
          parsed,
          worldType,
          depth,
          recursionId
        );

        return { world, depth, tokens: tokensUsed, strategy };
      } else if (anticipation.suggestedAction === 'recurse_single') {
        // Recurse: try to improve with more context
        const refinedResult = await this.refineWorld(
          phrase,
          worldType,
          parsed,
          recursionId,
          branch,
          depth + 1
        );

        return {
          world: refinedResult.world,
          depth: refinedResult.depth,
          tokens: tokensUsed + refinedResult.tokens,
          strategy: refinedResult.strategy,
        };
      } else {
        // Abort: quality too low, return null
        return { world: null, depth, tokens: tokensUsed, strategy };
      }
    } catch (error) {
      if (this.verbose) {
        console.error(
          `[WorldSynthesizer] Error generating ${worldType} world:`,
          error
        );
      }
      return { world: null, depth, tokens: 0, strategy };
    }
  }

  /**
   * Refine a world with additional context
   */
  private async refineWorld(
    phrase: PhraseInput,
    worldType: WorldType,
    previousWorld: WorldGeneration,
    parentRecursionId: string,
    branch: number,
    depth: number
  ): Promise<{
    world: CoordinatedWorld | null;
    depth: number;
    tokens: number;
    strategy: RecursionStrategy;
  }> {
    const promptConfig = this.worldPrompts[worldType];
    const strategy: RecursionStrategy = 'summarize';

    // Build refinement prompt
    const refinementPrompt = `The previous attempt generated this sentence, but it needs improvement:

Previous N'Ko: ${previousWorld.nkoSentence}
Previous English: ${previousWorld.englishTranslation}
Confidence: ${previousWorld.confidence}

Please improve this sentence to be more natural and culturally appropriate.
Keep the same word (${phrase.nkoWord}) but create a better example.

Respond in the same JSON format.`;

    try {
      const response = await this.llm.generateCompletion({
        model: 'claude-sonnet-4-20250514',
        systemPrompt: promptConfig.systemPrompt + '\n\nThis is a refinement pass.',
        userPrompt: refinementPrompt,
        temperature: promptConfig.temperature * 0.8, // Slightly lower for refinement
        maxTokens: promptConfig.maxTokens,
      });

      const tokensUsed = response.tokensUsed.input + response.tokensUsed.output;
      const parsed = this.parseWorldResponse(response.content, worldType);

      if (!parsed || parsed.confidence <= previousWorld.confidence) {
        // Refinement didn't improve - use previous
        const world = await this.createCoordinatedWorld(
          previousWorld,
          worldType,
          depth - 1,
          parentRecursionId
        );
        return { world, depth: depth - 1, tokens: tokensUsed, strategy };
      }

      // Record refinement recursion
      const recursionId = await this.recordRecursion({
        passNumber: 3,
        parentId: parentRecursionId,
        depth,
        branch,
        strategy,
        action: 'commit', // Always commit after refinement
        commitment: parsed.confidence,
        uncertainty: 1 - parsed.confidence,
        tokensConsumed: tokensUsed,
        qualityScore: parsed.confidence,
      });

      // Create the improved world
      const world = await this.createCoordinatedWorld(
        parsed,
        worldType,
        depth,
        recursionId
      );

      return { world, depth, tokens: tokensUsed, strategy };
    } catch (error) {
      // On error, fall back to previous world
      const world = await this.createCoordinatedWorld(
        previousWorld,
        worldType,
        depth - 1,
        parentRecursionId
      );
      return { world, depth: depth - 1, tokens: 0, strategy };
    }
  }

  /**
   * Handle parse failure with retry
   */
  private async handleParseFailure(
    phrase: PhraseInput,
    worldType: WorldType,
    parentRecursionId: string,
    branch: number,
    depth: number,
    previousTokens: number
  ): Promise<{
    world: CoordinatedWorld | null;
    depth: number;
    tokens: number;
    strategy: RecursionStrategy;
  }> {
    if (depth >= this.maxDepth - 1) {
      return { world: null, depth, tokens: previousTokens, strategy: 'auto' };
    }

    // Record failure and retry
    await this.recordRecursion({
      passNumber: 3,
      parentId: parentRecursionId,
      depth,
      branch,
      strategy: 'auto',
      action: 'recurse_single',
      commitment: 0.2,
      uncertainty: 0.9,
      tokensConsumed: previousTokens,
      qualityScore: 0,
    });

    // Retry with stricter prompt
    return this.generateWorldWithRecursion(
      phrase,
      worldType,
      parentRecursionId,
      branch,
      depth + 1
    );
  }

  /**
   * Create a coordinated world with 5D trajectory coordinates
   */
  private async createCoordinatedWorld(
    generation: WorldGeneration,
    worldType: WorldType,
    depth: number,
    recursionId: string
  ): Promise<CoordinatedWorld> {
    // Calculate coordinates using the coordinate calculator
    const coordinates = this.coordinateCalculator.calculateWorldCoordinates({
      id: recursionId, // Use recursion ID temporarily
      generatedAt: new Date(),
      worldType,
      nkoSentence: generation.nkoSentence,
      englishTranslation: generation.englishTranslation,
      generationConfidence: generation.confidence,
      recursionDepth: depth,
    });

    // Store coordinates in database
    const coordsResult = await this.db.rpc('upsert_trajectory_coordinates', {
      p_entity_type: 'world',
      p_entity_id: recursionId,
      p_temporal: coordinates.temporal,
      p_semantic: coordinates.semantic,
      p_depth: coordinates.depth,
      p_homogeneity: coordinates.homogeneity,
      p_salience: coordinates.salience,
    });

    if (coordsResult.error && this.verbose) {
      console.warn('[WorldSynthesizer] Failed to store coordinates:', coordsResult.error);
    }

    return {
      ...generation,
      worldType,
      coordinates,
      qualityScore: coordinates.pedagogicalScore,
      validationStatus: 'pending',
    };
  }

  /**
   * Calculate anticipation state for depth control
   */
  private calculateAnticipation(
    world: WorldGeneration,
    depth: number
  ): AnticipationState {
    const triggers = DEFAULT_RECURSION_TRIGGERS[3]; // Pass 3

    // Confidence directly maps to commitment
    const commitment = world.confidence;

    // Uncertainty inversely related to confidence, adjusted by depth
    // Deeper recursions have lower uncertainty tolerance
    const depthFactor = 1 - depth / this.maxDepth;
    const uncertainty = (1 - world.confidence) * depthFactor;

    // Determine suggested action
    let suggestedAction: AnticipationState['suggestedAction'];

    if (commitment >= triggers.commitment) {
      suggestedAction = 'commit';
    } else if (uncertainty >= triggers.uncertainty && depth < this.maxDepth - 1) {
      suggestedAction = 'recurse_single';
    } else if (world.confidence < 0.3) {
      suggestedAction = 'abort';
    } else {
      suggestedAction = 'commit'; // Default to commit if unsure
    }

    return { commitment, uncertainty, suggestedAction };
  }

  /**
   * Build prompt from template
   * Uses [\s\S] instead of . with s flag for ES5 compatibility
   */
  private buildPrompt(template: string, phrase: PhraseInput): string {
    return template
      .replace('{{nkoWord}}', phrase.nkoWord)
      .replace('{{englishMeaning}}', phrase.englishMeaning)
      .replace(
        /\{\{#if partOfSpeech\}\}([\s\S]*?)\{\{\/if\}\}/,
        phrase.partOfSpeech ? '$1'.replace('{{partOfSpeech}}', phrase.partOfSpeech) : ''
      )
      .replace(
        /\{\{#if culturalContext\}\}([\s\S]*?)\{\{\/if\}\}/,
        phrase.culturalContext
          ? '$1'.replace('{{culturalContext}}', phrase.culturalContext)
          : ''
      );
  }

  /**
   * Parse LLM response into WorldGeneration
   */
  private parseWorldResponse(
    content: string,
    worldType: WorldType
  ): WorldGeneration | null {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.nkoSentence || !parsed.englishTranslation) {
        return null;
      }

      return {
        worldType,
        nkoSentence: parsed.nkoSentence,
        englishTranslation: parsed.englishTranslation,
        culturalNotes: parsed.culturalNotes || parsed.context || parsed.learningNote,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
        recursionDepth: 0, // Will be set by caller
      };
    } catch (error) {
      if (this.verbose) {
        console.error('[WorldSynthesizer] Failed to parse response:', error);
      }
      return null;
    }
  }

  /**
   * Record recursion to database
   */
  private async recordRecursion(params: {
    passNumber: number;
    parentId: string | null;
    depth: number;
    branch: number;
    strategy: RecursionStrategy;
    action: AnticipationState['suggestedAction'];
    commitment: number;
    uncertainty: number;
    tokensConsumed?: number;
    qualityScore?: number;
    contextSize?: number;
    executionTimeMs?: number;
  }): Promise<string> {
    const result = await this.db.rpc('record_rlm_recursion', {
      p_pass_number: params.passNumber,
      p_parent_id: params.parentId,
      p_depth: params.depth,
      p_branch: params.branch,
      p_strategy: params.strategy,
      p_action: params.action,
      p_commitment: params.commitment,
      p_uncertainty: params.uncertainty,
      p_tokens: params.tokensConsumed ?? null,
      p_time_ms: params.executionTimeMs ?? null,
      p_context_size: params.contextSize ?? null,
      p_quality_score: params.qualityScore ?? null,
    });

    if (result.error) {
      if (this.verbose) {
        console.error('[WorldSynthesizer] Failed to record recursion:', result.error);
      }
      // Return a fallback UUID
      return crypto.randomUUID();
    }

    return result.data as string;
  }

  /**
   * Update recursion metrics after completion
   */
  private async updateRecursionMetrics(
    recursionId: string,
    metrics: {
      tokensConsumed?: number;
      executionTimeMs?: number;
      qualityScore?: number;
    }
  ): Promise<void> {
    await this.db
      .from('nko_rlm_recursions')
      .update({
        tokens_consumed: metrics.tokensConsumed,
        execution_time_ms: metrics.executionTimeMs,
        output_quality_score: metrics.qualityScore,
      })
      .eq('id', recursionId);
  }

  // ============================================================================
  // Batch Processing Methods
  // ============================================================================

  /**
   * Process multiple phrases in batch
   */
  async synthesizeBatch(
    phrases: PhraseInput[],
    options?: {
      concurrency?: number;
      onProgress?: (completed: number, total: number) => void;
    }
  ): Promise<WorldSynthesisResult[]> {
    const concurrency = options?.concurrency ?? 5;
    const results: WorldSynthesisResult[] = [];
    let completed = 0;

    // Process in batches to control concurrency
    for (let i = 0; i < phrases.length; i += concurrency) {
      const batch = phrases.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        batch.map((phrase) => this.synthesizeWorlds(phrase))
      );

      results.push(...batchResults);
      completed += batchResults.length;

      if (options?.onProgress) {
        options.onProgress(completed, phrases.length);
      }
    }

    return results;
  }

  /**
   * Store synthesized worlds to database
   */
  async storeWorlds(
    result: WorldSynthesisResult,
    phraseId: string
  ): Promise<{ success: boolean; worldIds: string[] }> {
    const worldIds: string[] = [];

    for (const world of result.worlds) {
      const insertResult = await this.db.from('nko_worlds').insert({
        phrase_id: phraseId,
        world_type: world.worldType,
        nko_sentence: world.nkoSentence,
        english_translation: world.englishTranslation,
        cultural_notes: world.culturalNotes,
        confidence: world.confidence,
        quality_score: world.qualityScore,
        recursion_depth_required: world.recursionDepth,
        validation_status: world.validationStatus,
        // RLM tracking columns
        rlm_coordinates_id: world.coordinates?.entityId,
      });

      if (!insertResult.error && insertResult.data) {
        const inserted = insertResult.data as { id: string };
        worldIds.push(inserted.id);
      }
    }

    return {
      success: worldIds.length === result.worlds.length,
      worldIds,
    };
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a world synthesizer with Anthropic Claude backend
 */
export function createWorldSynthesizer(
  db: DatabaseClient,
  anthropicApiKey: string,
  options?: {
    maxDepth?: number;
    verbose?: boolean;
  }
): WorldSynthesizer {
  // Create a simple LLM client wrapper for Anthropic
  const llmClient: LLMClient = {
    async generateCompletion(params) {
      // Dynamic import to avoid bundling issues
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: params.model,
          max_tokens: params.maxTokens,
          temperature: params.temperature,
          system: params.systemPrompt,
          messages: [{ role: 'user', content: params.userPrompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      const textContent = data.content.find((c: { type: string }) => c.type === 'text');

      return {
        content: textContent?.text ?? '',
        tokensUsed: {
          input: data.usage?.input_tokens ?? 0,
          output: data.usage?.output_tokens ?? 0,
        },
      };
    },
  };

  return new WorldSynthesizer({
    db,
    llm: llmClient,
    maxDepth: options?.maxDepth,
    verbose: options?.verbose,
  });
}

// ============================================================================
// Exports
// ============================================================================

export { DEFAULT_WORLD_PROMPTS };
