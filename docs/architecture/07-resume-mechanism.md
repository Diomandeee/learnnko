# Resume Mechanism

This document describes the checkpoint and resume system for long-running pipeline operations.

## Problem

Processing 522 videos takes 8-12 hours. Without checkpointing:
- Power outages lose all progress
- Network issues require full restart
- Can't pause and resume work
- No visibility into progress

## Solution

A multi-layer resume mechanism:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Resume Mechanism                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐    ┌────────────────┐    ┌───────────────┐  │
│  │ Lock File      │    │ Checkpoint     │    │ Progress      │  │
│  │ (Concurrency)  │    │ (State)        │    │ (Visibility)  │  │
│  └────────────────┘    └────────────────┘    └───────────────┘  │
│         │                      │                     │          │
│         ▼                      ▼                     ▼          │
│  Prevent multi-run      Track completed       Show metrics      │
│                         and failed                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                 Graceful Shutdown                           │ │
│  │  Ctrl+C → Complete current → Save state → Exit cleanly     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Lock File

Prevents concurrent pipeline runs.

```python
LOCK_FILE = Path("data/pipeline.lock")

def create_lock_file() -> int:
    """Create lock file, return file descriptor."""
    LOCK_FILE.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(LOCK_FILE, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
    fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
    os.write(fd, str(os.getpid()).encode())
    return fd

def release_lock_file(fd: int):
    """Release lock file."""
    fcntl.flock(fd, fcntl.LOCK_UN)
    os.close(fd)
    LOCK_FILE.unlink(missing_ok=True)
```

**Usage:**
```bash
# First instance succeeds
python run_extraction.py

# Second instance fails
python run_extraction.py
# Error: Another instance is already running. Use --force to override.

# Force override
python run_extraction.py --force
```

### 2. Checkpoint File

Tracks completed and failed videos.

```python
CHECKPOINT_FILE = Path("data/checkpoints/extraction_checkpoint.json")

@dataclass
class Checkpoint:
    """Pipeline checkpoint state."""
    completed_videos: List[str]    # Successfully processed video IDs
    failed_videos: List[Dict]      # Failed videos with errors
    current_video: Optional[str]   # Currently processing
    started_at: str                # Pipeline start time
    last_updated: str              # Last checkpoint time
    
def load_checkpoint() -> Checkpoint:
    """Load checkpoint from disk."""
    if CHECKPOINT_FILE.exists():
        with open(CHECKPOINT_FILE) as f:
            return Checkpoint(**json.load(f))
    return Checkpoint(
        completed_videos=[],
        failed_videos=[],
        current_video=None,
        started_at=datetime.now().isoformat(),
        last_updated=datetime.now().isoformat(),
    )

def save_checkpoint(checkpoint: Checkpoint):
    """Save checkpoint to disk."""
    checkpoint.last_updated = datetime.now().isoformat()
    with open(CHECKPOINT_FILE, "w") as f:
        json.dump(asdict(checkpoint), f, indent=2)
```

**Checkpoint file example:**
```json
{
  "completed_videos": [
    "xsUrdpKD5wM",
    "arSJHqQGpds",
    "toUJQVnRSbU"
  ],
  "failed_videos": [
    {
      "id": "ylJcGYu9FYM",
      "error": "Download failed: SABR streaming restriction",
      "timestamp": "2024-12-31T10:15:00.000Z"
    }
  ],
  "current_video": "nh8HtWQVKDM",
  "started_at": "2024-12-31T08:45:00.000Z",
  "last_updated": "2024-12-31T11:30:00.000Z"
}
```

### 3. Progress File

Tracks aggregate statistics.

```python
PROGRESS_FILE = Path("data/checkpoints/extraction_progress.json")

@dataclass
class Progress:
    """Pipeline progress metrics."""
    total_videos: int
    processed_videos: int
    total_frames: int
    total_detections: int
    total_audio_segments: int
    total_nko_frames: int
    elapsed_seconds: float
    
def save_progress(progress: Progress):
    """Save progress to disk."""
    with open(PROGRESS_FILE, "w") as f:
        json.dump(asdict(progress), f, indent=2)
```

### 4. Graceful Shutdown

Handle Ctrl+C cleanly.

