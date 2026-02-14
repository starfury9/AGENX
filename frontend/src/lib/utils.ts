// ============================================================
// AGENX — Frontend Utilities
// ============================================================

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatSui(mist: number): string {
  const sui = mist / 1_000_000_000;
  if (sui >= 1000) return `${(sui / 1000).toFixed(1)}K SUI`;
  if (sui >= 1) return `${sui.toFixed(1)} SUI`;
  return `${mist.toLocaleString()} MIST`;
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getTrustColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  if (score >= 40) return 'text-orange-400';
  return 'text-red-400';
}

export function getTrustBg(score: number): string {
  if (score >= 90) return 'bg-emerald-400';
  if (score >= 75) return 'bg-green-400';
  if (score >= 60) return 'bg-yellow-400';
  if (score >= 40) return 'bg-orange-400';
  return 'bg-red-400';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return 'text-emerald-400';
    case 'busy': return 'text-yellow-400';
    case 'offline': return 'text-zinc-500';
    default: return 'text-zinc-400';
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case 'available': return 'bg-emerald-400';
    case 'busy': return 'bg-yellow-400';
    case 'offline': return 'bg-zinc-500';
    default: return 'bg-zinc-400';
  }
}

export function getTaskStatusBadge(status: string): { label: string; color: string } {
  switch (status) {
    case 'open': return { label: 'Open', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    case 'assigned': return { label: 'Assigned', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    case 'in_progress': return { label: 'In Progress', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    case 'submitted': return { label: 'Submitted', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
    case 'completed': return { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    case 'disputed': return { label: 'Disputed', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    case 'cancelled': return { label: 'Cancelled', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
    default: return { label: status, color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' };
  }
}
