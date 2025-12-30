import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'https://cc-music-pipeline-owq2vk3wya-uc.a.run.app';

export async function GET(req: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/batch/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { error: data.error || 'Failed to list batch jobs' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error listing batch jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

