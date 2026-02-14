// ============================================================
// AGENX — WebSocket Manager
// Broadcasts real-time events to all connected dashboard clients
// ============================================================

import { WebSocketServer, WebSocket } from 'ws';
import { WsEvent, WsEventType } from './types';

let wss: WebSocketServer | null = null;

export function initWebSocket(server: any): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected');
    ws.on('close', () => console.log('[WS] Client disconnected'));
    ws.on('error', (err) => console.error('[WS] Error:', err.message));
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

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
