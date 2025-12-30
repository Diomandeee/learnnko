# N'Ko Language Learning Database - Supabase Schema

This directory contains the complete database schema for the N'Ko language learning platform.

## Schema Overview

The database is organized into 6 layers:

### Layer 1: Source Data
- `nko_sources` - Video/media source metadata (YouTube, files)
- `nko_frames` - Individual extracted frames with timestamps

### Layer 2: Detection Data
- `nko_detections` - OCR detections from frames
- `nko_characters` - Character-level breakdown per detection
- `nko_bounding_boxes` - Spatial location of text

### Layer 3: Linguistic Data
- `nko_vocabulary` - Master vocabulary dictionary
- `nko_translations` - Translation pairs (N'Ko, Latin, English, French)
- `nko_examples` - Example sentences
- `nko_phonetics` - Pronunciation data
- `nko_grammar_rules` - Grammatical patterns
- `nko_word_relationships` - Semantic relationships

### Layer 4: User Data
- `nko_users` - User profiles
- `nko_corrections` - User-submitted corrections
- `nko_validations` - Community validation votes
- `nko_feedback` - Quality feedback
- `nko_reports` - Content reports

### Layer 5: Trajectory Data (cc-rag++ compatible)
- `nko_sessions` - Learning sessions
- `nko_learning_events` - Individual learning interactions
- `nko_trajectories` - Learning path tracking (4D/5D DLM)
- `nko_trajectory_nodes` - Individual nodes with phase inference
- `nko_welford_stats` - Running statistics per vocabulary item

### Layer 6: Embedding Data
- `nko_embeddings` - Vector embeddings for semantic search
- `nko_embedding_clusters` - Semantic clusters
- `nko_embedding_cluster_members` - Cluster membership

## Applying Migrations

### Option 1: Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `ALL_MIGRATIONS.sql` and copy its contents
4. Paste into the SQL Editor
5. Click **Run**

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link to your project
supabase link --project-ref zceeunlfhcherokveyek

# Push migrations
supabase db push
```

### Option 3: Run Individual Migrations

If you prefer to run migrations one by one:

```sql
-- Run each migration file in order:
-- 001_enable_extensions.sql
-- 002_source_layer.sql
-- 003_detection_layer.sql
-- 004_linguistic_layer.sql
-- 005_user_layer.sql
-- 006_trajectory_layer.sql
-- 007_embedding_layer.sql
-- 008_indexes.sql
-- 009_rls_policies.sql
```

## Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zceeunlfhcherokveyek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## TypeScript Client

The TypeScript client is available at:

- `src/lib/supabase/client.ts` - Supabase client with helper functions
- `src/lib/supabase/types.ts` - Type definitions for all tables

### Usage Example

```typescript
import { getVocabulary, createTranslation, submitCorrection } from '@/lib/supabase/client';

// Get vocabulary
const vocab = await getVocabulary({ search: 'ߒߞߏ', limit: 10 });

// Create a translation
const translation = await createTranslation({
  nko_text: 'ߒߞߏ',
  english_text: "N'Ko",
  quality_tier: 'gold'
});

// Submit a correction
const correction = await submitCorrection({
  vocabulary_id: vocab[0].id,
  field_corrected: 'english_text',
  original_value: 'Nko',
  corrected_value: "N'Ko",
  correction_type: 'spelling',
  user_id: currentUser.id
});
```

## cc-rag++ Compatibility

The trajectory layer is fully compatible with the cc-rag++ system:

- 4D DLM Coordinates: depth, sibling_order, homogeneity, temporal
- 5D Extension: complexity
- Phase inference: exploration, consolidation, synthesis, debugging, planning
- Salience scores for bounded forgetting
- Welford algorithm for running statistics

## Vector Search

The database supports semantic search via pgvector:

```typescript
// Find similar vocabulary by embedding
const similar = await findSimilarVocabulary(embedding, 10);
```

## Row Level Security

RLS is enabled on all tables with the following policies:

- **Public read**: Core language data is publicly readable
- **Authenticated write**: Users can submit corrections/validations
- **Role-based access**: Contributors, validators, experts, admins have different permissions

## Schema Diagram

```
nko_sources ─┬─→ nko_frames ─→ nko_detections ─→ nko_characters
             │                       │
             └───────────────────────┼─→ nko_translations
                                     │
nko_vocabulary ←─────────────────────┘
      │
      ├─→ nko_examples
      ├─→ nko_phonetics
      ├─→ nko_word_relationships
      └─→ nko_welford_stats

nko_users ─┬─→ nko_corrections
           ├─→ nko_validations
           ├─→ nko_sessions ─→ nko_learning_events
           └─→ nko_trajectories ─→ nko_trajectory_nodes
```

