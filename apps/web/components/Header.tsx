"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./ui/Icon";
import type { ThemeMode } from "@/lib/types";

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
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lifebridge-theme") as ThemeMode) || "system";
    }
    return "system";
  });
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  useEffect(() => {
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
    } else {
      document.documentElement.dataset.theme = theme;
    }
    localStorage.setItem("lifebridge-theme", theme);
  }, [theme]);

  // Determine current page title if not passed explicitly
  const displayTitle = pageTitle || getTitleFromPath(pathname);

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
            aria-label={`${unreadCount} notifications`}
            onClick={() => setUnreadCount(0)}
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
              <span className="greeting-text">Hello, Aarav</span>
              <div className="avatar-img-placeholder">
                <Icon name="user" size={18} />
              </div>
            </button>

            {showProfileMenu && (
              <div className="profile-menu-dropdown" role="menu">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">Aarav Sharma</div>
                  <div className="dropdown-user-email">aarav.sharma@lifebridge.ai</div>
                  <div className="dropdown-user-role">Student & Civic Safety Volunteer</div>
                </div>
                <hr className="dropdown-divider" />
                <Link href="/profile" className="dropdown-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <Icon name="user" size={16} /> My Profile & Preferences
                </Link>
                <Link href="/saved" className="dropdown-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <Icon name="bookmark" size={16} /> Saved Opportunities
                </Link>
                <Link href="/skills" className="dropdown-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <Icon name="book" size={16} /> SkillBridge Intelligence
                </Link>
                <Link href="/settings" className="dropdown-item" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  <Icon name="settings" size={16} /> Settings
                </Link>
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

