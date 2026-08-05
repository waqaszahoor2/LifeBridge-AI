"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { Icon } from "@/components/ui/Icon";
import { fetchFeed } from "@/lib/api";
import { sampleFeed } from "@/lib/sample-data";
import type { FeedItem } from "@/lib/types";

export default function DisastersPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoData, setIsDemoData] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchFeed();
      if (res && res.items && res.items.length > 0) {
        const filtered = res.items.filter((i) => ["disaster", "weather", "safety"].includes(i.category));
        setItems(filtered);
        setIsDemoData(!res.live);
      } else {
        setItems(sampleFeed.filter((i) => ["disaster", "weather", "safety"].includes(i.category)));
        setIsDemoData(true);
      }
    } catch {
      setItems(sampleFeed.filter((i) => ["disaster", "weather", "safety"].includes(i.category)));
      setIsDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayed = items.filter((item) => {
    if (severityFilter === "all") return true;
    return item.severity === severityFilter;
  });

  return (
    <AppShell pageTitle="DisasterLink Safety" pageSubtitle="Urgent risk advisories, disaster warnings, and emergency management updates.">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Permanent Demonstration Alert Notice when demo data active */}
        {isDemoData && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold uppercase tracking-wider text-[10px]">
                DEMONSTRATION ALERT — NOT A LIVE WARNING
              </span>
              <span>Sample disaster advisories displayed for interface demonstration.</span>
            </span>
          </div>
        )}

        {/* Emergency Notice Header */}
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 text-white shadow-lg border border-rose-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Icon name="alert" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">DisasterLink Safety Advisories</h1>
              <p className="text-xs text-rose-200">Real-time severe risk warnings and disaster management notices</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            ⚠️ <strong>Notice:</strong> In case of an immediate life-threatening emergency, call local official emergency response hotlines (e.g. 1122 / 911 / 112) immediately.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Safety Advisories" },
            { id: "critical", label: "🚨 Critical Risks" },
            { id: "high", label: "⚠️ High Severity" },
            { id: "medium", label: "ℹ️ Medium Alerts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSeverityFilter(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                severityFilter === tab.id
                  ? "bg-rose-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card Stream */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No matching alerts found</h3>
            <button type="button" onClick={() => setSeverityFilter("all")} className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 text-white">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((item) => (
              <FeedCard key={item.id || item.external_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
