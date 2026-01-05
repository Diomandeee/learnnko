# LearnN'Ko Architecture

This document provides a comprehensive overview of the LearnN'Ko system architecture, from data ingestion to the learning interface.

## System Overview

LearnN'Ko is an AI-powered N'Ko language learning platform that:

1. **Extracts** N'Ko text from educational YouTube videos
2. **Generates** diverse learning contexts (5 "worlds")
3. **Transcribes** Bambara speech using Jeli ASR
4. **Stores** structured training data in Supabase
5. **Delivers** adaptive learning experiences via the web frontend

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LearnN'Ko Architecture (v2)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐           │
│  │   YouTube    │───▶│   Google     │───▶│   Daily      │           │
│  │   933 Videos │    │   Cloud      │    │   Scheduler  │           │
│  └──────────────┘    │   Storage    │    │   ($2/day)   │           │
│                      └──────────────┘    └──────────────┘           │
│                                                  │                   │
│                             ┌────────────────────┼────────────────┐ │
│                             │                    │                │ │
│                             ▼                    ▼                ▼ │
│                      ┌──────────────┐    ┌──────────────┐  ┌──────┐│
│                      │   Gemini     │    │   Jeli ASR   │  │Supa- ││
│                      │   2.5 Flash  │    │   (Bambara)  │  │base  ││
│                      └──────────────┘    └──────────────┘  └──────┘│
│                             │                    │             │    │
│                             └────────────────────┴─────────────┘    │
│                                                  │                   │
│                                                  ▼                   │
│                                          ┌──────────────┐           │
│                                          │   Next.js    │           │
│                                          │   Frontend   │           │
│                                          └──────────────┘           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Processing Strategy

**60-Day Streaming Pipeline**: Process 933 videos over 60 days at ~$2/day.

| Metric | Value |
|--------|-------|
| Total videos | 933 |
| Videos per day | ~16 |
| Daily budget | $2.00 |
| Total cost | ~$120 |
| OCR model | Gemini 3 Flash (`gemini-3-flash-preview`) |
| ASR model | Jeli ASR (Bambara) |

## Core Components

### 1. Training Pipeline (`/training`)

Python-based video processing pipeline:

| Component | Purpose |
|-----------|---------|
| `NkoAnalyzer` | Video download, frame extraction, Gemini OCR |
| `SmartFrameExtractor` | Scene detection, deduplication |
| `WorldGenerator` | 5-world variant generation |
| `AudioExtractor` | Scene-based audio segmentation |
| `SupabaseClient` | Database operations |

### 2. Database Layer (`/supabase`)

PostgreSQL via Supabase with:

- **12 core tables** for N'Ko learning data
- **Row Level Security** for access control
- **pgvector** for semantic search
- **Real-time subscriptions** for live updates

### 3. Frontend (`/src`)

Next.js 14 application with:

- **App Router** for navigation
- **shadcn/ui** components
- **Tailwind CSS** styling
- **SSE streaming** for real-time learning

### 4. Prompt System (`/prompts`)

YAML-based prompt definitions:

- World exploration prompts
- OCR extraction prompts
- Live API pronunciation prompts

## Architecture Documents

| Document | Description |
|----------|-------------|
| [01-data-flow.md](01-data-flow.md) | End-to-end data flow |
| [02-database-schema.md](02-database-schema.md) | Supabase schema & relationships |
| [03-pipeline-passes.md](03-pipeline-passes.md) | 4-pass pipeline details |
| [04-frame-extraction.md](04-frame-extraction.md) | Smart frame filtering |
| [05-world-generation.md](05-world-generation.md) | 5-world variant system |
| [06-audio-segments.md](06-audio-segments.md) | Audio for future ASR |
| [07-resume-mechanism.md](07-resume-mechanism.md) | Checkpoint/resume system |

## Technology Stack

### Backend/Pipeline

| Technology | Purpose |
|------------|---------|
| Python 3.9+ | Pipeline orchestration |
| yt-dlp | YouTube video download |
| FFmpeg | Frame/audio extraction |
| Gemini 3 Flash | Multimodal OCR, text generation ($0.50/$3 per 1M tokens) |
| Jeli ASR | Bambara speech-to-text (sudoping01/jeli-asr) |
| Google Cloud Storage | Video/audio storage |
| aiohttp | Async HTTP requests |

### Database

| Technology | Purpose |
|------------|---------|
| Supabase | Managed PostgreSQL |
| pgvector | Vector embeddings |
| PostgREST | REST API |

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js 14 | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| Vercel | Hosting |

## Data Flow Summary

```
YouTube Videos
      │
      ▼
┌─────────────────────────────────────────────┐
│           Pass 1: Extraction                 │
│  • Download video                            │
│  • Extract frames (scene detection)          │
│  • OCR with Gemini                           │
│  • Extract audio segments                    │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│          Pass 2: Consolidation               │
│  • Query all detections                      │
│  • Deduplicate N'Ko phrases                  │
│  • Build vocabulary                          │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│         Pass 3: World Generation             │
│  • Load vocabulary                           │
│  • Generate 5 worlds per phrase              │
│  • Store trajectories                        │
└─────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────┐
│        Pass 4: Transcription (Optional)      │
│  • Load audio segments                       │
│  • Jeli ASR (Bambara-optimized)              │
│  • Link to slides                            │
└─────────────────────────────────────────────┘
      │
      ▼
   Supabase
      │
      ▼
   Frontend
```

## Quick Links

- [Training Pipeline README](/training/README.md)
- [Database Migrations](/supabase/migrations/)
- [Frontend Components](/src/components/)
- [Prompt Definitions](/prompts/)

