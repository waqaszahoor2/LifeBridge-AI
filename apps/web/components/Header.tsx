"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./ui/Icon";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";
import { RelativeTime } from "./RelativeTime";

export function Header({
  pageTitle = "For You",
  pageSubtitle = "Verified updates, AI recommendations, and local safety alerts.",
  onRefresh,
  isRefreshing,
}: {
  pageTitle?: string;
  pageSubtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/opportunities?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayTitle = pageTitle || getTitleFromPath(pathname);

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Page Title & Subtitle */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
              {displayTitle}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/60 shrink-0">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
            {pageSubtitle}
          </p>
        </div>

        {/* Global Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-72">
          <input
            type="text"
            placeholder="Search opportunities, skills, safety..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </form>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Refresh Action */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                isRefreshing ? "animate-spin opacity-60" : ""
              }`}
              title="Refresh Feed"
            >
              <Icon name="refresh" size={17} />
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfileMenu(false);
              }}
              title="Notifications"
            >
              <Icon name="bell" size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                    Notifications ({unreadCount} Unread)
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllAsRead()}
                      className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors space-y-1 ${
                          notif.read
                            ? "bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                            : "bg-primary-50/70 dark:bg-primary-950/40 border-primary-200/70 dark:border-primary-900/50 text-slate-900 dark:text-white font-semibold"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold truncate">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            <RelativeTime value={notif.created_at} />
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications at this time.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle mode={theme} onChange={setTheme} />

          {/* User Account Greeting & Avatar Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                setShowNotifications(false);
              }}
              aria-label="User Account Options"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-teal-400 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                {isAuthenticated && user?.name ? user.name.slice(0, 1).toUpperCase() : "G"}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
                {isAuthenticated ? user?.name || "Demo User" : "Hello, Guest"}
              </span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-64 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 space-y-2 text-xs">
                <div className="px-2 py-1">
                  <div className="font-bold text-slate-900 dark:text-white">{isAuthenticated ? user?.name || "Demo Profile" : "Guest Explorer"}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{isAuthenticated ? user?.email || "demo@lifebridge.ai" : "Local Demo Session"}</div>
                </div>
                <hr className="border-slate-100 dark:border-slate-800" />
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Icon name="user" size={15} /> My Profile & Preferences
                </Link>
                <Link
                  href="/saved"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Icon name="bookmark" size={15} /> Saved Opportunities
                </Link>
                {isAuthenticated && (
                  <button
                    type="button"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold w-full text-left"
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                  >
                    <Icon name="logout" size={15} /> Clear Demo Session
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function getTitleFromPath(pathname: string): string {
  switch (pathname) {
    case "/assistant":
      return "AI Assistant";
    case "/for-you":
    case "/":
      return "For You Feed";
    case "/jobs":
      return "Jobs & Careers";
    case "/scholarships":
      return "Scholarships & Funding";
    case "/disasters":
      return "DisasterLink Safety";
    case "/weather":
      return "Weather Advisories";
    case "/services":
      return "ServiceLink Finder";
    case "/opportunities":
      return "Opportunities Explorer";
    case "/skills":
      return "SkillBridge CV Intelligence";
    case "/trust-scanner":
      return "VerifyLink Trust Scanner";
    case "/profile":
      return "Profile & Preferences";
    case "/saved":
      return "Saved Items";
    default:
      return "LifeBridge AI";
  }
}
