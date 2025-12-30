# Stage 2: N'Ko Language Model Training Pipeline

**Status**: 📋 PLANNING  
**Start Date**: December 30, 2025  
**Objective**: Process 532 N'Ko educational videos and generate training data for language model fine-tuning

---

## Executive Summary

Stage 2 leverages the infrastructure built in Stage 1 to:

1. **Execute Large-Scale Batch Processing** - Process all 532 N'Ko videos
2. **Generate Training Datasets** - Create JSONL files for model training
3. **Integrate cc-rag-plus-plus** - Store trajectories and learning metrics
4. **Prepare Fine-Tuning Pipeline** - Set up Gemini or custom model training

---

## Phase 2.1: Batch Processing Execution

### Objective
Process the 532 N'Ko educational videos from `@babamamadidiane` YouTube channel.

### Tasks

| Task | Description | Output |
|------|-------------|--------|
| **2.1.1** | Create video URL manifest | `videos.json` with 532 URLs |
| **2.1.2** | Configure batch job settings | Frame rate, dedup threshold |
| **2.1.3** | Submit batch jobs (chunked) | 10-20 videos per batch |
| **2.1.4** | Monitor job progress | Status dashboard |
| **2.1.5** | Collect and merge results | Combined analysis results |

### Implementation

```typescript
// Batch job configuration
const batchConfig = {
  mode: 'training_data_generation',
  frameRate: 0.2,  // 1 frame every 5 seconds
  deduplicationThreshold: 0.85,
  outputFormat: 'jsonl',
  template: 'nko_ocr',
  chunkSize: 20,  // 20 videos per batch job
};
```

### Cost Estimate

| Metric | Value |
|--------|-------|
| Videos | 532 |
| Est. Frames (before dedup) | ~287,000 |
| Est. Frames (after 85% dedup) | ~43,000 |
| Batch API Cost | ~$556 (50% discount) |
| Processing Time | ~24 hours |

---

## Phase 2.2: Training Data Generation

### Objective
Transform Gemini analysis results into structured training datasets.

### Output Formats

#### Format A: N'Ko-English Pairs (Translation)
```jsonl
{"nko": "ߒߞߏ", "english": "N'Ko", "context": "script_name"}
{"nko": "ߌ ߛߋ߲߬ߓߊ", "english": "Hello", "context": "greeting"}
{"nko": "ߊ߬ ߣߌ߫ ߖߐ", "english": "Thank you", "context": "gratitude"}
```

#### Format B: Conversational (Fine-Tuning)
```jsonl
{"messages": [{"role": "user", "content": "How do you say hello in N'Ko?"}, {"role": "assistant", "content": "In N'Ko, hello is 'ߌ ߛߋ߲߬ߓߊ' (I sɛnba), which literally means 'I greet you'."}]}
```

#### Format C: OCR Training (Vision)
```jsonl
{"image": "base64...", "text": "ߒߞߏ ߛߓߍ߬ߟߊ", "latin": "N'Ko sɛbɛla", "translation": "N'Ko writing"}
```

#### Format D: Vocabulary Expansion
```jsonl
{"word": "ߛߓߍ", "latin": "sɛbɛ", "meaning": "to write", "pos": "verb", "examples": ["ߒ ߓߊ߯ ߛߓߍ߬ ߟߊ߫", "I am writing"]}
```

### Tasks

| Task | Description | Output |
|------|-------------|--------|
| **2.2.1** | Define training data schemas | `schemas/training/*.json` |
| **2.2.2** | Create data transformation pipeline | Rust/Python converters |
| **2.2.3** | Implement deduplication at text level | Unique content filter |
| **2.2.4** | Generate Format A (translation pairs) | `training/nko_english.jsonl` |
| **2.2.5** | Generate Format B (conversational) | `training/conversations.jsonl` |
| **2.2.6** | Generate Format C (OCR) | `training/ocr_samples.jsonl` |
| **2.2.7** | Generate Format D (vocabulary) | `training/vocabulary.jsonl` |
| **2.2.8** | Validate all outputs | Validation reports |

---

## Phase 2.3: cc-rag-plus-plus Integration

### Objective
Store processed data in Supabase for trajectory tracking and retrieval.

### Database Tables to Use

| Table | Purpose |
|-------|---------|
| `memory_turns` | Store each processed frame as a learning turn |
| `memory_turn_edges` | Link related content (same video, topic) |
| `memory_motifs` | Extracted patterns (vocabulary, phrases) |
| `memory_conversations` | Group turns by video source |

### Schema Mapping

```sql
-- Each processed frame becomes a memory_turn
INSERT INTO memory_turns (
  conversation_id,      -- Video ID
  content,              -- JSON with nko_text, latin, translation
  trajectory_depth,     -- Frame index
  trajectory_phase,     -- 'extraction' or 'validation'
  salience_score,       -- Confidence from Gemini
  outcome_mean,         -- Running accuracy
  outcome_m2,           -- Welford M2
  outcome_count         -- Total frames
);

-- Vocabulary items become motifs
INSERT INTO memory_motifs (
  motif_type,           -- 'vocabulary', 'phrase', 'pattern'
  content,              -- JSON with word details
  salience_score,       -- Frequency/importance
  embedding             -- Vector for semantic search
);
```

### Tasks

