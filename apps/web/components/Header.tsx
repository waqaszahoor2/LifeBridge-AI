"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import type { ThemeMode } from "@/lib/types";

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("lifebridge-theme") as ThemeMode) || "system";
    }
    return "system";
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState<number>(2);
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

  const navLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/for-you", label: "For You", icon: "✨" },
    { href: "/jobs", label: "Jobs", icon: "💼" },
    { href: "/scholarships", label: "Scholarships", icon: "🎓" },
    { href: "/disasters", label: "Disasters", icon: "🚨" },
    { href: "/services", label: "Services", icon: "✚" },
  ];

  return (
    <header className="lb-linkedin-header">
      <div className="header-inner container">
        {/* Brand Logo */}
        <Link href="/for-you" className="brand-logo" aria-label="LifeBridge AI Home">
          <div className="logo-badge">LB</div>
          <div className="brand-text">
            <span className="brand-name">LifeBridge AI</span>
            <span className="brand-tagline">Personalised Opportunity Feed</span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="global-search-container">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search opportunities, skills, alerts..."
            aria-label="Global search"
            className="global-search-input"
          />
        </div>

        {/* Main Desktop Navigation */}
        <nav className="header-nav-links" aria-label="Primary navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <span className="nav-icon" aria-hidden="true">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Controls & User Profile */}
        <div className="header-actions">
          {/* Notifications Button */}
          <button
            type="button"
            className="icon-action-btn notif-btn"
            aria-label={`${unreadCount} notifications`}
            onClick={() => setUnreadCount(0)}
            title="Notifications"
          >
            <span className="action-icon">🔔</span>
            {unreadCount > 0 && <span className="unread-pill">{unreadCount}</span>}
          </button>

          {/* Theme Selector */}
          <ThemeToggle mode={theme} onChange={setTheme} />

          {/* User Profile Menu */}
          <div className="profile-menu-wrapper">
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              aria-expanded={showProfileMenu}
              aria-label="User Account Options"
            >
              <span className="avatar-text">WZ</span>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown-card" role="menu">
                <div className="user-info-header">
                  <div className="user-name">Waqas Zahoor</div>
                  <div className="user-role">Data Scientist & AI Researcher</div>
                  <div className="user-loc">📍 Pakistan 🇵🇰 · Masters</div>
                </div>
                <hr className="menu-divider" />
                <Link href="/profile" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  👤 My Profile & Preferences
                </Link>
                <Link href="/saved" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  🔖 Saved Opportunities
                </Link>
                <Link href="/skills" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  ⚡ Skills & Match Index
                </Link>
                <Link href="/accessibility" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  ♿ Accessibility Controls
                </Link>
                <Link href="/settings" role="menuitem" onClick={() => setShowProfileMenu(false)}>
                  ⚙️ Notification Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
