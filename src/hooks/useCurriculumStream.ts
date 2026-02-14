/**
 * useCurriculumStream Hook
 *
 * Hook for live SSE streaming of training pipeline events.
 * Connects to the curriculum stream endpoint and processes real-time events.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  CurriculumFrame,
  CurriculumDetection,
  StreamEvent,
  FrameProcessedEvent,
  DetectionFoundEvent,
  UseCurriculumStreamReturn,
} from '@/lib/curriculum/types';

const STREAM_URL = '/api/curriculum/stream';
const RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECENT_DETECTIONS = 50;

/**
 * Hook for streaming live training pipeline events via SSE.
 */
export function useCurriculumStream(): UseCurriculumStreamReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<StreamEvent | null>(null);
  const [currentFrame, setCurrentFrame] = useState<CurriculumFrame | null>(null);
  const [recentDetections, setRecentDetections] = useState<CurriculumDetection[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Connect to the SSE stream.
   */
  const connect = useCallback(() => {
    // Close existing connection if any
    disconnect();

    if (!isMountedRef.current) return;

    try {
      const eventSource = new EventSource(STREAM_URL);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (isMountedRef.current) {
          setIsConnected(true);
          setError(null);
        }
      };

      eventSource.onmessage = (event) => {
        if (!isMountedRef.current) return;

        try {
          const data = JSON.parse(event.data) as StreamEvent;
          handleStreamEvent(data);
        } catch (parseError) {
          console.error('Failed to parse SSE message:', parseError);
        }
      };

      eventSource.onerror = (event) => {
        if (!isMountedRef.current) return;

        console.error('SSE connection error:', event);
        setIsConnected(false);
        setError(new Error('Connection lost'));

        // Close the errored connection
        eventSource.close();
        eventSourceRef.current = null;

        // Attempt to reconnect
        scheduleReconnect();
      };

      // Handle specific event types
      eventSource.addEventListener('frame_processed', (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data) as FrameProcessedEvent;
          handleFrameProcessed(data);
        } catch (e) {
          console.error('Failed to parse frame_processed event:', e);
        }
      });

      eventSource.addEventListener('detection_found', (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data) as DetectionFoundEvent;
          handleDetectionFound(data);
        } catch (e) {
          console.error('Failed to parse detection_found event:', e);
        }
      });

      eventSource.addEventListener('heartbeat', () => {
        // Just update last event time for connection monitoring
        if (isMountedRef.current) {
          setLastEvent({
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
            data: null,
          });
        }
      });
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to connect'));
        scheduleReconnect();
      }
    }
  }, []);

  /**
   * Disconnect from the SSE stream.
   */
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setIsConnected(false);
  }, []);

  /**
   * Schedule a reconnection attempt.
   */
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        connect();
      }
    }, RECONNECT_DELAY);
  }, [connect]);

  /**
   * Handle incoming stream events.
   */
  const handleStreamEvent = useCallback((event: StreamEvent) => {
    setLastEvent(event);

    switch (event.type) {
      case 'frame_processed':
        handleFrameProcessed(event.data as FrameProcessedEvent);
        break;
      case 'detection_found':
        handleDetectionFound(event.data as DetectionFoundEvent);
        break;
      // Other event types can be handled here
    }
  }, []);

  /**
   * Handle frame_processed events.
   */
  const handleFrameProcessed = useCallback((data: FrameProcessedEvent) => {
    setCurrentFrame(data.frame);

    if (data.detections && data.detections.length > 0) {
      setRecentDetections((prev) => {
        const updated = [...data.detections, ...prev];
        return updated.slice(0, MAX_RECENT_DETECTIONS);
      });
    }
  }, []);

  /**
   * Handle detection_found events.
   */
  const handleDetectionFound = useCallback((data: DetectionFoundEvent) => {
    setRecentDetections((prev) => {
      const updated = [data.detection, ...prev];
      return updated.slice(0, MAX_RECENT_DETECTIONS);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    lastEvent,
    currentFrame,
    recentDetections,
    error,
    connect,
    disconnect,
  };
}

export default useCurriculumStream;
