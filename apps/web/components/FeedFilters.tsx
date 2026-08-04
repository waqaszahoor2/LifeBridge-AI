"use client";

import type { FeedCategory } from "@/lib/types";

export type SortMode = "urgent" | "match" | "newest";

const categories: Array<{ key: "all" | FeedCategory; label: string; icon: string }> = [
  { key: "all", label: "For You", icon: "✨" },
  { key: "job", label: "Jobs", icon: "💼" },
  { key: "scholarship", label: "Scholarships", icon: "🎓" },
  { key: "disaster", label: "Disasters", icon: "⚠" },
  { key: "weather", label: "Weather", icon: "☁" },
  { key: "service", label: "Services", icon: "✚" },
  { key: "safety", label: "Safety", icon: "🛡" },
  { key: "learning", label: "Learning", icon: "📖" },
];

export function FeedFilters({
  category,
  search,
  sortMode,
  onCategory,
  onSearch,
  onSort,
  onRefresh,
  isRefreshing,
}: {
  category: "all" | FeedCategory;
  search: string;
  sortMode: SortMode;
  onCategory: (category: "all" | FeedCategory) => void;
  onSearch: (value: string) => void;
  onSort: (mode: SortMode) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  return (
    <section className="feed-toolbar">
      <div className="category-tabs" role="tablist" aria-label="Feed categories">
        {categories.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={category === entry.key}
            className={`tab-btn ${category === entry.key ? "active" : ""}`}
            onClick={() => onCategory(entry.key)}
          >
            <span aria-hidden="true">{entry.icon}</span>
            <span>{entry.label}</span>
          </button>
        ))}
      </div>

      <div className="feed-controls-row">
        <div className="search-input-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search jobs, scholarships, disasters, skills..."
            aria-label="Search feed items"
            className="search-field"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearch("")}
              aria-label="Clear search text"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <label htmlFor="sort-select" className="sr-only">Sort Order</label>
          <select
            id="sort-select"
            value={sortMode}
            onChange={(e) => onSort(e.target.value as SortMode)}
            className="sort-select"
            aria-label="Sort feed"
          >
            <option value="urgent">🚨 Urgent Alerts First</option>
            <option value="match">🎯 Highest Recommendation Match</option>
            <option value="newest">🕒 Newest Published Date</option>
          </select>

          {onRefresh && (
            <button
              type="button"
              className={`refresh-btn ${isRefreshing ? "spin" : ""}`}
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh feed items"
              title="Refresh latest updates"
            >
              🔄 Refresh
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
