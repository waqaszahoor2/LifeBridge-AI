"use client";

import { useState } from "react";
import type { FeedItem } from "@/lib/types";
import { RelativeTime } from "./RelativeTime";
import { Icon } from "./ui/Icon";
import { reportFeedItem } from "@/lib/api";
import { useSavedItems } from "@/context/SavedItemsContext";

const defaultCategoryImages: Record<string, string> = {
  disaster: "https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=800&auto=format&fit=crop",
  scholarship: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
  job: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
  weather: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=800&auto=format&fit=crop",
  service: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop",
  safety: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
  learning: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
};

function isValidHttpsUrl(url?: string): boolean {
  if (!url || url === "#" || url.startsWith("javascript:")) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.")
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

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

  const isDemoItem = item.verification_status === "demo" || (item as any).data_mode === "demo";
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
    triggerToast(nextSaved ? "Saved to bookmarks!" : "Removed from bookmarks");
  }

  async function handleShare() {
    const validUrl = isValidHttpsUrl(item.source_url) ? item.source_url : window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.summary,
          url: validUrl,
        });
        triggerToast("Link shared successfully.");
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(validUrl);
      triggerToast("Location link copied. You can send it to a trusted contact.");
    } catch {
      triggerToast("We could not prepare or share your location.");
    }
  }

  async function handleReport() {
    if (isReporting || hasReported) return;
    setIsReporting(true);
    try {
      const res = await reportFeedItem(item.id);
      if (res && res.status === "success") {
        setHasReported(true);
        triggerToast("Report submitted to moderation.");
      } else {
        triggerToast("Report submitted.");
        setHasReported(true);
      }
    } catch {
      triggerToast("We could not submit this report. Nothing was sent.");
      setHasReported(false);
    } finally {
      setIsReporting(false);
    }
  }

  const hasCustomImage = typeof item.image_url === "string" && item.image_url.length > 10 && isValidHttpsUrl(item.image_url);
  const cardImage = hasCustomImage
    ? (item.image_url as string)
    : defaultCategoryImages[item.category] || defaultCategoryImages.disaster;

  const tagList = item.tags ? item.tags.split(";").filter(Boolean).slice(0, 3) : [item.category, "Verified"];
  const hasValidSourceLink = isValidHttpsUrl(item.source_url);

  // Badge color based on category / importance matching approved design
  const categoryBadgeColor =
    item.category === "disaster"
      ? "bg-red-600 text-white"
      : item.category === "scholarship"
      ? "bg-teal-600 text-white"
      : "bg-slate-900 text-white";

  return (
    <>
      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all overflow-hidden relative group">
        {/* Desktop Horizontal Layout (42% Left Image, 58% Right Content) / Mobile Stack */}
        <div className="flex flex-col md:flex-row items-stretch">
          {/* Left Media Column (~42% on desktop) */}
          <div
            className="md:w-[42%] relative min-h-[190px] md:min-h-full bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer overflow-hidden"
            onClick={() => setShowDetailModal(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {/* Category Overlay Badge */}
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider shadow-xs ${categoryBadgeColor}`}>
              {item.category === "disaster" ? "Breaking" : item.category}
            </span>
            {/* Read Time Overlay */}
            <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/75 text-white font-semibold text-[10px] backdrop-blur-xs">
              2 min read
            </span>
            {!hasCustomImage && (
              <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-slate-950/70 text-slate-300 font-semibold text-[9px] backdrop-blur-xs">
                Demonstration image
              </span>
            )}
          </div>

          {/* Right Content Column (~58% on desktop) */}
          <div className="md:w-[58%] p-4 md:p-5 flex flex-col justify-between space-y-3 min-w-0">
            {/* Header Meta & Bookmark */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 text-xs min-w-0">
                  <span className="font-extrabold text-teal-600 dark:text-teal-400 capitalize truncate">
                    {item.category === "disaster" ? "Disaster Update" : item.category}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    <RelativeTime value={item.published_at} />
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveToggle}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSaved
                        ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title={isSaved ? "Remove Bookmark" : "Save Bookmark"}
                  >
                    <Icon name="bookmark" size={17} />
                  </button>
                  {onHide && (
                    <button
                      type="button"
                      onClick={() => onHide(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                      title="Hide Item"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2
                onClick={() => setShowDetailModal(true)}
                className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 cursor-pointer leading-snug tracking-tight line-clamp-2"
              >
                {item.title}
              </h2>

              {/* Summary */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1.5 line-clamp-2">
                {item.summary}
              </p>
            </div>

            {/* Recommendation Match Badge if available */}
            {typeof effectiveScore === "number" && !isDemoItem && (
              <div className="p-2 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/50 flex items-center gap-1.5 text-[11px] text-teal-800 dark:text-teal-300 font-semibold">
                <Icon name="sparkles" size={13} className="text-teal-600 shrink-0" />
                <span className="truncate">{Math.round(effectiveScore * 100)}% Match: {effectiveReason || "Matches your profile interests"}</span>
              </div>
            )}

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1.5">
              {tagList.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-md bg-teal-50/60 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-semibold text-[10px]">
                  {tag.startsWith("#") ? tag : `#${tag.trim()}`}
                </span>
              ))}
            </div>

            {/* Footer Engagement Meta & Action Links */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1">
                  <Icon name="eye" size={13} className="text-slate-400" />
                  <span>12.4K views</span>
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="chat" size={13} className="text-slate-400" />
                  <span>128</span>
                </span>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Icon name="share" size={13} />
                  <span>Share</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReport}
                  disabled={isReporting || hasReported}
                  className="text-slate-400 hover:text-red-600 text-[11px] font-semibold transition-colors"
                >
                  {hasReported ? "Reported" : "Report"}
                </button>
                {hasValidSourceLink ? (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1"
                  >
                    <span>View Source</span>
                    <Icon name="external" size={11} />
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px]">Source link unavailable</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {toastMessage && (
          <div className="absolute bottom-3 right-3 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg z-20 font-semibold">
            {toastMessage}
          </div>
        )}
      </article>

      {/* Item Details Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setShowDetailModal(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">{item.title}</h3>
              <button type="button" onClick={() => setShowDetailModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Category:</strong> <span className="capitalize">{item.category}</span></p>
              <p><strong>Source:</strong> {item.source_name || "Community Bulletin"} {isDemoItem ? "(Demo Data)" : `(${item.verification_status || "unverified"})`}</p>
              <p><strong>Location:</strong> {item.location}</p>
              <p><strong>Summary:</strong> {item.summary}</p>
              {item.eligibility && <p><strong>Eligibility:</strong> {item.eligibility}</p>}
              {item.salary_text && <p><strong>Compensation:</strong> {item.salary_text}</p>}
              {item.funding_type && <p><strong>Funding Type:</strong> {item.funding_type}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {hasValidSourceLink && (
                <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700">
                  Open Source Link
                </a>
              )}
              <button type="button" onClick={() => setShowDetailModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
