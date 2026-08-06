"use client";

export function LoadingState({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse space-y-3"
        >
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
