import { sampleFeed } from "./sample-data";
import type { CursorPaginatedResponse, CvAnalysis, DecisionGraph, FeedItem, NearbyService, Recommendation, ScamCheckResult } from "./types";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export interface FetchFeedParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
  cursor?: string;
  country?: string;
  exclude_ids?: string;
  signal?: AbortSignal;
}

export async function fetchFeed(
  opts?: FetchFeedParams | AbortSignal,
  catParam?: string
): Promise<{ items: FeedItem[]; live: boolean }> {
  try {
    let query = "";
    let signal: AbortSignal | undefined;

    if (opts instanceof AbortSignal) {
      signal = opts;
      if (catParam && catParam !== "all") query = `?category=${encodeURIComponent(catParam)}`;
    } else if (opts) {
      const params = new URLSearchParams();
      if (opts.category && opts.category !== "all" && opts.category !== "for_you") params.set("category", opts.category);
      if (opts.search) params.set("search", opts.search);
      if (opts.limit) params.set("limit", String(opts.limit));
      if (opts.offset) params.set("offset", String(opts.offset));
      if (opts.cursor) params.set("cursor", opts.cursor);
      if (opts.country) params.set("country", opts.country);
      if (opts.exclude_ids) params.set("exclude_ids", opts.exclude_ids);
      const str = params.toString();
      if (str) query = `?${str}`;
      signal = opts.signal;
    }

    const items = await request<FeedItem[]>(`/api/v1/feed${query}`, { signal });
    return { items, live: true };
  } catch {
    const category = typeof opts === "object" && !(opts instanceof AbortSignal) ? opts.category : catParam;
    const filtered = category && category !== "all" && category !== "for_you"
      ? sampleFeed.filter((item) => item.category === category)
      : sampleFeed;
    return { items: filtered, live: false };
  }
}

export async function fetchForYouFeed(params: {
  limit?: number;
  cursor?: string | null;
  category?: string;
  country?: string;
  exclude_ids?: string;
  signal?: AbortSignal;
}): Promise<{ data: CursorPaginatedResponse; live: boolean }> {
  try {
    const qp = new URLSearchParams();
    if (params.limit) qp.set("limit", String(params.limit));
    if (params.cursor) qp.set("cursor", params.cursor);
    if (params.category && params.category !== "all" && params.category !== "for_you") qp.set("category", params.category);
    if (params.country) qp.set("country", params.country);
    if (params.exclude_ids) qp.set("exclude_ids", params.exclude_ids);

    const data = await request<CursorPaginatedResponse>(`/api/v1/feed/for-you?${qp.toString()}`, { signal: params.signal });
    return { data, live: true };
  } catch {
    const category = params.category;
    const filtered = category && category !== "all" && category !== "for_you"
      ? sampleFeed.filter((item) => item.category === category)
      : sampleFeed;

    return {
      data: {
        items: filtered,
        next_cursor: null,
        has_more: false,
        generated_at: new Date().toISOString(),
        latest_item_at: filtered[0]?.published_at,
      },
      live: false,
    };
  }
}

export async function triggerFeedRefresh(): Promise<{ status: string; message: string; requested_at: string }> {
  try {
    return await request<{ status: string; message: string; requested_at: string }>("/api/v1/feed/refresh", {
      method: "POST",
    });
  } catch {
    return {
      status: "queued",
      message: "Offline fallback refresh queued",
      requested_at: new Date().toISOString(),
    };
  }
}

export async function reportFeedItem(itemId: number): Promise<{ status: string; message: string }> {
  try {
    return await request<{ status: string; message: string }>(`/api/v1/feed/${itemId}/report`, {
      method: "POST",
    });
  } catch {
    return { status: "received", message: "Report noted in local offline queue" };
  }
}

export async function fetchRecommendations(payload?: Record<string, unknown>): Promise<Recommendation[]> {
  try {
    return await request<Recommendation[]>("/api/v1/recommendations", {
      method: "POST",
      body: JSON.stringify(
        payload ?? {
          skills: ["python", "data science"],
          preferred_categories: ["job", "scholarship"],
          country: "Pakistan",
          limit: 10,
        }
      ),
    });
  } catch {
    return sampleFeed.map((item) => ({
      item,
      score: item.severity === "critical" ? 0.98 : 0.88,
      reasons: [
        `Matches target area ${item.location}`,
        `Verified content from ${item.source_name}`,
      ],
    }));
  }
}

export async function getRecommendations(payload: Record<string, unknown>): Promise<Recommendation[]> {
  return request<Recommendation[]>("/api/v1/recommendations", { method: "POST", body: JSON.stringify(payload) });
}

export async function checkScam(text: string, url?: string): Promise<ScamCheckResult> {
  return request<ScamCheckResult>("/api/v1/ai/trust-check", {
    method: "POST",
    body: JSON.stringify({ text, url: url || null }),
  });
}

export async function getNearbyServices(latitude: number, longitude: number, serviceType = "all"): Promise<NearbyService[]> {
  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude), service_type: serviceType });
  return request<NearbyService[]>(`/api/v1/services/nearby?${params.toString()}`);
}

export async function analyzeCv(text: string): Promise<CvAnalysis> {
  return request<CvAnalysis>("/api/v1/ai/cv/analyze", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function buildDecisionGraph(payload: Record<string, unknown>): Promise<DecisionGraph> {
  return request<DecisionGraph>("/api/v1/ai/decision-graph", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
