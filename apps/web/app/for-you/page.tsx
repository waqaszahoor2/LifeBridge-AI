"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { FeedFilters, type CategoryKey, type SortMode } from "@/components/FeedFilters";
import { LeftSidebar } from "@/components/LeftSidebar";
import { RightSidebar } from "@/components/RightSidebar";
import { fetchForYouFeed, fetchRecommendations, triggerFeedRefresh } from "@/lib/api";
import { sampleFeed } from "@/lib/sample-data";
import type { FeedItem } from "@/lib/types";

export default function ForYouPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="container" style={{ padding: "40px 0", textAlign: "center" }}>
            <p>Loading For You Feed...</p>
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

  const [newUpdatesCount, setNewUpdatesCount] = useState<number>(0);
  const [pendingNewItems, setPendingNewItems] = useState<FeedItem[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  const sentinelRef = useRef<HTMLDivElement | null>(null);

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
        const filtered = sampleFeed.filter(
          (i) => selectedCategory === "all" || selectedCategory === "latest" || i.category === selectedCategory
        );
        setItems(filtered);
        setSeenIds(new Set(filtered.map((i) => i.id)));
        setHasMore(false);
        setNextCursor(null);
      }

      // Load AI recommendation scores
      const recs = await fetchRecommendations();
      if (recs && recs.length > 0) {
        const map: Record<number, { score: number; reasons: string[] }> = {};
        recs.forEach((r) => {
          map[r.item.id] = { score: r.score, reasons: r.reasons };
        });
        setRecommendations(map);
      }
    } catch {
      setIsOffline(true);
      const filtered = sampleFeed.filter(
        (i) => selectedCategory === "all" || selectedCategory === "latest" || i.category === selectedCategory
      );
      setItems(filtered);
      setSeenIds(new Set(filtered.map((i) => i.id)));
      setHasMore(false);
      setNextCursor(null);
    } finally {
      setLoading(false);
      setLastSyncTime(new Date().toISOString());
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadInitialFeed();
  }, [loadInitialFeed]);

  // Load next cursor-paginated page
  const loadNextPage = useCallback(async () => {
    if (loadingMore || !hasMore) return;
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
  }, [loadingMore, hasMore, seenIds, selectedCategory, nextCursor]);

  // IntersectionObserver for continuous infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading || loadingMore) return;

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
  }, [hasMore, loading, loadingMore, loadNextPage]);

  // Real-time background sync simulation for urgent emergency warnings
  useEffect(() => {
    const timer = setTimeout(() => {
      const urgentItem: FeedItem = {
        id: Date.now(),
        external_id: `urgent-disaster-${Date.now()}`,
        category: "disaster",
        title: "🚨 URGENT: Flash Flood Emergency Warning Issued",
        summary: "National Disaster Management Authority issues emergency advisory for low-lying areas in Sindh & Punjab. Evacuation routes active.",
        source_name: "NDMA Pakistan Safety Portal",
        source_url: "https://ndma.gov.pk",
        published_at: new Date().toISOString(),
        collected_at: new Date().toISOString(),
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 86400000 * 2).toISOString(),
        location: "Pakistan (Sindh & Punjab)",
        country_code: "PK",
        tags: "disaster;flood;emergency;safety",
        severity: "critical",
        verification_status: "verified",
        source_reliability: 0.99,
        recommendation_reason: "Urgent disaster safety warning prioritised for your region.",
        match_score: 0.99,
      };
      setPendingNewItems([urgentItem]);
      setNewUpdatesCount(1);
    }, 18000);

    return () => clearTimeout(timer);
  }, []);

  const handleShowNewUpdates = () => {
    if (pendingNewItems.length > 0) {
      setItems((prev) => [...pendingNewItems, ...prev]);
      setSeenIds((prev) => {
        const next = new Set(prev);
        pendingNewItems.forEach((i) => next.add(i.id));
        return next;
      });
      setPendingNewItems([]);
      setNewUpdatesCount(0);
    }
  };

  const handleManualRefresh = async () => {
    await triggerFeedRefresh();
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
    <AppShell>
      <main className="linkedin-feed-layout container">
        {/* Left Sidebar (Sticky) */}
        <LeftSidebar />

        {/* Central Feed Column */}
        <section className="linkedin-center-feed" aria-label="Main Feed">
          {/* Toolbar Header Card */}
          <div className="feed-header-card">
            <div className="feed-header-main">
              <div>
                <h1 className="feed-page-title">For You Feed</h1>
                <p className="feed-page-subtitle">
                  Personalised AI opportunities, scholarships, safety alerts & verified career insights
                </p>
              </div>
              <button
                type="button"
                className="btn-refresh-feed"
                onClick={handleManualRefresh}
                title="Refresh feed sources"
              >
                🔄 Refresh Feed
              </button>
            </div>

            {isOffline && (
              <div className="offline-notice-banner" role="status">
                📡 Connected to offline cache mode — displaying verified opportunities.
              </div>
            )}

            {/* Category Filter Chips & Search Bar */}
            <FeedFilters
              category={selectedCategory}
              search={searchTerm}
              sortMode={sortMode}
              onCategory={handleCategorySelect}
              onSearch={setSearchTerm}
              onSort={setSortMode}
              onRefresh={handleManualRefresh}
            />
          </div>

          {/* New Updates Banner */}
          {newUpdatesCount > 0 && (
            <div className="new-updates-banner" role="alert">
              <span>🔔 {newUpdatesCount} new emergency update available</span>
              <button
                type="button"
                className="btn-show-updates"
                onClick={handleShowNewUpdates}
              >
                Show new updates ↑
              </button>
            </div>
          )}

          {/* Feed Content Loading / Skeletons / Cards */}
          {loading ? (
            <div className="feed-skeletons-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="feed-card skeleton-card">
                  <div className="skeleton-line title-skel" />
                  <div className="skeleton-line text-skel" />
                  <div className="skeleton-line short-skel" />
                </div>
              ))}
            </div>
          ) : sortedItems.length === 0 ? (
            <div className="empty-feed-card">
              <h3>No matching updates found</h3>
              <p>Try adjusting your category filter or search query.</p>
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
            <div className="feed-cards-container">
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

          {/* Infinite Scroll Sentinel & Footer Status */}
          <div ref={sentinelRef} className="infinite-scroll-sentinel">
            {loadingMore && (
              <div className="loading-more-spinner">
                <span>🔄 Loading more updates...</span>
              </div>
            )}
            {!hasMore && !loading && sortedItems.length > 0 && (
              <div className="end-of-feed-badge">
                ✓ You&apos;re all caught up on the latest verified updates.
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar (Sticky) */}
        <RightSidebar
          lastSyncTime={lastSyncTime}
          onRefreshTrigger={handleManualRefresh}
        />
      </main>
    </AppShell>
  );
}
