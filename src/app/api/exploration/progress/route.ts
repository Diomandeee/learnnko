import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_BACKEND_URL = process.env.ANALYZER_BACKEND_URL || 'https://cc-music-pipeline-owq2vk3wya-uc.a.run.app';

const defaultProgress = {
  videos_processed: 0,
  total_videos: 0,
  frames_analyzed: 0,
  explorations_generated: 0,
  current_cost_usd: 0,
  status: 'idle' as const,
};

export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get('job_id');
    
    if (!jobId) {
      // No job_id, try to get list of active jobs
      const listResponse = await fetch(`${ANALYZER_BACKEND_URL}/api/batch/jobs`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!listResponse.ok) {
        return NextResponse.json(defaultProgress);
      }
      
      const listData = await listResponse.json();
      const jobs = listData.jobs || [];
      
      // Backend returns: { job_id, job_name, status, request_count, estimated_cost_usd, submitted_at }
      // Status values from backend: "active", "completed", "failed"
      
      // Find the most recent active job
      const activeJob = jobs.find((j: { status: string }) => 
        j.status === 'active'
      );
      
      if (!activeJob) {
        // No active jobs, check for most recent completed
        const completedJob = jobs[0]; // Assuming sorted by recency
        if (completedJob) {
          const statusMapping: Record<string, string> = {
            'active': 'running',
            'completed': 'completed',
            'failed': 'error',
          };
          return NextResponse.json({
            job_id: completedJob.job_id,
            videos_processed: completedJob.request_count || 0,
            total_videos: completedJob.request_count || 0,
            frames_analyzed: (completedJob.request_count || 0) * 50,
            explorations_generated: 0,
            current_cost_usd: completedJob.estimated_cost_usd || 0,
            status: statusMapping[completedJob.status] || completedJob.status || 'completed',
          });
        }
        return NextResponse.json(defaultProgress);
      }
      
      // Return the active job's status
      return NextResponse.json({
        job_id: activeJob.job_id,
        videos_processed: 0, // Will be updated by specific job status call
        total_videos: activeJob.request_count || 0,
        frames_analyzed: 0,
        explorations_generated: 0,
        current_cost_usd: 0,
        status: 'running',
      });
    }
    
    // Specific job_id provided, get its status
    const response = await fetch(`${ANALYZER_BACKEND_URL}/api/batch/status/${jobId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      console.error('Batch status error:', await response.text());
      return NextResponse.json({
        ...defaultProgress,
        job_id: jobId,
        status: 'error',
      });
    }
    
    const data = await response.json();
    
    // Map backend response to frontend expected format
    // Backend: { job_id, state, total_requests, completed_requests, failed_requests, estimated_remaining_secs }
    // Frontend expects: { job_id, videos_processed, total_videos, frames_analyzed, explorations_generated, current_cost_usd, status }
    const statusMapping: Record<string, string> = {
      'processing': 'running',
      'completed': 'completed',
      'failed': 'error',
      'submitted': 'pending',
      'cancelled': 'idle',
    };
    
    return NextResponse.json({
      job_id: data.job_id || jobId,
      videos_processed: data.completed_requests || 0,
      total_videos: data.total_requests || 0,
      frames_analyzed: data.frames_analyzed || (data.completed_requests || 0) * 50, // Estimate
      explorations_generated: data.explorations_generated || 0,
      current_cost_usd: data.total_cost_usd || (data.completed_requests || 0) * 0.01, // Estimate
      status: statusMapping[data.state] || data.state || 'unknown',
      error: data.error,
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(defaultProgress);
  }
}
