import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'https://cc-music-pipeline-owq2vk3wya-uc.a.run.app';

interface StartRequest {
  video_urls: string[];
  config: {
    max_budget_usd: number;
    max_concurrency: number;
    enable_stage_2: boolean;
    stage_2_worlds: string[];
    inject_knowledge: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: StartRequest = await req.json();
    
    // Validate input
    if (!body.video_urls || body.video_urls.length === 0) {
      return NextResponse.json(
        { error: 'No video URLs provided' },
        { status: 400 }
      );
    }
    
    // Map to batch training submit endpoint
    // The backend has /api/batch/training/submit with TrainingJobRequest format
    const response = await fetch(`${ANALYZER_BACKEND_URL}/api/batch/training/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_urls: body.video_urls,
        output_format: 'jsonl',
        include_corrections: false,
        display_name: `N'Ko Exploration - ${body.video_urls.length} videos`,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Backend batch submit error:', error);
      return NextResponse.json(
        { error: `Backend error: ${error}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    // Return job_id for progress tracking
    return NextResponse.json({
      job_id: data.job_id,
      status: data.status || 'started',
      message: data.message || `Started processing ${body.video_urls.length} videos`,
    });
  } catch (error) {
    console.error('Start exploration error:', error);
    return NextResponse.json(
      { error: 'Failed to start exploration' },
      { status: 500 }
    );
  }
}
