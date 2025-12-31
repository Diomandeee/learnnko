'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  PlayCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Video,
  Zap,
  Clock,
} from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface PipelineEvent {
  id: number;
  type: string;
  videoId: string | null;
  message: string | null;
  data: Record<string, unknown>;
  timestamp: string;
}

interface LiveActivityFeedProps {
  maxEvents?: number;
  showDetectionsOnly?: boolean;
  className?: string;
}

const eventIcons: Record<string, React.ReactNode> = {
  run_start: <PlayCircle className="h-4 w-4 text-cyan-400" />,
  run_complete: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  run_failed: <XCircle className="h-4 w-4 text-red-400" />,
  run_stopped: <Clock className="h-4 w-4 text-amber-400" />,
  video_start: <Video className="h-4 w-4 text-violet-400" />,
  video_complete: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  video_failed: <XCircle className="h-4 w-4 text-red-400" />,
  detection_found: <BookOpen className="h-4 w-4 text-cyan-400" />,
  frame_extracted: <Zap className="h-4 w-4 text-amber-400" />,
  default: <Activity className="h-4 w-4 text-white/40" />,
};

const eventColors: Record<string, string> = {
  run_start: 'border-cyan-500/20 bg-cyan-500/5',
  run_complete: 'border-emerald-500/20 bg-emerald-500/5',
  run_failed: 'border-red-500/20 bg-red-500/5',
  run_stopped: 'border-amber-500/20 bg-amber-500/5',
  video_start: 'border-violet-500/20 bg-violet-500/5',
  video_complete: 'border-emerald-500/20 bg-emerald-500/5',
  video_failed: 'border-red-500/20 bg-red-500/5',
  detection_found: 'border-cyan-500/20 bg-cyan-500/5',
  default: 'border-white/5 bg-white/[0.02]',
};

function formatTimeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function LiveActivityFeed({
  maxEvents = 20,
  showDetectionsOnly = false,
  className = '',
}: LiveActivityFeedProps) {
  const [events, setEvents] = useState<PipelineEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch initial events and set up realtime subscription
  useEffect(() => {
    // Fetch initial events
    const fetchInitialEvents = async () => {
      try {
        const response = await fetch('/api/pipeline/status');
        if (response.ok) {
          const data = await response.json();
          setEvents(data.recentEvents || []);
        }
      } catch (err) {
        console.error('Failed to fetch initial events:', err);
      }
    };

    fetchInitialEvents();

    // Set up Supabase Realtime subscription
    const channel = supabase
      .channel('pipeline-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pipeline_events',
        },
        (payload) => {
          const newEvent: PipelineEvent = {
            id: payload.new.id,
            type: payload.new.event_type,
            videoId: payload.new.video_id,
            message: payload.new.message,
            data: payload.new.data || {},
            timestamp: payload.new.created_at,
          };

          // Filter detections if requested
          if (showDetectionsOnly && newEvent.type !== 'detection_found') {
            return;
          }

          setEvents((prev) => {
            const updated = [newEvent, ...prev].slice(0, maxEvents);
            return updated;
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [maxEvents, showDetectionsOnly]);

  // Filter events if showing detections only
  const displayEvents = showDetectionsOnly
    ? events.filter((e) => e.type === 'detection_found')
    : events;

  return (
    <Card className={`border-white/5 bg-white/[0.02] ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400/60" />
            Live Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'
              }`}
            />
            <span className="text-xs text-white/40">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]" ref={scrollRef}>
          {displayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Events will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${eventColors[event.type] || eventColors.default}
                    animate-in fade-in slide-in-from-top-2 duration-300
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {eventIcons[event.type] || eventIcons.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] border-white/10 bg-white/5"
                        >
                          {event.type.replace(/_/g, ' ')}
                        </Badge>
                        {event.videoId && (
                          <span className="text-xs text-white/30 font-mono truncate">
                            {event.videoId}
                          </span>
                        )}
                      </div>
                      
                      {/* Show N'Ko text prominently for detections */}
                      {event.type === 'detection_found' && event.data?.nko_text && (
                        <div className="nko-text text-lg text-cyan-400 mb-1">
                          {String(event.data.nko_text)}
                        </div>
                      )}
                      
                      {/* Message */}
                      {event.message && (
                        <p className="text-sm text-white/70 truncate">
                          {event.message}
                        </p>
                      )}
                      
                      {/* Additional data for video completions */}
                      {event.type === 'video_complete' && event.data && (
                        <div className="flex gap-3 mt-1 text-xs text-white/40">
                          {event.data.frames !== undefined && (
                            <span>{String(event.data.frames)} frames</span>
                          )}
                          {event.data.detections !== undefined && (
                            <span>{String(event.data.detections)} detections</span>
                          )}
                          {event.data.duration_ms !== undefined && (
                            <span>
                              {(Number(event.data.duration_ms) / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Latin transliteration for detections */}
                      {event.type === 'detection_found' && event.data?.latin_text && (
                        <p className="text-xs text-white/40 font-mono mt-1">
                          {String(event.data.latin_text)}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-white/30 whitespace-nowrap">
                      {formatTimeAgo(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

