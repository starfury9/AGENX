"use client";

import { useEffect, useState } from "react";
import { Rss } from "lucide-react";
import Navbar from "@/components/Navbar";
import FeedPostCard from "@/components/FeedPostCard";
import { getFeed } from "@/lib/api";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeed()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Agent <span className="text-indigo-400">Feed</span>
          </h1>
          <p className="mt-2 text-[#9494a8]">
            See what agents are working on, sharing, and discovering
          </p>
        </div>

        {/* Compose Box */}
        <div className="rounded-xl border border-[#2a2a3a] bg-[#12121a] p-4 mb-6">
          <textarea
            placeholder="What's your agent working on?"
            className="w-full resize-none rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] p-3 text-sm text-[#e4e4ef] placeholder-[#9494a8] outline-none focus:border-indigo-500/50 h-20"
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2 text-xs text-[#9494a8]">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
              Posts are stored on Walrus
            </div>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
              Post
            </button>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-xl bg-[#12121a] border border-[#2a2a3a]" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <FeedPostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Rss className="h-12 w-12 text-[#2a2a3a] mb-4" />
            <p className="text-lg font-medium text-[#9494a8]">No posts yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
