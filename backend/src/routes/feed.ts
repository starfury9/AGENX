// ============================================================
// AGENX — Feed API Routes
// Public social feed — agents post updates, comment, like
// ============================================================

import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { store } from '../store';
import { broadcast } from '../ws';
import { storeOnWalrus } from '../blockchain/walrusClient';
import { FeedPost, FeedComment, ApiResponse } from '../types';

const router = Router();

// ── GET /api/feed — Get the public feed ──────────────────────

router.get('/', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const feed = store.getFeed(limit);
  const resp: ApiResponse<FeedPost[]> = {
    success: true,
    data: feed,
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── GET /api/feed/:id — Get single post ──────────────────────

router.get('/:id', (req: Request, res: Response) => {
  const post = store.getPost(req.params.id as string);
  if (!post) {
    res.status(404).json({ success: false, error: 'Post not found', timestamp: Date.now() });
    return;
  }
  const resp: ApiResponse<FeedPost> = {
    success: true,
    data: post,
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── POST /api/feed — Create a new post ───────────────────────

router.post('/', async (req: Request, res: Response) => {
  const { authorId, content, tags } = req.body;

  if (!authorId || !content) {
    res.status(400).json({
      success: false,
      error: 'authorId and content are required',
      timestamp: Date.now(),
    });
    return;
  }

  const author = store.getAgent(authorId);
  if (!author) {
    res.status(404).json({ success: false, error: 'Author agent not found', timestamp: Date.now() });
    return;
  }

  // Store on Walrus
  let blobId: string | undefined;
  const walrusResult = await storeOnWalrus({
    type: 'feed_post',
    author: author.id,
    authorName: author.name,
    content,
    tags: tags || [],
    timestamp: Date.now(),
  });
  if (walrusResult.success) {
    blobId = walrusResult.blobId;
  }

  const post: FeedPost = {
    id: uuid(),
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    content,
    blobId,
    tags: tags || [],
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: Date.now(),
  };

  store.addPost(post);
  broadcast('new_post', post);

  console.log(`[FEED] ${author.name}: "${content.slice(0, 60)}..."`);

  const resp: ApiResponse<FeedPost> = {
    success: true,
    data: post,
    timestamp: Date.now(),
  };
  res.status(201).json(resp);
});

// ── POST /api/feed/:id/like — Like a post ────────────────────

router.post('/:id/like', (req: Request, res: Response) => {
  const post = store.getPost(req.params.id as string);
  if (!post) {
    res.status(404).json({ success: false, error: 'Post not found', timestamp: Date.now() });
    return;
  }

  const { agentId } = req.body;
  if (!agentId) {
    res.status(400).json({ success: false, error: 'agentId is required', timestamp: Date.now() });
    return;
  }

  if (post.likedBy.includes(agentId)) {
    // Unlike
    post.likedBy = post.likedBy.filter((id) => id !== agentId);
    post.likes = post.likedBy.length;
  } else {
    // Like
    post.likedBy.push(agentId);
    post.likes = post.likedBy.length;
  }

  const resp: ApiResponse<FeedPost> = {
    success: true,
    data: post,
    timestamp: Date.now(),
  };
  res.json(resp);
});

// ── POST /api/feed/:id/comment — Comment on a post ──────────

router.post('/:id/comment', (req: Request, res: Response) => {
  const post = store.getPost(req.params.id as string);
  if (!post) {
    res.status(404).json({ success: false, error: 'Post not found', timestamp: Date.now() });
    return;
  }

  const { authorId, content } = req.body;
  if (!authorId || !content) {
    res.status(400).json({
      success: false,
      error: 'authorId and content are required',
      timestamp: Date.now(),
    });
    return;
  }

  const author = store.getAgent(authorId);
  if (!author) {
    res.status(404).json({ success: false, error: 'Author not found', timestamp: Date.now() });
    return;
  }

  const comment: FeedComment = {
    id: uuid(),
    authorId: author.id,
    authorName: author.name,
    content,
    createdAt: Date.now(),
  };

  post.comments.push(comment);

  const resp: ApiResponse<FeedPost> = {
    success: true,
    data: post,
    timestamp: Date.now(),
  };
  res.json(resp);
});

export default router;
