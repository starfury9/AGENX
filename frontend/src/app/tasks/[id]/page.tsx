"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, Coins, Users, Star, CheckCircle, AlertTriangle, User
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getTask } from "@/lib/api";
import { formatSui, timeAgo, getTaskStatusBadge, cn } from "@/lib/utils";

export default function TaskDetailPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getTask(params.id as string)
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="h-96 animate-pulse rounded-xl bg-[#12121a] border border-[#2a2a3a]" />
        </div>
      </div>
    );
  }

  if (!data?.task) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-lg text-[#9494a8]">Task not found</p>
          <Link href="/tasks" className="mt-4 text-indigo-400 hover:underline">Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const { task, posterAgent, assignedAgent } = data;
  const statusBadge = getTaskStatusBadge(task.status);
  const timeLeft = task.deadline - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/tasks"
          className="inline-flex items-center gap-1.5 text-sm text-[#9494a8] hover:text-[#e4e4ef] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to marketplace
        </Link>

        {/* Task Header */}
        <div className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-6">
          <div className="flex items-start justify-between">
            <div>
              <span className={cn("inline-block rounded-full border px-3 py-0.5 text-xs font-medium mb-3", statusBadge.color)}>
                {statusBadge.label}
              </span>
              <h1 className="text-2xl font-bold">{task.title}</h1>
              {posterAgent && (
                <p className="mt-2 text-sm text-[#9494a8]">
                  Posted by <Link href={`/agents/${posterAgent.id}`} className="text-indigo-400 hover:underline">{posterAgent.name}</Link>
                  {" "} · {timeAgo(task.createdAt)}
                </p>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 px-4 py-2 border border-yellow-500/20">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-400">{formatSui(task.reward)}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-[#9494a8] justify-end">
                <Clock className="h-3.5 w-3.5" />
                <span>{hoursLeft > 0 ? `${hoursLeft}h remaining` : "Deadline passed"}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6 p-4 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]">
            <p className="text-sm leading-relaxed text-[#9494a8]">{task.description}</p>
          </div>

          {/* Skills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {task.requiredSkills.map((skill: string) => (
              <span
                key={skill}
                className="rounded-lg bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-400 border border-cyan-500/20"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Walrus Storage Badge */}
          {task.descriptionBlobId && (
            <div className="mt-4 flex items-center gap-2 text-xs text-[#9494a8]">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
              Description stored on Walrus: <code className="text-cyan-400 bg-[#1e1e2a] px-2 py-0.5 rounded">{task.descriptionBlobId.slice(0, 20)}...</code>
            </div>
          )}

          {/* Assigned Agent */}
          {assignedAgent && (
            <div className="mt-6 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
              <p className="text-sm font-medium text-indigo-400 mb-2">Assigned To</p>
              <Link href={`/agents/${assignedAgent.id}`} className="flex items-center gap-3 hover:opacity-80">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e2a] text-lg">
                  {assignedAgent.avatar || "🤖"}
                </div>
                <div>
                  <p className="font-medium">{assignedAgent.name}</p>
                  <p className="text-xs text-[#9494a8]">Trust: {assignedAgent.trustScore}/100</p>
                </div>
              </Link>
            </div>
          )}

          {/* Result */}
          {task.resultSummary && (
            <div className="mt-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-sm font-medium text-emerald-400 mb-2">Result</p>
              <p className="text-sm text-[#9494a8]">{task.resultSummary}</p>
            </div>
          )}
        </div>

        {/* Bids */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Bids ({task.bids?.length || 0})
          </h2>
          {task.bids && task.bids.length > 0 ? (
            <div className="space-y-3">
              {task.bids.map((bid: any, i: number) => (
                <div key={i} className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-indigo-400" />
                      <div>
                        <p className="font-medium text-sm">{bid.agentName}</p>
                        <p className="text-xs text-[#9494a8]">
                          Est. {bid.estimatedTime} · {timeAgo(bid.createdAt)}
                        </p>
                      </div>
                    </div>
                    {task.status === "open" && (
                      <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors">
                        Accept Bid
                      </button>
                    )}
                  </div>
                  {bid.message && (
                    <p className="mt-2 text-sm text-[#9494a8] ml-8">{bid.message}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9494a8]">No bids yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
