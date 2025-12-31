'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  DollarSign, 
  Zap, 
  Clock, 
  BookOpen,
  MessageSquare,
  ScrollText,
  GraduationCap,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

// Types matching the Rust backend
interface CostEstimate {
  video_count: number;
  frames_per_video: number;
  stage_1_cost_usd: number;
  stage_2_cost_usd: number;
  total_cost_usd: number;
  within_budget: boolean;
  estimated_duration_secs: number;
  worlds_per_frame: number;
}

interface BatchProgress {
  job_id?: string;
  videos_processed: number;
  total_videos: number;
  frames_analyzed: number;
  explorations_generated: number;
  current_cost_usd: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'pending' | 'processing';
  current_video?: string;
  error?: string;
}

interface WorldConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const WORLD_CONFIGS: WorldConfig[] = [
  {
    id: 'everyday',
    name: 'Everyday',
    description: 'Casual conversation variants',
    icon: <MessageSquare className="h-4 w-4" />,
    enabled: true,
  },
  {
    id: 'formal',
    name: 'Formal',
    description: 'Official/business variants',
    icon: <ScrollText className="h-4 w-4" />,
    enabled: true,
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Griot tradition variants',
    icon: <BookOpen className="h-4 w-4" />,
    enabled: true,
  },
  {
    id: 'proverbs',
    name: 'Proverbs',
    description: 'Mande wisdom traditions',
    icon: <Sparkles className="h-4 w-4" />,
    enabled: true,
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Teaching content',
    icon: <GraduationCap className="h-4 w-4" />,
    enabled: true,
  },
];

interface ExplorationPanelProps {
  className?: string;
}

