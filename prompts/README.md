# N'Ko Prompt Library

A **language-agnostic prompt library** for N'Ko language learning applications. Prompts are stored externally (not hardcoded) and can be loaded from:

1. **Supabase database** - Dynamic updates, A/B testing, versioning
2. **YAML files** - Version-controlled, local development

## Architecture

```
prompts/
├── nko/                        # YAML prompt definitions
│   ├── frame_analysis.yaml     # Multimodal video analysis prompts
│   ├── world_exploration.yaml  # Text-only content generation
│   └── live_api.yaml           # Voice interaction prompts
├── loader.ts                   # TypeScript loader
├── loader.py                   # Python loader
└── README.md                   # This file

Supabase:
└── nko_prompts table           # Database storage with A/B testing
```

## Usage

### TypeScript

```typescript
import { PromptLoader } from './prompts/loader';

const loader = new PromptLoader()
  .withSupabase(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Get a prompt
const prompt = await loader.get('nko_frame');
console.log(prompt.template);

// Get and fill a prompt
const filled = await loader.getAndFill('world_everyday', {
  nko_text: 'ߒߞߏ',
  latin_text: "N'Ko",
  translation: 'I declare'
});
```

### Python

```python
from prompts.loader import PromptLoader

loader = PromptLoader().from_env()

# Get a prompt
prompt = loader.get('nko_frame')
print(prompt.template)

# Get and fill
filled = loader.get_and_fill('world_everyday', {
    'nko_text': 'ߒߞߏ',
    'latin_text': "N'Ko",
    'translation': 'I declare'
})
```

### Rust

```rust
use music_pipeline_analyzer::prompts::{PromptTemplate, get_prompt, PromptBuilder};

// Get a prompt
let content = get_prompt(PromptTemplate::NkoFrame).await?;

// Use builder pattern
let prompt = PromptBuilder::from_template(PromptTemplate::WorldEveryday)
    .with_variable("nko_text", "ߒߞߏ")
    .with_variable("translation", "I declare")
    .build_async()
    .await?;
```

## Prompt Categories

| Category | Cost Tier | Description |
|----------|-----------|-------------|
| `frame_analysis` | Multimodal (~$0.01/call) | Video frame analysis with Gemini Vision |
| `world_exploration` | Text-only (~$0.0001/call) | Generate content variants |
| `live_api` | Live (~$0.005/call) | Real-time voice interaction |

## Available Prompts

### Frame Analysis (Multimodal)
- `nko_frame` - N'Ko educational video frame analysis
- `nko_audio` - N'Ko audio transcription
- `general_frame` - General video frame description
- `text_extraction` - OCR text extraction
- `object_detection` - Object identification
- `scene_understanding` - Comprehensive scene analysis

### World Exploration (Text-only)
- `world_everyday` - Casual conversation variants
- `world_formal` - Formal/official variants
- `world_storytelling` - Griot tradition variants
- `world_proverbs` - Mande wisdom traditions
- `world_educational` - Teaching content

### Live API
- `nko_live_system` - System instruction for voice learning
- `nko_pronunciation_drill` - Pronunciation practice
- `nko_reading` - Reading comprehension
- `nko_conversation` - Conversation practice

## Template Variables

Prompts use `{variable}` syntax for substitution:

```yaml
template: |
  Given the following N'Ko text:
  N'Ko: {nko_text}
  Latin: {latin_text}
  English: {translation}
  
  Generate everyday conversation variants.
```

Common variables:
- `{nko_text}` - N'Ko script text
- `{latin_text}` - Romanized transcription
- `{translation}` - English translation
- `{knowledge}` - Injected knowledge context

## Database Schema

The `nko_prompts` Supabase table supports:

```sql
CREATE TABLE nko_prompts (
    id TEXT PRIMARY KEY,           -- Prompt ID (e.g., 'nko_frame')
    name TEXT NOT NULL,            -- Human-readable name
    description TEXT,              -- What this prompt does
    category prompt_category,      -- frame_analysis, world_exploration, live_api
    cost_tier prompt_cost_tier,    -- text_only, multimodal, live
    template TEXT NOT NULL,        -- The actual prompt with {variables}
    output_schema JSONB,           -- JSON schema for validation
    version TEXT DEFAULT '1.0.0',  -- Version tracking
    active BOOLEAN DEFAULT true,   -- Enable/disable without deleting
    tags TEXT[],                   -- Searchable tags
    
    -- A/B Testing
    experiment_group TEXT,         -- Group for A/B tests
    weight FLOAT DEFAULT 1.0,      -- Selection weight
    
    -- Analytics
    usage_count BIGINT,            -- How many times used
    success_count BIGINT,          -- Successful completions
    total_cost_usd FLOAT,          -- Total cost spent
    avg_latency_ms FLOAT           -- Average response time
);
```

## Adding New Prompts

### Option 1: Add to YAML (for development)

```yaml
# prompts/nko/my_category.yaml
schema_version: "1.0.0"
category: my_category
cost_tier: text_only

prompts:
  my_new_prompt:
    id: my_new_prompt
    name: "My New Prompt"
    description: "What it does"
    template: |
      Your prompt content here.
      Use {variables} for substitution.
```

### Option 2: Add to Supabase (for production)

```sql
INSERT INTO nko_prompts (id, name, category, cost_tier, template)
VALUES (
    'my_new_prompt',
    'My New Prompt',
    'custom',
    'text_only',
    'Your prompt content here.'
);
```

## Environment Variables

```bash
# Required for database loading
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Optional: custom YAML directory
PROMPTS_YAML_DIR=/path/to/prompts
```

## Cost Optimization

The library is designed for cost-effective batch processing:

1. **Stage 1 (Multimodal)**: Frame analysis with `nko_frame` - expensive but necessary
2. **Stage 2 (Text-only)**: World exploration with `world_*` prompts - 10x cheaper

Expected savings:
- 85% frame deduplication
- 30% content filtering  
- 10x cheaper Stage 2

Result: ~$0.08/video vs ~$0.50/video naive approach

