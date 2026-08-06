"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "./ui/Icon";
import { isDemoModeEnabled } from "@/lib/api";

export function RightSidebar() {
  const [sharingLocation, setSharingLocation] = useState<boolean>(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const isDemo = isDemoModeEnabled();

  const handleShareLocation = async () => {
    setSharingLocation(true);
    setShareFeedback(null);

    if (!navigator.geolocation) {
      setShareFeedback("We could not prepare or share your location.");
      setSharingLocation(false);
      setTimeout(() => setShareFeedback(null), 4000);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: "Emergency Location — LifeBridge AI",
              text: `My current emergency location: ${mapUrl}`,
              url: mapUrl,
            });
            setShareFeedback("Location link shared successfully.");
          } catch {
            setShareFeedback("Location sharing cancelled.");
          }
        } else {
          try {
            await navigator.clipboard.writeText(mapUrl);
            setShareFeedback("Location link copied. You can send it to a trusted contact.");
          } catch {
            setShareFeedback("We could not prepare or share your location.");
          }
        }
        setSharingLocation(false);
        setTimeout(() => setShareFeedback(null), 4500);
      },
      (error) => {
        console.warn("Geolocation permission error:", error);
        setShareFeedback("We could not prepare or share your location.");
        setSharingLocation(false);
        setTimeout(() => setShareFeedback(null), 4500);
      },
      { timeout: 8000 }
    );
  };

  return (
    <aside className="w-[320px] shrink-0 space-y-4" aria-label="Contextual Widgets & Local Info">
      {/* Widget 1: Weather Now (Exact Approved Screenshot Layout) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Weather Now</h3>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Icon name="pin" size={12} className="text-teal-600" /> Guwahati, Assam
          </span>
        </div>

        {isDemo && (
          <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 block text-center">
            Demonstration weather — not current conditions
          </span>
        )}

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
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Quick Services</h3>
          <Link href="/services" className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <Link href="/services?type=telemedicine" className="p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 hover:border-teal-400 transition-colors flex flex-col items-center justify-center text-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="hospital" size={18} />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">Telemedicine</span>
          </Link>
          <Link href="/services?type=ambulance" className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40 hover:border-red-400 transition-colors flex flex-col items-center justify-center text-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="ambulance" size={18} />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">Ambulance</span>
          </Link>
          <Link href="/services?type=blood" className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 hover:border-rose-400 transition-colors flex flex-col items-center justify-center text-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="droplet" size={18} />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">Blood Donor</span>
          </Link>
          <Link href="/services?type=shelter" className="p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 hover:border-sky-400 transition-colors flex flex-col items-center justify-center text-center gap-1.5 group">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon name="services" size={18} />
            </div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[11px]">Nearby Shelter</span>
          </Link>
        </div>
      </div>

      {/* Widget 3: Stay Safe */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-3 relative">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Stay Safe</h3>
          <Icon name="shield" size={16} className="text-teal-600" />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
          Share your location with trusted contacts in emergencies.
        </p>

        {shareFeedback && (
          <div className="p-2 rounded-xl bg-slate-900 text-white text-[11px] font-semibold text-center">
            {shareFeedback}
          </div>
        )}

        <button
          type="button"
          onClick={handleShareLocation}
          disabled={sharingLocation}
          className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
        >
          <Icon name="pin" size={14} className={sharingLocation ? "animate-spin" : ""} />
          <span>{sharingLocation ? "Getting Location..." : "Share Location"}</span>
        </button>
      </div>

      {/* Widget 4: Daily Tip */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white">
          <Icon name="shield" size={15} className="text-teal-600" />
          <span>Daily Tip</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
          &ldquo;Stay informed, stay prepared, stay safe. Small actions save lives.&rdquo;
        </p>
      </div>
    </aside>
  );
}
