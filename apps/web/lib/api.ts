import { sampleFeed } from "./sample-data";
import type { AssistantChatRequest, AssistantChatResponse, CursorPaginatedResponse, CvAnalysis, DecisionGraph, FeedItem, MentorChatResponse, NearbyService, Recommendation, RoadmapResponse, ScamCheckResult, SkillGoalRequest } from "./types";


const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (process.env.NODE_ENV === "production") {
  if (!configuredApiUrl) {
    throw new Error("[Build Failure] NEXT_PUBLIC_API_BASE_URL is required in production environment.");
  }
  if (!configuredApiUrl.startsWith("https://")) {
    throw new Error("[Build Failure] NEXT_PUBLIC_API_BASE_URL must begin with https:// in production environment.");
  }
  if (typeof window === "undefined") {
    const origin = new URL(configuredApiUrl).origin;
    console.log(`[Production API Target] ${origin}`);
  }
}

export const API_BASE_URL = configuredApiUrl ? configuredApiUrl.replace(/\/$/, "") : "http://localhost:8000";
export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
export const IS_DEMO_MODE = isDemoModeEnabled();

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
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
    }
    const category = typeof opts === "object" && !(opts instanceof AbortSignal) ? opts.category : catParam;
    const filtered = category && category !== "all" && category !== "for_you"
      ? sampleFeed.filter((item) => item.category === category)
      : sampleFeed;
    return { items: filtered.map((i) => ({ ...i, verification_status: "demo", data_mode: "demo" })), live: false };
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
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
    }
    const category = params.category;
    const filtered = category && category !== "all" && category !== "for_you"
      ? sampleFeed.filter((item) => item.category === category)
      : sampleFeed;

    return {
      data: {
        items: filtered.map((i) => ({ ...i, verification_status: "demo", data_mode: "demo" })),
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
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw new Error("We could not complete this action. Nothing was sent.");
    }
    throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
  }
}

export async function reportFeedItem(itemId: number): Promise<{ status: string; message: string }> {
  try {
    return await request<{ status: string; message: string }>(`/api/v1/feed/${itemId}/report`, {
      method: "POST",
    });
  } catch (err) {
    throw new Error("We could not complete this action. Nothing was sent.");
  }
}

export async function fetchRecommendations(payload?: Record<string, unknown> | null): Promise<Recommendation[]> {
  if (!payload) return [];
  try {
    return await request<Recommendation[]>("/api/v1/recommendations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
    }
    return sampleFeed.map((item) => ({
      item: { ...item, verification_status: "demo" as const, data_mode: "demo" },
      score: 0.5,
      reasons: ["Sample score for interface testing."],
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

// AI Skill Mentor Client API


export async function generateRoadmap(payload: SkillGoalRequest): Promise<RoadmapResponse> {
  try {
    return await request<RoadmapResponse>("/api/v1/skills/mentor/generate-roadmap", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
    }
    // Offline / Demo fallback roadmap generator
    const targetSkill = payload.target_skill || (payload.raw_goal.toLowerCase().includes("python") ? "Python" : "Data Science");
    const isPython = targetSkill === "Python";
    
    return {
      roadmap_id: `rm_demo_${Date.now()}`,
      title: isPython ? "Modern Python Development & Automation" : "Data Science & AI Analytics Mastery",
      primary_skill: targetSkill,
      target_role: isPython ? "Python Developer" : "Data Scientist / AI Analyst",
      current_level: payload.current_level || "Beginner",
      target_level: "Job Ready",
      estimated_hours: 120,
      completion_percentage: 0,
      current_phase_number: 1,
      mode_used: "local_demo",
      personalization_reason: "Demo roadmap — not generated by the live AI service.",
      phases: [
        {
          phase_number: 1,
          title: "PHASE 1 — Foundations",
          objective: "Master essential syntax, concepts, and development environment setup.",
          estimated_hours: 15,
          topics: ["Core Syntax & Variables", "Control Flow & Functions", "Environment Setup", "Git & GitHub"],
          tools: [isPython ? "Python 3.12" : "JupyterLab", "VS Code"],
          ai_tools: ["ChatGPT", "GitHub Copilot"],
          exercises: ["Write 5 basic practice functions", "Create local Git repository"],
          project: "CLI Study Tracker Application",
          checkpoint: "Foundations Checkpoint"
        },
        {
          phase_number: 2,
          title: "PHASE 2 — Core Skills",
          objective: "Master data structures, algorithms, libraries, and SQL querying.",
          estimated_hours: 25,
          topics: [isPython ? "OOP & Modules" : "Pandas & Data Cleaning", "SQL Relational Queries", "Handling Edge Cases"],
          tools: [isPython ? "FastAPI" : "Pandas", "PostgreSQL"],
          ai_tools: ["Claude 3.5 Sonnet"],
          exercises: ["Clean 5,000-row sample dataset", "Write 10 SQL join queries"],
          project: "Data Processing Pipeline",
          checkpoint: "Core Skills Assessment"
        }
      ],
      tools: [
        {
          name: isPython ? "Python 3.12" : "Python & Pandas",
          category: "Core",
          purpose: "Primary development ecosystem",
          skill_level: "Beginner to Advanced",
          is_free: true,
          platform: "Cross-platform",
          why_recommended: "Industry standard language",
          alternative: "R / Node.js"
        }
      ],
      ai_workflows: [],
      schedule: { weeks: [] },
      projects: [],
      assessments: [],
      resources: [],
      completed_items: []
    };
  }
}

export async function getRoadmap(roadmapId: string): Promise<RoadmapResponse> {
  try {
    return await request<RoadmapResponse>(`/api/v1/skills/mentor/roadmaps/${roadmapId}`);
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
    }
    return generateRoadmap({ raw_goal: "Learn Data Science in 6 months", target_skill: "Data Science" });
  }
}

export async function updateRoadmapProgress(roadmapId: string, itemId: string, isCompleted: boolean): Promise<RoadmapResponse> {
  try {
    return await request<RoadmapResponse>(`/api/v1/skills/mentor/roadmaps/${roadmapId}/progress`, {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, is_completed: isCompleted }),
    });
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
    }
    const rm = await getRoadmap(roadmapId);
    const completed = new Set(rm.completed_items);
    if (isCompleted) completed.add(itemId);
    else completed.delete(itemId);
    rm.completed_items = Array.from(completed);
    return rm;
  }
}

export async function sendMentorChatMessage(roadmapId: string, userMessage: string, currentPhase = 1): Promise<MentorChatResponse> {
  try {
    const res = await sendAssistantChat({
      messages: [{ role: "user", content: userMessage }],
      roadmap_id: roadmapId,
    });
    return {
      reply: res.reply,
      citations: res.citations || [],
      suggested_questions: ["Explain Phase concepts simply", "Give me a practice exercise", "How do I audit AI outputs?"],
      disclaimer: res.disclaimer,
    };
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
    }
    return {
      reply: `Demo Skill Mentor Response:\n\nRegarding your question: "${userMessage}"\n\nFocus on practicing core exercises in Phase ${currentPhase}. Always verify AI-generated output against official documentation.`,
      citations: [],
      suggested_questions: ["Explain Phase concepts simply", "Give me a practice exercise", "How do I audit AI outputs?"],
      disclaimer: "Demo guidance — not generated by live AI service.",
    };
  }
}

