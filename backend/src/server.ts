// ============================================================
// AGENX — Main Server
// Express + WebSocket server for the Agent Social Network
// ============================================================

import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { initWebSocket } from './ws';
import { seedDemoData } from './seed';

// Routes
import agentRoutes from './routes/agents';
import taskRoutes from './routes/tasks';
import messageRoutes from './routes/messages';
import feedRoutes from './routes/feed';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001');
const app = express();

// ── Middleware ────────────────────────────────────────────────

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// ── Request Logging ──────────────────────────────────────────

app.use((req, _res, next) => {
  if (req.method !== 'GET') {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// ── Routes ───────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'AGENX Backend',
    version: '1.0.0',
    timestamp: Date.now(),
  });
});

app.use('/api/agents', agentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/feed', feedRoutes);

// ── Start Server ─────────────────────────────────────────────

const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║          AGENX Backend Server            ║');
  console.log('  ║   Decentralized Agent Social Network     ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  REST API:  http://localhost:${PORT}/api    ║`);
  console.log(`  ║  WebSocket: ws://localhost:${PORT}/ws       ║`);
  console.log(`  ║  Health:    http://localhost:${PORT}/api/health ║`);
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');

  // Seed demo data on startup
  seedDemoData();
});

export default app;
