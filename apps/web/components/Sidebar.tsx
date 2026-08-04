"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./ui/Icon";

interface NavGroupItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
}

const navItems: NavGroupItem[] = [
  { href: "/for-you", label: "For You", icon: "sparkles" },
  { href: "/opportunities", label: "Latest", icon: "clock" },
  { href: "/jobs", label: "Jobs", icon: "briefcase" },
  { href: "/scholarships", label: "Scholarships", icon: "academic" },
  { href: "/disasters", label: "Disasters", icon: "alert" },
  { href: "/weather", label: "Weather", icon: "cloud" },
  { href: "/services", label: "Services", icon: "services" },
  { href: "/trust-scanner", label: "Safety", icon: "shield" },
  { href: "/skills", label: "Learning", icon: "book" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="lb-desktop-sidebar" aria-label="Main Navigation Sidebar">
      {/* Brand Header */}
      <Link href="/for-you" className="sidebar-brand" aria-label="LifeBridge AI Home">
        <div className="brand-logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill="url(#brandGrad)"
            />
            <defs>
              <linearGradient id="brandGrad" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#078F87" />
                <stop offset="1" stopColor="#0DA7A0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="brand-text-block">
          <span className="brand-title">LifeBridge AI</span>
          <span className="brand-sub">AI for a safer, healthier life</span>
        </div>
      </Link>

      {/* Primary Navigation Links */}
      <nav className="sidebar-nav-list" aria-label="Primary Navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/for-you" && pathname === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon name={item.icon} size={18} className="nav-icon" />
              <span className="nav-text">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>

      {/* AI Assistant Promo Card */}
      <div className="assistant-promo-card">
        <div className="promo-header">
          <span className="promo-title">LifeBridge AI Assistant</span>
          <span className="beta-badge">Beta</span>
        </div>
        <p className="promo-desc">
          Your AI companion for health, safety, learning and more.
        </p>
        <Link href="/skills" className="promo-btn">
          <Icon name="sparkles" size={15} />
          <span>Chat Now</span>
        </Link>
      </div>

      {/* Footer Navigation Options */}
      <div className="sidebar-footer-links">
        <Link href="/settings" className={`footer-link ${pathname === "/settings" ? "active" : ""}`}>
          <Icon name="settings" size={16} />
          <span>Settings</span>
        </Link>
        <Link href="/about" className={`footer-link ${pathname === "/about" ? "active" : ""}`}>
          <Icon name="help" size={16} />
          <span>Help & Support</span>
        </Link>
        <Link href="/login" className="footer-link logout-link">
          <Icon name="logout" size={16} />
          <span>Log Out</span>
        </Link>
      </div>
    </aside>
  );
}