export function ExplorationPanel({ className }: ExplorationPanelProps) {
  // Budget and configuration state
  const [maxBudget, setMaxBudget] = useState(10);
  const [concurrency, setConcurrency] = useState(2);
  const [enableStage2, setEnableStage2] = useState(true);
  const [injectKnowledge, setInjectKnowledge] = useState(true);
  const [worlds, setWorlds] = useState<WorldConfig[]>(WORLD_CONFIGS);
  const [videoUrls, setVideoUrls] = useState<string>('');
  
  // Processing state
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [progress, setProgress] = useState<BatchProgress>({
    videos_processed: 0,
    total_videos: 0,
    frames_analyzed: 0,
    explorations_generated: 0,
    current_cost_usd: 0,
    status: 'idle',
  });
  
  // Estimate cost
  const handleEstimate = useCallback(async () => {
    const urls = videoUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) return;
    
    setIsEstimating(true);
    try {
      const enabledWorlds = worlds.filter(w => w.enabled).map(w => w.id);
      const response = await fetch('/api/exploration/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_count: urls.length,
          enable_stage_2: enableStage2,
          worlds: enabledWorlds,
          max_budget: maxBudget,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setEstimate(data);
      }
    } catch (error) {
      console.error('Estimate failed:', error);
    } finally {
      setIsEstimating(false);
    }
  }, [videoUrls, enableStage2, worlds, maxBudget]);
  
  // Start processing
  const handleStart = useCallback(async () => {
    const urls = videoUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) return;
    
    setProgress(prev => ({ ...prev, status: 'running', total_videos: urls.length }));
    
    try {
      const enabledWorlds = worlds.filter(w => w.enabled).map(w => w.id);
      const response = await fetch('/api/exploration/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_urls: urls,
          config: {
            max_budget_usd: maxBudget,
            max_concurrency: concurrency,
            enable_stage_2: enableStage2,
            stage_2_worlds: enabledWorlds,
            inject_knowledge: injectKnowledge,
          },
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to start processing');
      }
      
      const data = await response.json();
      const jobId = data.job_id;
      
      // Update progress with job_id
      setProgress(prev => ({ 
        ...prev, 
        job_id: jobId,
        status: 'running', 
        total_videos: urls.length 
      }));
      
      // Start polling for progress with job_id
      pollProgress(jobId);
    } catch (error) {
      console.error('Start failed:', error);
      setProgress(prev => ({ ...prev, status: 'error', error: String(error) }));
    }
  }, [videoUrls, maxBudget, concurrency, enableStage2, worlds, injectKnowledge]);
  
  // Poll for progress
  const pollProgress = useCallback(async (jobId?: string) => {
    try {
      const url = jobId 
        ? `/api/exploration/progress?job_id=${encodeURIComponent(jobId)}`
        : '/api/exploration/progress';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        
        // Continue polling if still running or processing
        if (data.status === 'running' || data.status === 'processing' || data.status === 'pending') {
          setTimeout(() => pollProgress(jobId || data.job_id), 2000);
        }
      }
    } catch (error) {
      console.error('Progress poll failed:', error);
    }
  }, []);
  
  // Stop processing
  const handleStop = useCallback(async () => {
    try {
      await fetch('/api/exploration/stop', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: progress.job_id }),
      });
      setProgress(prev => ({ ...prev, status: 'idle', job_id: undefined }));
    } catch (error) {
      console.error('Stop failed:', error);
    }
  }, [progress.job_id]);
  
  // Toggle world
  const toggleWorld = useCallback((worldId: string) => {
    setWorlds(prev => 
      prev.map(w => w.id === worldId ? { ...w, enabled: !w.enabled } : w)
    );
  }, []);
  
  const enabledWorldsCount = worlds.filter(w => w.enabled).length;
  const progressPercent = progress.total_videos > 0 
    ? (progress.videos_processed / progress.total_videos) * 100 
    : 0;
  const budgetPercent = maxBudget > 0 
    ? (progress.current_cost_usd / maxBudget) * 100 
    : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Exploration Engine
          </CardTitle>
          <CardDescription>
            Multi-world N'Ko content generation with cost-aware batch processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="worlds">Worlds</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            
            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Budget Control */}
                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Max Budget (USD)
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="budget"
                      min={1}
                      max={100}
                      step={1}
                      value={[maxBudget]}
                      onValueChange={([value]) => setMaxBudget(value)}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-mono">${maxBudget}</span>
                  </div>
                </div>
                
                {/* Concurrency */}
                <div className="space-y-2">
                  <Label htmlFor="concurrency" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Concurrency
                  </Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      id="concurrency"
                      min={1}
                      max={8}
                      step={1}
                      value={[concurrency]}
                      onValueChange={([value]) => setConcurrency(value)}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-mono">{concurrency} videos</span>
                  </div>
                </div>
              </div>
              
              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="stage2"
                    checked={enableStage2}
                    onCheckedChange={setEnableStage2}
                  />
                  <Label htmlFor="stage2">World Exploration (Stage 2)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="knowledge"
                    checked={injectKnowledge}
                    onCheckedChange={setInjectKnowledge}
                    disabled={!enableStage2}
                  />
                  <Label htmlFor="knowledge" className={!enableStage2 ? 'opacity-50' : ''}>
                    Knowledge Injection
                  </Label>
                </div>
              </div>
              
              {/* Video URLs */}
              <div className="space-y-2">
                <Label htmlFor="urls">Video URLs (one per line)</Label>
                <textarea
                  id="urls"
                  className="w-full min-h-[100px] p-2 border rounded-md font-mono text-sm"
                  placeholder="https://youtube.com/watch?v=..."
                  value={videoUrls}
                  onChange={(e) => setVideoUrls(e.target.value)}
                />
              </div>
              
              {/* Estimate */}
              {estimate && (
                <Card className={estimate.within_budget ? 'border-green-500/50' : 'border-red-500/50'}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Videos</p>
                        <p className="font-mono text-lg">{estimate.video_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Frames/Video</p>
                        <p className="font-mono text-lg">~{estimate.frames_per_video}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stage 1 Cost</p>
                        <p className="font-mono text-lg">${estimate.stage_1_cost_usd.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Stage 2 Cost</p>
                        <p className="font-mono text-lg">${estimate.stage_2_cost_usd.toFixed(2)}</p>
                      </div>
                      <div className="col-span-2 md:col-span-4 flex items-center justify-between border-t pt-2">
                        <div>
                          <p className="text-muted-foreground">Total Estimated Cost</p>
                          <p className={`font-mono text-2xl ${estimate.within_budget ? 'text-green-500' : 'text-red-500'}`}>
                            ${estimate.total_cost_usd.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Estimated Time</p>
                          <p className="font-mono text-lg flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {Math.ceil(estimate.estimated_duration_secs / 60)} min
                          </p>
                        </div>
                      </div>
                      {!estimate.within_budget && (
                        <div className="col-span-2 md:col-span-4 flex items-center gap-2 text-red-500 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          Exceeds budget! Increase budget or reduce videos.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleEstimate}
                  disabled={isEstimating || !videoUrls.trim()}
                >
                  {isEstimating ? 'Estimating...' : 'Estimate Cost'}
                </Button>
                <Button
                  onClick={handleStart}
                  disabled={progress.status === 'running' || !videoUrls.trim()}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Processing
                </Button>
              </div>
            </TabsContent>
            
            {/* Worlds Tab */}
            <TabsContent value="worlds" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select which world variants to generate. Each enabled world adds ~$0.0001 per frame.
              </p>
              
              <div className="grid gap-3">
                {worlds.map((world) => (
                  <div
                    key={world.id}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      world.enabled ? 'border-primary/50 bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-md ${world.enabled ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {world.icon}
                      </div>
                      <div>
                        <p className="font-medium">{world.name}</p>
                        <p className="text-sm text-muted-foreground">{world.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={world.enabled}
                      onCheckedChange={() => toggleWorld(world.id)}
                      disabled={!enableStage2}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm text-muted-foreground">
                  {enabledWorldsCount} of {worlds.length} worlds enabled
                </span>
                <Badge variant={enabledWorldsCount > 0 ? 'default' : 'secondary'}>
                  +${(enabledWorldsCount * 0.0001 * 50).toFixed(4)}/frame
                </Badge>
              </div>
            </TabsContent>
            
            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      progress.status === 'running' || progress.status === 'processing' ? 'default' :
                      progress.status === 'pending' ? 'secondary' :
                      progress.status === 'completed' ? 'secondary' :
                      progress.status === 'error' ? 'destructive' : 'outline'
                    }
                    className="text-sm"
                  >
                    {progress.status.toUpperCase()}
                  </Badge>
                  {progress.job_id && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {progress.job_id.slice(0, 8)}...
                    </span>
                  )}
                </div>
                {(progress.status === 'running' || progress.status === 'processing' || progress.status === 'pending') && (
                  <Button variant="destructive" size="sm" onClick={handleStop}>
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Videos Processed</span>
                  <span className="font-mono">
                    {progress.videos_processed} / {progress.total_videos}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
              
              {/* Budget Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Budget Used</span>
                  <span className="font-mono">
                    ${progress.current_cost_usd.toFixed(4)} / ${maxBudget}
                  </span>
                </div>
                <Progress 
                  value={budgetPercent} 
                  className={`h-2 ${budgetPercent > 80 ? '[&>div]:bg-red-500' : ''}`}
                />
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Frames Analyzed</p>
                    <p className="text-2xl font-mono">{progress.frames_analyzed}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Explorations Generated</p>
                    <p className="text-2xl font-mono">{progress.explorations_generated}</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Current Video */}
              {progress.current_video && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Currently Processing</p>
                  <p className="font-mono truncate">{progress.current_video}</p>
                </div>
              )}
              
              {/* Error Display */}
              {progress.error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
                  {progress.error}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

