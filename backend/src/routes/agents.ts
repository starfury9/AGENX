// ============================================================
// AGENX — Agent API Routes
// CRUD for agent profiles, discovery, reputation
// ============================================================

import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../store';
import { broadcast } from '../ws';
import { storeOnWalrus } from '../blockchain/walrusClient';
import { AgentProfile, CreateAgentInput, ApiResponse } from '../types';

const router = Router();

// ── GET /api/agents — List all agents ────────────────────────

router.get('/', (_req: Request, res: Response) => {
  const { q, skill, status } = _req.query;
  let agents = store.getAllAgents();

  if (q && typeof q === 'string') {
    agents = store.searchAgents(q);
  }

  if (skill && typeof skill === 'string') {
    agents = agents.filter((a) =>
      a.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
    );
  }

  if (status && typeof status === 'string') {
    agents = agents.filter((a) => a.status === status);
  }

  const resp: ApiResponse<AgentProfile[]> = {
    success: true,
    data: agents,
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── GET /api/agents/stats — Network statistics ───────────────

router.get('/stats', (_req: Request, res: Response) => {
  const resp: ApiResponse = {
    success: true,
    data: store.getStats(),
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── GET /api/agents/:id — Get agent profile ──────────────────

router.get('/:id', (req: Request, res: Response) => {
  const agent = store.getAgent(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found', timestamp: Date.now() });
    return;
  }

  const reviews = store.getReviewsFor(agent.id);
  const tasks = store.getTasksByAgent(agent.id);
  const posts = store.getPostsByAgent(agent.id);

  const resp: ApiResponse = {
    success: true,
    data: { agent, reviews, recentTasks: tasks.slice(0, 10), recentPosts: posts.slice(0, 10) },
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── POST /api/agents — Register new agent ────────────────────

router.post('/', async (req: Request, res: Response) => {
  const input: CreateAgentInput = req.body;

  if (!input.name || !input.skills?.length || !input.owner) {
    res.status(400).json({
      success: false,
      error: 'name, skills[], and owner are required',
      timestamp: Date.now(),
    });
    return;
  }

  // Check name uniqueness
  if (store.getAgentByName(input.name)) {
    res.status(409).json({
      success: false,
      error: `Agent name "${input.name}" already taken`,
      timestamp: Date.now(),
    });
    return;
  }

  // Store bio on Walrus
  let bioBlobId: string | undefined;
  if (input.bio) {
    const walrusResult = await storeOnWalrus({
      type: 'agent_bio',
      name: input.name,
      bio: input.bio,
      skills: input.skills,
      createdAt: Date.now(),
    });
    if (walrusResult.success) {
      bioBlobId = walrusResult.blobId;
    }
  }

  const agent: AgentProfile = {
    id: uuid(),
    owner: input.owner,
    name: input.name,
    bio: input.bio || '',
    bioBlobId,
    skills: input.skills,
    trustScore: 50, // neutral starting score
    tasksCompleted: 0,
    tasksPosted: 0,
    totalEarned: 0,
    totalSpent: 0,
    totalRatings: 0,
    ratingSum: 0,
    disputes: 0,
    status: 'available',
    avatar: input.avatar || '🤖',
    createdAt: Date.now(),
  };

  store.upsertAgent(agent);
  broadcast('agent_registered', agent);
  broadcast('stats_updated', store.getStats());

  console.log(`[AGENT] Registered: ${agent.name} (${agent.id})`);

  const resp: ApiResponse<AgentProfile> = {
    success: true,
    data: agent,
    timestamp: Date.now(),
  };
  res.status(201).json(resp);
});

// ── PATCH /api/agents/:id — Update agent ─────────────────────

router.patch('/:id', (req: Request, res: Response) => {
  const agent = store.getAgent(req.params.id);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found', timestamp: Date.now() });
    return;
  }

  const { status, bio, skills, avatar } = req.body;
  if (status) agent.status = status;
  if (bio) agent.bio = bio;
  if (skills) agent.skills = skills;
  if (avatar) agent.avatar = avatar;

  store.upsertAgent(agent);
  broadcast('agent_updated', agent);

  const resp: ApiResponse<AgentProfile> = {
    success: true,
    data: agent,
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── GET /api/agents/:id/reviews — Get reviews for agent ──────

router.get('/:id/reviews', (req: Request, res: Response) => {
  const reviews = store.getReviewsFor(req.params.id);
  const resp: ApiResponse = {
    success: true,
    data: reviews,
    timestamp: Date.now(),
  };
  res.json(resp);
});

export default router;
