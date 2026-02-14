// ============================================================
// AGENX — In-Memory Data Store
// For hackathon demo — all state lives here, easily replaceable
// with a real database in production.
// ============================================================

import {
  AgentProfile,
  Task,
  Review,
  Message,
  FeedPost,
  NetworkStats,
} from './types';

class Store {
  agents: Map<string, AgentProfile> = new Map();
  tasks: Map<string, Task> = new Map();
  reviews: Review[] = [];
  messages: Message[] = [];
  feedPosts: FeedPost[] = [];

  // ── Agent Operations ─────────────────────────────────────

  getAgent(id: string): AgentProfile | undefined {
    return this.agents.get(id);
  }

  getAgentByName(name: string): AgentProfile | undefined {
    return Array.from(this.agents.values()).find(
      (a) => a.name.toLowerCase() === name.toLowerCase()
    );
  }

  getAllAgents(): AgentProfile[] {
    return Array.from(this.agents.values()).sort(
      (a, b) => b.trustScore - a.trustScore
    );
  }

  searchAgents(query: string): AgentProfile[] {
    const q = query.toLowerCase();
    return this.getAllAgents().filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.skills.some((s) => s.toLowerCase().includes(q)) ||
        a.bio.toLowerCase().includes(q)
    );
  }

  upsertAgent(agent: AgentProfile): void {
    this.agents.set(agent.id, agent);
  }

  // ── Task Operations ──────────────────────────────────────

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values()).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  }

  getOpenTasks(): Task[] {
    return this.getAllTasks().filter((t) => t.status === 'open');
  }

  getTasksByAgent(agentId: string): Task[] {
    return this.getAllTasks().filter(
      (t) => t.poster === agentId || t.assignedTo === agentId
    );
  }

  upsertTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  // ── Review Operations ────────────────────────────────────

  addReview(review: Review): void {
    this.reviews.push(review);
  }

  getReviewsFor(agentId: string): Review[] {
    return this.reviews
      .filter((r) => r.reviewee === agentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getReviewsBy(agentId: string): Review[] {
    return this.reviews
      .filter((r) => r.reviewer === agentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ── Message Operations ───────────────────────────────────

  addMessage(message: Message): void {
    this.messages.push(message);
  }

  getMessages(agentId: string): Message[] {
    return this.messages
      .filter((m) => m.from === agentId || m.to === agentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getConversation(agent1: string, agent2: string): Message[] {
    return this.messages
      .filter(
        (m) =>
          (m.from === agent1 && m.to === agent2) ||
          (m.from === agent2 && m.to === agent1)
      )
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // ── Feed Operations ──────────────────────────────────────

  addPost(post: FeedPost): void {
    this.feedPosts.push(post);
  }

  getFeed(limit = 50): FeedPost[] {
    return [...this.feedPosts]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  getPost(id: string): FeedPost | undefined {
    return this.feedPosts.find((p) => p.id === id);
  }

  getPostsByAgent(agentId: string): FeedPost[] {
    return this.feedPosts
      .filter((p) => p.authorId === agentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // ── Network Stats ────────────────────────────────────────

  getStats(): NetworkStats {
    const agents = this.getAllAgents();
    const tasks = this.getAllTasks();

    return {
      totalAgents: agents.length,
      totalTasks: tasks.length,
      totalTasksCompleted: tasks.filter((t) => t.status === 'completed').length,
      totalSuiExchanged: tasks
        .filter((t) => t.status === 'completed')
        .reduce((sum, t) => sum + t.reward, 0),
      activeAgents: agents.filter((a) => a.status === 'available').length,
      openTasks: tasks.filter((t) => t.status === 'open').length,
    };
  }
}

// Singleton
export const store = new Store();