export async function sendAssistantChat(req: AssistantChatRequest & { signal?: AbortSignal }): Promise<AssistantChatResponse> {
  const { signal, ...payload } = req;
  return request<AssistantChatResponse>("/api/v1/assistant/chat", {
    method: "POST",
    body: JSON.stringify(payload),
    signal,
  });
}

export async function streamAssistantChat(
  req: AssistantChatRequest,
  onToken: (token: string) => void,
  onMeta?: (meta: { provider: string; status: string; model: string; citations: string[] }) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/assistant/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Streaming request failed with HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/event-stream")) {
    throw new Error(`Invalid SSE content type received: ${contentType}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No readable response body for SSE streaming");

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let receivedMeta = false;
  let receivedDone = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.replace(/^data:\s*/, "").trim();
        if (!jsonStr) continue;

        let parsed: any;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          continue;
        }

        if (parsed.type === "error") {
          throw new Error(parsed.message || "Streaming provider error encountered");
        }

        if (parsed.type === "meta") {
          receivedMeta = true;
          if (onMeta) {
            onMeta({
              provider: parsed.provider,
              status: parsed.status,
              model: parsed.model,
              citations: parsed.citations || [],
            });
          }
        } else if (parsed.type === "token" && parsed.content) {
          onToken(parsed.content);
        } else if (parsed.type === "done") {
          receivedDone = true;
        }
      }
    }

    buffer += decoder.decode();
    if (buffer.startsWith("data: ")) {
      const jsonStr = buffer.replace(/^data:\s*/, "").trim();
      if (jsonStr) {
        let parsed: any;
        try {
          parsed = JSON.parse(jsonStr);
        } catch {
          // ignore
        }
        if (parsed) {
          if (parsed.type === "error") throw new Error(parsed.message || "Streaming provider error");
          if (parsed.type === "meta") receivedMeta = true;
          if (parsed.type === "token" && parsed.content) onToken(parsed.content);
          if (parsed.type === "done") receivedDone = true;
        }
      }
    }

    if (!receivedMeta && !signal?.aborted) {
      throw new Error("Stream closed before receiving meta metadata event.");
    }

    if (!receivedDone && !signal?.aborted) {
      throw new Error("Stream closed unexpectedly before completion done event.");
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // ignore cancel error
    }
  }
}




