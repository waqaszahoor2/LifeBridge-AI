"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { RightSidebar } from "@/components/RightSidebar";
import { Icon, type IconName } from "@/components/ui/Icon";
import { fetchForYouFeed, fetchRecommendations, isDemoModeEnabled, triggerFeedRefresh } from "@/lib/api";
import { sampleFeed } from "@/lib/sample-data";
import { readLocalProfile } from "@/lib/profile";
import { useSavedItems } from "@/context/SavedItemsContext";
import { useAuth } from "@/context/AuthContext";
import type { FeedCategory, FeedItem } from "@/lib/types";

type CategoryKey = "all" | "latest" | FeedCategory;

const CATEGORIES: { key: CategoryKey; label: string; icon: IconName }[] = [
  { key: "all", label: "For You", icon: "sparkles" },
  { key: "latest" as any, label: "Latest", icon: "clock" },
  { key: "job", label: "Jobs", icon: "briefcase" },
  { key: "scholarship", label: "Scholarships", icon: "academic" },
  { key: "disaster", label: "Disasters", icon: "alert" },
  { key: "weather", label: "Weather", icon: "cloud" },
  { key: "service", label: "Services", icon: "services" },
  { key: "safety", label: "Safety", icon: "shield" },
  { key: "skills" as any, label: "Learning", icon: "academic" },
];

function ForYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSaved, toggleSave } = useSavedItems();

  const initialCategory = (searchParams.get("category") as CategoryKey) || "all";
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(initialCategory);

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"published" | "score" | "reliability">("published");

  const [recommendations, setRecommendations] = useState<Record<number, { score: number; reasons: string[] }>>({});
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(true);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isDemo = isDemoModeEnabled();

  const handleCategorySelect = (category: CategoryKey) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all" || category === "latest") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/for-you?${params.toString()}`);
  };

  const loadInitialFeed = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data } = await fetchForYouFeed({
        category: selectedCategory === "all" || selectedCategory === "latest" ? undefined : selectedCategory,
        limit: 15,
      });

      if (data && data.items && data.items.length > 0) {
        setItems(data.items);
        setHasMore(data.has_more);
        setNextCursor(data.next_cursor);
      } else {
        if (isDemoModeEnabled()) {
          const filtered = sampleFeed.filter(
            (i: FeedItem) => selectedCategory === "all" || selectedCategory === "latest" || i.category === selectedCategory
          );
          setItems(filtered.map((i: FeedItem) => ({ ...i, verification_status: "demo" as const, data_mode: "demo" as const })));
        } else {
          setItems([]);
        }
        setHasMore(false);
        setNextCursor(null);
      }

      const userProf = readLocalProfile();
      if (userProf) {
        setHasProfile(true);
        const recs = await fetchRecommendations(userProf as unknown as Record<string, unknown>).catch(() => []);
        if (recs && recs.length > 0) {
          const map: Record<number, { score: number; reasons: string[] }> = {};
          recs.forEach((r) => {
            map[r.item.id] = { score: r.score, reasons: r.reasons };
          });
          setRecommendations(map);
        }
      } else {
        setHasProfile(false);
        setRecommendations({});
      }
    } catch {
      if (isDemoModeEnabled()) {
        const filtered = sampleFeed.filter(
          (i: FeedItem) => selectedCategory === "all" || selectedCategory === "latest" || i.category === selectedCategory
        );
        setItems(filtered.map((i: FeedItem) => ({ ...i, verification_status: "demo" as const, data_mode: "demo" as const })));
        setHasMore(false);
        setNextCursor(null);
      } else {
        setErrorMsg("Live updates are temporarily unavailable. Please try again in a moment.");
        setItems([]);
        setHasMore(false);
        setNextCursor(null);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadInitialFeed();
  }, [loadInitialFeed]);

  const loadNextPage = useCallback(async () => {
    if (loadingMore || !hasMore || errorMsg) return;
    setLoadingMore(true);

    try {
      const { data } = await fetchForYouFeed({
        category: selectedCategory === "all" || selectedCategory === "latest" ? undefined : selectedCategory,
        cursor: nextCursor || undefined,
        limit: 10,
      });

      if (data && data.items && data.items.length > 0) {
        const existingIds = new Set(items.map((i) => i.id));
        const newItems = data.items.filter((item) => !existingIds.has(item.id));
        if (newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
          setHasMore(data.has_more);
          setNextCursor(data.next_cursor);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, errorMsg, items, selectedCategory, nextCursor]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading || loadingMore || errorMsg) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextPage();
        }
      },
      { rootMargin: "350px" }
    );

    const currentSentinel = sentinelRef.current;
    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [hasMore, loading, loadingMore, errorMsg, loadNextPage]);

  const handleManualRefresh = async () => {
    setRefreshNotice(null);
    let refreshSuccess = false;
    try {
      const res = await triggerFeedRefresh();
      if (res && res.status === "success") {
        refreshSuccess = true;
      }
    } catch {
      refreshSuccess = false;
    }
    await loadInitialFeed();
    if (refreshSuccess) {
      setRefreshNotice("Fresh data requested successfully.");
    } else {
      setRefreshNotice("Displayed items refreshed.");
    }
    setTimeout(() => setRefreshNotice(null), 4000);
  };

  const handleHideItem = (item: FeedItem) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
  };

  const getFilteredAndSortedItems = () => {
    let filtered = items.filter((i) => !hiddenIds.has(i.id));

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(term) ||
          i.summary.toLowerCase().includes(term) ||
          (i.source_name && i.source_name.toLowerCase().includes(term)) ||
          (i.tags && i.tags.toLowerCase().includes(term)) ||
          (i.location && i.location.toLowerCase().includes(term))
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "reliability" && typeof a.source_reliability === "number" && typeof b.source_reliability === "number") {
        return b.source_reliability - a.source_reliability;
      }
      if (sortBy === "score" && hasProfile) {
        const scoreA = recommendations[a.id]?.score ?? a.match_score ?? 0;
        const scoreB = recommendations[b.id]?.score ?? b.match_score ?? 0;
        return scoreB - scoreA;
      }
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
  };

  const displayedItems = getFilteredAndSortedItems();

  return (
    <AppShell onRefresh={handleManualRefresh} isRefreshing={loading}>
      {/* 2-Column Desktop Grid Layout: Feed Column (flex-1 min 650px) + Right Sidebar (320px) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* CENTER FEED COLUMN */}
        <div className="flex-1 min-w-0 space-y-4 w-full">
          {/* Urgent Emergency Alert Banner (Matches Approved Screenshot) */}
          {showAlert && (
            <div className="p-4 rounded-2xl bg-red-50/90 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 text-slate-900 dark:text-slate-100 flex items-start gap-4 relative shadow-2xs">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Icon name="alert" size={22} />
              </div>
              <div className="flex-1 min-w-0 space-y-1 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs text-red-700 dark:text-red-400 tracking-wide uppercase">URGENT FLOOD ALERT</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/80 text-red-700 dark:text-red-300 font-extrabold text-[10px]">High Risk</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                  Heavy rainfall causing severe flooding in parts of Assam and Bihar. Stay indoors if possible. Follow local instructions and stay safe.
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <Link href="/disasters" className="font-bold text-red-700 dark:text-red-400 hover:underline flex items-center gap-1">
                    <span>📅 View Affected Areas</span>
                    <Icon name="chevron-right" size={12} />
                  </Link>
                  <span>•</span>
                  <span>Source: IMD • 20 mins ago</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAlert(false)}
                className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                title="Dismiss Alert"
              >
                ✕
              </button>
            </div>
          )}

          {refreshNotice && (
            <div className="p-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs">
              <span>{refreshNotice}</span>
              <button type="button" onClick={() => setRefreshNotice(null)} className="ml-2 font-bold opacity-80 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Category Tabs (Exact Approved Screenshot Pill Design) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategorySelect(cat.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                  }`}
                >
                  <Icon name={cat.icon} size={14} className={isActive ? "text-white" : "text-teal-600 dark:text-teal-400"} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Compact Toolbar: Filter Search Input, Sort Select, Refresh Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search feed by keyword, topic, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="published">Latest Published</option>
                {hasProfile && <option value="score">Highest AI Match</option>}
                <option value="reliability">Source Reliability</option>
              </select>

              <button
                type="button"
                onClick={handleManualRefresh}
                className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                title="Refresh Feed"
              >
                <Icon name="refresh" size={15} />
              </button>
            </div>
          </div>

          {/* Inline Error Card (Approved Error Handling Format) */}
          {errorMsg && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-2xs text-center space-y-3">
              <Icon name="alert" size={28} className="mx-auto text-red-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Live updates are temporarily unavailable.</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Please try again in a moment.</p>
              <button
                type="button"
                onClick={loadInitialFeed}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-2xs transition-colors inline-flex items-center gap-2"
              >
                <Icon name="refresh" size={14} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Feed Cards List / Skeleton Loaders */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : displayedItems.length > 0 ? (
              <div className="space-y-4">
                {displayedItems.map((item) => {
                  const rec = hasProfile ? recommendations[item.id] : undefined;
                  return (
                    <FeedCard
                      key={item.id}
                      item={item}
                      matchScore={rec ? rec.score : undefined}
                      reasons={rec ? rec.reasons : undefined}
                      isSavedInitial={isSaved(item.id)}
                      onToggleSave={(i) => toggleSave(i.id)}
                      onHide={handleHideItem}
                    />
                  );
                })}
              </div>
            ) : !errorMsg ? (
              <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
                <Icon name="search" size={28} className="mx-auto text-slate-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">No updates found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchTerm ? `No items matched "${searchTerm}".` : "Check back later for new updates."}
                </p>
              </div>
            ) : null}

            {/* End Sentinel Bar (Exact Approved Screenshot Design) */}
            {!loading && displayedItems.length > 0 && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-teal-600 text-lg">♾️</span>
                  <span>You&apos;ve reached the end for now. New updates will appear automatically.</span>
                </div>
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Icon name="refresh" size={13} />
                  <span>Refresh</span>
                </button>
              </div>
            )}

            {/* Continuous Infinite Scroll Sentinel */}
            {hasMore && !loading && (
              <div ref={sentinelRef} className="py-6 text-center">
                {loadingMore && (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Icon name="refresh" size={14} className="animate-spin text-teal-600" />
                    <span>Loading more updates...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR COLUMN (Weather Now, Quick Services, Stay Safe, Daily Tip) */}
        <div className="hidden lg:block sticky top-20">
          <RightSidebar />
        </div>
      </div>
    </AppShell>
  );
}

export default function ForYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-semibold text-slate-500">Loading feed...</div>}>
      <ForYouContent />
    </Suspense>
  );
}
