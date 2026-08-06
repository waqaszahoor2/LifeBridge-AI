import { sampleFeed } from "./sample-data";
import type {
  AssistantChatRequest,
  AssistantChatResponse,
  CursorPaginatedResponse,
  CvAnalysis,
  DecisionGraph,
  FeedItem,
  MentorChatResponse,
  NearbyService,
  Recommendation,
  RoadmapResponse,
  ScamCheckResult,
  SkillGoalRequest,
} from "./types";

// ---------------------------------------------------------------------------
// Environment configuration
// ---------------------------------------------------------------------------

const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const defaultProdApiUrl = "https://lifebridge-ai-backend.onrender.com";

const rawApiUrl = configuredApiUrl || (process.env.NODE_ENV === "production" ? defaultProdApiUrl : "http://localhost:8000");

export const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
export const IS_DEMO_MODE = isDemoModeEnabled();

// ---------------------------------------------------------------------------
// Timeouts
// ---------------------------------------------------------------------------

const TIMEOUT_STANDARD_MS = 15_000;     // Standard API calls
const TIMEOUT_HEALTH_MS = 10_000;       // Health endpoint
const TIMEOUT_STREAM_CONNECT_MS = 15_000; // SSE connection
const TIMEOUT_FIRST_TOKEN_MS = 20_000;  // First token deadline
const TIMEOUT_MAX_STREAM_MS = 120_000;  // Hard stream ceiling

// ---------------------------------------------------------------------------
// Typed frontend errors
// ---------------------------------------------------------------------------

export type AssistantErrorCode =
  | "CONFIGURATION_MISSING"
  | "NETWORK_ERROR"
  | "REQUEST_TIMEOUT"
  | "FIRST_TOKEN_TIMEOUT"
  | "STREAM_DURATION_EXCEEDED"
  | "BACKEND_UNAVAILABLE"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_AUTHENTICATION_FAILED"
  | "PROVIDER_RATE_LIMITED"
  | "RATE_LIMITED"
  | "INVALID_STREAM_SEQUENCE"
  | "INCOMPLETE_STREAM"
  | "MISSING_STREAM_METADATA"
  | "HTTP_ERROR"
  | "INVALID_CONTENT_TYPE"
  | "NO_BODY"
  | "STREAM_ERROR"
  | string;

export class AssistantStreamError extends Error {
  constructor(
    public code: AssistantErrorCode,
    message: string,
    public requestId?: string
  ) {
    super(message);
    this.name = "AssistantStreamError";
  }
}

// ---------------------------------------------------------------------------
// Internal: fetch with timeout
// ---------------------------------------------------------------------------

function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = TIMEOUT_STANDARD_MS, signal: userSignal, ...rest } = init;
  const controller = new AbortController();

  const timerHandle = setTimeout(() => controller.abort(), timeoutMs);

  // Chain user signal if provided
  if (userSignal) {
    if (userSignal.aborted) {
      controller.abort();
    } else {
      userSignal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  return fetch(input, { ...rest, signal: controller.signal }).finally(() => {
    clearTimeout(timerHandle);
  });
}

// ---------------------------------------------------------------------------
// Generic JSON request helper
// ---------------------------------------------------------------------------

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
    timeoutMs: TIMEOUT_STANDARD_MS,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

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
    const filtered =
      category && category !== "all" && category !== "for_you"
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
    if (params.category && params.category !== "all" && params.category !== "for_you")
      qp.set("category", params.category);
    if (params.country) qp.set("country", params.country);
    if (params.exclude_ids) qp.set("exclude_ids", params.exclude_ids);

    const data = await request<CursorPaginatedResponse>(`/api/v1/feed/for-you?${qp.toString()}`, {
      signal: params.signal,
    });
    return { data, live: true };
  } catch (err) {
    if (!isDemoModeEnabled()) {
      throw err instanceof Error ? err : new Error("We could not complete this action. Nothing was sent.");
    }
    const category = params.category;
    const filtered =
      category && category !== "all" && category !== "for_you"
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

export async function getNearbyServices(
  latitude: number,
  longitude: number,
  serviceType = "all"
): Promise<NearbyService[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    service_type: serviceType,
  });
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

// ---------------------------------------------------------------------------
// AI Skill Mentor
// ---------------------------------------------------------------------------

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
          checkpoint: "Foundations Checkpoint",
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
          checkpoint: "Core Skills Assessment",
        },
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
          alternative: "R / Node.js",
        },
      ],
      ai_workflows: [],
      schedule: { weeks: [] },
      projects: [],
      assessments: [],
      resources: [],
      completed_items: [],
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

