"use client";

import { Icon } from "@/components/ui/Icon";

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Retry",
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-red-200 dark:border-red-900/30 space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-3">
        <Icon name="alert" size={24} />
      </div>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      {message && <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">{message}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow transition-all"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
