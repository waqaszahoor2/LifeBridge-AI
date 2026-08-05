"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/context/AuthContext";
import { Icon } from "@/components/ui/Icon";

export default function LoginPage() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    login(email, name || undefined);
    setMessage(`Successfully signed in as ${email}`);
  };

  return (
    <AppShell>
      <TopBar title="User Authentication" />
      <PageIntro
        title="Sign In to LifeBridge AI"
        description="Access personalized recommendations, saved opportunities, and multi-turn AI assistance across platforms."
      />

      <div className="max-w-md mx-auto my-6 px-4">
        {isAuthenticated ? (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 text-primary-500 mx-auto flex items-center justify-center mb-4">
              <Icon name="user" size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Signed in as {user?.name}
            </h2>
            <p className="text-xs text-slate-500 mb-6">{user?.email}</p>
            <div className="flex flex-col gap-3">
              <Link
                href="/for-you"
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Go to For You Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 text-xs font-bold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          <form className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.org"
                className="w-full bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <button type="submit" className="w-full py-2.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all">
              Sign In
            </button>

            {message && <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 font-semibold">{message}</p>}
          </form>
        )}
      </div>
    </AppShell>
  );
}
