/**
 * WebSocket Manager for N'Ko Inscription System
 *
 * Handles real-time connection to the GCP VM fusion system (136.114.76.114:8765)
 * and manages inscription event streaming at 6Hz.
 *
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Connection status callbacks
 * - Message parsing and validation
 * - Graceful disconnect
 */

import {
  type Inscription,
  type InscriptionWebSocketMessage,
  inscriptionFromWebSocket,
} from './types';
import type { ConnectionStatus } from '@/store/use-inscription-store';

// =====================================================
// CONFIGURATION
// =====================================================

/** WebSocket endpoint for fusion system */
const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_INSCRIPTION_WS_URL ||
  'ws://localhost:8765/fusion/ws?subscribe=inscription';

/** Initial reconnect delay (ms) */
const INITIAL_RECONNECT_DELAY = 2000;

/** Maximum reconnect delay (ms) */
const MAX_RECONNECT_DELAY = 30000;

/** Reconnect backoff multiplier */
const RECONNECT_BACKOFF = 1.5;

// =====================================================
// WEBSOCKET MANAGER CLASS
// =====================================================

export class InscriptionWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectDelay = INITIAL_RECONNECT_DELAY;
  private shouldReconnect = true;
  private url: string;

  // Callbacks
  private onInscriptionCallback: (inscription: Inscription) => void;
  private onStatusChangeCallback: (status: ConnectionStatus, error?: string) => void;

  constructor(
    url: string = WEBSOCKET_URL,
    onInscription: (inscription: Inscription) => void,
    onStatusChange: (status: ConnectionStatus, error?: string) => void
  ) {
    this.url = url;
    this.onInscriptionCallback = onInscription;
    this.onStatusChangeCallback = onStatusChange;
  }

  // =====================================================
  // PUBLIC METHODS
  // =====================================================

  /**
   * Connect to the WebSocket server.
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      console.log('[InscriptionWS] Already connected or connecting');
      return;
    }

    this.shouldReconnect = true;
    this.onStatusChangeCallback('connecting');

    try {
      console.log(`[InscriptionWS] Connecting to ${this.url}...`);
      this.ws = new WebSocket(this.url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('[InscriptionWS] Connection error:', error);
      this.onStatusChangeCallback('error', String(error));
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server.
   * Disables auto-reconnect.
   */
  disconnect(): void {
    console.log('[InscriptionWS] Disconnecting...');
    this.shouldReconnect = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.onStatusChangeCallback('disconnected');
  }

  /**
   * Send a message to the server (for future bidirectional use).
   */
  send(data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[InscriptionWS] Cannot send: not connected');
    }
  }

  /**
   * Check if currently connected.
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  private handleOpen(): void {
    console.log('[InscriptionWS] Connected successfully');
    this.reconnectDelay = INITIAL_RECONNECT_DELAY;
    this.onStatusChangeCallback('connected');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Validate message type
      if (data.type === 'inscription') {
        const inscription = this.parseInscriptionMessage(data);
        if (inscription) {
          this.onInscriptionCallback(inscription);
        }
      } else if (data.type === 'heartbeat') {
        // Heartbeat - no action needed
        console.debug('[InscriptionWS] Heartbeat received');
      } else if (data.type === 'status') {
        // Backend status update - log for debugging
        console.debug('[InscriptionWS] Status:', data);
      } else {
        console.warn('[InscriptionWS] Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('[InscriptionWS] Failed to parse message:', error);
    }
  }

  private handleError(event: Event): void {
    console.error('[InscriptionWS] WebSocket error:', event);
    this.onStatusChangeCallback('error', 'Connection error');
  }

  private handleClose(event: CloseEvent): void {
    console.log('[InscriptionWS] Connection closed:', event.code, event.reason);
    this.ws = null;

    if (this.shouldReconnect) {
      this.onStatusChangeCallback('disconnected');
      this.scheduleReconnect();
    } else {
      this.onStatusChangeCallback('disconnected');
    }
  }

  // =====================================================
  // RECONNECTION LOGIC
  // =====================================================

  private scheduleReconnect(): void {
    if (!this.shouldReconnect) return;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    console.log(`[InscriptionWS] Reconnecting in ${this.reconnectDelay}ms...`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;

      // Exponential backoff
      this.reconnectDelay = Math.min(
        this.reconnectDelay * RECONNECT_BACKOFF,
        MAX_RECONNECT_DELAY
      );

      this.connect();
    }, this.reconnectDelay);
  }

  // =====================================================
  // MESSAGE PARSING
  // =====================================================

  /**
   * Parse and validate an inscription message from the WebSocket.
   */
  private parseInscriptionMessage(data: unknown): Inscription | null {
    try {
      // Basic structure validation
      if (!this.isInscriptionMessage(data)) {
        console.error('[InscriptionWS] Invalid inscription message structure:', data);
        return null;
      }

      // Convert to Inscription object
      const inscription = inscriptionFromWebSocket(data);

      // Validation
      if (!this.validateInscription(inscription)) {
        console.error('[InscriptionWS] Inscription validation failed:', inscription);
        return null;
      }

      return inscription;
    } catch (error) {
      console.error('[InscriptionWS] Failed to parse inscription:', error);
      return null;
    }
  }

  /**
   * Type guard for WebSocket message.
   * Backend sends messages wrapped in MessageEnvelope: { type, timestamp, data }
   */
  private isInscriptionMessage(data: unknown): data is InscriptionWebSocketMessage {
    if (typeof data !== 'object' || data === null) return false;

    const msg = data as Record<string, unknown>;

    // Validate envelope structure
    if (msg.type !== 'inscription') return false;
    if (typeof msg.timestamp !== 'number') return false;
    if (typeof msg.data !== 'object' || msg.data === null) return false;

    // Validate inner data structure
    const innerData = msg.data as Record<string, unknown>;

    return (
      typeof innerData.id === 'string' &&
      typeof innerData.claim_type === 'number' &&
      innerData.claim_type >= 0 &&
      innerData.claim_type <= 9 &&
      typeof innerData.nko_text === 'string' &&
      typeof innerData.timestamp_ms === 'number' &&
      typeof innerData.confidence === 'number' &&
      typeof innerData.provenance === 'object'
    );
  }

  /**
   * Validate inscription data.
   */
  private validateInscription(inscription: Inscription): boolean {
    // ID must be non-empty
    if (!inscription.id) return false;

    // N'Ko text must be non-empty
    if (!inscription.nkoText) return false;

    // Timestamp must be positive
    if (inscription.timestampMs < 0) return false;

    // Confidence must be in [0, 1]
    if (inscription.confidence < 0 || inscription.confidence > 1) return false;

    // Provenance must have fusion frame ID
    if (typeof inscription.provenance.fusionFrameId !== 'number') return false;

    return true;
  }
}

