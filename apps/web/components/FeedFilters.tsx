"use client";

import type { FeedCategory } from "@/lib/types";
import { Icon, type IconName } from "./ui/Icon";

export type SortMode = "urgent" | "match" | "newest";
export type CategoryKey = "all" | "latest" | FeedCategory;

const categories: Array<{ key: CategoryKey; label: string; icon: IconName }> = [
  { key: "all", label: "For You", icon: "sparkles" },
  { key: "latest", label: "Latest", icon: "clock" },
  { key: "job", label: "Jobs", icon: "briefcase" },
  { key: "scholarship", label: "Scholarships", icon: "academic" },
  { key: "disaster", label: "Disasters", icon: "alert" },
  { key: "weather", label: "Weather", icon: "cloud" },
  { key: "service", label: "Services", icon: "services" },
  { key: "safety", label: "Safety", icon: "shield" },
  { key: "learning", label: "Learning", icon: "book" },
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
  category: CategoryKey;
  search: string;
  sortMode: SortMode;
  onCategory: (category: CategoryKey) => void;
  onSearch: (value: string) => void;
  onSort: (mode: SortMode) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  return (
    <section className="lb-feed-toolbar">
      {/* Category Chips Bar */}
      <div className="category-chips-scroll" role="tablist" aria-label="Feed Categories">
        {categories.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={category === entry.key}
            className={`chip-btn ${category === entry.key ? "active" : ""}`}
            onClick={() => onCategory(entry.key)}
          >
            <Icon name={entry.icon} size={15} />
            <span>{entry.label}</span>
          </button>
        ))}
      </div>

      {/* Controls Row */}
      <div className="toolbar-controls-row">
        <div className="search-field-wrap">
          <Icon name="search" size={16} className="search-field-icon" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search jobs, scholarships, disasters, skills..."
            aria-label="Search feed"
            className="search-field-input"
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearch("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="sort-dropdown-wrap">
          <Icon name="filter" size={15} className="sort-icon" />
          <select
            value={sortMode}
            onChange={(e) => onSort(e.target.value as SortMode)}
            className="sort-select-input"
            aria-label="Sort Order"
          >
            <option value="urgent">Urgent Alerts First</option>
            <option value="match">Highest Match Score</option>
            <option value="newest">Newest Published</option>
          </select>
        </div>
      </div>
    </section>
  );
}

