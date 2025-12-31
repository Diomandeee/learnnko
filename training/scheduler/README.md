# N'Ko Training Pipeline - Streaming Scheduler

A continuous training loop that processes N'Ko videos from January 1st through January 31st with adjustable throughput.

## 📊 The Math

```
Total Videos:     532 videos
Total Days:       31 days (January)
Total Budget:     $300 (configurable)

Per Video Cost Breakdown:
├── Stage 1 (Multimodal OCR):    50 frames × $0.01  = $0.50
├── Stage 2 (World Exploration): 50 × 5 worlds × $0.0001 = $0.025
└── Total per video: ~$0.525

At current settings:
├── 10 videos/day = $5.25/day × 31 days = $162.75 total
├── 17 videos/day = $8.93/day × 31 days = $276.75 total (on-track pace)
└── 20 videos/day = $10.50/day × 31 days = $325.50 total (exceeds budget)
```

## 🎛️ Rate Control

The scheduler watches `config.yaml` for changes. Modify these values in real-time:

```yaml
throughput:
  videos_per_day: 10      # Start slow
  # Change to 15, 20, etc. to speed up
  # Scheduler auto-detects changes every minute
```

## 🚀 Quick Start

```bash
# Preview the schedule (no processing)
python streaming_scheduler.py --dry-run

# Start the scheduler
python streaming_scheduler.py

# Start fresh (clear progress)
python streaming_scheduler.py --reset
```

## 📈 Scaling Strategy

| Week | videos_per_day | Daily Cost | Cumulative |
|------|---------------|------------|------------|
| 1    | 10            | $5.25      | $36.75     |
| 2    | 15            | $7.88      | $91.91     |
| 3    | 20            | $10.50     | $165.41    |
| 4    | 25            | $13.13     | $257.32    |

This gives you ~489 videos processed, leaving buffer for retries.

## 🔧 Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| `videos_per_day` | Processing rate | 10 |
| `max_daily_budget_usd` | Stop if exceeded | $15 |
| `max_total_budget_usd` | Total budget cap | $300 |
| `min_video_interval_seconds` | Minimum gap | 300 (5 min) |
| `max_concurrent_videos` | Parallelism | 2 |

## 📁 Files

```
training/scheduler/
├── config.yaml           # Main configuration (hot-reloadable)
├── streaming_scheduler.py # The scheduler
├── scheduler_state.json  # Progress checkpoint (auto-created)
├── video_urls.txt        # Cached video list (auto-created)
└── README.md            # This file
```

## 🔄 Adjusting Rate During Run

While the scheduler is running:

1. Open `config.yaml`
2. Change `videos_per_day` to desired rate
3. Save the file
4. Scheduler auto-detects within 1 minute

No restart needed!

## 🛡️ Recovery

The scheduler automatically:
- Saves progress every 10 videos
- Resumes from last checkpoint on restart
- Skips already-processed videos
- Retries failed videos (up to 3 times)

## 📊 Monitoring

Progress reports every 5 minutes show:
- Videos processed / total
- Current spend / budget
- ETA to completion
- On-track status

Metrics exported to Supabase `nko_training_metrics` table.

