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
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { unreadCount, markAllAsRead } = useNotifications();
  
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  // Determine current page title if not passed explicitly
  const displayTitle = pageTitle || getTitleFromPath(pathname);

  const notificationLabel =
    unreadCount > 0
      ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
      : "No unread notifications";

  return (
    <header className="lb-top-header">
      <div className="header-container">
        {/* Left Title & Subtitle */}
        <div className="header-title-block">
          <div className="header-title-row">
            <Icon name="sparkles" size={20} className="title-icon text-teal" />
            <h1 className="header-page-title">{displayTitle}</h1>
          </div>
          <p className="header-page-subtitle">{pageSubtitle}</p>
        </div>

        {/* Right Header Actions */}
        <div className="header-right-actions">
          {/* AI Assistant Navigation Button */}
          <Link
            href="/assistant"
            className="header-btn font-semibold text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:opacity-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Icon name="sparkles" size={14} />
            <span className="hidden sm:inline">AI Assistant</span>
          </Link>

          {/* Refresh Action Button */}
          {onRefresh && (
            <button
              type="button"
              className={`header-btn refresh-btn ${isRefreshing ? "spin" : ""}`}
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <Icon name="refresh" size={16} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            type="button"
            className="header-btn icon-btn notif-btn"
            aria-label={notificationLabel}
            onClick={() => markAllAsRead()}
            title="Notifications"
          >
            <Icon name="bell" size={18} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {/* Theme Toggle Selector */}
          <ThemeToggle mode={theme} onChange={setTheme} />

          {/* User Profile Greeting & Avatar Dropdown */}
          <div className="profile-greeting-wrapper">
            <button
              type="button"
              className="user-avatar-btn"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-expanded={showProfileMenu}
              aria-label="User Account Options"
            >
              <span className="greeting-text">
                {isAuthenticated ? `Hello, ${user?.name || "Demo User"}` : "Hello, Guest"}
              </span>
              <div className="avatar-img-placeholder">
                <Icon name="user" size={18} />
              </div>
            </button>

            {showProfileMenu && (
              <div className="profile-menu-dropdown" role="menu">
                {isAuthenticated ? (
                  <>
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">{user?.name || "Demo User"}</div>
                      <div className="dropdown-user-email">{user?.email || "demo@lifebridge.ai"}</div>
                      <div className="dropdown-user-role">Local Demo Profile</div>
                    </div>
                    <hr className="dropdown-divider" />
                    <Link href="/profile" className="dropdown-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                      <Icon name="user" size={16} /> My Profile & Preferences
                    </Link>
                    <Link href="/saved" className="dropdown-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                      <Icon name="bookmark" size={16} /> Saved Opportunities
                    </Link>
                    <button
                      type="button"
                      className="dropdown-item text-rose-600 dark:text-rose-400 w-full text-left"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                    >
                      <Icon name="logout" size={16} /> Clear Demo Profile
                    </button>
                  </>
                ) : (
                  <>
                    <div className="dropdown-user-info">
                      <div className="dropdown-user-name">Guest Explorer</div>
                      <div className="dropdown-user-email">Set up a local demo profile to personalise</div>
                    </div>
                    <hr className="dropdown-divider" />
                    <Link href="/login" className="dropdown-item font-semibold text-primary-600" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                      <Icon name="user" size={16} /> Set Up Local Demo Profile
                    </Link>
                  </>
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
    case "/decision-graph":
      return "Personal Decision Graph";
    case "/trust-scanner":
      return "VerifyLink Trust Scanner";
    case "/accessibility":
      return "AccessLink Mobility";
    case "/profile":
      return "Profile & Preferences";
    case "/saved":
      return "Saved Items";
    case "/about":
      return "About LifeBridge AI";
    case "/settings":
      return "Settings";
    default:
      return "LifeBridge AI";
  }
}