```python
import signal

def setup_signal_handlers(checkpoint: Checkpoint):
    """Set up graceful shutdown handlers."""
    
    def handle_shutdown(signum, frame):
        print("\n⚠️  Received shutdown signal")
        print("   Completing current video...")
        
        # Mark current video as incomplete
        if checkpoint.current_video:
            checkpoint.failed_videos.append({
                "id": checkpoint.current_video,
                "error": "Interrupted by user",
                "timestamp": datetime.now().isoformat(),
            })
        
        # Save checkpoint
        save_checkpoint(checkpoint)
        print("   ✓ Checkpoint saved")
        print("   Resume with: python run_extraction.py --resume")
        
        sys.exit(0)
    
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)
```

## Resume Logic

```python
async def run_extraction(
    videos: List[Dict],
    resume: bool = False,
    retry_failed: bool = False,
):
    """Run extraction with resume support."""
    
    checkpoint = load_checkpoint()
    
    if resume:
        # Skip already completed videos
        videos = [v for v in videos 
                  if v["video_id"] not in checkpoint.completed_videos]
        print(f"Resuming: {len(videos)} videos remaining")
    
    if retry_failed:
        # Only process previously failed videos
        failed_ids = [f["id"] for f in checkpoint.failed_videos]
        videos = [v for v in videos if v["video_id"] in failed_ids]
        # Clear failed list for retry
        checkpoint.failed_videos = []
        print(f"Retrying: {len(videos)} failed videos")
    
    for video in videos:
        checkpoint.current_video = video["video_id"]
        save_checkpoint(checkpoint)
        
        try:
            await process_video(video)
            checkpoint.completed_videos.append(video["video_id"])
            
        except Exception as e:
            checkpoint.failed_videos.append({
                "id": video["video_id"],
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            })
        
        checkpoint.current_video = None
        save_checkpoint(checkpoint)
```

## Command Line Options

```bash
# Normal run (starts fresh)
python run_extraction.py

# Resume from checkpoint
python run_extraction.py --resume

# Retry only failed videos
python run_extraction.py --retry-failed

# Force run (override lock)
python run_extraction.py --force

# Show status without running
python run_extraction.py --status

# Dry run (list videos without processing)
python run_extraction.py --dry-run
```

## Status Display

```bash
$ python run_extraction.py --status

╔═══════════════════════════════════════════════════════════════╗
║                    Pipeline Status                             ║
╠═══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Videos:     47 / 522 (9.0%)  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░ ║
║  Frames:     2,585 extracted                                   ║
║  N'Ko:       1,847 detections (71%)                            ║
║  Audio:      2,891 segments                                    ║
║  Failed:     2 videos                                          ║
║                                                                ║
║  Elapsed:    2h 15m                                            ║
║  ETA:        ~8h remaining                                     ║
║  Rate:       21 videos/hour                                    ║
║                                                                ║
║  Currently:  Processing nh8HtWQVKDM                            ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝

Failed Videos:
  1. ylJcGYu9FYM - Download failed: SABR streaming restriction
  2. abc123xyz  - API timeout after 3 retries
```

## Recovery Scenarios

### Scenario 1: Power Outage

```
Before: Video 47 of 522 processing
        Checkpoint has 46 completed

After power restored:
$ python run_extraction.py --resume
  → Skips 46 completed
  → Retries video 47
  → Continues from 47
```

### Scenario 2: API Rate Limit

```
During: Video fails with rate limit error
        Checkpoint marks video 47 as failed

Later:
$ python run_extraction.py --resume
  → Skips 46 completed
  → Skips failed 47
  → Continues from 48

Then:
$ python run_extraction.py --retry-failed
  → Only processes failed videos
```

### Scenario 3: User Interruption

```
User presses Ctrl+C during video 47:
  → Current video marked as interrupted
  → Checkpoint saved
  → Clean exit

Later:
$ python run_extraction.py --resume
  → Retries interrupted video
  → Continues normally
```

## Best Practices

1. **Always use --resume** for long runs
2. **Check --status** before starting
3. **Use --retry-failed** after fixing issues
4. **Don't delete checkpoint files** during a run
5. **Keep logs** for debugging failed videos

