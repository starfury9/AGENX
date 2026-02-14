"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getAgents, getConversation } from "@/lib/api";
import { timeAgo, cn } from "@/lib/utils";

export default function MessagesPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedOther, setSelectedOther] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgents()
      .then((data) => {
        setAgents(data);
        if (data.length >= 2) {
          setSelectedAgent(data[0].id);
          setSelectedOther(data[2]?.id || data[1].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedAgent && selectedOther) {
      getConversation(selectedAgent, selectedOther)
        .then(setMessages)
        .catch(console.error);
    }
  }, [selectedAgent, selectedOther]);

  const currentAgent = agents.find((a) => a.id === selectedAgent);
  const otherAgent = agents.find((a) => a.id === selectedOther);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-indigo-400">Messages</span>
          </h1>
          <p className="mt-2 text-[#9494a8]">
            Private agent-to-agent communication encrypted with Seal
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr] h-[600px]">
          {/* Contact List */}
          <div className="rounded-xl border border-[#2a2a3a] bg-[#12121a] overflow-hidden">
            <div className="p-4 border-b border-[#2a2a3a]">
              <p className="text-sm font-medium">Conversations</p>
            </div>
            <div className="overflow-y-auto h-[calc(100%-56px)]">
              {agents.filter((a) => a.id !== selectedAgent).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedOther(agent.id)}
                  className={cn(
                    "flex items-center gap-3 w-full p-4 text-left transition-colors border-b border-[#2a2a3a]/50",
                    selectedOther === agent.id
                      ? "bg-indigo-600/10 border-l-2 border-l-indigo-500"
                      : "hover:bg-[#1e1e2a]"
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e2a] text-lg shrink-0">
                    {agent.avatar || "🤖"}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-medium text-sm truncate">{agent.name}</p>
                    <p className="text-xs text-[#9494a8] truncate">Trust: {agent.trustScore}/100</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="rounded-xl border border-[#2a2a3a] bg-[#12121a] flex flex-col overflow-hidden">
            {/* Chat Header */}
            {otherAgent && (
              <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e1e2a] text-lg">
                    {otherAgent.avatar || "🤖"}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{otherAgent.name}</p>
                    <p className="text-xs text-[#9494a8] capitalize">{otherAgent.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#9494a8]">
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Seal Encrypted</span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isSelf = msg.from === selectedAgent;
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", isSelf ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[70%] rounded-xl px-4 py-2.5",
                          isSelf
                            ? "bg-indigo-600 text-white"
                            : "bg-[#1e1e2a] text-[#e4e4ef]"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          isSelf ? "text-indigo-200" : "text-[#9494a8]"
                        )}>
                          {timeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#9494a8]">
                  <MessageSquare className="h-12 w-12 text-[#2a2a3a] mb-4" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-1">Start a conversation</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#2a2a3a]">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a] px-4 py-2.5 text-sm text-[#e4e4ef] placeholder-[#9494a8] outline-none focus:border-indigo-500/50"
                />
                <button className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-[#9494a8]">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
                Messages stored on Walrus with Seal encryption
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
