"use client";

import { useState } from "react";
import type { FeedItem } from "@/lib/types";
import { RelativeTime } from "./RelativeTime";
import { Icon } from "./ui/Icon";
import { reportFeedItem } from "@/lib/api";

const defaultCategoryImages: Record<string, string> = {
  disaster: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800&auto=format&fit=crop",
  scholarship: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
  job: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
  weather: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=800&auto=format&fit=crop",
  service: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
  safety: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
  learning: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
};

import { useSavedItems } from "@/context/SavedItemsContext";

export function FeedCard({
  item,
  matchScore,
  reasons,
  isSavedInitial,
  onToggleSave,
  onHide,
}: {
  item: FeedItem;
  matchScore?: number;
  reasons?: string[];
  isSavedInitial?: boolean;
  onToggleSave?: (item: FeedItem, saved: boolean) => void;
  onHide?: (item: FeedItem) => void;
}) {
  const { isSaved: checkIsSaved, toggleSave } = useSavedItems();
  const isSaved = isSavedInitial !== undefined ? isSavedInitial : checkIsSaved(item.id);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const [hasReported, setHasReported] = useState<boolean>(false);

  const effectiveScore = typeof matchScore === "number" ? matchScore : item.match_score;
  const effectiveReason = item.recommendation_reason || (reasons && reasons.length > 0 ? reasons[0] : null);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  function handleSaveToggle() {
    toggleSave(item.id);
    const nextSaved = !isSaved;
    if (onToggleSave) {
      onToggleSave(item, nextSaved);
    }
    triggerToast(nextSaved ? "Saved to your bookmarks!" : "Removed from bookmarks");
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary,
          url: item.source_url,
        });
        return;
      } catch {
        // Fallback
      }
    }
    try {
      await navigator.clipboard.writeText(item.source_url);
      triggerToast("Link copied to clipboard!");
    } catch {
      triggerToast("We could not share or copy this link.");
    }
  }

  async function handleReport() {
    if (isReporting || hasReported) return;
    setIsReporting(true);
    try {
      const res = await reportFeedItem(item.id);
      if (res && res.status === "success") {
        setHasReported(true);
        triggerToast("Report submitted to Trust & Safety.");
      } else {
        triggerToast("We could not submit this report. Nothing was sent.");
      }
    } catch {
      triggerToast("We could not submit this report. Nothing was sent.");
    } finally {
      setIsReporting(false);
    }
  }

  const cardImage =
    typeof item.image_url === "string" && item.image_url.length > 10
      ? item.image_url
      : defaultCategoryImages[item.category] || defaultCategoryImages.disaster;

  const tagList = item.tags ? item.tags.split(";").filter(Boolean).slice(0, 4) : [item.category, "LifeBridge"];

  return (
    <>
      <article className={`lb-feed-card category-${item.category} ${item.severity === "critical" ? "is-critical" : ""}`}>
        <div className="feed-card-inner">
          {/* Left Thumbnail Section */}
          <div className="card-media-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cardImage} alt={item.title} className="card-thumbnail-img" loading="lazy" />
            <div className="media-overlay-badge badge-left">
              {item.severity === "critical" ? "Breaking" : item.category.toUpperCase()}
            </div>
          </div>

          {/* Right Content Section */}
          <div className="card-body-wrapper">
            {/* Header Meta & Bookmark */}
            <div className="card-top-row">
              <div className="meta-category-time">
                <span className="category-name">{item.category.charAt(0).toUpperCase() + item.category.slice(1)} Update</span>
                {(item.verification_status === "demo" || (item as any).data_mode === "demo") && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Demo Data
                  </span>
                )}
                <span className="meta-bullet">•</span>
                <RelativeTime value={item.published_at} />
              </div>
              <button
                type="button"
                className={`bookmark-btn ${isSaved ? "saved" : ""}`}
                onClick={handleSaveToggle}
                aria-label="Bookmark Item"
              >
                <Icon name="bookmark" size={18} />
              </button>
            </div>

            {/* Title */}
            <h2 className="card-title-heading" onClick={() => setShowDetailModal(true)}>
              {item.title}
            </h2>

            {/* Summary */}
            <p className="card-summary-text">{item.summary}</p>

            {/* Recommendation Match Badge if applicable */}
            {typeof effectiveScore === "number" && (
              <div className="rec-reason-pill">
                <Icon name="sparkles" size={13} className="text-teal" />
                <span>{Math.round(effectiveScore * 100)}% Match: {effectiveReason || "Matches your interests"}</span>
              </div>
            )}

            {/* Tag Pills */}
            <div className="card-tags-row">
              {tagList.map((tag) => (
                <span key={tag} className="tag-chip">
                  #{tag.trim()}
                </span>
              ))}
            </div>

            {/* Bottom Actions Row */}
            <div className="card-footer-metrics">
              <div className="metrics-group text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="font-medium text-slate-600 dark:text-slate-300">
                  {item.source_name || "Verified Source"}
                </span>
              </div>

              <div className="actions-group flex items-center gap-2">
                <button
                  type="button"
                  className="footer-action-btn"
                  onClick={handleReport}
                  disabled={isReporting || hasReported}
                  title="Report Content"
                >
                  <Icon name="shield" size={14} />
                  <span>{hasReported ? "Reported" : isReporting ? "Reporting..." : "Report"}</span>
                </button>
                <button type="button" className="footer-action-btn" onClick={handleShare}>
                  <Icon name="share" size={14} /> Share
                </button>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-action-btn view-link-btn"
                >
                  <Icon name="external" size={14} /> View
                </a>
              </div>
            </div>
          </div>
        </div>

        {toastMessage && <div className="card-toast" role="status">{toastMessage}</div>}
      </article>

      {/* Details Modal */}
      {showDetailModal && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <header className="modal-header">
              <h3 id="modal-title">{item.title}</h3>
              <button type="button" className="close-btn" onClick={() => setShowDetailModal(false)}>✕</button>
            </header>
            <div className="modal-body space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Source:</strong> {item.source_name} ({item.verification_status})</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Summary:</strong> {item.summary}</p>
              {item.eligibility && <p><strong>Eligibility:</strong> {item.eligibility}</p>}
              {item.salary_text && <p><strong>Compensation:</strong> {item.salary_text}</p>}
              {item.funding_type && <p><strong>Funding Type:</strong> {item.funding_type}</p>}
              <p><strong>Source Reliability:</strong> {Math.round(item.source_reliability * 100)}%</p>
            </div>
            <footer className="modal-footer">
              <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Open Official Link
              </a>
              <button type="button" onClick={() => setShowDetailModal(false)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
