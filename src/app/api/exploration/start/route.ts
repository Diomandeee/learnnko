import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'http://localhost:8080';

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
    
    // Forward to backend
    const response = await fetch(`${ANALYZER_BACKEND_URL}/api/exploration/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_urls: body.video_urls,
        config: {
          max_budget_usd: body.config.max_budget_usd,
          max_concurrency: body.config.max_concurrency,
          enable_stage_2: body.config.enable_stage_2,
          stage_2_worlds: body.config.stage_2_worlds,
          inject_knowledge: body.config.inject_knowledge,
          inter_video_delay_ms: 1000,
          priority: 'quality',
          stop_on_budget: true,
        },
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${error}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Start exploration error:', error);
    return NextResponse.json(
      { error: 'Failed to start exploration' },
      { status: 500 }
    );
  }
}

