"use client";

import { Icon } from "@/components/ui/Icon";

export function DemoDataNotice({ message }: { message?: string }) {
  return (
    <div
      className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2"
      role="status"
    >
      <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold uppercase tracking-wider text-[10px] shrink-0">
        DEMO DATA
      </span>
      <span>{message || "Showing demonstration data — this is not live or verified information."}</span>
    </div>
  );
}
