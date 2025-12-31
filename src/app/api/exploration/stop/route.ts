import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'https://cc-music-pipeline-owq2vk3wya-uc.a.run.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const jobId = body.job_id;
    
    if (!jobId) {
      // No job_id provided, try to find and cancel the active job
      const listResponse = await fetch(`${ANALYZER_BACKEND_URL}/api/batch/jobs`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!listResponse.ok) {
        return NextResponse.json(
          { error: 'Could not get job list' },
          { status: 500 }
        );
      }
      
      const listData = await listResponse.json();
      const jobs = listData.jobs || [];
      
      // Find active job to cancel
      const activeJob = jobs.find((j: { status: string }) => 
        j.status === 'running' || j.status === 'pending' || j.status === 'processing'
      );
      
      if (!activeJob) {
        return NextResponse.json({ success: true, message: 'No active job to cancel' });
      }
      
      // Cancel the found active job
      const cancelResponse = await fetch(`${ANALYZER_BACKEND_URL}/api/batch/cancel/${activeJob.job_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!cancelResponse.ok) {
        const error = await cancelResponse.text();
        return NextResponse.json(
          { error: `Failed to cancel job: ${error}` },
          { status: cancelResponse.status }
        );
      }
      
      return NextResponse.json({ success: true, cancelled_job_id: activeJob.job_id });
    }
    
    // Specific job_id provided, cancel it
    const response = await fetch(`${ANALYZER_BACKEND_URL}/api/batch/cancel/${jobId}`, {
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
    
    return NextResponse.json({ success: true, cancelled_job_id: jobId });
  } catch (error) {
    console.error('Stop exploration error:', error);
    return NextResponse.json(
      { error: 'Failed to stop exploration' },
      { status: 500 }
    );
  }
}
