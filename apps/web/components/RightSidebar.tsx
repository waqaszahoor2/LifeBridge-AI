"use client";

import Link from "next/link";
import { Icon } from "./ui/Icon";

export function RightSidebar() {
  return (
    <aside className="w-full space-y-4" aria-label="Latest Opportunities & Information Rail">
      {/* AI Assistant Mini-Card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-900 via-slate-900 to-teal-950 p-4 border border-primary-800/50 shadow-xs text-white space-y-3">
        <div className="flex items-center gap-2 text-teal-400 font-extrabold text-xs">
          <Icon name="sparkles" size={16} />
          <span>LifeBridge AI Assistant</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Ask questions about scholarships, career paths, CV evaluation, or emergency safety guidelines.
        </p>
        <Link
          href="/assistant"
          className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-primary-500 to-teal-400 hover:from-primary-600 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-md transition-all"
        >
          <Icon name="sparkles" size={14} />
          <span>Launch AI Chat</span>
        </Link>
      </div>

      {/* Latest Opportunities & Trending Skills */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Top Opportunities</h3>
          <Link href="/opportunities" className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline">
            View All
          </Link>
        </div>
        <ul className="space-y-2.5 text-xs">
          <li className="space-y-0.5">
            <Link href="/scholarships" className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 block line-clamp-1">
              Global STEM Excellence Scholarship 2026
            </Link>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>Scholarship</span>
              <span>•</span>
              <span className="text-teal-600 dark:text-teal-400 font-semibold">Fully Funded</span>
            </div>
          </li>
          <li className="space-y-0.5">
            <Link href="/jobs" className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 block line-clamp-1">
              Junior AI & Data Analyst Apprenticeship
            </Link>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>Full-time</span>
              <span>•</span>
              <span>Remote / Hybrid</span>
            </div>
          </li>
          <li className="space-y-0.5">
            <Link href="/skills" className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 block line-clamp-1">
              CV & Resume Optimizer with AI Analysis
            </Link>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>Skill Tool</span>
              <span>•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Instant Score</span>
            </div>
          </li>
        </ul>
      </div>

      {/* Safety & Important Bulletins */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Safety Bulletins</h3>
          <Link href="/disasters" className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline">
            Advisories
          </Link>
        </div>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
              <Icon name="shield" size={13} />
              <span>Verify Suspicious Job Offers</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
              Use VerifyLink before paying upfront fees for job interviews or visas.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-[11px]">
              <Icon name="services" size={13} />
              <span>ServiceLink Emergency Finder</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              Locate nearby medical centers, shelters, and emergency hotlines.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
