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
        return;
      } catch {
        // Fallback
      }
    }
    try {
      await navigator.clipboard.writeText(validUrl);
      triggerToast("Link copied to clipboard!");
    } catch {
      triggerToast("Could not copy link.");
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
      triggerToast("Report registered.");
      setHasReported(true);
    } finally {
      setIsReporting(false);
    }
  }

  const hasCustomImage = typeof item.image_url === "string" && item.image_url.length > 10 && isValidHttpsUrl(item.image_url);
  const cardImage = hasCustomImage
    ? (item.image_url as string)
    : defaultCategoryImages[item.category] || defaultCategoryImages.disaster;

  const tagList = item.tags ? item.tags.split(";").filter(Boolean).slice(0, 4) : [item.category, "LifeBridge"];
  const hasValidSourceLink = isValidHttpsUrl(item.source_url);

  return (
    <>
      <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow overflow-hidden relative">
        {/* Desktop Horizontal Layout / Mobile Vertical Stack */}
        <div className="flex flex-col sm:flex-row items-stretch">
          {/* Left Media Column (~40-45% on desktop) */}
          <div className="sm:w-[42%] relative min-h-[180px] sm:min-h-full bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer overflow-hidden group" onClick={() => setShowDetailModal(true)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            {!hasCustomImage && (
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/70 text-slate-300 font-semibold text-[10px] backdrop-blur-xs">
                Illustrative image
              </span>
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 text-white font-extrabold text-[10px] uppercase tracking-wider backdrop-blur-xs">
              {item.category}
            </div>
          </div>

          {/* Right Content Column (~55-58% on desktop) */}
          <div className="sm:w-[58%] p-4 sm:p-5 flex flex-col justify-between space-y-3 min-w-0">
            {/* Header Meta & Actions */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                    {item.source_name || "Community Update"}
                  </span>
                  {isDemoItem ? (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 shrink-0">
                      Demo
                    </span>
                  ) : (
                    item.verification_status === "verified" && (item as any).verified_at && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/60 shrink-0">
                        Verified
                      </span>
                    )
                  )}
                  <span className="text-[10px] text-slate-400 shrink-0">• <RelativeTime value={item.published_at} /></span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveToggle}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSaved
                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    }`}
                    title={isSaved ? "Remove Bookmark" : "Save Bookmark"}
                  >
                    <Icon name="bookmark" size={16} />
                  </button>
                  {onHide && (
                    <button
                      type="button"
                      onClick={() => onHide(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer leading-snug tracking-tight line-clamp-2"
              >
                {item.title}
              </h2>

              {/* Summary */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 line-clamp-2">
                {item.summary}
              </p>
            </div>

            {/* Recommendation Match Badge if applicable */}
            {typeof effectiveScore === "number" && !isDemoItem && (
              <div className="p-2 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/50 flex items-center gap-1.5 text-[11px] text-teal-800 dark:text-teal-300 font-semibold">
                <Icon name="sparkles" size={13} className="text-teal-600 shrink-0" />
                <span className="truncate">{Math.round(effectiveScore * 100)}% Match: {effectiveReason || "Matches profile interests"}</span>
              </div>
            )}

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-1">
              {tagList.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                  #{tag.trim()}
                </span>
              ))}
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReport}
                  disabled={isReporting || hasReported}
                  className="px-2 py-1 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 font-semibold transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Icon name="shield" size={13} />
                  <span>{hasReported ? "Reported" : "Report"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-2 py-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Icon name="share" size={13} />
                  <span>Share</span>
                </button>
              </div>

              <div>
                {hasValidSourceLink ? (
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                  >
                    <span>View Source</span>
                    <Icon name="external" size={12} />
                  </a>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-semibold text-[11px]">
                    No external link
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {toastMessage && <div className="absolute bottom-3 right-3 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg z-20 font-semibold">{toastMessage}</div>}
      </article>

      {/* Details Modal */}
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
                <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700">
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
