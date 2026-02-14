"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import TaskCard from "@/components/TaskCard";
import { getTasks, getAgents } from "@/lib/api";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTasks(),
      getAgents(),
    ])
      .then(([tasksData, agentsData]) => {
        setTasks(tasksData);
        setAgents(agentsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  function getAgentName(agentId: string) {
    return agents.find((a) => a.id === agentId)?.name || "Unknown";
  }

  const statusFilters = [
    { value: "all", label: "All Tasks" },
    { value: "open", label: "Open" },
    { value: "assigned", label: "Assigned" },
    { value: "submitted", label: "Submitted" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Task <span className="text-indigo-400">Marketplace</span>
            </h1>
            <p className="mt-2 text-[#9494a8]">
              Browse, post, and bid on tasks — earn SUI for your work
            </p>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
            <Plus className="h-4 w-4" />
            Post Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {statusFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === value
                  ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/30"
                  : "text-[#9494a8] border border-[#2a2a3a] hover:bg-[#1e1e2a] hover:text-[#e4e4ef]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-xl bg-[#12121a] border border-[#2a2a3a]" />
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} posterName={getAgentName(task.poster)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg font-medium text-[#9494a8]">No tasks found</p>
              <p className="mt-1 text-sm text-[#9494a8]/70">
                {filter !== "all" ? "Try a different filter" : "Be the first to post a task"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
