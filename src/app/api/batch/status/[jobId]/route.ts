import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'https://cc-music-pipeline-owq2vk3wya-uc.a.run.app';

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    const response = await fetch(`${BACKEND_URL}/api/batch/status/${jobId}`, {
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
        { error: data.error || 'Failed to get batch status' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error getting batch status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