// =====================================================
// HOOK INTEGRATION
// =====================================================

/**
 * React hook for managing WebSocket connection.
 *
 * Usage:
 * ```tsx
 * import { useInscriptionWebSocket } from '@/lib/inscription/websocket';
 *
 * function MyComponent() {
 *   const { ws, isConnected, connect, disconnect } = useInscriptionWebSocket();
 *
 *   useEffect(() => {
 *     connect();
 *     return () => disconnect();
 *   }, []);
 *
 *   return <div>Connected: {isConnected}</div>;
 * }
 * ```
 */
export function useInscriptionWebSocket() {
  const [wsInstance, setWsInstance] = React.useState<InscriptionWebSocket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  const connect = React.useCallback(() => {
    if (!wsInstance) {
      const ws = new InscriptionWebSocket(
        WEBSOCKET_URL,
        (inscription) => {
          // This will be handled by the store
          console.log('[InscriptionWS] Received inscription:', inscription);
        },
        (status) => {
          setIsConnected(status === 'connected');
        }
      );
      setWsInstance(ws);
      ws.connect();
    } else {
      wsInstance.connect();
    }
  }, [wsInstance]);

  const disconnect = React.useCallback(() => {
    if (wsInstance) {
      wsInstance.disconnect();
    }
  }, [wsInstance]);

  return {
    ws: wsInstance,
    isConnected,
    connect,
    disconnect,
  };
}

// Import React for the hook
import * as React from 'react';
