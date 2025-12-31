# Audio Segmentation

This document describes the audio extraction and segmentation system for future ASR integration.

## Purpose

N'Ko educational videos contain spoken explanations alongside visual slides. By extracting and segmenting audio:

1. **Align speech to slides** - Link what's spoken to what's shown
2. **Enable transcription** - Future ASR to get spoken text
3. **Build curriculum** - Audio explanations paired with visual content
4. **Pronunciation training** - Native speaker audio for learners

## Architecture

```
Video File
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AudioExtractor                                │
│                                                                  │
│  ┌────────────────┐    ┌────────────────┐    ┌───────────────┐  │
│  │ Extract Full   │───▶│ Detect Scene   │───▶│ Slice Audio   │  │
│  │ Audio Track    │    │ Timestamps     │    │ by Scene      │  │
│  └────────────────┘    └────────────────┘    └───────────────┘  │
│         │                      │                     │          │
│         ▼                      ▼                     ▼          │
│    audio.m4a            Scene timestamps      segment_*.m4a     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
Video Manifest (JSON)
```

## Process

### Step 1: Extract Full Audio

```python
def extract_full_audio(video_path: str, output_path: str) -> str:
    """Extract audio track from video."""
    cmd = [
        "ffmpeg",
        "-i", video_path,
        "-vn",                    # No video
        "-c:a", "aac",            # AAC codec
        "-b:a", "128k",           # 128 kbps bitrate
        "-ar", "16000",           # 16kHz sample rate (speech-optimized)
        "-ac", "1",               # Mono
        "-map_metadata", "-1",    # Remove metadata
        "-y",                     # Overwrite
        output_path
    ]
    subprocess.run(cmd, check=True)
    return output_path
```

**Output:** `audio.m4a` (~5-10 MB for 60 min video)

### Step 2: Detect Scene Timestamps

Scene timestamps from frame extraction are reused:

```python
def get_scene_timestamps(video_path: str, threshold: float = 0.3) -> List[float]:
    """Detect scene changes in video."""
    # Same scene detection used for frame extraction
    return SceneChangeDetector(threshold).detect_scenes(video_path)
```

**Output:** `[0.0, 45.2, 89.7, 134.1, ...]` (seconds)

### Step 3: Slice Audio by Scene

```python
def slice_audio_segments(
    full_audio_path: str,
    output_dir: str,
    scene_timestamps: List[float],
    video_duration_ms: int,
) -> List[SceneInfo]:
    """Slice audio into scene-aligned segments."""
    
    segments = []
    
    # Add start and end boundaries
    timestamps = [0.0] + scene_timestamps + [video_duration_ms / 1000.0]
    
    for i in range(len(timestamps) - 1):
        start_s = timestamps[i]
        end_s = timestamps[i + 1]
        
        segment_path = f"{output_dir}/segment_{i+1:04d}.m4a"
        
        cmd = [
            "ffmpeg",
            "-i", full_audio_path,
            "-ss", str(start_s),          # Start time
            "-t", str(end_s - start_s),   # Duration
            "-c", "copy",                  # No re-encoding
            "-y",
            segment_path
        ]
        subprocess.run(cmd, check=True)
        
        segments.append(SceneInfo(
            index=i + 1,
            start_ms=int(start_s * 1000),
            end_ms=int(end_s * 1000),
            audio_path=segment_path,
        ))
    
    return segments
```

**Output:** `segment_0001.m4a`, `segment_0002.m4a`, etc.

## Data Structures

```python
@dataclass
class SceneInfo:
    """Metadata for an audio segment."""
    index: int                           # Segment number (1-based)
    start_ms: int                        # Start timestamp
    end_ms: int                          # End timestamp
    duration_ms: int                     # Segment duration
    frame_path: Optional[str] = None     # Associated frame
    audio_path: Optional[str] = None     # Path to audio file
    has_nko: bool = False                # Frame has N'Ko text
    nko_text: Optional[str] = None       # Detected N'Ko
    latin_text: Optional[str] = None     # Transliteration
    english_text: Optional[str] = None   # Translation
    confidence: float = 0.0              # Detection confidence
    transcription: Optional[str] = None  # Future: ASR result

@dataclass
class VideoManifest:
    """Complete manifest for a processed video."""
    video_id: str
    title: str
    youtube_url: str
    channel_name: Optional[str]
    duration_ms: int
    created_at: str
    scenes: List[SceneInfo]
    
    def to_json(self) -> str:
        return json.dumps(asdict(self), indent=2)
```

