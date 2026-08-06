"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredProfile } from "@/lib/profile";
import { useSavedItems } from "@/context/SavedItemsContext";
import { Icon } from "./ui/Icon";

export function LeftSidebar() {
  const { savedCount } = useSavedItems();
  const [profile, setProfile] = useState({
    name: "Guest",
    title: "Guest Explorer",
    country: "",
    studyLevel: "",
    field: "",
    hasLocalProfile: false,
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
    if (savedProf && (savedProf.name || savedProf.country || savedProf.study_level)) {
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

      setProfile({
        name: savedProf.name || "Guest Explorer",
        title: savedProf.target_goal || "Local Demo Profile",
        country: savedProf.country || "",
        studyLevel: savedProf.study_level || "",
        field: savedProf.field_of_study || "",
        hasLocalProfile: true,
      });
    } else {
      setCompleteness(0);
      setProfile({
        name: "Guest",
        title: "Guest Explorer",
        country: "",
        studyLevel: "",
        field: "",
        hasLocalProfile: false,
      });
    }
  }, []);

  return (
    <aside className="w-full space-y-4" aria-label="User Profile & Quick Links">
      {/* Profile Header Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="h-16 bg-gradient-to-r from-primary-600 via-primary-700 to-teal-600" />
        
        {/* Avatar */}
        <div className="px-4 -mt-8 mb-2 flex justify-between items-end">
          <div className="w-14 h-14 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-primary-500 to-teal-400 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
            {profile.hasLocalProfile && profile.name && profile.name !== "Guest"
              ? profile.name.slice(0, 2).toUpperCase()
              : "👤"}
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-3">
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">{profile.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{profile.title}</p>
          {profile.hasLocalProfile && (profile.country || profile.studyLevel) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.country && <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">📍 {profile.country}</span>}
              {profile.studyLevel && <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">🎓 {profile.studyLevel}</span>}
            </div>
          )}
        </div>

        <hr className="border-slate-100 dark:border-slate-800" />

        {/* Stats */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-500 dark:text-slate-400">Profile Completeness</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{completeness}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-teal-400 rounded-full transition-all duration-300" style={{ width: `${completeness}%` }} />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-500 dark:text-slate-400">Saved Items</span>
            <span className="px-2 py-0.5 rounded-full bg-primary-600 text-white font-bold text-[11px]">{savedCount}</span>
          </div>

          <Link
            href="/profile"
            className="block w-full text-center py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold text-xs border border-slate-200/80 dark:border-slate-700/80 transition-all mt-1"
          >
            Build My Profile
          </Link>
        </div>
      </div>

      {/* Navigation Shortcuts Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shortcuts</h3>
        <ul className="space-y-1 text-xs">
          <li>
            <Link href="/saved" className="flex items-center justify-between p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
              <span className="flex items-center gap-2">
                <Icon name="bookmark" size={15} className="text-primary-500" />
                <span>Saved Items</span>
              </span>
              {savedCount > 0 && <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px]">{savedCount}</span>}
            </Link>
          </li>
          <li>
            <Link href="/skills" className="flex items-center gap-2 p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
              <Icon name="academic" size={15} className="text-teal-500" />
              <span>My Roadmaps</span>
            </Link>
          </li>
          <li>
            <Link href="/opportunities" className="flex items-center gap-2 p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
              <Icon name="briefcase" size={15} className="text-indigo-500" />
              <span>Applications</span>
            </Link>
          </li>
          <li>
            <Link href="/accessibility" className="flex items-center gap-2 p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
              <Icon name="user" size={15} className="text-amber-500" />
              <span>Accessibility Preferences</span>
            </Link>
          </li>
          <li>
            <Link href="/settings" className="flex items-center gap-2 p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">
              <Icon name="settings" size={15} className="text-slate-400" />
              <span>Notification Settings</span>
            </Link>
          </li>
        </ul>
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
          LifeBridge AI v1.0.0 {buildCommit && <>(Commit: <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{buildCommit}</code>)</>}
        </div>
      </div>
    </aside>
  );
}
