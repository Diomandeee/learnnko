# Pipeline Passes

The N'Ko training pipeline uses a multi-pass architecture to optimize cost and quality.

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        4-Pass Pipeline                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Pass 1         Pass 2          Pass 3           Pass 4             │
│  ┌────────┐    ┌────────┐      ┌────────┐       ┌────────┐          │
│  │Extract │───▶│Consolidate│──▶│Generate│──────▶│Transcribe│        │
│  │$57     │    │ FREE    │    │ $2     │       │ $188     │        │
│  └────────┘    └────────┘      └────────┘       └────────┘          │
│     │              │               │                │               │
│   OCR +          Dedup +         5 Worlds        ASR +              │
│   Audio          Vocab           per phrase      Align              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Pass 1: Extraction

**Script:** `training/scripts/run_extraction.py`

### Purpose
Download videos, extract frames, run OCR, and segment audio.

### Process

```python
for video in channel_videos:
    # 1. Download
    video_path = yt_dlp.download(video.url)
    
    # 2. Extract frames
    frames = SmartFrameExtractor.extract(
        video_path,
        target_frames=100,
        use_scene_detection=True
    )
    
    # 3. OCR each frame
    for frame in frames:
        detection = gemini.analyze(frame)
        supabase.insert_detection(detection)
    
    # 4. Extract audio
    scenes = detect_scenes(video_path)
    audio_segments = slice_audio(video_path, scenes)
    
    # 5. Save manifest
    manifest = VideoManifest(frames, audio_segments)
    manifest.save()
```

### Inputs
- YouTube channel URL
- Configuration file

### Outputs
- `nko_sources` records
- `nko_frames` records
- `nko_detections` records
- Local frame images
- Local audio segments
- Video manifests

### Cost Breakdown

| Component | Calculation | Cost |
|-----------|-------------|------|
| Gemini OCR | 522 × 55 frames × $0.002 | $57.42 |
| yt-dlp | Free | $0 |
| FFmpeg | Free | $0 |
| **Total** | | **~$57** |

### Commands

```bash
# Full run
python run_extraction.py

# Resume from checkpoint
python run_extraction.py --resume

# Process 10 videos
python run_extraction.py --limit 10

# Skip audio
python run_extraction.py --no-audio

# Retry failures
python run_extraction.py --retry-failed
```

---

## Pass 2: Consolidation

**Script:** `training/scripts/run_consolidation.py`

### Purpose
Deduplicate detected N'Ko phrases and build vocabulary.

### Process

```python
# 1. Query all detections
detections = supabase.query("""
    SELECT nko_text, latin_text, english_text, 
           COUNT(*) as frequency
    FROM nko_detections
    WHERE confidence > 0.8
    GROUP BY nko_text_normalized
    ORDER BY frequency DESC
""")

# 2. Normalize text
for detection in detections:
    normalized = normalize_nko(detection.nko_text)
    
# 3. Deduplicate
unique_phrases = deduplicate(detections)

# 4. Build vocabulary
for phrase in unique_phrases:
    supabase.upsert_vocabulary(phrase)
```

### Inputs
- `nko_detections` table

### Outputs
- `nko_vocabulary` table entries
- Deduplication statistics

### Cost Breakdown

| Component | Calculation | Cost |
|-----------|-------------|------|
| Supabase queries | Database operations | $0 |
| **Total** | | **FREE** |

### Commands

```bash
# Run consolidation
python run_consolidation.py

# Export vocabulary
python run_consolidation.py --export vocab.json

# Minimum frequency threshold
python run_consolidation.py --min-frequency 2
```

---

## Pass 3: World Generation

**Script:** `training/scripts/run_worlds.py`

### Purpose
Generate 5 contextual variants for each vocabulary entry.

### Process

```python
# 1. Load vocabulary
vocabulary = supabase.query("SELECT * FROM nko_vocabulary")

# 2. Generate worlds for each phrase
for word in vocabulary:
    worlds = WorldGenerator.generate(
        nko_text=word.nko_text,
        latin_text=word.latin_text,
        english_text=word.english_text,
        worlds=['everyday', 'formal', 'storytelling', 'proverbs', 'educational']
    )
    
    # 3. Create trajectory
    trajectory = supabase.insert_trajectory(
        name=f"worlds_{word.nko_text}",
        trajectory_type="world_exploration"
    )
    
    # 4. Create nodes for each world
    for i, world in enumerate(worlds):
        supabase.insert_trajectory_node(
            trajectory_id=trajectory.id,
            vocabulary_id=word.id,
            node_index=i,
            content_preview=world.sentence
        )
```

