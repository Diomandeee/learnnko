'use client';

/**
 * LearningHub - Main container for the Real-Time N'Ko Learning Interface
 *
 * This component orchestrates the learning visualization, showing:
 * - Real-time learning progress with confidence bands
 * - Current learning phase with visual timeline
 * - Adaptive frame display with variable timing
 * - Interactive correction panel for user feedback
 * - Trajectory exploration for multi-world generation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import real components
import { ProgressRing } from './visualizations/ProgressRing';
import { PhaseTimeline } from './visualizations/PhaseTimeline';
import { TrajectoryGraph } from './visualizations/TrajectoryGraph';
import { AdaptiveFrameDisplay } from './interactive/AdaptiveFrameDisplay';
import { UserCorrectionPanel } from './interactive/UserCorrectionPanel';
import { NkoTextDisplay } from './nko/NkoTextDisplay';

import type {
  LearningPhase,
  LearningStats,
  FrameData,
  PhaseTransition,
  TrajectoryNode,
  BackendStreamMessage,
  CompletionData,
} from '@/lib/learning/types';
import {
  createEmptyStats,
  transformBackendMessage,
  inferPhaseFromStats,
  PHASE_COLORS,
  PHASE_LABELS,
} from '@/lib/learning/types';

interface LearningHubProps {
  sessionId?: string;
  onStatsUpdate?: (stats: LearningStats) => void;
  onPhaseChange?: (phase: LearningPhase) => void;
  onFrameProcessed?: (frame: FrameData) => void;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function LearningHub({
  sessionId: initialSessionId,
  onStatsUpdate,
  onPhaseChange,
  onFrameProcessed,
}: LearningHubProps) {
  // Learning state
  const [phase, setPhase] = useState<LearningPhase>('exploration');
  const [stats, setStats] = useState<LearningStats>(createEmptyStats());
  const [currentFrame, setCurrentFrame] = useState<FrameData | null>(null);
  const [phaseHistory, setPhaseHistory] = useState<PhaseTransition[]>([]);
  const [trajectoryNodes, setTrajectoryNodes] = useState<TrajectoryNode[]>([]);
  const [isLearning, setIsLearning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Session management
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [videoUrl, setVideoUrl] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase session tracking
  const [dbSessionId, setDbSessionId] = useState<string | null>(null);
  const [trajectoryId, setTrajectoryId] = useState<string | null>(null);
  const frameCountRef = useRef(0);
  const nodeIndexRef = useRef(0);

  // Refs
  const eventSourceRef = useRef<EventSource | null>(null);

  // Create Supabase session and trajectory when analysis starts
  useEffect(() => {
    if (!sessionId) return;

    const createDbSession = async () => {
      try {
        // Create session
        const sessionResponse = await fetch('/api/learning/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_type: 'realtime_learning',
          }),
        });

        const sessionData = await sessionResponse.json();
        if (sessionData.session_id) {
          setDbSessionId(sessionData.session_id);
          console.log('Created Supabase session:', sessionData.session_id);

          // Create trajectory for this session
          const trajectoryResponse = await fetch('/api/learning/trajectory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create',
              session_id: sessionData.session_id,
              trajectory_type: 'learning_path',
            }),
          });

          const trajectoryData = await trajectoryResponse.json();
          if (trajectoryData.trajectory_id) {
            setTrajectoryId(trajectoryData.trajectory_id);
            console.log('Created trajectory:', trajectoryData.trajectory_id);
          }
        }
      } catch (err) {
        console.warn('Failed to create Supabase session:', err);
        // Continue without Supabase tracking
      }
    };

    createDbSession();
  }, [sessionId]);

  // End Supabase session and trajectory on unmount
  useEffect(() => {
    return () => {
      // Complete trajectory
      if (trajectoryId) {
        fetch('/api/learning/trajectory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'complete',
            trajectory_id: trajectoryId,
          }),
        }).catch((err) => console.warn('Failed to complete trajectory:', err));
      }

      // End session
      if (dbSessionId) {
        fetch('/api/learning/session', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: dbSessionId,
            action: 'end',
            data: {
              vocabulary_learned: stats.count,
              final_phase: phase,
              summary: {
                frames_processed: frameCountRef.current,
                mean_confidence: stats.mean,
                trajectory_nodes: nodeIndexRef.current,
              },
            },
          }),
        }).catch((err) => console.warn('Failed to end session:', err));
      }
    };
  }, [dbSessionId, trajectoryId, stats, phase]);

  // Handle SSE connection
  useEffect(() => {
    if (!sessionId) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');
    setIsLearning(true);
    setError(null);

    const eventSource = new EventSource(`/api/learning/stream?sessionId=${sessionId}`);

    eventSource.onopen = () => {
      setConnectionStatus('connected');
      setIsLearning(true);
    };

    eventSource.onmessage = (event) => {
      try {
        // Parse backend message and transform to frontend format
        const backendMessage: BackendStreamMessage = JSON.parse(event.data);
        const message = transformBackendMessage(backendMessage);
        handleStreamMessage(message);
      } catch (e) {
        console.error('Failed to parse SSE message:', e, event.data);
        // Don't set error for parse failures - just log and continue
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      setConnectionStatus('error');
      setIsLearning(false);
      eventSource.close();
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [sessionId]);

  // Handle stream messages (already transformed from backend format)
  const handleStreamMessage = useCallback((message: {
    type: string;
    timestamp: number;
    sessionId: string;
    data?: FrameData | LearningStats | PhaseTransition | TrajectoryNode | CompletionData;
    message?: string;
  }) => {
    switch (message.type) {
      case 'frame':
        const frameData = message.data as FrameData;
        setCurrentFrame(frameData);
        onFrameProcessed?.(frameData);
        frameCountRef.current += 1;

        // Record learning event to Supabase
        if (dbSessionId) {
          fetch('/api/learning/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: dbSessionId,
              event_type: 'frame_view',
              confidence: frameData.confidence,
              metadata: {
                frame_index: frameCountRef.current,
                has_nko_text: Boolean(frameData.content?.nkoText),
              },
            }),
          }).catch((err) => console.debug('Failed to record event:', err));
        }

        // Add node to trajectory
        if (trajectoryId) {
          nodeIndexRef.current += 1;
          fetch('/api/learning/trajectory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'add_node',
              trajectory_id: trajectoryId,
              node_index: nodeIndexRef.current,
              trajectory_depth: Math.min(frameCountRef.current, 10),
              trajectory_phase: phase,
              trajectory_phase_confidence: stats.mean || 0.5,
              salience_score: frameData.confidence || 0.5,
              is_phase_transition: false,
            }),
          }).catch((err) => console.debug('Failed to add trajectory node:', err));
        }
        
        // Infer phase from current state
        setStats(prev => {
          const newPhase = inferPhaseFromStats(prev);
          if (newPhase !== phase) {
            setPhase(newPhase);
            onPhaseChange?.(newPhase);

            // Record phase transition
            if (dbSessionId) {
              fetch('/api/learning/session', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  session_id: dbSessionId,
                  action: 'update_phase',
                  data: { phase: newPhase },
                }),
              }).catch((err) => console.debug('Failed to update phase:', err));
            }
          }
          return prev;
        });
        break;

      case 'stats':
        const newStats = message.data as LearningStats;
        setStats(newStats);
        onStatsUpdate?.(newStats);
        
        // Infer phase from stats
        const inferredPhase = inferPhaseFromStats(newStats);
        if (inferredPhase !== phase) {
          setPhase(inferredPhase);
          setPhaseHistory(prev => [...prev, {
            oldPhase: phase,
            newPhase: inferredPhase,
            reason: 'Inferred from statistics',
          }]);
          onPhaseChange?.(inferredPhase);
        }
        break;

      case 'phase':
        const transition = message.data as PhaseTransition;
        setPhase(transition.newPhase);
        setPhaseHistory(prev => [...prev, transition]);
        onPhaseChange?.(transition.newPhase);
        break;

      case 'trajectory':
        const node = message.data as TrajectoryNode;
        setTrajectoryNodes(prev => [...prev, node]);
        break;

      case 'error':
        setError(message.message || 'An error occurred');
        setConnectionStatus('error');
        break;

      case 'complete':
        const completionData = message.data as CompletionData;
        console.log('Analysis complete:', completionData);
        setConnectionStatus('disconnected');
        setIsLearning(false);
        setIsStarting(false);
        break;
    }
  }, [onStatsUpdate, onPhaseChange, onFrameProcessed, phase]);

  // Handle user corrections (called by UserCorrectionPanel)
  const handleCorrection = useCallback(async (correction: {
    frameId: string;
    originalNko: string;
    correctedNko: string;
    correctionType: 'spelling' | 'tone' | 'meaning' | 'other';
    timestamp: number;
  }) => {
    if (!sessionId) {
      setError('No active session');
      return;
    }

    try {
      const response = await fetch('/api/learning/correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          frame_id: correction.frameId,
          original_nko: correction.originalNko,
          corrected_nko: correction.correctedNko,
          correction_type: correction.correctionType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit correction');
      }

      // Correction submitted successfully
      console.log('Correction submitted:', correction);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Failed to submit correction:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit correction');
    }
  }, [sessionId]);

  // Start analysis handler
  const handleStartAnalysis = useCallback(async () => {
    if (!videoUrl.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setIsStarting(true);
    setError(null);
    setConnectionStatus('connecting');

    try {
      const response = await fetch('/api/learning/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoUrl.trim(),
          mode: 'nko',
          frame_rate: 0.5,
          max_frames: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start analysis');
      }

      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setIsLearning(true);
      } else {
        throw new Error('No session ID returned');
      }
    } catch (error) {
      console.error('Failed to start analysis:', error);
      setError(error instanceof Error ? error.message : 'Failed to start analysis');
      setConnectionStatus('error');
      setIsStarting(false);
    }
  }, [videoUrl]);

  return (
    <div className="space-y-4 p-4">
      {/* Video URL Input Section */}
      {!sessionId && (
        <Card>
          <CardHeader>
            <CardTitle>Start Video Analysis</CardTitle>
            <CardDescription>
              Enter a video URL to begin real-time N&apos;Ko learning analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isStarting) {
                    handleStartAnalysis();
                  }
                }}
                disabled={isStarting}
              />
            </div>
            <Button
              onClick={handleStartAnalysis}
              disabled={isStarting || !videoUrl.trim()}
              className="w-full"
            >
              {isStarting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Analysis...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Analysis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Connection Status */}
      {sessionId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    connectionStatus === 'connected' && 'animate-pulse bg-green-500',
                    connectionStatus === 'connecting' && 'bg-yellow-500',
                    connectionStatus === 'error' && 'bg-red-500',
                    connectionStatus === 'disconnected' && 'bg-gray-400'
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'connecting' && 'Connecting...'}
                  {connectionStatus === 'error' && 'Connection Error'}
                  {connectionStatus === 'disconnected' && 'Disconnected'}
                </span>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {sessionId.slice(0, 8)}...
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Learning Interface */}
      {sessionId && (
        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel: Learning Progress */}
          <Card className="col-span-12 lg:col-span-3">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    isLearning ? 'animate-pulse bg-green-500' : 'bg-gray-400'
                  )}
                />
                {isLearning ? 'Learning in Progress' : 'Ready to Learn'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Progress Ring */}
              <div className="flex justify-center">
                <ProgressRing
                  stats={stats}
                  phase={phase}
                  isActive={isLearning}
                  size="lg"
                />
              </div>

              {/* Stats Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frames Analyzed</span>
                  <span className="font-medium">{stats.framesProcessed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N&apos;Ko Frames</span>
                  <span className="font-medium">{stats.framesWithNko}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Characters</span>
                  <span className="font-medium">{stats.uniqueCharacters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Words</span>
                  <span className="font-medium">{stats.uniqueWords}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-medium">{isNaN(stats.averageConfidence) ? '0.0' : (stats.averageConfidence * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Phase Timeline */}
              <div>
                <h4 className="text-sm font-medium mb-2">Learning Phase</h4>
                <PhaseTimeline
                  currentPhase={phase}
                  transitions={phaseHistory}
                />
              </div>
            </CardContent>
          </Card>

          {/* Center Panel: Content Display */}
          <Card className="col-span-12 lg:col-span-6">
            <CardHeader className="pb-3">
              <CardTitle>Current Content</CardTitle>
            </CardHeader>
            <CardContent>
              {currentFrame ? (
                <div className="space-y-4">
                  <AdaptiveFrameDisplay
                    frame={currentFrame}
                    onUserCorrection={(frame) => {
                      // AdaptiveFrameDisplay provides frame for correction
                      // The actual correction is handled by UserCorrectionPanel
                    }}
                  />
                  <NkoTextDisplay
                    text={currentFrame.content.nkoText}
                    size="xl"
                    showBreakdown={true}
                    validationStatus={currentFrame.validationStatus}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <div className="text-6xl mb-4">ߒߞߏ</div>
                  <p>Waiting for content...</p>
                  <p className="text-sm">Analysis is running. Content will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel: Trajectory & Interaction */}
          <Card className="col-span-12 lg:col-span-3">
            <Tabs defaultValue="phase" className="h-full">
              <TabsList className="grid grid-cols-3 m-2">
                <TabsTrigger value="phase">Phase</TabsTrigger>
                <TabsTrigger value="paths">Paths</TabsTrigger>
                <TabsTrigger value="interact">Interact</TabsTrigger>
              </TabsList>

              <TabsContent value="phase" className="p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Current Phase</h4>
                  <div
                    className="p-4 rounded-lg text-center"
                    style={{ backgroundColor: `${PHASE_COLORS[phase]}20` }}
                  >
                    <div
                      className="text-2xl font-bold mb-1"
                      style={{ color: PHASE_COLORS[phase] }}
                    >
                      {PHASE_LABELS[phase]}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {phase === 'exploration' && 'Discovering new patterns and content'}
                      {phase === 'consolidation' && 'Reinforcing learned patterns'}
                      {phase === 'synthesis' && 'Combining knowledge together'}
                      {phase === 'debugging' && 'Correcting errors and mistakes'}
                      {phase === 'planning' && 'Planning next learning steps'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Phase History</h4>
                    {phaseHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No transitions yet</p>
                    ) : (
                      <div className="space-y-1">
                        {phaseHistory.slice(-5).map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <Badge
                              variant="outline"
                              style={{ borderColor: PHASE_COLORS[t.oldPhase] }}
                            >
                              {PHASE_LABELS[t.oldPhase]}
                            </Badge>
                            <span>→</span>
                            <Badge
                              variant="outline"
                              style={{ borderColor: PHASE_COLORS[t.newPhase] }}
                            >
                              {PHASE_LABELS[t.newPhase]}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="paths" className="p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Learning Paths</h4>
                  {trajectoryNodes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No trajectory nodes yet. As the AI learns, different paths
                      will appear here.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {trajectoryNodes.slice(-10).map((node) => (
                        <div
                          key={node.id}
                          className="p-2 border rounded text-sm"
                        >
                          <div className="font-nko text-right">
                            {node.content.nkoText.slice(0, 30)}
                            {node.content.nkoText.length > 30 && '...'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              Confidence: {Math.round(node.confidence * 100)}%
                            </Badge>
                            {node.worldContext && (
                              <Badge variant="outline" className="text-xs">
                                {node.worldContext}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="interact" className="p-4">
                <UserCorrectionPanel
                  currentFrame={currentFrame}
                  onSubmitCorrection={handleCorrection}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  );
}

export default LearningHub;
