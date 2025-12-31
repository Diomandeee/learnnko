# World Generation

This document describes the 5-world variant system for creating diverse learning contexts.

## Concept

Each detected N'Ko phrase is expanded into 5 contextual "worlds" - different usage scenarios that demonstrate how the phrase appears in real language:

```
Detected: ߒ ߡߊ߬ ߘߌ߫ (I will give)
     │
     ├── Everyday: "ߒ ߡߊ߬ ߘߌ߫ ߌ ߡߊ߬ ߡߊ߲߫ ߘߏ߫"
     │              (I will give you some mangoes)
     │
     ├── Formal: "ߒ ߡߊ߬ ߘߌ߫ ߊ߬ ߟߊ߫ ߘߌ߬ߢߍ ߡߊ߬"
     │           (I will give it with your permission)
     │
     ├── Storytelling: "ߊ߬ ߕߘߍ߬ ߞߊ߬ ߒ ߡߊ߬ ߘߌ߫..."
     │                  (It was then that I will give...)
     │
     ├── Proverbs: "ߣߌ߫ ߌ ߡߊ߬ ߘߌ߫, ߌ ߡߊ߬ ߛߐ߬ߘߐ߲߫"
     │              (If you give, you will receive)
     │
     └── Educational: "ߒ ߡߊ߬ ߘߌ߫ ߦߋ߫ ߟߊ߫..."
                       (The meaning of 'I will give' is...)
```

## The 5 Worlds

### 1. Everyday (ߢߍ߫ ߓߍ߯ ߕߎ߲߬)

Common, casual usage in daily life.

**Characteristics:**
- Simple sentence structure
- Familiar vocabulary
- Practical situations (market, home, greetings)

**Prompt:**
```
Create a natural, everyday sentence using "{nko_text}" ({english_text}).
The sentence should reflect common daily usage in N'Ko-speaking communities.
Use familiar settings like the market, home, or casual conversations.
```

### 2. Formal (ߘߐ߬ ߛߓߍ)

Official, polite, or professional usage.

**Characteristics:**
- Respectful language
- Longer, more complex sentences
- Official contexts (meetings, ceremonies, letters)

**Prompt:**
```
Create a formal, respectful sentence using "{nko_text}" ({english_text}).
The sentence should be appropriate for official communication,
such as addressing elders, in ceremonies, or formal letters.
```

### 3. Storytelling (ߡߊ߬ ߓߊ ߣߌ)

Narrative and oral tradition contexts.

**Characteristics:**
- Story-like structure
- Traditional narrative patterns
- Past tense, descriptive language

**Prompt:**
```
Create a sentence using "{nko_text}" ({english_text}) as if telling a story.
Use traditional N'Ko storytelling patterns and narrative style.
Begin with "ߊ߬ ߕߘߍ߬..." (It was then...) or similar.
```

### 4. Proverbs (ߓߌ߬ ߡߊ߲)

Traditional wisdom and cultural sayings.

**Characteristics:**
- Metaphorical language
- Parallel structures
- Timeless wisdom

**Prompt:**
```
Create a proverb or wise saying incorporating "{nko_text}" ({english_text}).
The proverb should reflect traditional N'Ko/Manding wisdom.
Use balanced, memorable phrasing.
```

### 5. Educational (ߞߊ߬ ߞߊ߬ ߟߌ)

Learning and explanation contexts.

**Characteristics:**
- Definitional language
- Grammatical context
- Meta-linguistic awareness

**Prompt:**
```
Create an educational sentence that teaches about "{nko_text}" ({english_text}).
Explain its meaning, usage, or grammatical role.
Use phrases like "ߛߓߍ ߣߌ߲߬ ߦߋ߫..." (This word means...).
```

## Architecture

```python
class WorldGenerator:
    """Generates 5-world variants for N'Ko phrases."""
    
    WORLDS = [
        "world_everyday",
        "world_formal", 
        "world_storytelling",
        "world_proverbs",
        "world_educational",
    ]
    
    def __init__(
        self,
        api_key: str,
        model: str = "gemini-2.0-flash",
    ):
        self.client = genai.GenerativeModel(model)
    
    async def generate(
        self,
        nko_text: str,
        latin_text: str,
        english_text: str,
        worlds: List[str] = None,
    ) -> List[WorldVariant]:
        """Generate world variants for a phrase."""
        
        worlds = worlds or self.WORLDS
        variants = []
        
        for world in worlds:
            prompt = self._build_prompt(world, nko_text, latin_text, english_text)
            response = await self.client.generate_content_async(prompt)
            
            variant = WorldVariant(
                world_name=world,
                nko_sentence=self._extract_nko(response),
                latin_sentence=self._extract_latin(response),
                english_sentence=self._extract_english(response),
            )
            variants.append(variant)
        
        return variants
```

## Data Model

