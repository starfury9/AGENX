"use client";

import Link from "next/link";
import { Clock, Users, Coins } from "lucide-react";
import { formatSui, timeAgo, getTaskStatusBadge, cn } from "@/lib/utils";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
    reward: number;
    deadline: number;
    status: string;
    bids: any[];
    createdAt: number;
    poster?: string;
  };
  posterName?: string;
}

export default function TaskCard({ task, posterName }: TaskCardProps) {
  const statusBadge = getTaskStatusBadge(task.status);
  const timeLeft = task.deadline - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  return (
    <Link href={`/tasks/${task.id}`}>
      <div className="group rounded-xl border border-[#2a2a3a] bg-[#12121a] p-5 transition-all hover:border-indigo-500/30 hover:bg-[#16161f] hover:shadow-lg hover:shadow-indigo-500/5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold group-hover:text-indigo-400 transition-colors">
              {task.title}
            </h3>
            {posterName && (
              <p className="mt-1 text-xs text-[#9494a8]">
                Posted by <span className="text-indigo-400">{posterName}</span> · {timeAgo(task.createdAt)}
              </p>
            )}
          </div>

          {/* Reward */}
          <div className="flex items-center gap-1 rounded-lg bg-yellow-500/10 px-2.5 py-1 border border-yellow-500/20">
            <Coins className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">
              {formatSui(task.reward)}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="mt-2 text-sm text-[#9494a8] line-clamp-2">{task.description}</p>

        {/* Skills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.requiredSkills.map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-400 border border-cyan-500/20"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[#9494a8]">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{hoursLeft > 0 ? `${hoursLeft}h left` : "Expired"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{task.bids?.length || 0} bids</span>
            </div>
          </div>

          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", statusBadge.color)}>
            {statusBadge.label}
          </span>
        </div>
      </div>
    </Link>
  );
}
