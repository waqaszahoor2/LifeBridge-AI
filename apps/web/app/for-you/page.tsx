"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { LeftSidebar } from "@/components/LeftSidebar";
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
  { key: "job", label: "Jobs", icon: "briefcase" },
  { key: "scholarship", label: "Scholarships", icon: "academic" },
  { key: "skills" as any, label: "Skills", icon: "academic" },
  { key: "safety", label: "Safety", icon: "shield" },
  { key: "disaster", label: "Disasters", icon: "alert" },
  { key: "service", label: "Services", icon: "services" },
];

function ForYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { isSaved, toggleSave } = useSavedItems();

  const initialCategory = (searchParams.get("category") as CategoryKey) || "all";
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(initialCategory);

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"published" | "score" | "reliability">("published");

  const [recommendations, setRecommendations] = useState<Record<number, { score: number; reasons: string[] }>>({});
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isDemo = isDemoModeEnabled();

  // Sync category with URL search param
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

  // Fetch initial feed data
  const loadInitialFeed = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    setIsOffline(false);

    try {
      const { data, live } = await fetchForYouFeed({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        limit: 15,
      });

      if (!live) setIsOffline(true);

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

      // Check local profile & load recommendations strictly if profile exists
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
        setIsOffline(true);
        const filtered = sampleFeed.filter(
          (i: FeedItem) => selectedCategory === "all" || selectedCategory === "latest" || i.category === selectedCategory
        );
        setItems(filtered.map((i: FeedItem) => ({ ...i, verification_status: "demo" as const, data_mode: "demo" as const })));
        setHasMore(false);
        setNextCursor(null);
      } else {
        // User-friendly error message — no technical infra jargon exposed
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

  // Load next cursor-paginated page
  const loadNextPage = useCallback(async () => {
    if (loadingMore || !hasMore || errorMsg) return;
    setLoadingMore(true);

    try {
      const { data } = await fetchForYouFeed({
        category: selectedCategory === "all" ? undefined : selectedCategory,
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

  // IntersectionObserver for continuous infinite scroll
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
      setRefreshNotice("Feed reloaded.");
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

  // Search filtering & sorting
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
      {/* 3-Column LinkedIn-Style Desktop Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-5 items-start">
        {/* LEFT COLUMN: Profile Card & Shortcuts */}
        <div className="hidden lg:block sticky top-20">
          <LeftSidebar />
        </div>

        {/* CENTER COLUMN: Feed Composer, Categories, Toolbar, & Feed Cards */}
        <div className="space-y-4 min-w-0">
          {/* Feed Composer Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-teal-400 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                {isAuthenticated && user?.name ? user.name.slice(0, 1).toUpperCase() : "G"}
              </div>
              <Link
                href="/assistant"
                className="flex-1 py-2.5 px-4 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-colors flex items-center justify-between"
              >
                <span>Ask or share something with LifeBridge AI...</span>
                <Icon name="sparkles" size={16} className="text-primary-500" />
              </Link>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between gap-1 text-xs font-semibold overflow-x-auto no-scrollbar">
              <Link href="/assistant" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shrink-0">
                <Icon name="sparkles" size={16} className="text-primary-600" />
                <span>Ask AI</span>
              </Link>
              <Link href="/trust-scanner" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shrink-0">
                <Icon name="shield" size={16} className="text-teal-600" />
                <span>Scan Content</span>
              </Link>
              <Link href="/opportunities" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shrink-0">
                <Icon name="briefcase" size={16} className="text-amber-600" />
                <span>Find Opportunity</span>
              </Link>
              <Link href="/skills" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shrink-0">
                <Icon name="academic" size={16} className="text-indigo-600" />
                <span>Build Roadmap</span>
              </Link>
            </div>
          </div>

          {/* Urgent Emergency Alert Banner ONLY when Global Demo Mode is enabled */}
          {isDemo && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs" role="alert">
              <Icon name="alert" size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="font-extrabold tracking-wide uppercase text-[11px] text-amber-700 dark:text-amber-400">DEMONSTRATION ALERT</div>
                <p className="leading-snug text-slate-700 dark:text-slate-300">
                  This is a platform demonstration feed. Emergency bulletins are sourced from verified regional APIs when live connectors are configured.
                </p>
              </div>
            </div>
          )}

          {refreshNotice && (
            <div className="p-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
              <span>{refreshNotice}</span>
              <button type="button" onClick={() => setRefreshNotice(null)} className="ml-2 font-bold opacity-80 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleCategorySelect(cat.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.key
                    ? "bg-primary-600 text-white border-primary-600 shadow-xs"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon name={cat.icon} size={14} />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search, Sort, Refresh Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search feed by keyword or source..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="published">Latest Published</option>
                {hasProfile && <option value="score">Highest AI Match</option>}
                <option value="reliability">Source Reliability</option>
              </select>

              <button
                type="button"
                onClick={handleManualRefresh}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors"
                title="Refresh Feed"
              >
                <Icon name="refresh" size={15} />
              </button>
            </div>
          </div>

          {/* User-Friendly Error Banner (if API error occurs) */}
          {errorMsg && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 shadow-xs text-center space-y-3">
              <Icon name="alert" size={28} className="mx-auto text-red-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{errorMsg}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Please try again in a moment.</p>
              <button
                type="button"
                onClick={loadInitialFeed}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-colors inline-flex items-center gap-2"
              >
                <Icon name="refresh" size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Feed Cards List / Skeleton Loaders */}
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                      <div className="space-y-1 flex-1">
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
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
                      onToggleSave={(i, s) => toggleSave(i.id)}
                      onHide={handleHideItem}
                    />
                  );
                })}
              </div>
            ) : !errorMsg ? (
              <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <Icon name="search" size={28} className="mx-auto text-slate-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">No updates found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchTerm ? `No items matched "${searchTerm}".` : "Check back later for new updates."}
                </p>
              </div>
            ) : null}

            {/* Continuous Infinite Scroll Sentinel */}
            {hasMore && !loading && (
              <div ref={sentinelRef} className="py-6 text-center">
                {loadingMore && (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Icon name="refresh" size={14} className="animate-spin text-primary-600" />
                    <span>Loading more updates...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Latest Opportunities & Information Rail */}
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
