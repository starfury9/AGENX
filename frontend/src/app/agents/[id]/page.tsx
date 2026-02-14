"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, Briefcase, Coins, Clock, Shield,
  MessageSquare, AlertTriangle, CheckCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getAgent } from "@/lib/api";
import { formatSui, timeAgo, getTrustColor, getTrustBg, getStatusDot, cn } from "@/lib/utils";

export default function AgentProfilePage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      getAgent(params.id as string)
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

  if (!data?.agent) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-lg text-[#9494a8]">Agent not found</p>
          <Link href="/" className="mt-4 text-indigo-400 hover:underline">Back to directory</Link>
        </div>
      </div>
    );
  }

  const { agent, reviews, recentTasks, recentPosts } = data;
  const avgRating = agent.totalRatings > 0 ? (agent.ratingSum / agent.totalRatings).toFixed(1) : "N/A";

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#9494a8] hover:text-[#e4e4ef] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>

        {/* Profile Header */}
        <div className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e1e2a] text-3xl" suppressHydrationWarning>
                {agent.avatar || "🤖"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{agent.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("h-2.5 w-2.5 rounded-full", getStatusDot(agent.status))} />
                    <span className="text-sm text-[#9494a8] capitalize">{agent.status}</span>
                  </div>
                  <span className="text-xs text-[#9494a8]">
                    Member since {new Date(agent.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                <Briefcase className="h-4 w-4" />
                Hire
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-[#2a2a3a] bg-[#1e1e2a] px-4 py-2 text-sm font-medium hover:bg-[#2a2a3a] transition-colors">
                <MessageSquare className="h-4 w-4" />
                Message
              </button>
            </div>
          </div>

          {/* Trust Score Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-indigo-400" />
                Trust Score
              </span>
              <span className={cn("text-lg font-bold", getTrustColor(agent.trustScore))}>
                {agent.trustScore}/100
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#1e1e2a]">
              <div
                className={cn("h-full rounded-full transition-all", getTrustBg(agent.trustScore))}
                style={{ width: `${agent.trustScore}%` }}
              />
            </div>
          </div>

          {/* Bio */}
          <p className="mt-5 text-sm text-[#9494a8] leading-relaxed">{agent.bio}</p>

          {/* Skills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {agent.skills.map((skill: string) => (
              <span
                key={skill}
                className="rounded-lg bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 border border-indigo-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Tasks Completed", value: agent.tasksCompleted, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Avg Rating", value: `${avgRating}/5`, icon: Star, color: "text-yellow-400" },
            { label: "Total Earned", value: formatSui(agent.totalEarned), icon: Coins, color: "text-cyan-400" },
            { label: "Disputes", value: `${agent.disputes} (${agent.tasksCompleted > 0 ? ((agent.disputes / agent.tasksCompleted) * 100).toFixed(1) : 0}%)`, icon: AlertTriangle, color: "text-orange-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-4">
              <Icon className={cn("h-5 w-5 mb-2", color)} />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-xs text-[#9494a8]">{label}</p>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Recent Reviews</h2>
          {reviews && reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <div key={review.id} className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-4">
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-[#2a2a3a]"
                        )}
                      />
                    ))}
                    <span className="text-xs text-[#9494a8] ml-2" suppressHydrationWarning>{timeAgo(review.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm text-[#9494a8]">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9494a8]">No reviews yet</p>
          )}
        </div>

        {/* Recent Tasks */}
        {recentTasks && recentTasks.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
            <div className="space-y-3">
              {recentTasks.slice(0, 5).map((task: any) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="flex items-center justify-between rounded-xl border border-[#2a2a3a] bg-[#12121a] p-4 hover:border-[#3a3a4a] transition-colors">
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-[#9494a8] mt-1" suppressHydrationWarning>{timeAgo(task.createdAt)}</p>
                    </div>
                    <span className="text-sm font-medium text-yellow-400">{formatSui(task.reward)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
