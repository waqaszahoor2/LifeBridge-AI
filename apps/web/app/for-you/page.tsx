"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { FeedFilters, type CategoryKey, type SortMode } from "@/components/FeedFilters";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { fetchForYouFeed, fetchRecommendations, isDemoModeEnabled, triggerFeedRefresh } from "@/lib/api";
import { sampleFeed } from "@/lib/sample-data";
import type { FeedItem } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";

export default function ForYouPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="max-w-4xl mx-auto p-6 space-y-4">
            <div className="h-48 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        </AppShell>
      }
    >
      <ForYouFeedContent />
    </Suspense>
  );
}

function ForYouFeedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = (searchParams.get("category") as CategoryKey) || "all";
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(urlCategory);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortMode, setSortMode] = useState<SortMode>("urgent");

  const [items, setItems] = useState<FeedItem[]>([]);
  const [recommendations, setRecommendations] = useState<Record<number, { score: number; reasons: string[] }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isDemo = isDemoModeEnabled();

  // Read saved item IDs from localStorage
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
        setSeenIds(new Set(data.items.map((i) => i.id)));
        setHasMore(data.has_more);
        setNextCursor(data.next_cursor);
      } else {
        if (isDemoModeEnabled()) {
          const filtered = sampleFeed.filter(
            (i) => selectedCategory === "all" || selectedCategory === "latest" || i.category === selectedCategory
          );
          setItems(filtered.map((i) => ({ ...i, verification_status: "demo" as const, data_mode: "demo" })));
          setSeenIds(new Set(filtered.map((i) => i.id)));
        } else {
          setItems([]);
        }
        setHasMore(false);
        setNextCursor(null);
      }

      // Load AI recommendation scores
      const recs = await fetchRecommendations().catch(() => []);
      if (recs && recs.length > 0) {
        const map: Record<number, { score: number; reasons: string[] }> = {};
        recs.forEach((r) => {
          map[r.item.id] = { score: r.score, reasons: r.reasons };
        });
        setRecommendations(map);
      }
    } catch {
      if (isDemoModeEnabled()) {
        setIsOffline(true);
        const filtered = sampleFeed.filter(
          (i) => selectedCategory === "all" || selectedCategory === "latest" || i.category === selectedCategory
        );
        setItems(filtered.map((i) => ({ ...i, verification_status: "demo", data_mode: "demo" })));
        setSeenIds(new Set(filtered.map((i) => i.id)));
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
      const excludeStr = Array.from(seenIds).join(",");
      const { data } = await fetchForYouFeed({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        cursor: nextCursor,
        limit: 15,
        exclude_ids: excludeStr,
      });

      if (data && data.items && data.items.length > 0) {
        const uniqueNew = data.items.filter((item) => !seenIds.has(item.id));
        if (uniqueNew.length > 0) {
          setItems((prev) => [...prev, ...uniqueNew]);
          setSeenIds((prev) => {
            const next = new Set(prev);
            uniqueNew.forEach((i) => next.add(i.id));
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
    try {
      await triggerFeedRefresh();
    } catch {
      // Ignore background trigger fail
    }
    await loadInitialFeed();
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

    const copy = [...filtered];
    if (sortMode === "urgent") {
      copy.sort((a, b) => {
        const weight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aSev = weight[a.severity as keyof typeof weight] || 1;
        const bSev = weight[b.severity as keyof typeof weight] || 1;
        if (aSev !== bSev) return bSev - aSev;
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });
    } else if (sortMode === "match") {
      copy.sort((a, b) => {
        const aScore = recommendations[a.id]?.score ?? a.match_score ?? 0.5;
        const bScore = recommendations[b.id]?.score ?? b.match_score ?? 0.5;
        return bScore - aScore;
      });
    } else if (sortMode === "newest") {
      copy.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }

    return copy;
  };

  const sortedItems = getFilteredAndSortedItems();

  return (
    <AppShell
      pageTitle="For You"
      pageSubtitle="Personalized updates and insights that matter to you."
      onRefresh={handleManualRefresh}
      isRefreshing={loading}
    >
      <div className="lb-for-you-layout">
        {/* Hero Banner Section */}
        <div className="mb-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-indigo-950 text-white shadow-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-300 text-xs font-semibold mb-3 border border-white/10 backdrop-blur-md">
              <Icon name="sparkles" size={14} />
              <span>LifeBridge AI Platform</span>
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

        {/* Render Top Urgent Emergency Alert Banner ONLY when Global Demo Mode is enabled */}
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

        {/* Category Filters Chips */}
        <FeedFilters
          category={selectedCategory}
          search={searchTerm}
          sortMode={sortMode}
          onCategory={handleCategorySelect}
          onSearch={setSearchTerm}
          onSort={setSortMode}
        />

        {/* 3-Column Main Feed Content (Left Sidebar + Central Feed + Right Sidebar) */}
        <div className="lb-feed-main-grid">
          <LeftSidebar />
          {/* Central Feed Column */}
          <section className="lb-center-feed-column" aria-label="Main Feed">
            {/* Offline Notification in Demo Mode */}
            {isDemo && isOffline && (
              <div className="offline-notice-banner mb-4" role="status">
                📡 Live feed data is unavailable. Showing demonstration content.
              </div>
            )}

            {/* Error Banner */}
            {errorMsg ? (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3 my-4" role="alert">
                <div className="text-red-600 dark:text-red-400 font-bold text-base">We could not load live updates</div>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">{errorMsg}</p>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow transition-all"
                  onClick={loadInitialFeed}
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="feed-skeletons-list">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="lb-feed-card skeleton-card">
                    <div className="skeleton-line title-skel" />
                    <div className="skeleton-line text-skel" />
                    <div className="skeleton-line short-skel" />
                  </div>
                ))}
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="empty-feed-card">
                <h3>No current updates were found</h3>
                <p>Try adjusting your category filter or search term.</p>
                <button
                  type="button"
                  className="reset-filter-btn"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchTerm("");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="feed-cards-list">
                {sortedItems.map((item) => (
                  <FeedCard
                    key={item.id}
                    item={item}
                    matchScore={recommendations[item.id]?.score}
                    reasons={recommendations[item.id]?.reasons}
                    isSavedInitial={savedIds.has(item.id)}
                    onToggleSave={handleToggleSaveItem}
                    onHide={handleHideItem}
                  />
                ))}
              </div>
            )}

            {/* Infinite Scroll Sentinel & End of Feed Banner */}
            <div ref={sentinelRef} className="infinite-scroll-sentinel">
              {loadingMore && (
                <div className="loading-more-spinner">
                  <Icon name="refresh" size={16} className="spin" />
                  <span>Loading more updates...</span>
                </div>
              )}
              {!hasMore && !loading && !errorMsg && sortedItems.length > 0 && (
                <div className="end-of-feed-card">
                  <div className="end-text">
                    <span className="infinity-symbol">♾</span>
                    <span>You&apos;ve reached the end of the feed.</span>
                  </div>
                  <button
                    type="button"
                    className="end-refresh-btn"
                    onClick={handleManualRefresh}
                  >
                    <Icon name="refresh" size={14} /> Refresh
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Right Sidebar Widgets */}
          <RightSidebar />
        </div>
      </div>
    </AppShell>
  );
}
