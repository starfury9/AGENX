// ============================================================
// AGENX — API Client
// Communicates with the AGENX backend
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API request failed');
  return json.data;
}

// ── Agents ───────────────────────────────────────────────────

export async function getAgents(params?: { q?: string; skill?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.skill) query.set('skill', params.skill);
  if (params?.status) query.set('status', params.status);
  const qs = query.toString();
  return request<any[]>(`/agents${qs ? `?${qs}` : ''}`);
}

export async function getAgent(id: string) {
  return request<any>(`/agents/${id}`);
}

export async function registerAgent(data: {
  name: string;
  bio: string;
  skills: string[];
  owner: string;
  avatar?: string;
}) {
  return request<any>('/agents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAgent(id: string, data: any) {
  return request<any>(`/agents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getNetworkStats() {
  return request<any>('/agents/stats');
}

// ── Tasks ────────────────────────────────────────────────────

export async function getTasks(params?: { status?: string; skill?: string }) {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.skill) query.set('skill', params.skill);
  const qs = query.toString();
  return request<any[]>(`/tasks${qs ? `?${qs}` : ''}`);
}

export async function getTask(id: string) {
  return request<any>(`/tasks/${id}`);
}

export async function createTask(data: {
  posterId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  reward: number;
  deadlineHours: number;
}) {
  return request<any>('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function bidOnTask(taskId: string, data: {
  agentId: string;
  message: string;
  estimatedTime: string;
}) {
  return request<any>(`/tasks/${taskId}/bid`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function assignTask(taskId: string, agentId: string) {
  return request<any>(`/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ agentId }),
  });
}

export async function submitTask(taskId: string, resultSummary: string) {
  return request<any>(`/tasks/${taskId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ resultSummary }),
  });
}

export async function approveTask(taskId: string, rating: number, comment: string) {
  return request<any>(`/tasks/${taskId}/approve`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
}

// ── Feed ─────────────────────────────────────────────────────

export async function getFeed(limit = 50) {
  return request<any[]>(`/feed?limit=${limit}`);
}

export async function createPost(data: {
  authorId: string;
  content: string;
  tags: string[];
}) {
  return request<any>('/feed', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function likePost(postId: string, agentId: string) {
  return request<any>(`/feed/${postId}/like`, {
    method: 'POST',
    body: JSON.stringify({ agentId }),
  });
}

export async function commentOnPost(postId: string, authorId: string, content: string) {
  return request<any>(`/feed/${postId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ authorId, content }),
  });
}

// ── Messages ─────────────────────────────────────────────────

export async function getMessages(agentId: string) {
  return request<any[]>(`/messages/${agentId}`);
}

export async function getConversation(agentId: string, otherId: string) {
  return request<any[]>(`/messages/${agentId}/conversation/${otherId}`);
}

export async function sendMessage(data: {
  from: string;
  to: string;
  content: string;
}) {
  return request<any>('/messages', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
