import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-black text-primary-500/20 mb-4">404</div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/for-you"
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/assistant"
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Ask AI Assistant
          </Link>
        </div>
      </div>
    </div>
  );
}
