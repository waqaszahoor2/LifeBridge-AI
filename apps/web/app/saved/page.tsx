"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { sampleFeed } from "@/lib/sample-data";
import type { FeedItem } from "@/lib/types";

interface SavedMetadata {
  note?: string;
  deadline?: string;
}

export default function SavedPage() {
  const [savedItems, setSavedItems] = useState<FeedItem[]>([]);
  const [metadata, setMetadata] = useState<Record<number, SavedMetadata>>({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [lastRemoved, setLastRemoved] = useState<FeedItem | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedIds = localStorage.getItem("lifebridge_saved_items");
        const storedMeta = localStorage.getItem("lifebridge_saved_metadata");
        let ids: number[] = [];
        if (storedIds) {
          ids = JSON.parse(storedIds);
        }
        if (storedMeta) {
          setMetadata(JSON.parse(storedMeta));
        }

        // Match sampleFeed items or local items
        const matched = sampleFeed.filter((item) => ids.includes(item.id));
        setSavedItems(matched);
      } catch {
        setSavedItems([]);
      }
    }
  }, []);

  function handleRemove(item: FeedItem) {
    const next = savedItems.filter((i) => i.id !== item.id);
    setSavedItems(next);
    setLastRemoved(item);
    if (typeof window !== "undefined") {
      localStorage.setItem("lifebridge_saved_items", JSON.stringify(next.map((i) => i.id)));
    }
    setTimeout(() => setLastRemoved(null), 5000);
  }

  function handleUndo() {
    if (lastRemoved) {
      const next = [...savedItems, lastRemoved];
      setSavedItems(next);
      setLastRemoved(null);
      if (typeof window !== "undefined") {
        localStorage.setItem("lifebridge_saved_items", JSON.stringify(next.map((i) => i.id)));
      }
    }
  }

  function updateMetadata(id: number, key: "note" | "deadline", value: string) {
    setMetadata((prev) => {
      const next = { ...prev, [id]: { ...prev[id], [key]: value } };
      if (typeof window !== "undefined") {
        localStorage.setItem("lifebridge_saved_metadata", JSON.stringify(next));
      }
      return next;
    });
  }

  const filtered = savedItems.filter((item) => {
    const matchesCat = category === "all" || item.category === category;
    const matchesSearch =
      !search.trim() ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <AppShell pageTitle="Saved Items" pageSubtitle="Your bookmarked opportunities, learning modules, and deadline reminders.">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header Intro */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="bookmark" size={24} className="text-primary-500" />
              Saved Items & Reminders
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Store important jobs, scholarships, and safety advisories locally with custom notes and deadlines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/for-you"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
            >
              Explore Feed
            </Link>
          </div>
        </div>

        {/* Undo Toast Banner */}
        {lastRemoved && (
          <div className="mb-4 p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between shadow-lg">
            <span>Removed item from your saved list.</span>
            <button type="button" onClick={handleUndo} className="text-primary-400 font-bold hover:underline">
              Undo Action
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search saved items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {["all", "job", "scholarship", "disaster", "learning"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  category === cat
                    ? "bg-primary-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Saved List Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 mx-auto flex items-center justify-center mb-3">
              <Icon name="bookmark" size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No saved items found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
              Browse the For You feed or Opportunities page and tap the bookmark icon to save items here.
            </p>
            <Link
              href="/opportunities"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 text-white"
            >
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-primary-500/10 text-primary-600 dark:text-primary-400">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400">• {item.source_name}</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 transition-colors">
                      {item.title}
                    </a>
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {item.summary}
                  </p>

                  {/* Personal Notes & Deadline Inputs */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                    <input
                      type="text"
                      placeholder="Add personal note (e.g. Need to tailor CV)..."
                      value={metadata[item.id]?.note || ""}
                      onChange={(e) => updateMetadata(item.id, "note", e.target.value)}
                      className="bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex-1 min-w-[200px]"
                    />
                    <input
                      type="date"
                      value={metadata[item.id]?.deadline || ""}
                      onChange={(e) => updateMetadata(item.id, "deadline", e.target.value)}
                      className="bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors shrink-0"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
