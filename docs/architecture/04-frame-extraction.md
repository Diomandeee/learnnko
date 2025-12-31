# Frame Extraction

This document describes the intelligent frame extraction system that optimizes video processing.

## Overview

N'Ko educational videos are primarily slide-based presentations. Naive frame extraction (1 fps) would produce:
- 60 minute video × 60 fps = 3,600 frames
- Most frames are duplicates of the same slide
- Significant API costs for redundant analysis

The `SmartFrameExtractor` reduces this to ~50-100 unique frames per video.

## Architecture

```
Video Input
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SmartFrameExtractor                           │
│                                                                  │
│  ┌────────────────┐    ┌────────────────┐    ┌───────────────┐  │
│  │ Scene Detection │───▶│ Content Filter │───▶│  Deduplication│  │
│  └────────────────┘    └────────────────┘    └───────────────┘  │
│         │                      │                     │          │
│         ▼                      ▼                     ▼          │
│    Scene changes          Skip intros/         Perceptual       │
│    detected              credits              hashing           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
     │
     ▼
Unique Frames (50-100)
```

## Components

### 1. Scene Detection

Detects visual transitions between slides.

```python
class SceneChangeDetector:
    def __init__(
        self,
        threshold: float = 0.3,          # Scene change sensitivity
        min_scene_duration: float = 2.0,  # Minimum scene length (seconds)
    ):
        self.threshold = threshold
        self.min_scene_duration = min_scene_duration
    
    def detect_scenes(self, video_path: str) -> List[float]:
        """Returns timestamps of scene changes."""
        # Uses FFmpeg's scene detection filter
        # ffmpeg -i video.mp4 -vf "select='gt(scene,0.3)'" ...
        pass
```

**How it works:**
1. FFmpeg analyzes frame-to-frame differences
2. When pixel difference exceeds threshold → scene change
3. Groups frames by scene
4. Takes 1 representative frame per scene

**Tuning:**
- `threshold=0.3`: Good for slide transitions
- `threshold=0.5`: More conservative, fewer scenes
- `min_scene_duration=2.0`: Prevents rapid transitions

### 2. Content Filtering

Skips non-educational content.

```python
class ContentFilter:
    def __init__(
        self,
        skip_intro_seconds: float = 10.0,    # Skip video intro
        skip_credits_seconds: float = 30.0,  # Skip end credits
    ):
        pass
    
    def filter(self, frames: List[FrameInfo]) -> List[FrameInfo]:
        """Removes intro/credits frames."""
        return [f for f in frames if self._is_content(f)]
```

**Skipped content:**
- First 10 seconds (intros, logos)
- Last 30 seconds (credits, outros)
- Frames with detected non-N'Ko text only

### 3. Perceptual Hashing

Removes near-duplicate frames.

```python
class PerceptualHashDeduplicator:
    def __init__(
        self,
        hash_size: int = 16,           # Hash resolution
        similarity_threshold: float = 0.95,  # Duplicate threshold
    ):
        pass
    
    def deduplicate(self, frames: List[FrameInfo]) -> List[FrameInfo]:
        """Removes visually similar frames."""
        unique = []
        hashes = set()
        
        for frame in frames:
            phash = compute_phash(frame.path)
            
            if not any(similar(phash, h) for h in hashes):
                unique.append(frame)
                hashes.add(phash)
        
        return unique
```

**How it works:**
1. Resize frame to 16×16 grayscale
2. Compute DCT (frequency transform)
3. Generate 64-bit hash
4. Compare Hamming distance between hashes
5. If distance < threshold → duplicate

## Configuration

```yaml
# config/production.yaml
extraction:
  target_frames: 100            # Max frames per video
  use_scene_detection: true     # Enable scene detection
  scene_threshold: 0.3          # Scene change sensitivity
  min_scene_duration: 2.0       # Min scene length (seconds)
  skip_intro_seconds: 10        # Skip intro
  skip_credits_seconds: 30      # Skip credits
  dedup_threshold: 0.95         # Duplicate similarity threshold
  fallback_to_even: true        # Use even sampling if scene detection fails
```

## Extraction Strategies

### Strategy 1: Scene-Based (Default)

Best for slide presentations.

```
Video: 60 minutes
     │
Scene Detection: 45 scenes detected
     │
Content Filter: 40 scenes (skip intro/credits)
     │
Deduplication: 38 unique frames
     │
Output: 38 frames
```

### Strategy 2: Even Sampling (Fallback)

For videos without clear transitions.

```
Video: 60 minutes (3600 seconds)
     │
Target: 100 frames
Interval: 3600 / 100 = 36 seconds
     │
Deduplication: 85 unique frames
     │
Output: 85 frames
```

### Strategy 3: Hybrid

Combines both approaches.

```
Video: 60 minutes
     │
Scene Detection: 30 scenes
Even Fill: Add 20 more at 2-minute intervals
     │
Total candidates: 50 frames
Deduplication: 48 unique frames
     │
Output: 48 frames
```

## Frame Info Structure

```python
@dataclass
class FrameInfo:
    """Metadata for an extracted frame."""
    path: str              # Local file path
    index: int             # Frame number
    timestamp_ms: int      # Position in video
    scene_index: int       # Which scene it belongs to
    phash: str             # Perceptual hash
    method: str            # 'scene', 'even', or 'hybrid'
```

## Statistics

```python
@dataclass
class FilterStats:
    """Statistics from frame extraction."""
    total_candidates: int      # Initial frame count
    after_scene_detection: int # After scene grouping
    after_content_filter: int  # After skipping intro/credits
    after_deduplication: int   # After removing duplicates
    final_count: int           # Output frames
    reduction_percent: float   # Overall reduction
    method_used: str           # Extraction method
```

## Example Output

```
Processing video: xsUrdpKD5wM (58:42)
  Scene detection: 67 scenes found
  Content filtering: 62 scenes (skipped 5)
  Deduplication: 55 unique frames
  
Filter Statistics:
  Candidates: 3522 (1 fps)
  After scene: 67 (98% reduction)
  After filter: 62 (7% reduction)
  After dedup: 55 (11% reduction)
  Final: 55 frames (98.4% total reduction)
  Method: scene-based
```

## Cost Impact

| Approach | Frames/Video | Cost/Video | Total (522 videos) |
|----------|--------------|------------|-------------------|
| Naive (1 fps) | 3,600 | $7.20 | $3,758 |
| Even (0.2 fps) | 720 | $1.44 | $752 |
| Smart (scene) | 55 | $0.11 | $57 |

**Savings: 98.4% reduction in API costs**

## Troubleshooting

### Scene detection finds too many scenes

Increase threshold:
```yaml
scene_threshold: 0.5  # More conservative
```

### Scene detection finds too few scenes

Use hybrid mode:
```yaml
fallback_to_even: true
target_frames: 100
```

### Frames look similar

Lower dedup threshold:
```yaml
dedup_threshold: 0.90  # Stricter deduplication
```

