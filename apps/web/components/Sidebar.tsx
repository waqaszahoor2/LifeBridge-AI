"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./ui/Icon";
import { useAuth } from "@/context/AuthContext";
import { useSavedItems } from "@/context/SavedItemsContext";

interface NavGroupItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
}

const mainNavItems: NavGroupItem[] = [
  { href: "/for-you", label: "For You", icon: "sparkles" },
  { href: "/assistant", label: "AI Assistant", icon: "sparkles", badge: "AI" },
  { href: "/opportunities", label: "Opportunities", icon: "clock" },
  { href: "/jobs", label: "Jobs", icon: "briefcase" },
  { href: "/scholarships", label: "Scholarships", icon: "academic" },
  { href: "/disasters", label: "Disasters", icon: "alert" },
  { href: "/weather", label: "Weather", icon: "cloud" },
  { href: "/services", label: "Services", icon: "services" },
  { href: "/trust-scanner", label: "Safety & Trust", icon: "shield" },
  { href: "/skills", label: "Skills & CV", icon: "book" },
  { href: "/saved", label: "Saved Items", icon: "bookmark" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { savedCount } = useSavedItems();

  return (
    <aside className="w-[250px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 z-40 overflow-y-auto" aria-label="Main Navigation Sidebar">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <Link href="/for-you" className="flex items-center gap-2.5 group" aria-label="LifeBridge AI Home">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 via-primary-700 to-teal-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
            LB
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-base text-slate-900 dark:text-white leading-none tracking-tight">LifeBridge AI</span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold tracking-wide uppercase mt-0.5">Intelligence Feed</span>
          </div>
        </Link>
      </div>

      {/* Primary Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto" aria-label="Primary Navigation">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/for-you" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-extrabold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon name={item.icon} size={17} className={isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400"} />
                <span>{item.label}</span>
              </div>
              {item.href === "/saved" && savedCount > 0 ? (
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-primary-600 text-white">
                  {savedCount}
                </span>
              ) : item.badge ? (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* AI Companion Promo Card */}
      <div className="p-3">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 via-primary-950 to-teal-950 text-white border border-primary-800/40 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-teal-400">
              <Icon name="sparkles" size={14} /> AI Companion
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-white">v1.0</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Instant help for opportunities, emergency safety, & skill roadmaps.
          </p>
          <Link
            href="/assistant"
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-gradient-to-r from-primary-500 to-teal-400 text-slate-950 font-bold text-xs hover:opacity-95 shadow-sm transition-all"
          >
            <Icon name="sparkles" size={13} />
            <span>Chat Assistant</span>
          </Link>
        </div>
      </div>

      {/* Footer System Links & User Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
        <Link
          href="/profile"
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            pathname === "/profile"
              ? "bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Icon name="user" size={16} />
          <span>Profile & Preferences</span>
        </Link>
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            pathname === "/settings"
              ? "bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Icon name="settings" size={16} />
          <span>Settings</span>
        </Link>
        <Link
          href="/help"
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            pathname === "/help"
              ? "bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Icon name="help" size={16} />
          <span>Help & Support</span>
        </Link>
        {isAuthenticated && (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left transition-colors"
          >
            <Icon name="logout" size={16} />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
