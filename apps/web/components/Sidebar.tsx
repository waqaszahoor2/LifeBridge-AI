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
  { href: "/opportunities?category=latest", label: "Latest", icon: "clock" },
  { href: "/jobs", label: "Jobs", icon: "briefcase" },
  { href: "/scholarships", label: "Scholarships", icon: "academic" },
  { href: "/disasters", label: "Disasters", icon: "alert" },
  { href: "/weather", label: "Weather", icon: "cloud" },
  { href: "/services", label: "Services", icon: "services" },
  { href: "/trust-scanner", label: "Safety", icon: "shield" },
  { href: "/skills", label: "Learning", icon: "academic" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { savedCount } = useSavedItems();

  return (
    <aside className="w-[250px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-screen sticky top-0 z-40 overflow-y-auto no-scrollbar" aria-label="Main Navigation Sidebar">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/for-you" className="flex items-center gap-3 group" aria-label="LifeBridge AI Home">
          {/* Teal Heart Icon Badge */}
          <div className="w-10 h-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-base text-slate-900 dark:text-white leading-tight tracking-tight">LifeBridge AI</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5 truncate">AI for a safer, healthier life</span>
          </div>
        </Link>
      </div>

      {/* Primary Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto no-scrollbar" aria-label="Primary Navigation">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/for-you" && (pathname === "/" || pathname === "/for-you"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                isActive
                  ? "bg-teal-600 dark:bg-teal-600 text-white font-bold shadow-xs"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name={item.icon} size={17} className={isActive ? "text-white" : "text-teal-600 dark:text-teal-400"} />
                <span>{item.label}</span>
              </div>
              {item.href === "/saved" && savedCount > 0 ? (
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${isActive ? "bg-white text-teal-700" : "bg-teal-600 text-white"}`}>
                  {savedCount}
                </span>
              ) : item.badge ? (
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md ${isActive ? "bg-white/20 text-white" : "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400"}`}>
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* LifeBridge AI Assistant Promo Card (Exact Approved Screenshot) */}
      <div className="p-3">
        <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 dark:text-white">LifeBridge AI Assistant</span>
            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-teal-500 text-white uppercase tracking-wider">Beta</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
            Your AI companion for health, safety, learning and more.
          </p>
          <Link
            href="/assistant"
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <Icon name="sparkles" size={14} />
            <span>Chat Now</span>
          </Link>
        </div>
      </div>

      {/* Footer System Links */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs font-semibold">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors ${
            pathname === "/settings"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Icon name="settings" size={16} className="text-slate-400" />
          <span>Settings</span>
        </Link>
        <Link
          href="/help"
          className={`flex items-center gap-3 px-3.5 py-2 rounded-xl transition-colors ${
            pathname === "/help"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Icon name="help" size={16} className="text-slate-400" />
          <span>Help & Support</span>
        </Link>
        {isAuthenticated && (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left transition-colors"
          >
            <Icon name="logout" size={16} />
            <span>Log Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
