"use client";

import { Icon, type IconName } from "@/components/ui/Icon";

export function EmptyState({
  icon = "search",
  title = "No items found",
  message,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
      <Icon name={icon} size={32} className="mx-auto text-slate-400 mb-3" />
      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
      {message && <p className="text-xs text-slate-500 dark:text-slate-400">{message}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
