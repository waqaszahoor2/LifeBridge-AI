import { sampleFeed } from "./sample-data";
import type { CvAnalysis, DecisionGraph, FeedItem, NearbyService, Recommendation, ScamCheckResult } from "./types";

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

export async function fetchFeed(signal?: AbortSignal, category?: string): Promise<{ items: FeedItem[]; live: boolean }> {
  try {
    const query = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
    const items = await request<FeedItem[]>(`/api/v1/feed${query}`, { signal });
    return { items, live: true };
  } catch {
    const items = category && category !== "all" ? sampleFeed.filter((item) => item.category === category) : sampleFeed;
    return { items, live: false };
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
