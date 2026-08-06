"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { Icon, type IconName } from "@/components/ui/Icon";
import { fetchForYouFeed, fetchRecommendations, isDemoModeEnabled, triggerFeedRefresh } from "@/lib/api";
import { sampleFeed } from "@/lib/sample-data";
import { readLocalProfile } from "@/lib/profile";
import { LeftSidebar } from "@/components/LeftSidebar";
import type { FeedCategory, FeedItem } from "@/lib/types";

type CategoryKey = "all" | "latest" | FeedCategory;

const CATEGORIES: { key: CategoryKey; label: string; icon: IconName }[] = [
  { key: "all", label: "For You Feed", icon: "sparkles" },
  { key: "latest", label: "Latest News", icon: "clock" },
  { key: "disaster", label: "Disasters", icon: "alert" },
  { key: "scholarship", label: "Scholarships", icon: "academic" },
  { key: "job", label: "Jobs", icon: "briefcase" },
  { key: "weather", label: "Weather Alerts", icon: "alert" },
  { key: "service", label: "Services", icon: "services" },
  { key: "safety", label: "Scam Alerts", icon: "shield" },
];

function ForYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [refreshNotice, setRefreshNotice] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const isDemo = isDemoModeEnabled();

  // Load saved bookmarks from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("lifebridge_saved_items");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setSavedIds(new Set(parsed));
        }
      } catch {
        // Fallback
      }
    }
  }, []);

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
        setSeenIds(new Set(data.items.map((i: FeedItem) => i.id)));
        setHasMore(data.has_more);
        setNextCursor(data.next_cursor);
      } else {
        if (isDemoModeEnabled()) {
          const filtered = sampleFeed.filter(
            (i: FeedItem) => selectedCategory === "all" || selectedCategory === "latest" || i.category === selectedCategory
          );
          setItems(filtered.map((i: FeedItem) => ({ ...i, verification_status: "demo" as const, data_mode: "demo" as const })));
          setSeenIds(new Set(filtered.map((i: FeedItem) => i.id)));
        } else {
          setItems([]);
        }
        setHasMore(false);
        setNextCursor(null);
      }

      // Check profile & load recommendations strictly if profile exists
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
        setSeenIds(new Set(filtered.map((i: FeedItem) => i.id)));
        setHasMore(false);
        setNextCursor(null);
      } else {
        setErrorMsg("We could not load live feed updates. Please check backend API connectivity.");
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
        const newItems = data.items.filter((item) => !seenIds.has(item.id));
        if (newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
          setSeenIds((prev) => {
            const next = new Set(prev);
            newItems.forEach((i) => next.add(i.id));
            return next;
          });
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
  }, [loadingMore, hasMore, errorMsg, seenIds, selectedCategory, nextCursor]);

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
      setRefreshNotice("Fresh data requested successfully from server.");
    } else {
      setRefreshNotice("We reloaded the displayed items, but could not request fresh data from the server.");
    }
    setTimeout(() => setRefreshNotice(null), 5000);
  };

  const handleHideItem = (item: FeedItem) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
  };

  const handleToggleSaveItem = (item: FeedItem, saved: boolean) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(item.id);
      else next.delete(item.id);
      if (typeof window !== "undefined") {
        localStorage.setItem("lifebridge_saved_items", JSON.stringify(Array.from(next)));
      }
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
          i.source_name.toLowerCase().includes(term) ||
          i.tags.toLowerCase().includes(term) ||
          i.location.toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "reliability") {
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
    <AppShell pageTitle="For You Feed" pageSubtitle="Verified updates, AI recommendations, and local safety alerts.">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Banner */}
        <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs font-semibold mb-3">
              <Icon name="sparkles" size={14} />
              <span>LifeBridge Intelligence Feed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-white">
              Practical AI support for opportunities, skills, safety and everyday decisions.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
              Discover trusted opportunities, develop useful skills, verify suspicious content and find essential services from one accessible platform.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/assistant"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-teal-400 hover:from-primary-600 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg transition-all flex items-center gap-2"
              >
                <Icon name="sparkles" size={16} />
                <span>Ask LifeBridge AI</span>
              </Link>
              <Link
                href="/opportunities"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <Icon name="clock" size={16} />
                <span>Explore Opportunities</span>
              </Link>
              <Link
                href="/profile"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <Icon name="user" size={16} />
                <span>Build My Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Urgent Emergency Alert Banner ONLY when Global Demo Mode is enabled */}
        {isDemo && (
          <div className="lb-urgent-alert-banner mb-6" role="alert">
            <div className="urgent-banner-left">
              <div className="urgent-icon-circle">
                <Icon name="alert" size={20} className="text-red" />
              </div>
              <div className="urgent-text-content">
                <div className="urgent-header-row">
                  <span className="urgent-label-red">DEMONSTRATION ALERT — NOT A LIVE WARNING</span>
                  <span className="urgent-badge-high">UI Demo Notice</span>
                </div>
                <p className="urgent-message-body">
                  This is a platform demonstration alert layout. Live emergency bulletins are sourced directly from verified regional disaster APIs when configured.
                </p>
                <div className="urgent-footer-row">
                  <a href="/disasters" className="urgent-action-link">
                    View Disaster Bulletin Directory &gt;
                  </a>
                  <span className="urgent-source-meta">Source: LifeBridge AI Demo Layout • UI Demonstration Only</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="urgent-close-btn"
              onClick={(e) => {
                (e.currentTarget.parentElement as HTMLElement).style.display = "none";
              }}
              aria-label="Dismiss Alert"
            >
              ✕
            </button>
          </div>
        )}

        {/* Profile Warning Banner when no profile exists */}
        {!hasProfile && (
          <div className="mb-6 p-4 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
              <Icon name="user" size={18} className="text-primary-500" />
              <span>Complete your profile to receive personalized recommendations.</span>
            </div>
            <Link href="/profile" className="px-3 py-1.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow transition-all shrink-0">
              Setup Profile
            </Link>
          </div>
        )}

        {refreshNotice && (
          <div className="mb-4 p-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{refreshNotice}</span>
            <button type="button" onClick={() => setRefreshNotice(null)} className="ml-2 text-xs font-bold opacity-80 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategorySelect(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.key
                  ? "bg-primary-600 text-white shadow-md shadow-primary-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700/60"
              }`}
            >
              <Icon name={cat.icon} size={15} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Controls: Search, Sort, Refresh */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Search feed by keyword, tag, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              <Icon name="search" size={14} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60 focus:outline-none"
              >
                <option value="published">Latest Published</option>
                {hasProfile && <option value="score">Highest AI Match</option>}
                <option value="reliability">Source Reliability</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-all"
              title="Refresh Feed"
            >
              <Icon name="refresh" size={15} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">{errorMsg}</p>
            <button
              type="button"
              onClick={loadInitialFeed}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Feed Grid with LeftSidebar Rail */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
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
                      isSavedInitial={savedIds.has(item.id)}
                      onToggleSave={handleToggleSaveItem}
                      onHide={handleHideItem}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <Icon name="search" size={32} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">No current updates were found.</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchTerm ? `No items matched your search for "${searchTerm}".` : "Check back later for new feed items."}
                </p>
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            {hasMore && !loading && (
              <div ref={sentinelRef} className="py-8 text-center">
                {loadingMore && (
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Icon name="refresh" size={14} className="animate-spin text-primary-500" />
                    <span>Loading more updates...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Rail: Profile & Quick Links */}
          <div className="sticky top-20">
            <LeftSidebar />
          </div>
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
