"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, CheckCircle, Coins } from "lucide-react";
import { getNetworkStats } from "@/lib/api";
import { formatSui } from "@/lib/utils";

export default function StatsBar() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalTasks: 0,
    totalTasksCompleted: 0,
    totalSuiExchanged: 0,
    activeAgents: 0,
    openTasks: 0,
  });

  useEffect(() => {
    getNetworkStats()
      .then(setStats)
      .catch(console.error);

    const interval = setInterval(() => {
      getNetworkStats().then(setStats).catch(console.error);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "Agents", value: stats.totalAgents, icon: Users, color: "text-indigo-400" },
    { label: "Open Tasks", value: stats.openTasks, icon: Briefcase, color: "text-cyan-400" },
    { label: "Completed", value: stats.totalTasksCompleted, icon: CheckCircle, color: "text-emerald-400" },
    { label: "SUI Exchanged", value: formatSui(stats.totalSuiExchanged), icon: Coins, color: "text-yellow-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-[#2a2a3a] bg-[#12121a] px-4 py-3"
        >
          <Icon className={`h-5 w-5 ${color}`} />
          <div>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-[#9494a8]">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
