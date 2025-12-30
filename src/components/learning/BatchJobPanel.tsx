'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  Play,
  Square,
  RefreshCw,
  Download,
  Trash2,
  Clock,
  DollarSign,
  FileText,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

// Types
interface BatchJob {
  job_id: string;
  job_name: string;
  status: string;
  request_count: number;
  estimated_cost_usd: number;
  submitted_at: string;
}

interface BatchStatus {
  job_id: string;
  state: string;
  total_requests: number;
  completed_requests: number;
  failed_requests: number;
  estimated_remaining_secs?: number;
}

interface BatchResults {
  job_id: string;
  total_frames: number;
  nko_frames: number;
  unique_characters: string[];
  unique_words: string[];
  total_cost_usd: number;
  duration_secs: number;
}

type BatchMode = 'bulk_video' | 'training_data' | 'cost_optimized';

const STATE_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  running: 'bg-blue-500',
  succeeded: 'bg-green-500',
  failed: 'bg-red-500',
  cancelled: 'bg-gray-500',
  submitted: 'bg-blue-400',
  active: 'bg-blue-500',
};

const STATE_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  running: <Loader2 className="w-4 h-4 animate-spin" />,
  succeeded: <CheckCircle2 className="w-4 h-4" />,
  failed: <XCircle className="w-4 h-4" />,
  cancelled: <Square className="w-4 h-4" />,
  submitted: <Clock className="w-4 h-4" />,
  active: <Loader2 className="w-4 h-4 animate-spin" />,
};