### Inputs
- `nko_vocabulary` table

### Outputs
- `nko_trajectories` records
- `nko_trajectory_nodes` records

### The 5 Worlds

| World | Description | Example |
|-------|-------------|---------|
| **Everyday** | Common usage | "ߒ ߦߋ߫ ߕߊ߬ߡߌ߲߬" (I am going to the market) |
| **Formal** | Official/polite | "ߊ߬ ߦߋ߫ ߞߍ߫ ߟߊ߫ ߘߌ߬ߢߍ ߡߊ߬" (It is done with permission) |
| **Storytelling** | Narrative | "ߊ߬ ߕߘߍ߬ ߞߊ߬ ߛߌ߬ ߕߎ߬ ߕߏ߫" (Long ago, there was...) |
| **Proverbs** | Traditional wisdom | "ߓߊ߯ߙߊ ߦߋ߫ ߟߊ߬ߓߊ߮ ߘߌ߫" (Work makes the man) |
| **Educational** | Learning context | "ߛߓߍ ߣߌ߲߬ ߦߋ߫ ..." (This word means...) |

### Cost Breakdown

| Component | Calculation | Cost |
|-----------|-------------|------|
| Gemini text | 3000 × 5 × $0.0001 | $1.50 |
| Buffer | Retries, etc. | $0.50 |
| **Total** | | **~$2** |

### Commands

```bash
# Generate worlds
python run_worlds.py

# Limit to new vocabulary
python run_worlds.py --new-only

# Specific worlds
python run_worlds.py --worlds everyday,formal
```

---

## Pass 4: Transcription (Optional)

**Script:** `training/scripts/run_transcription.py`

### Purpose
Add speech transcriptions to align with visual slides.

### Process

```python
# 1. Load manifests
for video_dir in data/videos/*/: 
    manifest = load_manifest(video_dir / "manifest.json")
    
    # 2. Transcribe each audio segment
    for segment in manifest.scenes:
        audio_path = video_dir / segment.audio_path
        
        transcription = whisper.transcribe(audio_path)
        
        # 3. Store in database
        supabase.update_audio_segment(
            segment_id=segment.id,
            transcription=transcription.text,
            confidence=transcription.confidence
        )
        
        # 4. Link to frame/slide
        align_transcription_to_frame(
            transcription=transcription,
            frame_id=segment.frame_id
        )
```

### Inputs
- Audio segments (local files)
- Video manifests

### Outputs
- `nko_audio_segments.transcription` populated
- Frame-transcription alignments

### Cost Breakdown

| Component | Calculation | Cost |
|-----------|-------------|------|
| Whisper API | 522 × 60 min × $0.006/min | $187.92 |
| **Total** | | **~$188** |

### Commands

```bash
# Transcribe all
python run_transcription.py

# Single video
python run_transcription.py --video-id xsUrdpKD5wM

# Dry run (show what would be transcribed)
python run_transcription.py --dry-run
```

---

## Cost Summary

| Pass | Description | Cost | Required |
|------|-------------|------|----------|
| 1 | Extraction | $57 | ✅ Yes |
| 2 | Consolidation | $0 | ✅ Yes |
| 3 | Worlds | $2 | ✅ Yes |
| 4 | Transcription | $188 | ❌ Optional |
| **Total** | | **$60-$247** | |

## Execution Order

```bash
# Pass 1: Extract (runs for ~8-12 hours)
nohup python run_extraction.py --resume > ../data/logs/pass1.log 2>&1 &

# Wait for Pass 1 to complete, then:

# Pass 2: Consolidate (~5 minutes)
python run_consolidation.py

# Pass 3: Generate worlds (~30 minutes)
python run_worlds.py

# Pass 4: Transcribe (optional, ~4-6 hours)
python run_transcription.py
```

## Pipeline Status

Check progress with:

```bash
python run_extraction.py --status
```

Output:
```
Pipeline Status
===============
Videos: 47/522 (9%)
Frames: 2,585
Detections: 1,847 (71% with N'Ko)
Audio segments: 2,891
Failed: 2
Time elapsed: 2h 15m
ETA: ~8h remaining
```

