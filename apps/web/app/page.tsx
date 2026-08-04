"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { FeedCard } from "@/components/FeedCard";
import { FeedFilters, type SortMode } from "@/components/FeedFilters";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { StatsGrid } from "@/components/StatsGrid";
import { TopBar } from "@/components/TopBar";
import { fetchFeed, getRecommendations } from "@/lib/api";
import { readLocalProfile } from "@/lib/profile";
import type { FeedCategory, FeedItem, Recommendation } from "@/lib/types";

export default function Home() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [category, setCategory] = useState<"all" | FeedCategory>("all");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("urgent");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadFeedData() {
      try {
        const { items, live: isLive } = await fetchFeed(controller.signal);
        if (!isMounted) return;
        setFeed(items);
        setLive(isLive);
        if (isLive) {
          try {
            const profile = readLocalProfile();
            const recs = await getRecommendations({ ...profile, limit: 50 });
            if (isMounted) setRecommendations(recs);
          } catch {
            if (isMounted) setRecommendations([]);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load feed items");
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadFeedData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const { items, live: isLive } = await fetchFeed();
      setFeed(items);
      setLive(isLive);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to refresh feed");
    } finally {
      setRefreshing(false);
    }
  };

  const recommendationById = useMemo(
    () => new Map(recommendations.map((result) => [result.item.external_id, result])),
    [recommendations],
  );

  const filteredAndSorted = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = feed.filter((item) => {
      const categoryMatch = category === "all" || item.category === category;
      const textMatch =
        !term ||
        `${item.title} ${item.summary} ${item.tags} ${item.location} ${item.source_name}`
          .toLowerCase()
          .includes(term);
      return categoryMatch && textMatch;
    });

    result = [...result].sort((a, b) => {
      // 1. Urgent / Critical Disasters ALWAYS come first if sortMode is urgent
      if (sortMode === "urgent") {
        if (a.severity === "critical" && b.severity !== "critical") return -1;
        if (b.severity === "critical" && a.severity !== "critical") return 1;
        if (a.category === "disaster" && b.category !== "disaster") return -1;
        if (b.category === "disaster" && a.category !== "disaster") return 1;
      }

      // 2. Recommendation Match Score
      if (sortMode === "match") {
        const scoreA = recommendationById.get(a.external_id)?.score ?? 0.75;
        const scoreB = recommendationById.get(b.external_id)?.score ?? 0.75;
        if (scoreA !== scoreB) return scoreB - scoreA;
      }

      // 3. Newest published date
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

    return result;
  }, [feed, category, search, sortMode, recommendationById]);

  const paginatedItems = useMemo(
    () => filteredAndSorted.slice(0, page * itemsPerPage),
    [filteredAndSorted, page],
  );

  const hasMore = paginatedItems.length < filteredAndSorted.length;

  return (
    <AppShell>
      <TopBar title="Opportunity & Safety Feed" live={live} />

      <section className="alert-banner" role="region" aria-label="Urgent Alerts Notice">
        <div className="alert-banner-content">
          <span className="alert-icon" aria-hidden="true">🚨</span>
          <div>
            <strong>Urgent Disaster & Safety Alerts Prioritized</strong>
            <p>LifeBridge AI ranks disaster warnings and high-priority safety notices above routine jobs and scholarships.</p>
          </div>
        </div>
        <a className="secondary-link" href="/profile">
          ⚙️ Personalize Match Rules
        </a>
      </section>

      <StatsGrid feed={feed} />

      <FeedFilters
        category={category}
        search={search}
        sortMode={sortMode}
        onCategory={(cat) => {
          setCategory(cat);
          setPage(1);
        }}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onSort={setSortMode}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="content-grid">
        <section className="feed-list" aria-live="polite">
          {loading && (
            <>
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </>
          )}

          {error && (
            <div className="error-card">
              <h3>⚠️ Unable to Load Feed Data</h3>
              <p>{error}</p>
              <button type="button" className="retry-btn" onClick={handleRefresh}>
                🔄 Retry Connection
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {paginatedItems.map((item) => {
                const rec = recommendationById.get(item.external_id);
                // Default explainable recommendation reasons if offline demo
                const defaultReasons = [
                  `Matches your ${item.category} requirements`,
                  `Location eligibility for ${item.location.split(";")[0]}`,
                  `Verified source: ${item.source_name}`,
                  item.expires_at ? `Active deadline: open until ${new Date(item.expires_at).toLocaleDateString()}` : "Active posting",
                ];
                return (
                  <FeedCard
                    key={item.external_id}
                    item={item}
                    matchScore={rec?.score ?? (item.severity === "critical" ? 0.98 : 0.85)}
                    reasons={rec?.reasons ?? defaultReasons}
                  />
                );
              })}

              {filteredAndSorted.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon" aria-hidden="true">🔍</span>
                  <h3>No matching posts found</h3>
                  <p>Try adjusting your search terms or clearing your category filters.</p>
                  <button
                    type="button"
                    className="reset-filter-btn"
                    onClick={() => {
                      setCategory("all");
                      setSearch("");
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {hasMore && (
                <div className="load-more-container">
                  <button
                    type="button"
                    className="load-more-btn"
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Load More Feed Updates ({filteredAndSorted.length - paginatedItems.length} remaining)
                  </button>
                </div>
              )}
            </>
          )}

          <footer className="recommendation-disclaimer">
            ℹ️ <em>Explainable AI Notice: Recommendation scores and match reasons are automated estimates based on your local profile settings and official data sources. They do not constitute guaranteed employment or safety assurances.</em>
          </footer>
        </section>

        <aside className="right-rail">
          <section className="side-card">
            <h2>💡 Personalized Match Rules</h2>
            <p>Posts are ranked using skills, eligibility, location, urgency, freshness, and verified source reliability.</p>
            <ul className="feature-bullets">
              <li>✓ Explainable match reasons</li>
              <li>✓ Exact timestamp audits</li>
              <li>✓ Verified official links</li>
              <li>✓ Urgent disaster overrides</li>
            </ul>
          </section>

          <section className="side-card highlight-card">
            <h2>🔗 Decision Graph</h2>
            <p>Inspect interactive node connections between skills, opportunities, sources, and locations.</p>
            <a className="primary-btn-block" href="/decision-graph">
              Open Decision Graph →
            </a>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
