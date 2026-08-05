"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function FloatingAssistantButton() {
  return (
    <Link
      href="/assistant"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 inline-flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-medium text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group border border-white/20"
      aria-label="Open AI Assistant"
    >
      <div className="relative">
        <Icon name="sparkles" size={20} className="animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-slate-900" />
      </div>
      <span className="hidden sm:inline font-semibold">Ask LifeBridge AI</span>
    </Link>
  );
}
