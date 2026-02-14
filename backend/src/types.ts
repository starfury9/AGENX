// ============================================================
// AGENX — Core Type Definitions
// ============================================================

// ── Agent ────────────────────────────────────────────────────

export type AgentStatus = 'available' | 'busy' | 'offline';

export interface AgentProfile {
  id: string;                   // Sui object ID
  owner: string;                // Sui address that owns this agent
  name: string;
  bio: string;
  bioBlobId?: string;           // Walrus blob ID for extended bio
  skills: string[];
  trustScore: number;           // 0–100
  tasksCompleted: number;
  tasksPosted: number;
  totalEarned: number;          // in MIST (1 SUI = 1e9 MIST)
  totalSpent: number;
  totalRatings: number;
  ratingSum: number;
  disputes: number;
  status: AgentStatus;
  avatar?: string;              // URL or emoji
  createdAt: number;            // unix ms
}

export interface CreateAgentInput {
  name: string;
  bio: string;
  skills: string[];
  owner: string;
  avatar?: string;
}

// ── Task ─────────────────────────────────────────────────────

export type TaskStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface Task {
  id: string;
  poster: string;               // agent ID that created the task
  posterAddress: string;         // Sui address
  title: string;
  description: string;
  descriptionBlobId?: string;   // Walrus blob ID
  requiredSkills: string[];
  reward: number;               // in MIST
  deadline: number;             // unix ms
  status: TaskStatus;
  assignedTo?: string;          // agent ID
  assignedAddress?: string;     // Sui address
  bids: TaskBid[];
  resultBlobId?: string;        // Walrus blob ID for completed work
  resultSummary?: string;
  escrowTxDigest?: string;      // Sui tx that locked funds
  paymentTxDigest?: string;     // Sui tx that released funds
  createdAt: number;
}

export interface TaskBid {
  agentId: string;
  agentName: string;
  message: string;
  estimatedTime: string;        // e.g. "30 min"
  createdAt: number;
}

export interface CreateTaskInput {
  posterId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  reward: number;
  deadlineHours: number;
}

// ── Review ───────────────────────────────────────────────────

export interface Review {
  id: string;
  taskId: string;
  reviewer: string;             // agent ID
  reviewee: string;             // agent ID
  rating: number;               // 1–5
  comment: string;
  commentBlobId?: string;       // Walrus blob ID
  createdAt: number;
}

// ── Message ──────────────────────────────────────────────────

export type MessageType = 'dm' | 'task_update';

export interface Message {
  id: string;
  from: string;                 // agent ID
  to: string;                   // agent ID
  content: string;
  type: MessageType;
  blobId?: string;              // Walrus blob ID
  encrypted: boolean;
  createdAt: number;
}

// ── Feed Post ────────────────────────────────────────────────

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  blobId?: string;              // Walrus blob ID
  tags: string[];
  likes: number;
  likedBy: string[];
  comments: FeedComment[];
  createdAt: number;
}

export interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
}

// ── Network Stats ────────────────────────────────────────────

export interface NetworkStats {
  totalAgents: number;
  totalTasks: number;
  totalTasksCompleted: number;
  totalSuiExchanged: number;    // in MIST
  activeAgents: number;
  openTasks: number;
}

// ── API Responses ────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// ── WebSocket Events ─────────────────────────────────────────

export type WsEventType =
  | 'agent_registered'
  | 'agent_updated'
  | 'task_created'
  | 'task_bid'
  | 'task_assigned'
  | 'task_submitted'
  | 'task_completed'
  | 'task_disputed'
  | 'new_message'
  | 'new_post'
  | 'new_review'
  | 'stats_updated';

export interface WsEvent {
  type: WsEventType;
  payload: unknown;
  timestamp: number;
}
