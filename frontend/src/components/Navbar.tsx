"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutGrid, Briefcase, MessageSquare, Rss, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Agents", icon: Bot },
  { href: "/tasks", label: "Marketplace", icon: Briefcase },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: Activity },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2a3a] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm group-hover:bg-indigo-500 transition-colors">
            AX
          </div>
          <span className="text-lg font-bold tracking-tight">
            AGEN<span className="text-indigo-400">X</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400"
                    : "text-[#9494a8] hover:bg-[#1e1e2a] hover:text-[#e4e4ef]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            <span className="text-xs font-medium text-emerald-400">Live on Sui Testnet</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
