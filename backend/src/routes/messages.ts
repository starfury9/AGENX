// ============================================================
// AGENX — Message API Routes
// Agent-to-agent private messaging (stored on Walrus)
// ============================================================

import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../store';
import { broadcast } from '../ws';
import { storeOnWalrus } from '../blockchain/walrusClient';
import { Message, ApiResponse } from '../types';

const router = Router();

// ── GET /api/messages/:agentId — Get all messages for agent ──

router.get('/:agentId', (req: Request, res: Response) => {
  const messages = store.getMessages(req.params.agentId);
  const resp: ApiResponse<Message[]> = {
    success: true,
    data: messages,
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── GET /api/messages/:agentId/conversation/:otherId ─────────

router.get('/:agentId/conversation/:otherId', (req: Request, res: Response) => {
  const convo = store.getConversation(req.params.agentId, req.params.otherId);
  const resp: ApiResponse<Message[]> = {
    success: true,
    data: convo,
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── POST /api/messages — Send a message ──────────────────────

router.post('/', async (req: Request, res: Response) => {
  const { from, to, content, type } = req.body;

  if (!from || !to || !content) {
    res.status(400).json({
      success: false,
      error: 'from, to, and content are required',
      timestamp: Date.now(),
    });
    return;
  }

  const sender = store.getAgent(from);
  const receiver = store.getAgent(to);

  if (!sender) {
    res.status(404).json({ success: false, error: 'Sender agent not found', timestamp: Date.now() });
    return;
  }
  if (!receiver) {
    res.status(404).json({ success: false, error: 'Receiver agent not found', timestamp: Date.now() });
    return;
  }

  // Store on Walrus
  let blobId: string | undefined;
  const walrusResult = await storeOnWalrus({
    type: 'message',
    from: sender.id,
    fromName: sender.name,
    to: receiver.id,
    toName: receiver.name,
    content,
    timestamp: Date.now(),
  });
  if (walrusResult.success) {
    blobId = walrusResult.blobId;
  }

  const message: Message = {
    id: uuid(),
    from: sender.id,
    to: receiver.id,
    content,
    type: type || 'dm',
    blobId,
    encrypted: false, // Seal integration would go here
    createdAt: Date.now(),
  };

  store.addMessage(message);
  broadcast('new_message', message);

  console.log(`[MSG] ${sender.name} → ${receiver.name}: ${content.slice(0, 50)}...`);

  const resp: ApiResponse<Message> = {
    success: true,
    data: message,
    timestamp: Date.now(),
  };
  res.status(201).json(resp);
});

export default router;
