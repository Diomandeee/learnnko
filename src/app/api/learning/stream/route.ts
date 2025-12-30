import { NextRequest, NextResponse } from 'next/server';

/**
 * SSE Stream Proxy - Proxies Server-Sent Events from Rust backend analyzer
 * 
 * GET /api/learning/stream?sessionId=xxx
 * 
 * This endpoint proxies the SSE stream from the Rust backend analyzer
 * to the frontend, allowing real-time learning updates.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json(
      { error: 'sessionId query parameter is required' },
      { status: 400 }
    );
  }

  const backendUrl = process.env.ANALYZER_BACKEND_URL || 'http://localhost:8080';
  const backendStreamUrl = `${backendUrl}/api/analyze/stream/${sessionId}`;

  try {
    // Proxy SSE stream from backend
    const response = await fetch(backendStreamUrl, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend stream error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: 'Failed to connect to analyzer backend', details: errorText },
        { status: response.status }
      );
    }

    // Return the SSE stream directly to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Error proxying SSE stream:', error);
    return NextResponse.json(
      { error: 'Failed to connect to analyzer backend', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}
