"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./ui/Icon";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useNotifications } from "@/context/NotificationContext";

export function Header({
  onRefresh,
  isRefreshing,
}: {
  pageTitle?: string;
  pageSubtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { unreadCount, markAllAsRead } = useNotifications();
  
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const notificationLabel =
    unreadCount > 0
      ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
      : "No unread notifications";

  const navItems = [
    { href: "/for-you", label: "For You", icon: "sparkles" as const },
    { href: "/opportunities", label: "Opportunities", icon: "briefcase" as const },
    { href: "/skills", label: "Skills", icon: "academic" as const },
    { href: "/services", label: "Services", icon: "services" as const },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Logo & Search Input */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <Link href="/for-you" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xs group-hover:scale-105 transition-transform">
              LB
            </div>
            <div className="hidden md:flex flex-col">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-none">LifeBridge AI</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide">INTELLIGENCE</span>
            </div>
          </Link>

          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-[280px] hidden sm:block">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search opportunities, skills, safety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Center / Right Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/for-you" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center px-2 sm:px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span className="hidden md:inline mt-0.5">{item.label}</span>
              </Link>
            );
          })}

          {/* AI Assistant Button */}
          <Link
            href="/assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-teal-500 text-white font-bold text-xs hover:opacity-95 shadow-xs transition-all shrink-0 ml-1"
          >
            <Icon name="sparkles" size={14} />
            <span className="hidden sm:inline">AI Assistant</span>
          </Link>

          {/* Refresh Action (if provided) */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${isRefreshing ? "animate-spin opacity-60" : ""}`}
              title="Refresh Feed"
            >
              <Icon name="refresh" size={18} />
            </button>
          )}

          {/* Notifications Button */}
          <button
            type="button"
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={notificationLabel}
            onClick={() => markAllAsRead()}
            title="Notifications"
          >
            <Icon name="bell" size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle mode={theme} onChange={setTheme} />

          {/* User Account Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-expanded={showProfileMenu}
              aria-label="User Account Options"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center">
                {isAuthenticated && user?.name ? user.name.slice(0, 1).toUpperCase() : "G"}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-11 w-56 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 flex flex-col gap-1 text-xs">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1">
                      <div className="font-bold text-slate-900 dark:text-white">{user?.name || "Demo User"}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email || "demo@lifebridge.ai"}</div>
                    </div>
                    <hr className="my-1 border-slate-100 dark:border-slate-800" />
                    <Link href="/profile" className="px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-semibold" onClick={() => setShowProfileMenu(false)}>
                      <Icon name="user" size={14} /> My Profile & Preferences
                    </Link>
                    <Link href="/saved" className="px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-semibold" onClick={() => setShowProfileMenu(false)}>
                      <Icon name="bookmark" size={14} /> Saved Opportunities
                    </Link>
                    <button
                      type="button"
                      className="px-2 py-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-semibold w-full text-left"
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                    >
                      <Icon name="logout" size={14} /> Clear Demo Profile
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1">
                      <div className="font-bold text-slate-900 dark:text-white">Guest Explorer</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Local session active</div>
                    </div>
                    <hr className="my-1 border-slate-100 dark:border-slate-800" />
                    <Link href="/profile" className="px-2 py-1.5 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 flex items-center gap-2 font-semibold" onClick={() => setShowProfileMenu(false)}>
                      <Icon name="user" size={14} /> Build Profile
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
