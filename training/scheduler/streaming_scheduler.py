#!/usr/bin/env python3
"""
N'Ko Training Pipeline - Streaming Scheduler

A continuous training loop that runs from start_date to end_date,
processing videos at a configurable rate with budget controls.

Features:
- Hot-reload config (modify config.yaml while running)
- Budget-aware scheduling
- Adjustable throughput in real-time
- Checkpoint/resume capability
- Detailed logging and metrics
- RAG++ integration for context retrieval and ingestion
- Orchestrator pattern for coordinated processing

Usage:
    python streaming_scheduler.py --config config.yaml
    python streaming_scheduler.py --dry-run  # Preview schedule
"""

import argparse
import asyncio
import json
import os
import signal
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
import yaml

# Add parent directory for local imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

# Import orchestrator and RAG client
from training.orchestrator import TrainingOrchestrator, OrchestratorConfig, ProcessingResult
from training.rag_client import RagClient, RagClientError


@dataclass
class SchedulerState:
    """Persistent state for the scheduler."""
    videos_processed: int = 0
    total_cost_usd: float = 0.0
    frames_analyzed: int = 0
    explorations_generated: int = 0
    last_video_id: Optional[str] = None
    last_checkpoint: Optional[str] = None
    processed_video_ids: List[str] = field(default_factory=list)
    daily_costs: Dict[str, float] = field(default_factory=dict)
    start_time: Optional[str] = None
    errors: List[Dict[str, Any]] = field(default_factory=list)
    # RAG++ tracking
    rag_turns_ingested: int = 0
    rag_context_retrievals: int = 0
    current_session_id: Optional[str] = None


