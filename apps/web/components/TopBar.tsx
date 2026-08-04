"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import type { ThemeMode } from "@/lib/types";

export function TopBar({ title, kicker = "PERSONAL DECISION PLATFORM", live }: { title: string; kicker?: string; live?: boolean }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lifebridge-theme") as ThemeMode) || "system";
    }
    return "system";
  });
  const [language, setLanguage] = useState<string>("en");
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);
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

  return (
    <header className="topbar">
      <div>
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        {typeof live === "boolean" && (
          <span className={`status ${live ? "live" : "demo"}`}>
            {live ? "Live API" : "Demo data"}
          </span>
        )}

        <div className="lang-control">
          <label htmlFor="lang-select" className="sr-only">Language</label>
          <select
            id="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="lang-select"
            aria-label="Select application language"
          >
            <option value="en">English (EN)</option>
            <option value="ur">اردو (UR)</option>
            <option value="es">Español (ES)</option>
            <option value="fr">Français (FR)</option>
            <option value="ar">العربية (AR)</option>
          </select>
        </div>

        <button
          type="button"
          className="icon-btn notif-btn"
          aria-label={`${unreadNotifications} unread notifications`}
          onClick={() => setUnreadNotifications(0)}
        >
          <span aria-hidden="true">🔔</span>
          {unreadNotifications > 0 && <span className="notif-badge">{unreadNotifications}</span>}
        </button>

        <ThemeToggle mode={theme} onChange={setTheme} />

        <div className="profile-menu-container">
          <button
            type="button"
            className="profile-avatar-btn"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-expanded={showProfileMenu}
            aria-label="User account menu"
          >
            <span className="avatar-text">AI</span>
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown-menu" role="menu">
              <div className="menu-header">
                <strong>Demo User</strong>
                <span>Data Science Candidate</span>
              </div>
              <hr />
              <a href="/profile" role="menuitem">Recommendation Settings</a>
              <a href="/saved" role="menuitem">Saved Bookmarks</a>
              <a href="/settings" role="menuitem">Preferences</a>
              <a href="/login" role="menuitem">Account Sign In</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
