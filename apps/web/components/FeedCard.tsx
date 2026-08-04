"use client";

import { useState } from "react";
import type { FeedItem } from "@/lib/types";
import { RelativeTime } from "./RelativeTime";
import { SourceBadge } from "./SourceBadge";
import { reportFeedItem } from "@/lib/api";

const categoryIcons: Record<string, string> = {
  job: "💼",
  scholarship: "🎓",
  disaster: "⚠",
  weather: "☁",
  service: "✚",
  safety: "🛡",
  learning: "📖",
};

export function FeedCard({
  item,
  matchScore,
  reasons,
  isSavedInitial = false,
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
  const [isSaved, setIsSaved] = useState<boolean>(isSavedInitial);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const published = new Date(item.published_at);
  const collected = new Date(item.collected_at);
  const expires = item.expires_at ? new Date(item.expires_at) : null;
  const effectiveScore = typeof matchScore === "number" ? matchScore : item.match_score;
  const effectiveReason = item.recommendation_reason || (reasons && reasons.length > 0 ? reasons[0] : null);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function handleSaveToggle() {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
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
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(item.source_url);
      triggerToast("Source link copied to clipboard!");
    } catch {
      triggerToast("Share option triggered");
    }
  }

  async function handleReport() {
    await reportFeedItem(item.id);
    triggerToast("Report submitted to LifeBridge Trust & Safety Unit.");
  }

  function handleHide() {
    if (onHide) {
      onHide(item);
    }
    triggerToast("Post hidden from your feed");
  }

  const displayImage: string | undefined =
    typeof item.image_url === "string" && item.image_url.length > 0 ? item.image_url : undefined;

  const formattedPubDate = published.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <article className={`feed-card category-${item.category} severity-${item.severity}`}>
        {item.severity === "critical" && (
          <div className="urgent-banner-strip" role="alert">
            🚨 URGENT EMERGENCY ALERT — PRIORITIZED FOR SAFETY
          </div>
        )}

        <header className="feed-card-header">
          <span className={`category-icon category-${item.category}`} aria-hidden="true">
            {categoryIcons[item.category] ?? "•"}
          </span>
          <div className="feed-card-title-block">
            <div className="feed-card-meta-row">
              <span className="category-label">{item.category.toUpperCase()}</span>
              <SourceBadge status={item.verification_status} />
              {typeof effectiveScore === "number" && (
                <span className="match-badge">
                  🎯 {Math.round(effectiveScore * 100)}% match
                </span>
              )}
            </div>
            <h2>{item.title}</h2>
            <p className="source-line">
              🏢 <strong>{item.source_name}</strong> · 📍 {item.location}
            </p>
          </div>
        </header>

        {displayImage && (
          <div className="feed-card-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={displayImage} alt={item.title} loading="lazy" />
          </div>
        )}

        <p className="feed-summary">{item.summary}</p>

        {effectiveReason && (
          <div className="reasons-box">
            <strong>Why recommended for you:</strong>
            <ul className="reason-list">
              <li>✓ {effectiveReason}</li>
              {reasons && reasons.slice(1).map((r) => <li key={r}>✓ {r}</li>)}
            </ul>
          </div>
        )}

        <div className="tag-row">
          {item.tags.split(";").filter(Boolean).slice(0, 5).map((tag) => (
            <span key={tag} className="tag-pill">#{tag.trim()}</span>
          ))}
        </div>

        <div className="timestamps-grid">
          <div>
            <span>Published:</span>{" "}
            <time dateTime={item.published_at}>{formattedPubDate}</time>
            {" "}(<RelativeTime value={item.published_at} />)
          </div>
          <div>
            <span>Last checked:</span>{" "}
            <RelativeTime value={item.last_checked_at} />
          </div>
          {expires && (
            <div className="deadline-highlight">
              <span>Deadline:</span>{" "}
              <time dateTime={item.expires_at || undefined}>{expires.toLocaleDateString()}</time>
            </div>
          )}
        </div>

        <footer className="feed-card-footer">
          <div className="card-actions">
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn view-source-btn"
            >
              🔗 View Source
            </a>
            <button
              type="button"
              className="action-btn"
              onClick={() => setShowDetailModal(true)}
            >
              🔍 Details
            </button>
            <button
              type="button"
              className={`action-btn ${isSaved ? "saved-active" : ""}`}
              onClick={handleSaveToggle}
              aria-label={`Bookmark ${item.title}`}
            >
              {isSaved ? "★ Saved" : "☆ Save"}
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={handleShare}
              aria-label={`Share ${item.title}`}
            >
              📤 Share
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => setShowReminderModal(true)}
              aria-label={`Set reminder for ${item.title}`}
            >
              ⏰ Reminder
            </button>
            <button
              type="button"
              className="action-btn hide-btn"
              onClick={handleHide}
              aria-label={`Hide post ${item.title}`}
            >
              🚫 Hide
            </button>
            <button
              type="button"
              className="action-btn report-btn"
              onClick={handleReport}
              aria-label={`Report post ${item.title}`}
            >
              🚩 Report
            </button>
          </div>
        </footer>

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
            <div className="modal-body">
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Source:</strong> {item.source_name} ({item.verification_status})</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Summary:</strong> {item.summary}</p>
              {item.eligibility && <p><strong>Eligibility:</strong> {item.eligibility}</p>}
              {item.salary_text && <p><strong>Salary / Compensation:</strong> {item.salary_text}</p>}
              {item.funding_type && <p><strong>Funding Type:</strong> {item.funding_type}</p>}
              {item.study_level && <p><strong>Study Level:</strong> {item.study_level}</p>}
              {expires && <p><strong>Expiration / Deadline:</strong> {expires.toLocaleString()}</p>}
              <p><strong>Reliability Score:</strong> {Math.round(item.source_reliability * 100)}%</p>
            </div>
            <footer className="modal-footer">
              <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="primary-link">Open Official Source</a>
              <button type="button" onClick={() => setShowDetailModal(false)}>Close</button>
            </footer>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="modal-backdrop" onClick={() => setShowReminderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="reminder-title">
            <header className="modal-header">
              <h3 id="reminder-title">Set Reminder: {item.title}</h3>
              <button type="button" className="close-btn" onClick={() => setShowReminderModal(false)}>✕</button>
            </header>
            <div className="modal-body">
              <p>Select when you would like a LifeBridge reminder before the deadline:</p>
              <label>
                Reminder time:
                <select className="input-select">
                  <option>24 Hours before deadline</option>
                  <option>3 Days before deadline</option>
                  <option>1 Week before deadline</option>
                </select>
              </label>
            </div>
            <footer className="modal-footer">
              <button
                type="button"
                className="primary-link"
                onClick={() => {
                  setShowReminderModal(false);
                  triggerToast("Reminder saved! We will notify you before deadline.");
                }}
              >
                Save Reminder
              </button>
              <button type="button" onClick={() => setShowReminderModal(false)}>Cancel</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