export function BatchJobPanel() {
  // Form state
  const [mode, setMode] = useState<BatchMode>('bulk_video');
  const [videoUrls, setVideoUrls] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [frameRate, setFrameRate] = useState(0.5);
  const [outputFormat, setOutputFormat] = useState('jsonl');
  const [includeCorrections, setIncludeCorrections] = useState(false);
  
  // Job state
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<BatchJob | null>(null);
  const [jobStatus, setJobStatus] = useState<BatchStatus | null>(null);
  const [jobResults, setJobResults] = useState<BatchResults | null>(null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs on mount
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch job status when a job is selected
  useEffect(() => {
    if (selectedJob) {
      fetchJobStatus(selectedJob.job_id);
      const interval = setInterval(() => fetchJobStatus(selectedJob.job_id), 10000);
      return () => clearInterval(interval);
    }
  }, [selectedJob]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/batch/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  const fetchJobStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/batch/status/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch job status:', err);
    }
  };

  const fetchJobResults = async (jobId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/batch/results/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobResults(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch results');
      }
    } catch (err) {
      setError('Failed to fetch job results');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const urls = videoUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      setError('Please enter at least one video URL');
      setIsSubmitting(false);
      return;
    }

    let requestBody: any = {
      display_name: displayName || undefined,
      mode: {},
    };

    switch (mode) {
      case 'bulk_video':
        requestBody.mode = {
          type: 'bulk_video',
          video_urls: urls,
          frame_rate: frameRate,
        };
        break;
      case 'training_data':
        requestBody.mode = {
          type: 'training_data',
          video_urls: urls,
          output_format: outputFormat,
          include_corrections: includeCorrections,
        };
        break;
      case 'cost_optimized':
        requestBody.mode = {
          type: 'cost_optimized',
          video_url: urls[0],
          priority: 'normal',
        };
        break;
    }

    try {
      const response = await fetch('/api/batch/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        // Clear form and refresh jobs
        setVideoUrls('');
        setDisplayName('');
        await fetchJobs();
        // Select the new job
        setSelectedJob({
          job_id: data.job_id,
          job_name: data.job_name,
          status: data.status,
          request_count: data.request_count,
          estimated_cost_usd: data.estimated_cost_usd,
          submitted_at: data.submitted_at,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit batch job');
      }
    } catch (err) {
      setError('Failed to submit batch job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      const response = await fetch(`/api/batch/cancel/${jobId}`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchJobs();
        if (selectedJob?.job_id === jobId) {
          setSelectedJob(null);
          setJobStatus(null);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel job');
      }
    } catch (err) {
      setError('Failed to cancel job');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Batch Processing
          </h2>
          <p className="text-sm text-muted-foreground">
            Process multiple videos at 50% cost with the Gemini Batch API
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchJobs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-700 dark:text-red-300">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              New Batch Job
            </CardTitle>
            <CardDescription>
              Submit videos for bulk processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Processing Mode</label>
              <Select value={mode} onValueChange={(v) => setMode(v as BatchMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulk_video">
                    Bulk Video Analysis
                  </SelectItem>
                  <SelectItem value="training_data">
                    Training Data Generation
                  </SelectItem>
                  <SelectItem value="cost_optimized">
                    Cost Optimized (Single Video)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Video URLs */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Video URLs (one per line)
              </label>
              <Textarea
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrls}
                onChange={(e) => setVideoUrls(e.target.value)}
                rows={4}
              />
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Job Name (optional)
              </label>
              <Input
                placeholder="My batch job"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            {/* Mode-specific options */}
            {mode === 'bulk_video' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Frame Rate (frames/second)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5"
                  value={frameRate}
                  onChange={(e) => setFrameRate(parseFloat(e.target.value))}
                />
              </div>
            )}

            {mode === 'training_data' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Format</label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jsonl">JSONL</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="parquet">Parquet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeCorrections"
                    checked={includeCorrections}
                    onChange={(e) => setIncludeCorrections(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="includeCorrections" className="text-sm">
                    Include user corrections
                  </label>
                </div>
              </>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !videoUrls.trim()}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Submit Batch Job
                </>
              )}
            </Button>

            {/* Cost Estimate */}
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">
                  50% cost savings with Batch API
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Job Details
            </CardTitle>
            <CardDescription>
              {selectedJob
                ? `Viewing: ${selectedJob.job_name || selectedJob.job_id}`
                : 'Select a job to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedJob && jobStatus ? (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    className={`${STATE_COLORS[jobStatus.state] || 'bg-gray-500'} text-white`}
                  >
                    {STATE_ICONS[jobStatus.state]}
                    <span className="ml-1 capitalize">{jobStatus.state}</span>
                  </Badge>
                </div>

                {/* Progress */}
                {jobStatus.total_requests > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {jobStatus.completed_requests} / {jobStatus.total_requests}
                      </span>
                    </div>
                    <Progress
                      value={
                        (jobStatus.completed_requests / jobStatus.total_requests) * 100
                      }
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Completed</span>
                    <p className="font-medium text-green-600">
                      {jobStatus.completed_requests}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Failed</span>
                    <p className="font-medium text-red-600">
                      {jobStatus.failed_requests}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estimated Cost</span>
                    <p className="font-medium">
                      ${selectedJob.estimated_cost_usd.toFixed(4)}
                    </p>
                  </div>
                  {jobStatus.estimated_remaining_secs && (
                    <div>
                      <span className="text-muted-foreground">Time Remaining</span>
                      <p className="font-medium">
                        {Math.round(jobStatus.estimated_remaining_secs / 60)} min
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {jobStatus.state === 'succeeded' && (
                    <Button
                      variant="outline"
                      onClick={() => fetchJobResults(selectedJob.job_id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Get Results
                    </Button>
                  )}
                  {['pending', 'running', 'submitted', 'active'].includes(
                    jobStatus.state
                  ) && (
                    <Button
                      variant="destructive"
                      onClick={() => handleCancel(selectedJob.job_id)}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>

                {/* Results */}
                {jobResults && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                    <h4 className="font-medium">Results</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Frames</span>
                        <p className="font-medium">{jobResults.total_frames}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">N'Ko Frames</span>
                        <p className="font-medium">{jobResults.nko_frames}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unique Characters</span>
                        <p className="font-medium">
                          {jobResults.unique_characters.length}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Unique Words</span>
                        <p className="font-medium">{jobResults.unique_words.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Cost</span>
                        <p className="font-medium">
                          ${jobResults.total_cost_usd.toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration</span>
                        <p className="font-medium">
                          {Math.round(jobResults.duration_secs / 60)} min
                        </p>
                      </div>
                    </div>
                    {jobResults.unique_words.length > 0 && (
                      <div>
                        <span className="text-muted-foreground text-sm">
                          Sample Words:
                        </span>
                        <p className="font-nko text-lg" dir="rtl">
                          {jobResults.unique_words.slice(0, 5).join(' ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                <p>Select a job from the list below</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Jobs</CardTitle>
          <CardDescription>
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} in queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Est. Cost</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow
                    key={job.job_id}
                    className={`cursor-pointer ${
                      selectedJob?.job_id === job.job_id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <TableCell className="font-medium">
                      {job.job_name || job.job_id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          STATE_COLORS[job.status] || 'bg-gray-500'
                        } text-white`}
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.request_count}</TableCell>
                    <TableCell>${job.estimated_cost_usd.toFixed(4)}</TableCell>
                    <TableCell>
                      {new Date(job.submitted_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(job.job_id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <p>No active batch jobs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default BatchJobPanel;