```python
@dataclass
class WorldVariant:
    """A single world variant."""
    world_name: str        # e.g., "world_everyday"
    nko_sentence: str      # Generated N'Ko sentence
    latin_sentence: str    # Latin transliteration
    english_sentence: str  # English translation
    confidence: float      # Generation confidence
```

## Database Storage

```sql
-- Trajectory groups worlds together
INSERT INTO nko_trajectories (name, trajectory_type)
VALUES ('worlds_ߒ_ߡߊ߬_ߘߌ߫', 'world_exploration');

-- Each world becomes a node
INSERT INTO nko_trajectory_nodes (
    trajectory_id,
    vocabulary_id,
    node_index,
    trajectory_phase,
    content_preview
) VALUES
    (..., ..., 0, 'everyday', 'ߒ ߡߊ߬ ߘߌ߫ ߌ ߡߊ߬...'),
    (..., ..., 1, 'formal', 'ߒ ߡߊ߬ ߘߌ߫ ߊ߬ ߟߊ߫...'),
    (..., ..., 2, 'storytelling', 'ߊ߬ ߕߘߍ߬ ߞߊ߬ ߒ...'),
    (..., ..., 3, 'proverbs', 'ߣߌ߫ ߌ ߡߊ߬ ߘߌ߫...'),
    (..., ..., 4, 'educational', 'ߒ ߡߊ߬ ߘߌ߫ ߦߋ߫...');
```

## Configuration

```yaml
# config/production.yaml
worlds:
  enabled: true
  model: gemini-2.0-flash
  temperature: 0.8            # Creativity level
  max_tokens: 200             # Per-world response
  selected:                   # Active worlds
    - world_everyday
    - world_formal
    - world_storytelling
    - world_proverbs
    - world_educational
  retry_on_failure: true
  max_retries: 3
```

## Prompt Templates

Prompts are stored in `/prompts/nko/worlds.yaml`:

```yaml
world_everyday:
  name: "Everyday Context"
  template: |
    You are generating N'Ko learning content.
    
    Given the N'Ko phrase: {nko_text}
    Latin transliteration: {latin_text}
    English meaning: {english_text}
    
    Create a natural, everyday sentence using this phrase.
    The sentence should:
    - Be grammatically correct in N'Ko
    - Reflect common daily usage
    - Use familiar settings (market, home, casual conversation)
    
    Respond with:
    N'Ko: [sentence in N'Ko script]
    Latin: [transliteration]
    English: [translation]

world_formal:
  name: "Formal Context"
  template: |
    # Similar structure for formal usage...
```

## Quality Controls

### 1. N'Ko Validation

```python
def validate_nko(text: str) -> bool:
    """Ensure text contains valid N'Ko characters."""
    nko_range = range(0x07C0, 0x07FF + 1)
    return any(ord(c) in nko_range for c in text)
```

### 2. Phrase Inclusion

```python
def validate_includes_phrase(generated: str, original: str) -> bool:
    """Ensure generated sentence includes the original phrase."""
    return normalize_nko(original) in normalize_nko(generated)
```

### 3. Length Limits

```python
def validate_length(text: str, min_chars: int = 10, max_chars: int = 200) -> bool:
    """Ensure reasonable sentence length."""
    return min_chars <= len(text) <= max_chars
```

## Learning Integration

The 5 worlds are presented to learners as:

```
┌─────────────────────────────────────────────────────────────────┐
│  ߒ ߡߊ߬ ߘߌ߫ (I will give)                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🏠 Everyday                                                     │
│  "ߒ ߡߊ߬ ߘߌ߫ ߌ ߡߊ߬ ߡߊ߲߫ ߘߏ߫"                                         │
│  I will give you some mangoes                                   │
│                                                                  │
│  🎩 Formal                                                       │
│  "ߒ ߡߊ߬ ߘߌ߫ ߊ߬ ߟߊ߫ ߘߌ߬ߢߍ ߡߊ߬"                                       │
│  I will give it with your permission                            │
│                                                                  │
│  📖 Story                                                        │
│  "ߊ߬ ߕߘߍ߬ ߞߊ߬ ߒ ߡߊ߬ ߘߌ߫..."                                        │
│  It was then that I would give...                               │
│                                                                  │
│  💎 Proverb                                                      │
│  "ߣߌ߫ ߌ ߡߊ߬ ߘߌ߫, ߌ ߡߊ߬ ߛߐ߬ߘߐ߲߫"                                     │
│  If you give, you will receive                                  │
│                                                                  │
│  📚 Learn                                                        │
│  "ߒ ߡߊ߬ ߘߌ߫ ߦߋ߫ ߟߊ߫..."                                            │
│  The phrase 'I will give' is used when...                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Cost Efficiency

By generating worlds only for unique vocabulary entries (Pass 3):

| Approach | Requests | Cost |
|----------|----------|------|
| Per-detection | 28,000 × 5 | $14.00 |
| Per-unique | 3,000 × 5 | $1.50 |

**Savings: ~89% by deduplicating first**

