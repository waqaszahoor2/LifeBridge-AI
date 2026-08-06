"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredProfile } from "@/lib/profile";
import { useSavedItems } from "@/context/SavedItemsContext";

export function LeftSidebar() {
  const { savedCount } = useSavedItems();
  const [profile, setProfile] = useState({
    name: "Guest User",
    title: "Local Demo Profile — not a secure account",
    country: "Not set",
    studyLevel: "Not set",
    field: "Not set",
  });
  const [completeness, setCompleteness] = useState<number>(0);
  const [buildCommit, setBuildCommit] = useState<string>("");

  useEffect(() => {
    // Fetch build info dynamically
    fetch("/api/build-info")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.commit) {
          setBuildCommit(data.commit !== "development" ? data.commit.slice(0, 7) : "dev");
        }
      })
      .catch(() => {});

    // Check stored profile
    const savedProf = getStoredProfile();
    if (savedProf) {
      const checkedFields = [
        savedProf.name,
        savedProf.country,
        savedProf.study_level,
        savedProf.field_of_study,
        savedProf.skills && savedProf.skills.length > 0 ? true : null,
        savedProf.target_goal,
        savedProf.opportunity_type,
        savedProf.notification_pref,
      ];
      const filled = checkedFields.filter(Boolean).length;
      const calc = Math.min(100, Math.round((filled / 8) * 100));
      setCompleteness(calc);

      setProfile((prev) => ({
        ...prev,
        name: savedProf.name || prev.name,
        country: savedProf.country || prev.country,
        studyLevel: savedProf.study_level || prev.studyLevel,
        field: savedProf.field_of_study || prev.field,
      }));
    } else {
      setCompleteness(0);
    }
  }, []);

  return (
    <aside className="linkedin-left-sidebar" aria-label="User Profile & Quick Links">
      {/* Profile Header Card */}
      <div className="sidebar-card profile-summary-card">
        <div className="profile-banner-bg" />
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-placeholder" aria-hidden="true">
            {profile.name && profile.name !== "Guest User" ? profile.name.slice(0, 2).toUpperCase() : "GU"}
          </div>
        </div>
        <div className="profile-info-block">
          <h2 className="profile-name">{profile.name}</h2>
          <p className="profile-headline">{profile.title}</p>
          <div className="profile-meta-tags">
            <span className="meta-badge">📍 {profile.country}</span>
            <span className="meta-badge">🎓 {profile.studyLevel}</span>
          </div>
        </div>

        <hr className="card-divider" />

        <div className="profile-stats-rows">
          <div className="stat-row">
            <span className="stat-label">Profile Completeness</span>
            <span className="stat-value text-teal">{completeness}%</span>
          </div>
          <div className="completeness-bar-bg">
            <div className="completeness-bar-fill" style={{ width: `${completeness}%` }} />
          </div>

          <div className="stat-row mt-2">
            <span className="stat-label">Saved Opportunities</span>
            <span className="stat-value badge-count">{savedCount}</span>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts Card */}
      <div className="sidebar-card nav-shortcuts-card">
        <h3 className="sidebar-card-title">Quick Access</h3>
        <ul className="nav-shortcuts-list">
          <li>
            <Link href="/profile" className="shortcut-link">
              <span className="shortcut-icon">👤</span> My Profile & Preferences
            </Link>
          </li>
          <li>
            <Link href="/saved" className="shortcut-link">
              <span className="shortcut-icon">🔖</span> Saved Opportunities
              {savedCount > 0 && <span className="pill-count">{savedCount}</span>}
            </Link>
          </li>
          <li>
            <Link href="/skills" className="shortcut-link">
              <span className="shortcut-icon">⚡</span> Skills & Match Index
            </Link>
          </li>
          <li>
            <Link href="/accessibility" className="shortcut-link">
              <span className="shortcut-icon">♿</span> Accessibility Controls
            </Link>
          </li>
          <li>
            <Link href="/settings" className="shortcut-link">
              <span className="shortcut-icon">⚙️</span> Push Notification Settings
            </Link>
          </li>
        </ul>
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
          LifeBridge AI v1.0.0 {buildCommit && <>(Build: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{buildCommit}</code>)</>}
        </div>
      </div>
    </aside>
  );
}
