"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center mb-4 text-2xl">
          ⚠️
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Something Went Wrong
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          An unexpected error occurred. Your data has not been affected.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow transition-all"
          >
            Try Again
          </button>
          <Link
            href="/for-you"
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
