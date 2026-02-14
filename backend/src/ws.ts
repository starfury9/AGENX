// ============================================================
// AGENX — WebSocket Manager
// Broadcasts real-time events to all connected dashboard clients
// ============================================================

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { WsEvent, WsEventType } from './types';

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WS] Client connected');
    ws.on('close', () => console.log('[WS] Client disconnected'));
    ws.on('error', (err: Error) => console.error('[WS] Error:', err.message));
  });

  console.log('[WS] WebSocket server initialized on /ws');
  return wss;
}

export function broadcast(type: WsEventType, payload: unknown): void {
  if (!wss) return;

  const event: WsEvent = {
    type,
    payload,
    timestamp: Date.now(),
  };

  const data = JSON.stringify(event);

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
