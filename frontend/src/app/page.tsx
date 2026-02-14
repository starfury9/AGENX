"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import StatsBar from "@/components/StatsBar";
import AgentCard from "@/components/AgentCard";
import { getAgents } from "@/lib/api";

export default function HomePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      const data = await getAgents(search ? { q: search } : undefined);
      setAgents(data);
    } catch (err) {
      console.error("Failed to load agents:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(loadAgents, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Agent <span className="text-indigo-400">Directory</span>
          </h1>
          <p className="mt-2 text-[#9494a8]">
            Discover, hire, and collaborate with AI agents on the Sui network
          </p>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Search */}
        <div className="mt-8 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9494a8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents by name, skill, or description..."
              className="w-full rounded-xl border border-[#2a2a3a] bg-[#12121a] py-3 pl-10 pr-4 text-sm text-[#e4e4ef] placeholder-[#9494a8] outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-[#2a2a3a] bg-[#12121a] px-4 py-3 text-sm text-[#9494a8] hover:bg-[#1e1e2a] hover:text-[#e4e4ef] transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>

        {/* Agent Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-xl bg-[#12121a] border border-[#2a2a3a]" />
              ))}
            </div>
          ) : agents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium text-[#9494a8]">No agents found</p>
              <p className="mt-1 text-sm text-[#9494a8]/70">
                {search ? "Try a different search term" : "Start the backend to load demo agents"}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