class StreamingScheduler:
    """
    Continuous streaming scheduler for N'Ko video processing.
    
    Uses the TrainingOrchestrator to coordinate:
    - cc-music-pipeline for video analysis
    - RAG++ for context retrieval and ingestion
    
    Watches config file for changes and adjusts throughput in real-time.
    """
    
    def __init__(self, config_path: Path, state_path: Optional[Path] = None):
        self.config_path = config_path
        self.state_path = state_path or config_path.parent / "scheduler_state.json"
        self.config: Dict[str, Any] = {}
        self.state = SchedulerState()
        self.config_mtime = 0
        self.running = False
        self.paused = False
        
        # Orchestrator (initialized after config load)
        self.orchestrator: Optional[TrainingOrchestrator] = None
        
        # Backend URL (fallback if orchestrator not used)
        self.backend_url = os.environ.get(
            "ANALYZER_BACKEND_URL", 
            "https://cc-music-pipeline-513507963446.us-central1.run.app"
        )
        
        # Supabase for metrics
        self.supabase_url = os.environ.get("SUPABASE_URL", "")
        self.supabase_key = os.environ.get("SUPABASE_SERVICE_KEY", "") or \
                           os.environ.get("SUPABASE_SECRET", "") or \
                           os.environ.get("SUPABASE_ANON_KEY", "")
        
        # HTTP client (for direct calls if needed)
        self.client = httpx.AsyncClient(timeout=300)
        
        # Video list
        self.video_urls: List[str] = []
        
    def _create_orchestrator_config(self) -> OrchestratorConfig:
        """Create OrchestratorConfig from scheduler config."""
        oc = OrchestratorConfig()
        
        # Analyzer settings
        analyzer = self.config.get("analyzer", self.config.get("backend_api", {}))
        oc.analyzer_url = analyzer.get("url", self.backend_url)
        oc.analyzer_submit_endpoint = analyzer.get("submit_endpoint", "/api/batch/submit")
        oc.analyzer_status_endpoint = analyzer.get("status_endpoint", "/api/batch/status")
        
        # RAG++ settings
        rag = self.config.get("rag", {})
        oc.rag_enabled = rag.get("enabled", True)
        oc.rag_url = rag.get("url", os.environ.get("RAG_SERVICE_URL", ""))
        oc.rag_project_name = rag.get("project_name", "NKo-Training")
        oc.rag_ingest_training_data = rag.get("ingest_training_data", True)
        oc.rag_context_limit = rag.get("context_limit", 5)
        
        # Prompts settings
        prompts = self.config.get("prompts", {})
        oc.prompts_source = prompts.get("source", "yaml")
        oc.prompts_yaml_dir = prompts.get("yaml_dir", "./prompts/nko")
        
        # Processing settings
        throughput = self.config.get("throughput", {})
        oc.max_frames_per_video = throughput.get("expected_frames_per_video", 50)
        
        stages = self.config.get("stages", {})
        stage2 = stages.get("stage_2_worlds", {})
        if stage2.get("enabled", True):
            oc.enabled_worlds = stage2.get("worlds", [
                "WorldEveryday",
                "WorldFormal",
                "WorldStorytelling",
                "WorldProverbs",
                "WorldEducational",
            ])
        else:
            oc.enabled_worlds = []
        
        return oc
        
    async def load_config(self) -> bool:
        """Load or reload config from YAML file."""
        try:
            mtime = self.config_path.stat().st_mtime
            if mtime != self.config_mtime:
                with open(self.config_path) as f:
                    self.config = yaml.safe_load(f)
                self.config_mtime = mtime
                print(f"[CONFIG] Loaded config from {self.config_path}")
                
                # Recreate orchestrator with new config
                if self.orchestrator:
                    await self.orchestrator.close()
                self.orchestrator = TrainingOrchestrator(self._create_orchestrator_config())
                
                # Start or continue session
                if self.state.current_session_id:
                    self.orchestrator.start_session(self.state.current_session_id)
                
                return True
            return False
        except Exception as e:
            print(f"[ERROR] Failed to load config: {e}")
            return False
    
    def load_state(self):
        """Load scheduler state from disk."""
        if self.state_path.exists():
            with open(self.state_path) as f:
                data = json.load(f)
                self.state = SchedulerState(**data)
            print(f"[STATE] Resumed from checkpoint: {self.state.videos_processed} videos processed")
    
    def save_state(self):
        """Save scheduler state to disk."""
        with open(self.state_path, "w") as f:
            json.dump(self.state.__dict__, f, indent=2, default=str)
    
    async def fetch_video_list(self) -> List[str]:
        """Fetch list of video URLs from YouTube channel."""
        channel = self.config.get("source", {}).get("channel", "@babamamadidiane")
        
        # Check if we have a cached list
        cache_file = self.config_path.parent / "video_urls.txt"
        if cache_file.exists():
            with open(cache_file) as f:
                urls = [line.strip() for line in f if line.strip()]
            print(f"[SOURCE] Loaded {len(urls)} video URLs from cache")
            return urls
        
        # Fetch from yt-dlp (using python -m for better PATH handling)
        print(f"[SOURCE] Fetching video list from {channel}...")
        proc = await asyncio.create_subprocess_exec(
            sys.executable, "-m", "yt_dlp",
            "--flat-playlist",
            "--print", "url",
            f"https://www.youtube.com/{channel}/videos",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        
        if proc.returncode != 0:
            print(f"[ERROR] yt-dlp failed: {stderr.decode()}")
            return []
        
        urls = [line.strip() for line in stdout.decode().split("\n") if line.strip()]
        
        # Cache for future runs
        with open(cache_file, "w") as f:
            f.write("\n".join(urls))
        
        print(f"[SOURCE] Found {len(urls)} videos")
        return urls
    
    def get_remaining_videos(self) -> List[str]:
        """Get videos that haven't been processed yet."""
        skip_processed = self.config.get("source", {}).get("skip_processed", True)
        if not skip_processed:
            return self.video_urls
        
        processed_set = set(self.state.processed_video_ids)
        return [url for url in self.video_urls if url not in processed_set]
    
    def calculate_schedule(self) -> Dict[str, Any]:
        """Calculate the processing schedule based on config."""
        schedule = self.config.get("schedule", {})
        throughput = self.config.get("throughput", {})
        budget = self.config.get("budget", {})
        rag_config = self.config.get("rag", {})
        
        start_date = datetime.fromisoformat(schedule.get("start_date", "2025-01-01"))
        end_date = datetime.fromisoformat(schedule.get("end_date", "2025-01-31"))
        total_days = (end_date - start_date).days + 1
        
        videos_per_day = throughput.get("videos_per_day", 10)
        remaining_videos = len(self.get_remaining_videos())
        
        # Cost estimates
        frames_per_video = throughput.get("expected_frames_per_video", 50)
        worlds_per_frame = throughput.get("worlds_per_frame", 5)
        
        stage1_cost_per_frame = 0.01  # Multimodal
        stage2_cost_per_world = 0.0001  # Text-only
        
        cost_per_video = (
            frames_per_video * stage1_cost_per_frame +
            frames_per_video * worlds_per_frame * stage2_cost_per_world
        )
        
        daily_cost = videos_per_day * cost_per_video
        total_cost = remaining_videos * cost_per_video
        
        # Time to complete
        days_to_complete = remaining_videos / videos_per_day if videos_per_day > 0 else float("inf")
        
        return {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "total_days": total_days,
            "remaining_videos": remaining_videos,
            "videos_per_day": videos_per_day,
            "days_to_complete": days_to_complete,
            "on_track": days_to_complete <= total_days,
            "cost_per_video_usd": cost_per_video,
            "daily_cost_usd": daily_cost,
            "total_cost_usd": total_cost,
            "max_daily_budget_usd": budget.get("max_daily_budget_usd", 15.0),
            "max_total_budget_usd": budget.get("max_total_budget_usd", 300.0),
            "videos_processed": self.state.videos_processed,
            "total_spent_usd": self.state.total_cost_usd,
            "budget_remaining_usd": budget.get("max_total_budget_usd", 300.0) - self.state.total_cost_usd,
            # RAG++ stats
            "rag_enabled": rag_config.get("enabled", True),
            "rag_turns_ingested": self.state.rag_turns_ingested,
            "rag_context_retrievals": self.state.rag_context_retrievals,
        }
    
    def is_within_schedule(self) -> bool:
        """Check if current time is within the active schedule."""
        schedule = self.config.get("schedule", {})
        now = datetime.now()
        
        # Check date range
        start_date = datetime.fromisoformat(schedule.get("start_date", "2025-01-01"))
        end_date = datetime.fromisoformat(schedule.get("end_date", "2025-01-31"))
        if not (start_date <= now <= end_date + timedelta(days=1)):
            return False
        
        # Check active hours
        active_hours = schedule.get("active_hours", {"start": 0, "end": 24})
        hour = now.hour
        if not (active_hours["start"] <= hour < active_hours["end"]):
            return False
        
        # Check active days
        active_days = schedule.get("active_days", list(range(7)))
        if now.weekday() not in active_days:
            return False
        
        return True
    
    def check_budget(self) -> tuple[bool, str]:
        """Check if we're within budget. Returns (ok, reason)."""
        budget = self.config.get("budget", {})
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Check daily budget
        daily_spent = self.state.daily_costs.get(today, 0.0)
        max_daily = budget.get("max_daily_budget_usd", 15.0)
        if daily_spent >= max_daily:
            return False, f"Daily budget exceeded: ${daily_spent:.2f} >= ${max_daily:.2f}"
        
        # Check total budget
        total_spent = self.state.total_cost_usd
        max_total = budget.get("max_total_budget_usd", 300.0)
        if total_spent >= max_total:
            return False, f"Total budget exceeded: ${total_spent:.2f} >= ${max_total:.2f}"
        
        return True, "Within budget"
    
    async def process_video(self, video_url: str) -> Dict[str, Any]:
        """Process a single video through the orchestrator."""
        print(f"[PROCESS] Starting: {video_url}")
        
        # Use orchestrator if available
        if self.orchestrator:
            result: ProcessingResult = await self.orchestrator.process_video(video_url)
            
            return {
                "success": result.status == "COMPLETED",
                "job_id": result.job_id,
                "frames_analyzed": len(result.detections),
                "explorations_generated": len(result.world_variants),
                "cost_usd": result.total_cost_usd,
                "error": result.error,
                "processing_time_seconds": result.processing_time_seconds,
                # RAG++ stats
                "rag_turns_ingested": len(result.rag_turn_ids),
                "detections": [
                    {
                        "text": d.text,
                        "latin": d.latin_transliteration,
                        "english": d.english_translation,
                        "confidence": d.confidence,
                    }
                    for d in result.detections
                ],
            }
        
        # Fallback to direct backend call (legacy mode)
        try:
            response = await self.client.post(
                f"{self.backend_url}/api/batch/submit",
                json={
                    "video_urls": [video_url],
                    "mode": "concurrent",
                    "max_frames": 100,
                    "enable_exploration": self.config.get("stages", {}).get("stage_2_worlds", {}).get("enabled", True),
                },
            )
            
            if response.status_code != 200:
                return {
                    "success": False,
                    "error": f"Submit failed: {response.status_code} - {response.text}",
                    "cost_usd": 0,
                }
            
            job = response.json()
            job_id = job.get("job_id")
            
            # Poll for completion
            while True:
                await asyncio.sleep(5)
                
                status_response = await self.client.get(
                    f"{self.backend_url}/api/batch/status/{job_id}"
                )
                
                if status_response.status_code != 200:
                    continue
                
                status = status_response.json()
                
                if status.get("status") == "completed":
                    return {
                        "success": True,
                        "job_id": job_id,
                        "frames_analyzed": status.get("frames_analyzed", 0),
                        "explorations_generated": status.get("explorations_generated", 0),
                        "cost_usd": status.get("cost_usd", 0.0),
                    }
                elif status.get("status") == "failed":
                    return {
                        "success": False,
                        "job_id": job_id,
                        "error": status.get("error", "Unknown error"),
                        "cost_usd": status.get("cost_usd", 0.0),
                    }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "cost_usd": 0,
            }
    
    async def report_progress(self):
        """Print and optionally export progress report."""
        schedule = self.calculate_schedule()
        
        print("\n" + "=" * 60)
        print("📊 TRAINING PIPELINE STATUS")
        print("=" * 60)
        print(f"Videos Processed: {schedule['videos_processed']} / {schedule['remaining_videos'] + schedule['videos_processed']}")
        print(f"Remaining: {schedule['remaining_videos']} videos")
        print(f"Rate: {schedule['videos_per_day']} videos/day")
        print(f"ETA: {schedule['days_to_complete']:.1f} days")
        print(f"On Track: {'✅ Yes' if schedule['on_track'] else '❌ No'}")
        print("-" * 60)
        print(f"💰 BUDGET")
        print(f"Spent: ${schedule['total_spent_usd']:.2f}")
        print(f"Remaining: ${schedule['budget_remaining_usd']:.2f}")
        print(f"Daily Rate: ${schedule['daily_cost_usd']:.2f}/day")
        print("-" * 60)
        print(f"🔗 RAG++ INTEGRATION")
        print(f"Enabled: {'✅ Yes' if schedule['rag_enabled'] else '❌ No'}")
        print(f"Turns Ingested: {schedule['rag_turns_ingested']}")
        print(f"Context Retrievals: {schedule['rag_context_retrievals']}")
        print("=" * 60 + "\n")
        
        # Export to Supabase if enabled
        if self.config.get("monitoring", {}).get("export_metrics", True) and self.supabase_url:
            await self.export_metrics(schedule)
    
    async def export_metrics(self, schedule: Dict[str, Any]):
        """Export metrics to Supabase."""
        try:
            await self.client.post(
                f"{self.supabase_url}/rest/v1/nko_training_metrics",
                headers={
                    "apikey": self.supabase_key,
                    "Authorization": f"Bearer {self.supabase_key}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
                json={
                    "timestamp": datetime.now().isoformat(),
                    "videos_processed": schedule["videos_processed"],
                    "videos_remaining": schedule["remaining_videos"],
                    "total_cost_usd": schedule["total_spent_usd"],
                    "daily_rate": schedule["videos_per_day"],
                    "on_track": schedule["on_track"],
                    "rag_turns_ingested": schedule["rag_turns_ingested"],
                    "rag_context_retrievals": schedule["rag_context_retrievals"],
                    "metadata": json.dumps(schedule),
                },
            )
        except Exception as e:
            print(f"[WARN] Failed to export metrics: {e}")
    
    async def run(self, dry_run: bool = False):
        """Main scheduler loop."""
        await self.load_config()
        self.load_state()
        
        # Initialize orchestrator
        self.orchestrator = TrainingOrchestrator(self._create_orchestrator_config())
        
        # Start a new session if none exists
        if not self.state.current_session_id:
            self.state.current_session_id = self.orchestrator.start_session()
            print(f"[SESSION] Started new session: {self.state.current_session_id}")
        else:
            self.orchestrator.start_session(self.state.current_session_id)
            print(f"[SESSION] Resumed session: {self.state.current_session_id}")
        
        # Fetch video list
        self.video_urls = await self.fetch_video_list()
        if not self.video_urls:
            print("[ERROR] No videos to process")
            return
        
        # Calculate initial schedule
        schedule = self.calculate_schedule()
        
        if dry_run:
            print("\n🔮 DRY RUN - Schedule Preview")
            await self.report_progress()
            return
        
        print("\n🚀 Starting Streaming Scheduler")
        print(f"   Videos: {len(self.video_urls)}")
        print(f"   Rate: {schedule['videos_per_day']} videos/day")
        print(f"   Budget: ${schedule['max_total_budget_usd']}")
        print(f"   RAG++: {'Enabled' if schedule['rag_enabled'] else 'Disabled'}")
        
        self.running = True
        self.state.start_time = datetime.now().isoformat()
        
        # Calculate interval between videos
        throughput = self.config.get("throughput", {})
        videos_per_day = throughput.get("videos_per_day", 10)
        seconds_per_video = 86400 / videos_per_day if videos_per_day > 0 else 3600
        min_interval = throughput.get("min_video_interval_seconds", 300)
        interval = max(seconds_per_video, min_interval)
        
        last_progress_report = time.time()
        progress_interval = self.config.get("monitoring", {}).get("progress_report_interval", 300)
        
        try:
            while self.running:
                # Hot-reload config
                if await self.load_config():
                    # Recalculate interval on config change
                    throughput = self.config.get("throughput", {})
                    videos_per_day = throughput.get("videos_per_day", 10)
                    seconds_per_video = 86400 / videos_per_day if videos_per_day > 0 else 3600
                    min_interval = throughput.get("min_video_interval_seconds", 300)
                    interval = max(seconds_per_video, min_interval)
                    print(f"[CONFIG] Updated rate: {videos_per_day} videos/day, interval: {interval:.0f}s")
                
                # Check schedule
                if not self.is_within_schedule():
                    print("[SCHEDULE] Outside active hours, waiting...")
                    await asyncio.sleep(60)
                    continue
                
                # Check budget
                budget_ok, budget_reason = self.check_budget()
                if not budget_ok:
                    print(f"[BUDGET] {budget_reason}")
                    if self.config.get("budget", {}).get("pause_on_budget_exceeded", True):
                        print("[BUDGET] Paused. Modify config to resume.")
                        await asyncio.sleep(60)
                        continue
                
                # Get next video
                remaining = self.get_remaining_videos()
                if not remaining:
                    print("[COMPLETE] All videos processed!")
                    await self.report_progress()
                    break
                
                video_url = remaining[0]
                
                # Process video
                result = await self.process_video(video_url)
                
                # Update state
                today = datetime.now().strftime("%Y-%m-%d")
                cost = result.get("cost_usd", 0.0)
                
                self.state.videos_processed += 1
                self.state.total_cost_usd += cost
                self.state.daily_costs[today] = self.state.daily_costs.get(today, 0.0) + cost
                self.state.processed_video_ids.append(video_url)
                self.state.last_video_id = video_url
                
                if result.get("success"):
                    self.state.frames_analyzed += result.get("frames_analyzed", 0)
                    self.state.explorations_generated += result.get("explorations_generated", 0)
                    self.state.rag_turns_ingested += result.get("rag_turns_ingested", 0)
                    print(f"[SUCCESS] {video_url} - ${cost:.4f} - {result.get('rag_turns_ingested', 0)} RAG turns")
                else:
                    self.state.errors.append({
                        "video_url": video_url,
                        "error": result.get("error"),
                        "timestamp": datetime.now().isoformat(),
                    })
                    print(f"[FAILED] {video_url} - {result.get('error')}")
                
                # Save checkpoint
                if self.state.videos_processed % self.config.get("recovery", {}).get("checkpoint_interval", 10) == 0:
                    self.save_state()
                    self.state.last_checkpoint = datetime.now().isoformat()
                
                # Progress report
                if time.time() - last_progress_report > progress_interval:
                    await self.report_progress()
                    last_progress_report = time.time()
                
                # Wait for next video
                print(f"[WAIT] Next video in {interval:.0f}s...")
                await asyncio.sleep(interval)
        
        finally:
            # End session and trigger RAG++ training
            if self.orchestrator:
                print("[SESSION] Ending session and triggering RAG++ training...")
                session_result = await self.orchestrator.end_session()
                print(f"[SESSION] Result: {session_result}")
                await self.orchestrator.close()
            
            # Final save
            self.save_state()
            print("\n✅ Scheduler stopped")
    
    def stop(self):
        """Stop the scheduler gracefully."""
        print("\n[STOP] Shutting down...")
        self.running = False
        self.save_state()


async def main():
    parser = argparse.ArgumentParser(description="N'Ko Training Pipeline Streaming Scheduler")
    parser.add_argument("--config", type=Path, default=Path(__file__).parent / "config.yaml",
                        help="Path to config file")
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview schedule without processing")
    parser.add_argument("--reset", action="store_true",
                        help="Reset state and start fresh")
    args = parser.parse_args()
    
    # Load environment
    env_file = Path(__file__).parent.parent.parent / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ.setdefault(key, value)
    
    scheduler = StreamingScheduler(args.config)
    
    if args.reset:
        if scheduler.state_path.exists():
            scheduler.state_path.unlink()
            print("[RESET] State cleared")
    
    # Handle signals
    def signal_handler(sig, frame):
        scheduler.stop()
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    await scheduler.run(dry_run=args.dry_run)


if __name__ == "__main__":
    asyncio.run(main())
