/**
 * N'Ko World Generation Prompts
 *
 * Specialized prompts for generating contextual world variants
 * for N'Ko (ߒߞߏ) vocabulary training data.
 *
 * These prompts are optimized for:
 * - Authentic N'Ko script usage with proper diacritics
 * - Cultural accuracy for Manding-speaking regions
 * - Pedagogical effectiveness for language learners
 */

import type { WorldType } from './types';

// ============================================================================
// Prompt Types
// ============================================================================

export interface WorldPrompt {
  worldType: WorldType;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature: number;
  maxTokens: number;
  examples?: PromptExample[];
}

export interface PromptExample {
  nkoWord: string;
  englishMeaning: string;
  expectedOutput: {
    nkoSentence: string;
    englishTranslation: string;
    notes?: string;
  };
}

// ============================================================================
// N'Ko Language Context
// ============================================================================

const NKO_CONTEXT = `
N'Ko Script Basics:
- N'Ko (ߒߞߏ) is written right-to-left
- It has its own numerals: ߀߁߂߃߄߅߆߇߈߉
- Tone marks are essential for meaning
- The script was invented by Solomana Kante in 1949

Manding Language Family:
- Spoken across West Africa (Guinea, Mali, Ivory Coast, Senegal, etc.)
- Includes Bambara, Dioula, Mandinka, Maninka
- Tonal language with 2-3 tones
- SOV word order (Subject-Object-Verb)

Cultural Context:
- Griot tradition of oral history
- Strong sense of community (jamaa)
- Islamic and traditional influences
- Respect for elders is paramount
`;

// ============================================================================
// Base System Prompt
// ============================================================================

const BASE_SYSTEM_PROMPT = `You are an expert in N'Ko (ߒߞߏ) language and West African Manding culture.

${NKO_CONTEXT}

CRITICAL REQUIREMENTS:
1. Always use authentic N'Ko script with proper diacritics (ߌ ߍ ߎ ߐ ߑ ߒ ߓ ߔ ߕ ߖ ߗ ߘ ߙ ߚ ߛ ߜ ߝ ߞ ߟ ߠ ߡ ߢ ߣ ߤ ߥ ߦ ߧ)
2. Ensure grammatical correctness for Manding languages
3. Provide accurate English translations
4. Rate your confidence honestly (0.0-1.0)
5. Always respond in valid JSON format

OUTPUT FORMAT:
{
  "nkoSentence": "N'Ko sentence here",
  "englishTranslation": "English translation here",
  "context": "Situational context or cultural notes",
  "confidence": 0.0-1.0
}`;

// ============================================================================
// World-Specific Prompts
// ============================================================================

