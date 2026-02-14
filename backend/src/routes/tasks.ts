// ============================================================
// AGENX — Task Marketplace API Routes
// Full task lifecycle: create → bid → assign → submit → approve
// ============================================================

import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../store';
import { broadcast } from '../ws';
import { storeOnWalrus } from '../blockchain/walrusClient';
import { Task, CreateTaskInput, TaskBid, Review, ApiResponse } from '../types';

const router = Router();

// ── GET /api/tasks — List tasks ──────────────────────────────

router.get('/', (req: Request, res: Response) => {
  const { status, skill, poster } = req.query;
  let tasks = store.getAllTasks();

  if (status && typeof status === 'string') {
    tasks = tasks.filter((t) => t.status === status);
  }

  if (skill && typeof skill === 'string') {
    tasks = tasks.filter((t) =>
      t.requiredSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
    );
  }

  if (poster && typeof poster === 'string') {
    tasks = tasks.filter((t) => t.poster === poster);
  }

  const resp: ApiResponse<Task[]> = {
    success: true,
    data: tasks,
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── GET /api/tasks/:id — Get task details ────────────────────

router.get('/:id', (req: Request, res: Response) => {
  const task = store.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found', timestamp: Date.now() });
    return;
  }

  const posterAgent = store.getAgent(task.poster);
  const assignedAgent = task.assignedTo ? store.getAgent(task.assignedTo) : null;

  const resp: ApiResponse = {
    success: true,
    data: { task, posterAgent, assignedAgent },
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── POST /api/tasks — Create a new task ──────────────────────

router.post('/', async (req: Request, res: Response) => {
  const input: CreateTaskInput = req.body;

  if (!input.posterId || !input.title || !input.reward) {
    res.status(400).json({
      success: false,
      error: 'posterId, title, and reward are required',
      timestamp: Date.now(),
    });
    return;
  }

  const poster = store.getAgent(input.posterId);
  if (!poster) {
    res.status(404).json({ success: false, error: 'Poster agent not found', timestamp: Date.now() });
    return;
  }

  // Store description on Walrus
  let descBlobId: string | undefined;
  if (input.description) {
    const walrusResult = await storeOnWalrus({
      type: 'task_description',
      title: input.title,
      description: input.description,
      requiredSkills: input.requiredSkills,
      reward: input.reward,
      createdAt: Date.now(),
    });
    if (walrusResult.success) {
      descBlobId = walrusResult.blobId;
    }
  }

  const task: Task = {
    id: uuid(),
    poster: poster.id,
    posterAddress: poster.owner,
    title: input.title,
    description: input.description || '',
    descriptionBlobId: descBlobId,
    requiredSkills: input.requiredSkills || [],
    reward: input.reward,
    deadline: Date.now() + (input.deadlineHours || 24) * 60 * 60 * 1000,
    status: 'open',
    bids: [],
    createdAt: Date.now(),
  };

  store.upsertTask(task);

  // Update poster stats
  poster.tasksPosted += 1;
  poster.totalSpent += task.reward;
  store.upsertAgent(poster);

  broadcast('task_created', task);
  broadcast('stats_updated', store.getStats());

  console.log(`[TASK] Created: "${task.title}" by ${poster.name} — ${task.reward / 1e9} SUI`);

  const resp: ApiResponse<Task> = {
    success: true,
    data: task,
    timestamp: Date.now(),
  };
  res.status(201).json(resp);
});

// ── POST /api/tasks/:id/bid — Bid on a task ─────────────────

router.post('/:id/bid', (req: Request, res: Response) => {
  const task = store.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found', timestamp: Date.now() });
    return;
  }

  if (task.status !== 'open') {
    res.status(400).json({ success: false, error: 'Task is not open for bids', timestamp: Date.now() });
    return;
  }

  const { agentId, message, estimatedTime } = req.body;
  const agent = store.getAgent(agentId);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Bidding agent not found', timestamp: Date.now() });
    return;
  }

  if (task.poster === agentId) {
    res.status(400).json({ success: false, error: 'Cannot bid on your own task', timestamp: Date.now() });
    return;
  }

  // Check if already bid
  if (task.bids.some((b) => b.agentId === agentId)) {
    res.status(409).json({ success: false, error: 'Already placed a bid', timestamp: Date.now() });
    return;
  }

  const bid: TaskBid = {
    agentId,
    agentName: agent.name,
    message: message || '',
    estimatedTime: estimatedTime || 'Unknown',
    createdAt: Date.now(),
  };

  task.bids.push(bid);
  store.upsertTask(task);

  broadcast('task_bid', { taskId: task.id, bid });

  console.log(`[TASK] Bid: ${agent.name} bid on "${task.title}"`);

  const resp: ApiResponse<Task> = { success: true, data: task, timestamp: Date.now() };
  res.json(resp);
});

// ── POST /api/tasks/:id/assign — Assign task to a bidder ────

router.post('/:id/assign', (req: Request, res: Response) => {
  const task = store.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found', timestamp: Date.now() });
    return;
  }

  if (task.status !== 'open') {
    res.status(400).json({ success: false, error: 'Task is not open', timestamp: Date.now() });
    return;
  }

  const { agentId } = req.body;
  const agent = store.getAgent(agentId);
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found', timestamp: Date.now() });
    return;
  }

  task.status = 'assigned';
  task.assignedTo = agent.id;
  task.assignedAddress = agent.owner;
  store.upsertTask(task);

  // Mark agent as busy
  agent.status = 'busy';
  store.upsertAgent(agent);

  broadcast('task_assigned', { taskId: task.id, assignedTo: agent.id, agentName: agent.name });

  console.log(`[TASK] Assigned: "${task.title}" → ${agent.name}`);

  const resp: ApiResponse<Task> = { success: true, data: task, timestamp: Date.now() };
  res.json(resp);
});

// ── POST /api/tasks/:id/submit — Worker submits result ───────

router.post('/:id/submit', async (req: Request, res: Response) => {
  const task = store.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found', timestamp: Date.now() });
    return;
  }

  if (task.status !== 'assigned' && task.status !== 'in_progress') {
    res.status(400).json({ success: false, error: 'Task is not in progress', timestamp: Date.now() });
    return;
  }

  const { resultSummary } = req.body;

  // Store result on Walrus
  let resultBlobId: string | undefined;
  if (resultSummary) {
    const walrusResult = await storeOnWalrus({
      type: 'task_result',
      taskId: task.id,
      taskTitle: task.title,
      result: resultSummary,
      submittedAt: Date.now(),
    });
    if (walrusResult.success) {
      resultBlobId = walrusResult.blobId;
    }
  }

  task.status = 'submitted';
  task.resultBlobId = resultBlobId;
  task.resultSummary = resultSummary || '';
  store.upsertTask(task);

  broadcast('task_submitted', { taskId: task.id });

  console.log(`[TASK] Submitted: "${task.title}"`);

  const resp: ApiResponse<Task> = { success: true, data: task, timestamp: Date.now() };
  res.json(resp);
});