export async function updateRoadmapProgress(
  roadmapId: string,
  itemId: string,
  isCompleted: boolean
): Promise<RoadmapResponse> {
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

export async function sendMentorChatMessage(
  roadmapId: string,
  userMessage: string,
  currentPhase = 1
): Promise<MentorChatResponse> {
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

// ---------------------------------------------------------------------------
// SSE streaming
// ---------------------------------------------------------------------------

export async function streamAssistantChat(
  req: AssistantChatRequest,
  onToken: (token: string) => void,
  onMeta?: (meta: {
    provider: string;
    status: string;
    model: string;
    citations: string[];
    request_id?: string;
  }) => void,
  signal?: AbortSignal
): Promise<void> {
  // ─── Outer timeouts ──────────────────────────────────────────────────────
  const controller = new AbortController();
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Chain caller's abort signal
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  // Connection timeout
  const connectTimer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_STREAM_CONNECT_MS);
  timers.push(connectTimer);

  // Max stream duration guard
  const maxStreamTimer = setTimeout(() => {
    controller.abort();
  }, TIMEOUT_MAX_STREAM_MS);
  timers.push(maxStreamTimer);

  let firstTokenTimer: ReturnType<typeof setTimeout> | null = null;
  let receivedFirstToken = false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/assistant/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
      cache: "no-store",
    });

    // Connection established — cancel connection timeout
    clearTimeout(connectTimer);

    if (!response.ok) {
      throw new AssistantStreamError(
        "HTTP_ERROR",
        `Streaming request failed with HTTP ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/event-stream")) {
      throw new AssistantStreamError(
        "INVALID_CONTENT_TYPE",
        `Invalid SSE content type received: ${contentType}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new AssistantStreamError("NO_BODY", "No readable response body for SSE streaming");
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let receivedMeta = false;
    let receivedDone = false;
    let requestId: string | null = null;

    // Start first-token timer now that connection is open
    firstTokenTimer = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_FIRST_TOKEN_MS);
    timers.push(firstTokenTimer);

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

          let parsed: {
            type?: string;
            code?: string;
            message?: string;
            request_id?: string;
            content?: string;
            provider?: string;
            status?: string;
            model?: string;
            citations?: string[];
          };

          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            // Skip malformed SSE lines
            continue;
          }

          switch (parsed.type) {
            case "meta":
              receivedMeta = true;
              requestId = parsed.request_id ?? null;
              if (onMeta) {
                onMeta({
                  provider: parsed.provider ?? "unknown",
                  status: parsed.status ?? "unknown",
                  model: parsed.model ?? "unknown",
                  citations: parsed.citations ?? [],
                  request_id: parsed.request_id,
                });
              }
              break;

            case "token":
              if (!receivedMeta) {
                throw new AssistantStreamError(
                  "INVALID_STREAM_SEQUENCE",
                  "The assistant returned an invalid stream sequence.",
                  requestId ?? undefined
                );
              }
              if (!receivedFirstToken) {
                receivedFirstToken = true;
                // Cancel first-token timer
                if (firstTokenTimer !== null) clearTimeout(firstTokenTimer);
              }
              if (parsed.content) {
                onToken(parsed.content);
              }
              break;

            case "done":
              receivedDone = true;
              break;

            case "error":
              // Throw immediately — do NOT swallow
              throw new AssistantStreamError(
                (parsed.code as AssistantErrorCode) || "PROVIDER_UNAVAILABLE",
                parsed.message || "The live assistant is unavailable.",
                parsed.request_id
              );
          }
        }
      }

      // Flush decoder remainder
      const remainder = decoder.decode();
      if (remainder.startsWith("data: ")) {
        const jsonStr = remainder.replace(/^data:\s*/, "").trim();
        if (jsonStr) {
          let parsed: { type?: string; code?: string; message?: string; request_id?: string; content?: string } | null = null;

          try {
            parsed = JSON.parse(jsonStr);
          } catch {
            // Ignore malformed final buffer
          }

          if (parsed) {
            if (parsed.type === "error") {
              throw new AssistantStreamError(
                (parsed.code as AssistantErrorCode) || "STREAM_ERROR",
                parsed.message || "The live AI assistant stream is temporarily unavailable.",
                parsed.request_id
              );
            }
            if (parsed.type === "meta") receivedMeta = true;
            if (parsed.type === "token" && parsed.content) onToken(parsed.content);
            if (parsed.type === "done") receivedDone = true;
          }
        }
      }
    } finally {
      try {
        await reader.cancel();
      } catch {
        // Ignore cancel errors
      }
    }

    // Validate stream completeness — but only if NOT a user/timeout abort
    if (controller.signal.aborted) {
      // Was it the max-stream timer or user abort?
      if (!signal?.aborted) {
        throw new AssistantStreamError(
          "STREAM_DURATION_EXCEEDED",
          "The assistant response exceeded the maximum allowed duration."
        );
      }
      // User abort — caller handles this via AbortError
      const abortErr = new Error("AbortError");
      abortErr.name = "AbortError";
      throw abortErr;
    }

    if (!receivedMeta) {
      throw new AssistantStreamError(
        "MISSING_STREAM_METADATA",
        "The assistant connection ended before provider confirmation.",
        requestId ?? undefined
      );
    }

    if (!receivedDone) {
      throw new AssistantStreamError(
        "INCOMPLETE_STREAM",
        "The assistant response ended unexpectedly.",
        requestId ?? undefined
      );
    }
  } finally {
    // Clear all timers unconditionally
    for (const t of timers) clearTimeout(t);
  }
}