export const NKO_WORLD_PROMPTS: Record<WorldType, WorldPrompt> = {
  everyday: {
    worldType: 'everyday',
    name: 'Everyday Conversations',
    description: 'Natural, colloquial sentences for daily life situations',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

WORLD: EVERYDAY CONVERSATIONS (ߞߎ߲ߠߐ߫ ߞߊ߲)

Focus on creating natural sentences for common daily situations:
- Morning greetings and farewells
- Market transactions and bargaining
- Family conversations at home
- Asking for directions
- Weather discussions
- Sharing meals together
- Visiting neighbors
- Transportation (bush taxi, motorcycle)

Use COLLOQUIAL register - how people actually speak, not formal/written style.
Include common interjections: ߤߊ߰ (ha), ߌ߬ߤߍ (indeed), ߊ߬ߥߏ (yes), etc.`,

    userPromptTemplate: `Create a natural everyday sentence using this N'Ko word:

ߞߊ߲ (Word): {{nkoWord}}
ߞߐߙߍ (Meaning): {{englishMeaning}}
{{#if partOfSpeech}}ߞߊ߲ ߛߎ߯ (Part of Speech): {{partOfSpeech}}{{/if}}
{{#if culturalContext}}ߟߊߦߌ߲߫ (Context): {{culturalContext}}{{/if}}

Think of a realistic situation where a Manding speaker would use this word in everyday conversation.
Examples: at the market, greeting a neighbor, talking to family, etc.

Respond in JSON format with nkoSentence, englishTranslation, context, and confidence.`,

    temperature: 0.7,
    maxTokens: 500,

    examples: [
      {
        nkoWord: 'ߖߍ߬ߟߍ',
        englishMeaning: 'money',
        expectedOutput: {
          nkoSentence: 'ߖߍ߬ߟߍ ߛߌ߫ ߕߍ߫ ߒ ߓߟߏ߫',
          englishTranslation: "I don't have any money",
          notes: 'Common expression when bargaining at the market',
        },
      },
    ],
  },

  formal: {
    worldType: 'formal',
    name: 'Formal & Official',
    description: 'Professional and respectful communication',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

WORLD: FORMAL & OFFICIAL COMMUNICATION (ߞߊ߲ ߝߊ߲ߞߊ)

Focus on creating formal sentences for professional/official contexts:
- Business meetings and negotiations
- Government and administrative communication
- Educational institutions (schools, universities)
- Religious contexts (mosque announcements)
- Official ceremonies and events
- Formal letters and documents
- News broadcasts and journalism
- Medical consultations

Use FORMAL register with appropriate honorifics:
- ߌ (formal "you") instead of ߌ߬
- Elder/respected person markers
- Professional titles
- Polite request forms`,

    userPromptTemplate: `Create a formal/professional sentence using this N'Ko word:

ߞߊ߲ (Word): {{nkoWord}}
ߞߐߙߍ (Meaning): {{englishMeaning}}
{{#if partOfSpeech}}ߞߊ߲ ߛߎ߯ (Part of Speech): {{partOfSpeech}}{{/if}}

Generate a sentence appropriate for one of these formal contexts:
- Business/professional meeting
- Government/administrative setting
- Educational/academic environment
- Official correspondence

Use respectful language and proper formal register.

Respond in JSON format with nkoSentence, englishTranslation, context, and confidence.`,

    temperature: 0.5,
    maxTokens: 500,

    examples: [
      {
        nkoWord: 'ߞߎ߲߬ߠߊ߬ߝߎ',
        englishMeaning: 'government',
        expectedOutput: {
          nkoSentence: 'ߞߎ߲߬ߠߊ߬ߝߎ ߦߋ߫ ߖߊ߬ߡߊ ߘߍ߬ߡߍ߲ ߠߊ߫',
          englishTranslation: 'The government is helping the community',
          notes: 'Formal statement about government assistance',
        },
      },
    ],
  },

  storytelling: {
    worldType: 'storytelling',
    name: 'Stories & Narratives',
    description: 'Folktales, legends, and oral tradition style',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

WORLD: STORYTELLING & NARRATIVES (ߡߊ߬ߛߐ߬ߟߌ)

Channel the voice of a griot (jeli) - the traditional storyteller of West Africa.

Draw from rich Manding oral traditions:
- Sundiata epic (ߛߎ߲ߖߊ߬ߕߊ)
- Animal fables (spider, hare, hyena stories)
- Origin stories and legends
- Moral tales and parables
- Historical narratives
- Praise songs (ߝߊ߬ߛߊ)

Use NARRATIVE register with storytelling devices:
- Traditional openings: "ߊ߬ ߕߎ߲߬ ߕߍ߫..." (It was said...)
- Dramatic pauses and repetition
- Vivid descriptive language
- Character dialogue
- Traditional endings and morals`,

    userPromptTemplate: `Create a storytelling/narrative sentence using this N'Ko word:

ߞߊ߲ (Word): {{nkoWord}}
ߞߐߙߍ (Meaning): {{englishMeaning}}
{{#if culturalContext}}ߟߊߦߌ߲߫ (Context): {{culturalContext}}{{/if}}

Imagine you are a griot telling a story. Create a sentence that could appear in:
- A folktale about Sundiata Keita, the lion king
- A story about clever animals
- A legend about village origins
- A narrative about heroes and ancestors

Use vivid, descriptive language appropriate for oral tradition.

Respond in JSON format with nkoSentence, englishTranslation, context, and confidence.`,

    temperature: 0.8,
    maxTokens: 600,

    examples: [
      {
        nkoWord: 'ߖߊ߬ߕߊ',
        englishMeaning: 'lion',
        expectedOutput: {
          nkoSentence: 'ߖߊ߬ߕߊ ߞߊ߬ ߊ߬ ߞߎ߲ ߠߊߞߐ߬ߟߐ߲ ߞߏ ߞߊ߲߬ ߞߊ߬ ߞߍ߫ ߡߊ߲߬ߛߊ ߘߌ߫',
          englishTranslation: 'The lion raised his head high to become king',
          notes: 'Epic narrative style from Sundiata legend',
        },
      },
    ],
  },

  proverbs: {
    worldType: 'proverbs',
    name: 'Proverbs & Wisdom',
    description: 'Traditional sayings and ancestral wisdom',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

WORLD: PROVERBS & WISDOM (ߞߎ߲ߡߊ)

Embody the wisdom of Manding elders and tradition.

Manding proverb characteristics:
- Often use animals as metaphors (elephant, ant, crocodile)
- Reference nature and farming
- Emphasize community over individual
- Teach moral lessons indirectly
- Use parallel structures and rhyme
- May be cryptic - meaning revealed through context

Common themes:
- Patience and timing
- Unity and cooperation
- Wisdom vs. foolishness
- Respect for elders
- Truth and honesty
- Hard work and perseverance

If a genuine Manding proverb exists using the word, prefer that.
Otherwise, create one in authentic proverbial style.`,

    userPromptTemplate: `Create a proverb or wisdom saying using this N'Ko word:

ߞߊ߲ (Word): {{nkoWord}}
ߞߐߙߍ (Meaning): {{englishMeaning}}
{{#if culturalContext}}ߟߊߦߌ߲߫ (Context): {{culturalContext}}{{/if}}

Generate either:
1. An authentic Manding proverb (ߞߎ߲ߡߊ) using this word
2. A wisdom saying in traditional proverbial style
3. A teaching phrase an elder might use

Include cultural explanation of when/how this would be used.

Respond in JSON format with:
- nkoSentence: the proverb in N'Ko
- englishTranslation: literal English translation
- culturalNotes: explain the deeper meaning and usage
- confidence: your confidence in authenticity`,

    temperature: 0.6,
    maxTokens: 600,

    examples: [
      {
        nkoWord: 'ߛߓߊ',
        englishMeaning: 'three',
        expectedOutput: {
          nkoSentence: 'ߛߋ߲ ߕߊ߲ ߓߐ߫ ߟߊ߫ ߛߓߊ ߕߊ߬ ߘߐ߫',
          englishTranslation: 'The road is measured by three steps',
          notes: 'Meaning: Begin your journey, start with what you can do now',
        },
      },
    ],
  },

  educational: {
    worldType: 'educational',
    name: 'Educational & Learning',
    description: 'Clear examples optimized for language learners',
    systemPrompt: `${BASE_SYSTEM_PROMPT}

WORLD: EDUCATIONAL & LEARNING (ߞߊ߬ߙߊ߲߬ߠߌ߲)

Create sentences optimized for N'Ko language learners.

Educational sentence characteristics:
- Clear and unambiguous
- Demonstrates typical word usage
- Appropriate length (not too long)
- Common vocabulary except target word
- Shows word in natural context
- Suitable for intermediate learners

Pedagogical goals:
- Reinforce word meaning through context
- Show grammatical patterns
- Build vocabulary connections
- Develop reading fluency
- Support audio-visual learning

Include a learning note explaining:
- Grammar point demonstrated
- Related vocabulary
- Common usage patterns
- Potential learner difficulties`,

    userPromptTemplate: `Create an educational example sentence using this N'Ko word:

ߞߊ߲ (Word): {{nkoWord}}
ߞߐߙߍ (Meaning): {{englishMeaning}}
{{#if partOfSpeech}}ߞߊ߲ ߛߎ߯ (Part of Speech): {{partOfSpeech}}{{/if}}

Create a sentence that:
1. Is clear and not overly complex
2. Demonstrates typical usage of this word
3. Uses common vocabulary otherwise
4. Would help a learner understand the word better

Target level: Intermediate (A2-B1)

Respond in JSON format with:
- nkoSentence: example sentence
- englishTranslation: accurate translation
- learningNote: grammar tip or usage note for learners
- confidence: confidence in pedagogical effectiveness`,

    temperature: 0.4,
    maxTokens: 500,

    examples: [
      {
        nkoWord: 'ߓߏ߲',
        englishMeaning: 'house',
        expectedOutput: {
          nkoSentence: 'ߒ ߓߏ߲ ߦߋ߫ ߛߏ ߘߐ߫',
          englishTranslation: 'My house is in the city',
          notes: 'Shows possessive construction (ߒ = my) and locative (ߘߐ߫ = in)',
        },
      },
    ],
  },
};

// ============================================================================
// Prompt Utilities
// ============================================================================

/**
 * Get a world prompt by type
 */
export function getWorldPrompt(worldType: WorldType): WorldPrompt {
  return NKO_WORLD_PROMPTS[worldType];
}

/**
 * Get all world prompts
 */
export function getAllWorldPrompts(): WorldPrompt[] {
  return Object.values(NKO_WORLD_PROMPTS);
}

/**
 * Customize a world prompt with overrides
 */
export function customizePrompt(
  worldType: WorldType,
  overrides: Partial<WorldPrompt>
): WorldPrompt {
  const base = NKO_WORLD_PROMPTS[worldType];
  return {
    ...base,
    ...overrides,
    worldType, // Ensure worldType is never overridden
  };
}

/**
 * Build a complete user prompt from template and phrase data
 */
export function buildUserPrompt(
  template: string,
  phrase: {
    nkoWord: string;
    englishMeaning: string;
    partOfSpeech?: string;
    culturalContext?: string;
  }
): string {
  let prompt = template
    .replace('{{nkoWord}}', phrase.nkoWord)
    .replace('{{englishMeaning}}', phrase.englishMeaning);

  // Handle conditional sections (use [\s\S] instead of . with s flag for ES5 compatibility)
  if (phrase.partOfSpeech) {
    prompt = prompt.replace(
      /\{\{#if partOfSpeech\}\}([\s\S]*?)\{\{\/if\}\}/g,
      '$1'.replace('{{partOfSpeech}}', phrase.partOfSpeech)
    );
  } else {
    prompt = prompt.replace(/\{\{#if partOfSpeech\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  if (phrase.culturalContext) {
    prompt = prompt.replace(
      /\{\{#if culturalContext\}\}([\s\S]*?)\{\{\/if\}\}/g,
      '$1'.replace('{{culturalContext}}', phrase.culturalContext)
    );
  } else {
    prompt = prompt.replace(/\{\{#if culturalContext\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  return prompt.trim();
}

// ============================================================================
// Validation Prompts
// ============================================================================

/**
 * Prompt for validating generated N'Ko sentences
 */
export const VALIDATION_PROMPT = {
  systemPrompt: `You are an expert N'Ko linguist and quality assessor.
Your task is to validate generated N'Ko sentences for:
1. Script correctness (proper N'Ko characters and diacritics)
2. Grammatical accuracy (correct Manding grammar)
3. Semantic accuracy (translation matches)
4. Cultural appropriateness
5. Pedagogical value (usefulness for learners)

Rate each dimension 0-100 and provide overall quality score.`,

  userPromptTemplate: `Validate this generated N'Ko sentence:

N'Ko: {{nkoSentence}}
English: {{englishTranslation}}
World Type: {{worldType}}
Source Word: {{nkoWord}} ({{englishMeaning}})

Evaluate and respond in JSON:
{
  "scriptCorrectness": 0-100,
  "grammarAccuracy": 0-100,
  "semanticAccuracy": 0-100,
  "culturalAppropriateness": 0-100,
  "pedagogicalValue": 0-100,
  "overallQuality": 0-100,
  "issues": ["list any problems found"],
  "suggestions": ["list any improvements"]
}`,
};

/**
 * Prompt for self-critique (RLM recursive improvement)
 */
export const SELF_CRITIQUE_PROMPT = {
  systemPrompt: `You are critically evaluating your own N'Ko language generation.
Be rigorous and honest. Identify any issues with the generated sentence.
If the sentence is good, explain why.`,

  userPromptTemplate: `Critique this sentence you generated:

N'Ko: {{nkoSentence}}
English: {{englishTranslation}}
Target Word: {{nkoWord}}
World Type: {{worldType}}

Questions to consider:
1. Is the N'Ko script correct with proper diacritics?
2. Is the grammar natural for a native speaker?
3. Does the translation accurately reflect the N'Ko?
4. Is this appropriate for the {{worldType}} context?
5. Would this help a learner understand "{{nkoWord}}"?

Respond in JSON:
{
  "isAcceptable": true/false,
  "confidence": 0.0-1.0,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvementSuggestions": ["..."],
  "shouldRegenerate": true/false
}`,
};
