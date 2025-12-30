import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'http://localhost:8080';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${ANALYZER_BACKEND_URL}/api/exploration/progress`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      // Return default idle state if backend not available
      return NextResponse.json({
        videos_processed: 0,
        total_videos: 0,
        frames_analyzed: 0,
        explorations_generated: 0,
        current_cost_usd: 0,
        status: 'idle',
      });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Progress fetch error:', error);
    // Return default state on error
    return NextResponse.json({
      videos_processed: 0,
      total_videos: 0,
      frames_analyzed: 0,
      explorations_generated: 0,
      current_cost_usd: 0,
      status: 'idle',
    });
  }
}