// ── POST /api/tasks/:id/approve — Poster approves the work ──

router.post('/:id/approve', async (req: Request, res: Response) => {
  const task = store.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found', timestamp: Date.now() });
    return;
  }

  if (task.status !== 'submitted') {
    res.status(400).json({ success: false, error: 'Task has not been submitted yet', timestamp: Date.now() });
    return;
  }

  const { rating, comment } = req.body;

  // Mark task completed
  task.status = 'completed';
  store.upsertTask(task);

  // Update worker agent stats
  if (task.assignedTo) {
    const worker = store.getAgent(task.assignedTo);
    if (worker) {
      worker.tasksCompleted += 1;
      worker.totalEarned += task.reward;
      worker.status = 'available';

      // Update reputation
      if (rating && rating >= 1 && rating <= 5) {
        worker.totalRatings += 1;
        worker.ratingSum += rating;

        // Recalculate trust score
        const avgRating = worker.ratingSum / worker.totalRatings;
        const completionBonus = Math.min(worker.tasksCompleted * 2, 30);
        const ratingScore = (avgRating / 5) * 25;
        const disputePenalty = worker.disputes * 5;
        worker.trustScore = Math.min(100, Math.max(0,
          Math.round(50 + completionBonus + ratingScore - disputePenalty)
        ));

        // Save review
        const review: Review = {
          id: uuid(),
          taskId: task.id,
          reviewer: task.poster,
          reviewee: worker.id,
          rating,
          comment: comment || '',
          createdAt: Date.now(),
        };
        store.addReview(review);

        // Store review on Walrus
        await storeOnWalrus({
          type: 'review',
          taskId: task.id,
          reviewer: task.poster,
          reviewee: worker.id,
          rating,
          comment: comment || '',
          createdAt: Date.now(),
        });

        broadcast('new_review', review);
      }

      store.upsertAgent(worker);
    }
  }

  // Log completion on Walrus
  await storeOnWalrus({
    type: 'task_completion',
    taskId: task.id,
    title: task.title,
    poster: task.poster,
    worker: task.assignedTo,
    reward: task.reward,
    completedAt: Date.now(),
  });

  broadcast('task_completed', { taskId: task.id });
  broadcast('stats_updated', store.getStats());

  console.log(`[TASK] Completed: "${task.title}" — ${task.reward / 1e9} SUI released`);

  const resp: ApiResponse<Task> = { success: true, data: task, timestamp: Date.now() };
  res.json(resp);
});

// ── POST /api/tasks/:id/dispute — Raise a dispute ───────────

router.post('/:id/dispute', (req: Request, res: Response) => {
  const task = store.getTask(req.params.id);
  if (!task) {
    res.status(404).json({ success: false, error: 'Task not found', timestamp: Date.now() });
    return;
  }

  task.status = 'disputed';
  store.upsertTask(task);

  // Increment dispute count for both parties
  if (task.assignedTo) {
    const worker = store.getAgent(task.assignedTo);
    if (worker) {
      worker.disputes += 1;
      worker.trustScore = Math.max(0, worker.trustScore - 5);
      store.upsertAgent(worker);
    }
  }

  broadcast('task_disputed', { taskId: task.id });

  console.log(`[TASK] Disputed: "${task.title}"`);

  const resp: ApiResponse<Task> = { success: true, data: task, timestamp: Date.now() };
  res.json(resp);
});

export default router;
