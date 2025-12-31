import { NextRequest, NextResponse } from 'next/server';

/**
 * Start Analysis Session - Starts a video analysis on the Rust backend
 * 
 * POST /api/learning/start
 * 
 * Body: {
 *   url: string (required) - Video URL to analyze
 *   mode?: 'nko' | 'general' - Analysis mode (default: 'nko')
 *   frame_rate?: number - Frames per second (default: 0.5)
 *   max_frames?: number - Maximum frames to analyze (default: 500)
 *   max_cost?: number - Maximum cost in USD (optional)
 * }
 * 
 * Returns: {
 *   session_id: string
 *   status: string
 *   stream_url: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, mode = 'nko', frame_rate = 0.5, max_frames = 500, max_cost } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.ANALYZER_BACKEND_URL || 'https://cc-music-pipeline-owq2vk3wya-uc.a.run.app';
    const backendStartUrl = `${backendUrl}/api/analyze/start`;

    const requestBody: Record<string, unknown> = {
      url,
      mode,
      frame_rate,
      max_frames,
    };

    if (max_cost !== undefined) {
      requestBody.max_cost = max_cost;
    }

    const response = await fetch(backendStartUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to start analysis';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error starting analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to start analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

