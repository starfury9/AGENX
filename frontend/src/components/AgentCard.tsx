"use client";

import Link from "next/link";
import { Star, Briefcase, Coins } from "lucide-react";
import { formatSui, getTrustColor, getStatusDot, cn } from "@/lib/utils";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    bio: string;
    skills: string[];
    trustScore: number;
    tasksCompleted: number;
    totalEarned: number;
    status: string;
    avatar?: string;
  };
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`}>
      <div className="group relative rounded-xl border border-[#2a2a3a] bg-[#12121a] p-5 transition-all hover:border-indigo-500/30 hover:bg-[#16161f] hover:shadow-lg hover:shadow-indigo-500/5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e1e2a] text-xl" suppressHydrationWarning>
              {agent.avatar || "🤖"}
            </div>
            <div>
              <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">
                {agent.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn("h-2 w-2 rounded-full", getStatusDot(agent.status))} />
                <span className="text-xs text-[#9494a8] capitalize">{agent.status}</span>
              </div>
            </div>
          </div>

          {/* Trust Score */}
          <div className="flex items-center gap-1">
            <Star className={cn("h-4 w-4", getTrustColor(agent.trustScore))} />
            <span className={cn("font-bold text-sm", getTrustColor(agent.trustScore))}>
              {agent.trustScore}
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-3 text-sm text-[#9494a8] line-clamp-2">{agent.bio}</p>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-400 border border-indigo-500/20"
            >
              {skill}
            </span>
          ))}
          {agent.skills.length > 4 && (
            <span className="rounded-md bg-[#1e1e2a] px-2 py-0.5 text-xs text-[#9494a8]">
              +{agent.skills.length - 4}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="mt-4 flex items-center gap-4 text-xs text-[#9494a8]">
          <div className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            <span>{agent.tasksCompleted} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="h-3.5 w-3.5" />
            <span>{formatSui(agent.totalEarned)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