| Task | Description | Output |
|------|-------------|--------|
| **2.3.1** | Set up Supabase connection in backend | `rag-client.rs` |
| **2.3.2** | Create ingestion pipeline | Batch → Supabase |
| **2.3.3** | Implement embedding generation | OpenAI/Gemini embeddings |
| **2.3.4** | Enable semantic search | Hybrid search endpoint |
| **2.3.5** | Connect frontend to trajectory data | Real-time display |

---

## Phase 2.4: Model Fine-Tuning Preparation

### Objective
Prepare datasets for Gemini fine-tuning or custom model training.

### Option A: Gemini Fine-Tuning

```bash
# Gemini fine-tuning requires:
# 1. Training file in JSONL format
# 2. At least 100 examples (we'll have thousands)
# 3. Validation split (10-20%)

gcloud ai models tune \
  --model=gemini-1.5-flash \
  --training-data=gs://bucket/training/nko_conversations.jsonl \
  --validation-split=0.1 \
  --epochs=3
```

### Option B: Open-Source Model (Llama/Mistral)

```python
# Using Hugging Face transformers
from transformers import AutoModelForCausalLM, Trainer

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-3-8B")
trainer = Trainer(
    model=model,
    train_dataset=nko_dataset,
    args=training_args,
)
trainer.train()
```

### Tasks

| Task | Description | Output |
|------|-------------|--------|
| **2.4.1** | Evaluate fine-tuning options | Decision document |
| **2.4.2** | Prepare Gemini fine-tuning dataset | Upload to GCS |
| **2.4.3** | Create train/validation splits | 90/10 split |
| **2.4.4** | Set up fine-tuning job | Cloud job config |
| **2.4.5** | Monitor training metrics | Loss, accuracy |
| **2.4.6** | Evaluate fine-tuned model | Benchmark tests |

---

## Implementation Checklist

### Week 1: Batch Processing

- [ ] **2.1.1** Scrape video URLs from YouTube channel
- [ ] **2.1.2** Create batch job configuration
- [ ] **2.1.3** Submit first test batch (10 videos)
- [ ] **2.1.4** Validate test results
- [ ] **2.1.5** Submit remaining batches (522 videos)
- [ ] **2.1.6** Collect all results

### Week 2: Data Transformation

- [ ] **2.2.1** Define training data schemas
- [ ] **2.2.2** Build transformation pipeline
- [ ] **2.2.3** Generate Format A (translation pairs)
- [ ] **2.2.4** Generate Format B (conversational)
- [ ] **2.2.5** Generate Format D (vocabulary)
- [ ] **2.2.6** Validate and deduplicate

### Week 3: Integration

- [ ] **2.3.1** Set up Supabase connection
- [ ] **2.3.2** Ingest data into memory_turns
- [ ] **2.3.3** Extract and store motifs
- [ ] **2.3.4** Generate embeddings
- [ ] **2.3.5** Enable semantic search

### Week 4: Fine-Tuning

- [ ] **2.4.1** Finalize fine-tuning approach
- [ ] **2.4.2** Prepare and upload datasets
- [ ] **2.4.3** Start fine-tuning job
- [ ] **2.4.4** Evaluate results
- [ ] **2.4.5** Integrate fine-tuned model

---

## File Structure

```
learnnko/
├── training/
│   ├── data/
│   │   ├── nko_english.jsonl          # Translation pairs
│   │   ├── conversations.jsonl         # Fine-tuning conversations
│   │   ├── vocabulary.jsonl            # Vocabulary items
│   │   └── raw/                         # Raw batch results
│   ├── schemas/
│   │   ├── translation.schema.json
│   │   ├── conversation.schema.json
│   │   └── vocabulary.schema.json
│   └── scripts/
│       ├── transform.ts                 # Data transformation
│       ├── validate.ts                  # Validation scripts
│       └── upload.ts                    # GCS upload

cc-music-pipeline/
├── crates/
│   ├── analyzer/
│   │   └── src/
│   │       ├── training/               # NEW: Training data generation
│   │       │   ├── mod.rs
│   │       │   ├── exporter.rs
│   │       │   └── formats.rs
│   │       └── rag/                    # NEW: cc-rag++ integration
│   │           ├── mod.rs
│   │           ├── client.rs
│   │           └── ingestion.rs
```

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Videos Processed | 532/532 (100%) |
| Unique N'Ko Phrases | 5,000+ |
| Vocabulary Items | 2,000+ |
| Training Examples | 10,000+ |
| Fine-Tuned Model Accuracy | >85% on validation |

---

## Dependencies

### From Stage 1 (Complete)
- ✅ Batch processing infrastructure
- ✅ Frame extraction pipeline
- ✅ N'Ko validation layer
- ✅ Cloud Run deployment

### External Requirements
- YouTube channel access for URL extraction
- Supabase project credentials for cc-rag++
- GCS bucket for training data storage
- Gemini API quota for fine-tuning

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Rate limiting on batch jobs | Chunk into smaller batches, use exponential backoff |
| Low-quality OCR results | Implement confidence threshold, human review for low scores |
| Duplicate content | Text-level deduplication after frame deduplication |
| Fine-tuning data too small | Augment with synthetic examples |
| High costs | Monitor closely, use batch API's 50% discount |

---

## Next Steps

1. **Immediate**: Create video URL manifest from YouTube channel
2. **This Week**: Submit test batch of 10 videos
3. **Validate**: Review test results, adjust parameters
4. **Scale**: Process remaining 522 videos

**Ready to begin Phase 2.1?**

