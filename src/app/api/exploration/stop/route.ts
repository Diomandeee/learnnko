import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'http://localhost:8080';

export async function POST(req: NextRequest) {
  try {
    const response = await fetch(`${ANALYZER_BACKEND_URL}/api/exploration/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${error}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stop exploration error:', error);
    return NextResponse.json(
      { error: 'Failed to stop exploration' },
      { status: 500 }
    );
  }
}

