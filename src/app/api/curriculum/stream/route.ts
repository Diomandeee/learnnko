/**
 * GET /api/curriculum/stream
 *
 * Server-Sent Events (SSE) endpoint for real-time pipeline updates.
 * Streams frame_processed, detection_found, and other events.
 * Uses the training database (zceeunlfhcherokveyek).
 */

import { NextRequest } from 'next/server';
import {
  getTrainingSupabase,
  isTrainingDbConfigured,
} from '@/lib/supabase/training-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Check if training database is configured
  if (!isTrainingDbConfigured()) {
    return new Response(
      JSON.stringify({ error: 'Training database not configured' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Create the SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = formatSSEMessage('connected', {
        message: 'Connected to curriculum stream',
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(initialMessage));

      // Set up Supabase realtime subscription
      const supabase = getTrainingSupabase();
      let isActive = true;

      // Subscribe to pipeline_events table for real-time updates
      const channel = supabase
        .channel('curriculum-stream')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pipeline_events',
          },
          (payload) => {
            if (!isActive) return;

            const event = payload.new as Record<string, unknown>;
            const eventType = event.event_type as string;

            // Map database events to SSE events
            if (eventType === 'frame_processed') {
              const message = formatSSEMessage('frame_processed', {
                frame: {
                  id: event.frame_id,
                  runId: event.run_id,
                  frameIndex: event.frame_index,
                  hasNko: event.has_nko,
                  detectionCount: event.detection_count,
                },
                detections: event.detections || [],
              });
              controller.enqueue(encoder.encode(message));
            } else if (eventType === 'detection_found') {
              const message = formatSSEMessage('detection_found', {
                detection: event.detection,
                frameId: event.frame_id,
              });
              controller.enqueue(encoder.encode(message));
            } else if (eventType === 'pass_started' || eventType === 'pass_completed') {
              const message = formatSSEMessage(eventType, {
                pass: event.pass_data,
                previousStatus: event.previous_status,
              });
              controller.enqueue(encoder.encode(message));
            }
          }
        )
        .subscribe();

      // Heartbeat to keep connection alive
      const heartbeatInterval = setInterval(() => {
        if (!isActive) return;
        const heartbeat = formatSSEMessage('heartbeat', {
          timestamp: new Date().toISOString(),
        });
        try {
          controller.enqueue(encoder.encode(heartbeat));
        } catch {
          // Stream may be closed
          clearInterval(heartbeatInterval);
        }
      }, 30000); // Every 30 seconds

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        isActive = false;
        clearInterval(heartbeatInterval);
        supabase.removeChannel(channel);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * Format a message for SSE transmission.
 */
function formatSSEMessage(eventType: string, data: unknown): string {
  const jsonData = JSON.stringify(data);
  return `event: ${eventType}\ndata: ${jsonData}\n\n`;
}
