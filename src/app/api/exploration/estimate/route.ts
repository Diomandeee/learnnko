import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'https://cc-music-pipeline-owq2vk3wya-uc.a.run.app';

interface EstimateRequest {
  video_count: number;
  enable_stage_2: boolean;
  worlds: string[];
  max_budget: number;
}

interface CostEstimate {
  video_count: number;
  frames_per_video: number;
  stage_1_cost_usd: number;
  stage_2_cost_usd: number;
  total_cost_usd: number;
  within_budget: boolean;
  estimated_duration_secs: number;
  worlds_per_frame: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: EstimateRequest = await req.json();
    
    // Calculate estimate locally (matching BatchScheduler logic)
    const framesPerVideo = 50; // After 85% dedup + ContentClassifier
    const stage1CostPerFrame = 0.01;
    const stage2CostPerWorld = 0.0001;
    const worldsCount = body.enable_stage_2 ? body.worlds.length : 0;
    
    const stage1Total = body.video_count * framesPerVideo * stage1CostPerFrame;
    const stage2Total = body.enable_stage_2 
      ? body.video_count * framesPerVideo * worldsCount * stage2CostPerWorld 
      : 0;
    const total = stage1Total + stage2Total;
    
    // Estimate time (assume 1.5s per frame on average)
    const estimatedDuration = (body.video_count * framesPerVideo * 1.5) / 2; // With concurrency 2
    
    const estimate: CostEstimate = {
      video_count: body.video_count,
      frames_per_video: framesPerVideo,
      stage_1_cost_usd: stage1Total,
      stage_2_cost_usd: stage2Total,
      total_cost_usd: total,
      within_budget: total <= body.max_budget,
      estimated_duration_secs: estimatedDuration,
      worlds_per_frame: worldsCount,
    };
    
    return NextResponse.json(estimate);
  } catch (error) {
    console.error('Estimate error:', error);
    return NextResponse.json(
      { error: 'Failed to estimate cost' },
      { status: 500 }
    );
  }
}

