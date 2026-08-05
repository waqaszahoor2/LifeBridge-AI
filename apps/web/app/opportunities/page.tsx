"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { Icon } from "@/components/ui/Icon";
import { fetchFeed } from "@/lib/api";
import { sampleFeed } from "@/lib/sample-data";
import type { FeedItem } from "@/lib/types";

export default function OpportunitiesPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [error, setError] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchFeed();
      if (res && res.items && res.items.length > 0) {
        const filtered = res.items.filter((i) => ["job", "scholarship", "learning"].includes(i.category));
        setItems(filtered);
      } else {
        setItems(sampleFeed.filter((i) => ["job", "scholarship", "learning"].includes(i.category)));
      }
    } catch {
      setError(true);
      setItems(sampleFeed.filter((i) => ["job", "scholarship", "learning"].includes(i.category)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayedItems = items.filter((item) => category === "all" || item.category === category);

  return (
    <AppShell pageTitle="Opportunities Explorer" pageSubtitle="Verified job positions, scholarships, and learning programs with transparent source tracking.">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Intro */}
        <div className="mb-6 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="clock" size={24} className="text-primary-500" />
              Opportunities Explorer
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse verified positions, grant deadlines, and skill courses with clear audit timestamps.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Icon name="refresh" size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Opportunities" },
            { id: "job", label: "Jobs & Careers" },
            { id: "scholarship", label: "Scholarships & Grants" },
            { id: "learning", label: "Learning Programs" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                category === tab.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Icon name="alert" size={16} />
            <span>Connected to verified demo database fallback.</span>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No opportunities found</h3>
            <p className="text-xs text-slate-500 mb-4">Try clearing category filters.</p>
            <button type="button" onClick={() => setCategory("all")} className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 text-white">
              Show All
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedItems.map((item) => (
              <FeedCard key={item.id || item.external_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
