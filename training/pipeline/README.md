# N'Ko Training Data Pipeline

Transform raw Gemini API responses into structured training data for various ML pipelines.

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     N'Ko Training Data Pipeline                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   Raw Responses ──► Transform ──► Validate ──► Export                │
│   (from batch)       │              │            │                   │
│                      │              │            ├─► Hugging Face    │
│                      │              │            ├─► OpenAI          │
│                      │              │            └─► cc-rag++        │
│                      │              │                                │
│                      ▼              ▼                                │
│              Translation       Structural                            │
│              Vocabulary        Validation                            │
│              OCR samples       Unicode rules                         │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Run the complete pipeline
./run_pipeline.sh path/to/raw_responses.jsonl

# Or run individual steps
python transform.py --input raw_responses.jsonl --output training_data/
python validate.py --input training_data/
python export.py --input training_data/ --format all
```

## Components

### 1. Transform (`transform.py`)

Converts raw Gemini API responses into structured training data:

- **Translation samples**: N'Ko text paired with English translations
- **Vocabulary samples**: Individual words with context
- **OCR samples**: Frame references with detected text

**Input**: JSONL file with raw responses from batch processing
**Output**: Structured JSONL files in `training_data/`

### 2. Validate (`validate.py`)

Validates transformed data against N'Ko Unicode standards:

- Character classification (digits, vowels, consonants, combining marks)
- Structural validation (combining mark placement)
- Coverage analysis (% N'Ko characters)
- Duplicate detection

**Input**: `training_data/` directory
**Output**: Validation report with errors and warnings

### 3. Export (`export.py`)

Exports validated data to ML pipeline formats:

- **Hugging Face**: Translation pairs format
- **OpenAI**: Chat fine-tuning format
- **cc-rag++**: Supabase-compatible trajectories

**Input**: `training_data/` directory
**Output**: `exports/{huggingface,openai,ccrag}/`

## Data Formats

### Translation Sample
```json
{
  "id": "uuid",
  "nko_text": "ߒ ߞߊ߲ ߓߍ߲",
  "latin_text": "n ka kan ben",
  "english_translation": "Hello",
  "source_url": "https://youtube.com/watch?v=...",
  "timestamp_ms": 12500,
  "confidence": 0.85,
  "validation_status": {
    "is_valid": true,
    "errors": [],
    "warnings": []
  }
}
```

### Vocabulary Sample
```json
{
  "id": "uuid",
  "nko_word": "ߞߊ߲",
  "latin_word": "kan",
  "meaning": "language",
  "source_url": "https://youtube.com/watch?v=...",
  "timestamp_ms": 12500,
  "sentence_context_nko": "ߒ ߞߊ߲ ߓߍ߲",
  "sentence_context_english": "Hello"
}
```

## N'Ko Unicode Validation

The validator checks N'Ko text against Unicode standards:

| Range | Characters | Description |
|-------|------------|-------------|
| U+07C0–U+07C9 | ߀ ߁ ߂ ߃ ߄ ߅ ߆ ߇ ߈ ߉ | Digits |
| U+07CA–U+07D0 | ߊ ߋ ߌ ߍ ߎ ߏ ߐ | Vowels |
| U+07D1–U+07E7 | ߑ ߒ ߓ ... ߧ | Consonants |
| U+07EB–U+07F5 | ◌߫ ◌߬ ◌߭ ... | Combining marks |
| U+07F6–U+07FF | ߶ ߷ ߸ ߹ | Punctuation |

### Validation Rules

1. **Combining marks** must follow a base character
2. **N'Ko ratio** should be >50% for valid samples
3. **Empty text** is always invalid
4. **Duplicates** are flagged with warnings

## Integration with cc-rag++

The pipeline exports data in cc-rag++ compatible format for Supabase:

```sql
-- Trajectories table
CREATE TABLE nko_trajectories (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ
);

-- Vocabulary table
CREATE TABLE nko_vocabulary (
  id UUID PRIMARY KEY,
  nko_word TEXT NOT NULL,
  latin_word TEXT,
  meaning TEXT,
  context JSONB,
  source_url TEXT,
  created_at TIMESTAMPTZ
);
```

## Requirements

- Python 3.8+
- No external dependencies (uses standard library only)

## License

MIT

