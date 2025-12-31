#!/bin/bash
# Start the N'Ko Training Pipeline Streaming Scheduler
# 
# This runs continuously from Jan 1-31, processing videos at a configurable rate.
# Modify config.yaml while running to adjust throughput.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.."

# Load environment
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       N'Ko Training Pipeline - Streaming Scheduler           ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Start Date:    January 1, 2025                              ║"
echo "║  End Date:      January 31, 2025                             ║"
echo "║  Total Videos:  532                                          ║"
echo "║  Budget:        \$300                                         ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  Controls:                                                   ║"
echo "║  - Edit config.yaml to adjust rate (hot-reload)              ║"
echo "║  - Ctrl+C to stop (progress is saved)                        ║"
echo "║  - Run again to resume from checkpoint                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if dry-run
if [ "$1" == "--dry-run" ] || [ "$1" == "-n" ]; then
    echo "🔮 Running in DRY-RUN mode (no processing)"
    python3 training/scheduler/streaming_scheduler.py --dry-run
    exit 0
fi

# Check if reset
if [ "$1" == "--reset" ]; then
    echo "⚠️  Resetting progress..."
    python3 training/scheduler/streaming_scheduler.py --reset
    exit 0
fi

# Start the scheduler
echo "🚀 Starting scheduler..."
echo "   Rate: $(grep 'videos_per_day' training/scheduler/config.yaml | head -1 | awk '{print $2}') videos/day"
echo ""

python3 training/scheduler/streaming_scheduler.py

echo ""
echo "✅ Scheduler stopped"

