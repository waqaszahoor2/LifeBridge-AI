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
  pageSubtitle = "Personalized updates and insights that matter to you.",
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

  const displayTitle = pageTitle || getTitleFromPath(pathname);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Page Title & Subtitle (Approved Screenshot Format) */}
        <div className="min-w-0 flex-1 flex items-center gap-3">
          <Icon name="sparkles" size={22} className="text-teal-600 dark:text-teal-400 shrink-0 hidden sm:block" />
          <div className="min-w-0">
            <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight truncate block">
              {displayTitle}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block mt-0.5">
              {pageSubtitle}
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Refresh Action Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 ${
                isRefreshing ? "opacity-60" : ""
              }`}
              title="Refresh Feed"
            >
              <Icon name="refresh" size={14} className={isRefreshing ? "animate-spin text-teal-600" : "text-slate-500"} />
              <span>Refresh</span>
            </button>
          )}

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                setShowNotifications((prev) => !prev);
                setShowProfileMenu(false);
              }}
              aria-label="Notifications"
            >
              <Icon name="bell" size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-teal-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
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
                      className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
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
                            : "bg-teal-50/70 dark:bg-teal-950/40 border-teal-200/70 dark:border-teal-900/50 text-slate-900 dark:text-white font-semibold"
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
              className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                setShowProfileMenu((prev) => !prev);
                setShowNotifications(false);
              }}
              aria-label="User Account Options"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline pl-1">
                {isAuthenticated ? `Hello, ${user?.name || "Aarav"}` : "Hello, Aarav"}
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-600 overflow-hidden">
                {/* Avatar representation matching approved screenshot */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                  alt="User profile avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-64 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 space-y-2 text-xs">
                <div className="px-2 py-1">
                  <div className="font-bold text-slate-900 dark:text-white">{isAuthenticated ? user?.name || "Aarav Sharma" : "Aarav Sharma"}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{isAuthenticated ? user?.email || "aarav@lifebridge.ai" : "aarav@lifebridge.ai"}</div>
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
      return "For You";
    case "/jobs":
      return "Jobs";
    case "/scholarships":
      return "Scholarships";
    case "/disasters":
      return "Disasters";
    case "/weather":
      return "Weather";
    case "/services":
      return "Services";
    case "/trust-scanner":
      return "Safety";
    case "/skills":
      return "Learning";
    case "/profile":
      return "Profile";
    case "/saved":
      return "Saved Items";
    default:
      return "LifeBridge AI";
  }
}
