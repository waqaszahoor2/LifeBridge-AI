"use client";

import Link from "next/link";
import { Icon } from "./ui/Icon";
import { useState } from "react";

export function RightSidebar() {
  const [locationShared, setLocationShared] = useState<boolean>(false);

  const handleShareLocation = () => {
    setLocationShared(true);
    setTimeout(() => setLocationShared(false), 4000);
  };

  return (
    <aside className="w-[320px] shrink-0 space-y-4" aria-label="Contextual Widgets & Local Info">
      {/* Widget 1: Weather Now & 4-Day Forecast */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Weather Now</h3>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Icon name="pin" size={12} className="text-teal-600" /> Guwahati, Assam
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80">
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">26°C</div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Cloudy</div>
            <div className="text-[10px] text-slate-400">Feels like 28°C</div>
          </div>
          <Icon name="cloud" size={42} className="text-teal-500 shrink-0" />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500 py-1">
          <div className="p-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/40">
            <Icon name="droplet" size={13} className="mx-auto text-teal-600 mb-0.5" />
            <span className="font-bold block text-slate-700 dark:text-slate-300">72%</span>
            <span>Humidity</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/40">
            <Icon name="cloud" size={13} className="mx-auto text-teal-600 mb-0.5" />
            <span className="font-bold block text-slate-700 dark:text-slate-300">8 km/h</span>
            <span>Wind</span>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/40">
            <Icon name="alert" size={13} className="mx-auto text-teal-600 mb-0.5" />
            <span className="font-bold block text-slate-700 dark:text-slate-300">1012 hPa</span>
            <span>Pressure</span>
          </div>
        </div>

        {/* 4-Day Forecast Mini Row */}
        <div className="grid grid-cols-4 gap-1 text-center text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-0.5">
            <span className="text-slate-400 font-semibold block">Sat</span>
            <Icon name="cloud" size={14} className="mx-auto text-teal-500" />
            <strong className="text-slate-700 dark:text-slate-300 block text-[10px]">31° / 25°</strong>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 font-semibold block">Sun</span>
            <Icon name="sun" size={14} className="mx-auto text-amber-500" />
            <strong className="text-slate-700 dark:text-slate-300 block text-[10px]">30° / 25°</strong>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 font-semibold block">Mon</span>
            <Icon name="cloud" size={14} className="mx-auto text-teal-500" />
            <strong className="text-slate-700 dark:text-slate-300 block text-[10px]">29° / 25°</strong>
          </div>
          <div className="space-y-0.5">
            <span className="text-slate-400 font-semibold block">Tue</span>
            <Icon name="cloud" size={14} className="mx-auto text-teal-500" />
            <strong className="text-slate-700 dark:text-slate-300 block text-[10px]">31° / 26°</strong>
          </div>
        </div>

        <Link href="/weather" className="flex items-center justify-between pt-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">
          <span>View full forecast</span>
          <Icon name="chevron-right" size={14} />
        </Link>
      </div>

      {/* Widget 2: Quick Services */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Quick Services</h3>
          <Link href="/services" className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <Link href="/services?type=telemedicine" className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/50 hover:border-sky-400 transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
              <Icon name="hospital" size={16} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Telemedicine</span>
          </Link>
          <Link href="/services?type=ambulance" className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 hover:border-red-400 transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0">
              <Icon name="ambulance" size={16} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Ambulance</span>
          </Link>
          <Link href="/services?type=blood" className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:border-rose-400 transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
              <Icon name="droplet" size={16} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Blood Donor</span>
          </Link>
          <Link href="/services?type=shelter" className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/50 hover:border-teal-400 transition-colors flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Icon name="services" size={16} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Shelters</span>
          </Link>
        </div>
      </div>

      {/* Widget 3: Stay Safe */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Stay Safe</h3>
          <Icon name="shield" size={16} className="text-teal-600" />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
          Share your emergency location with trusted contacts during active disaster alerts.
        </p>
        <button
          type="button"
          onClick={handleShareLocation}
          className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <Icon name="pin" size={14} />
          <span>{locationShared ? "Location Shared with Contacts!" : "Share Emergency Location"}</span>
        </button>
      </div>

      {/* Widget 4: Daily Tip */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 text-white border border-slate-800 shadow-xs p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-teal-400">
          <span>Daily LifeBridge Tip</span>
          <Icon name="sparkles" size={14} />
        </div>
        <p className="text-xs text-slate-300 italic leading-relaxed">
          &ldquo;Stay informed, stay prepared, stay safe. Small verification steps save lives and prevent financial fraud.&rdquo;
        </p>
      </div>

      {/* Widget 5: Top Opportunities (Demonstration Content Labeled) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Top Opportunities</h3>
          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
            Demo Preview
          </span>
        </div>
        <ul className="space-y-2.5 text-xs">
          <li className="space-y-0.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Link href="/scholarships" className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 block line-clamp-1">
              Global STEM Excellence Scholarship 2026
            </Link>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>Scholarship</span>
              <span>•</span>
              <span className="text-teal-600 dark:text-teal-400 font-semibold">Demonstration Listing</span>
            </div>
          </li>
          <li className="space-y-0.5">
            <Link href="/jobs" className="font-bold text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 block line-clamp-1">
              Junior AI & Data Analyst Apprenticeship
            </Link>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>Full-time</span>
              <span>•</span>
              <span>Demonstration Listing</span>
            </div>
          </li>
        </ul>
        <Link href="/opportunities" className="block text-center text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline pt-1">
          Explore Live Directory &rarr;
        </Link>
      </div>
    </aside>
  );
}