## File Structure

```
data/videos/{video_id}/
├── audio.m4a                  # Full audio track
├── audio_segments/            # Scene-based segments
│   ├── segment_0001.m4a       # Scene 1 audio
│   ├── segment_0002.m4a       # Scene 2 audio
│   └── ...
├── frames/                    # Extracted frames
│   ├── frame_0001.jpg         # Scene 1 frame
│   ├── frame_0002.jpg         # Scene 2 frame
│   └── ...
└── manifest.json              # All metadata
```

## Manifest Example

```json
{
  "video_id": "xsUrdpKD5wM",
  "title": "N'Ko Lesson 1 - Greetings",
  "youtube_url": "https://www.youtube.com/watch?v=xsUrdpKD5wM",
  "channel_name": "babamamadidiane",
  "duration_ms": 3522000,
  "created_at": "2024-12-31T08:45:00.000Z",
  "scenes": [
    {
      "index": 1,
      "start_ms": 0,
      "end_ms": 45200,
      "duration_ms": 45200,
      "frame_path": "frames/frame_0001.jpg",
      "audio_path": "audio_segments/segment_0001.m4a",
      "has_nko": true,
      "nko_text": "ߒ ߛߐ߰ ߞߊ߲߬",
      "latin_text": "N so kan",
      "english_text": "My greetings",
      "confidence": 0.95,
      "transcription": null
    },
    {
      "index": 2,
      "start_ms": 45200,
      "end_ms": 89700,
      ...
    }
  ]
}
```

## Database Storage

```sql
-- nko_audio_segments table
CREATE TABLE nko_audio_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES nko_sources(id),
    frame_id UUID REFERENCES nko_frames(id),
    segment_index INT NOT NULL,
    start_ms BIGINT NOT NULL,
    end_ms BIGINT NOT NULL,
    audio_path TEXT,
    transcription TEXT,
    transcription_confidence FLOAT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## Configuration

```yaml
# config/production.yaml
audio:
  format: "m4a"           # Output format
  bitrate: "128k"         # Audio quality
  sample_rate: 16000      # Hz (speech-optimized)
  channels: 1             # Mono

storage:
  local:
    keep_audio: true      # Don't delete after processing
```

## Future: ASR Integration

When ASR (Pass 4) is implemented:

```python
async def transcribe_segment(audio_path: str) -> Transcription:
    """Transcribe an audio segment using Whisper."""
    
    # Option 1: OpenAI Whisper API
    with open(audio_path, "rb") as audio:
        response = await openai.audio.transcriptions.create(
            model="whisper-1",
            file=audio,
            language="nqo",  # N'Ko language code
        )
    
    return Transcription(
        text=response.text,
        confidence=response.confidence,
    )
```

### Curriculum Building

With transcriptions:

```
┌─────────────────────────────────────────────────────────────────┐
│  Slide: ߒ ߛߐ߰ ߞߊ߲߬ (N so kan - My greetings)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🖼️ Visual:   [Slide showing N'Ko text]                         │
│                                                                  │
│  🔊 Audio:    "This phrase 'N so kan' is used when..."          │
│               (45 seconds of explanation)                        │
│                                                                  │
│  📝 Text:     [Full transcription of explanation]                │
│                                                                  │
│  ✨ Worlds:   [5 contextual examples]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Cost Estimate

| Component | Calculation | Cost |
|-----------|-------------|------|
| Audio extraction | FFmpeg (local) | $0 |
| Audio storage | ~500 MB total | ~$0.01/month |
| Whisper API | 522 × 60 min × $0.006 | $188 |

**Without ASR: FREE**
**With ASR: ~$188**

