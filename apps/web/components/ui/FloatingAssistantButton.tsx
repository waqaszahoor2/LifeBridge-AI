"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function FloatingAssistantButton() {
  return (
    <Link
      href="/assistant"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 inline-flex items-center gap-2.5 px-4 py-3 min-w-[44px] min-h-[44px] bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group border border-teal-400/30 focus:outline-none focus:ring-4 focus:ring-teal-500/40"
      aria-label="Ask LifeBridge AI Assistant"
      title="Ask LifeBridge AI"
    >
      <div className="relative flex items-center justify-center">
        <Icon name="sparkles" size={18} className="animate-pulse" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full ring-1 ring-teal-600" />
      </div>
      <span className="font-bold tracking-tight">Ask LifeBridge AI</span>
    </Link>
  );
}
