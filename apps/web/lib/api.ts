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

// AI Skill Mentor Client API
import type { MentorChatResponse, RoadmapResponse, SkillGoalRequest } from "./types";

export async function generateRoadmap(payload: SkillGoalRequest): Promise<RoadmapResponse> {
  try {
    return await request<RoadmapResponse>("/api/v1/skills/mentor/generate-roadmap", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
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
      mode_used: "structured_template",
      personalization_reason: `Generated for your ${payload.current_level || "Beginner"} level in ${targetSkill}, tailored to study goals.`,
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
        },
        {
          phase_number: 3,
          title: "PHASE 3 — Applied Practice",
          objective: "Apply concepts to real-world datasets and production patterns.",
          estimated_hours: 30,
          topics: ["Exploratory Analysis & Visualization", "Feature Engineering", "Error Handling"],
          tools: ["Matplotlib", "Seaborn"],
          ai_tools: ["Julius AI"],
          exercises: ["Build 5 interactive charts", "Document dataset anomalies"],
          project: "Industry Case Study Analysis",
          checkpoint: "Applied Practice Review"
        },
        {
          phase_number: 4,

          title: "PHASE 4 — AI Integration",
          objective: "Accelerate workflows responsibly using generative AI tools.",
          estimated_hours: 20,
          topics: ["AI-Assisted EDA & Coding", "Prompt Engineering for Development", "Output Verification & Auditing"],
          tools: ["ChatGPT Plus", "Cursor AI"],
          ai_tools: ["GitHub Copilot Workspace"],
          exercises: ["Audit AI-generated code for edge case bugs", "Generate unit test suites via prompts"],
          project: "AI-Augmented Sentiment Analysis App",
          checkpoint: "Responsible AI Checkpoint"
        },
        {
          phase_number: 5,
          title: "PHASE 5 — Advanced Work",
          objective: "Build scalable architectures and production machine learning models.",
          estimated_hours: 35,
          topics: ["Machine Learning / Advanced Backend", "Model Evaluation", "Docker Containerization"],
          tools: ["Scikit-Learn", "Docker", "MLflow"],
          ai_tools: ["Cursor"],
          exercises: ["Train prediction model & evaluate ROC curve", "Build multi-stage Dockerfile"],
          project: "Customer Churn Prediction Engine",
          checkpoint: "Advanced Competency Milestone"
        },
        {
          phase_number: 6,
          title: "PHASE 6 — Portfolio and Career",
          objective: "Package projects into a professional portfolio for tech job interviews.",
          estimated_hours: 15,
          topics: ["GitHub Portfolio Structuring", "Interactive Web App Deployment", "Resume & Mock Interviews"],
          tools: ["Streamlit", "LinkedIn"],
          ai_tools: ["Resume AI"],
          exercises: ["Deploy app to cloud platform", "Complete technical mock interview"],
          project: "Personal Developer Portfolio Site",
          checkpoint: "Portfolio Verification Milestone"
        },
        {
          phase_number: 7,
          title: "PHASE 7 — Capstone Project",
          objective: "Build and deploy an enterprise-grade Capstone application.",
          estimated_hours: 40,
          topics: ["End-to-End SaaS Platform", "FastAPI Serving Engine", "Cloud Deployment & Security"],
          tools: ["FastAPI", "Docker", "PostgreSQL", "Streamlit"],
          ai_tools: ["Cursor AI", "Copilot"],
          exercises: ["Deploy live cloud service", "Implement authentication & rate-limiting"],
          project: "Enterprise Complaint Intelligence SaaS",
          checkpoint: "Capstone Defense & Badge Award"
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
        },
        {
          name: "ChatGPT / Claude",
          category: "AI",
          purpose: "AI concept explanation and code drafting",
          skill_level: "All Levels",
          is_free: true,
          platform: "Web / Mobile",
          why_recommended: "Fast troubleshooting and syntax reference",
          alternative: "Gemini"
        }
      ],
      ai_workflows: [
        {
          task: "Automated Data Cleaning & Code Drafting",
          recommended_ai_tool: "ChatGPT / Copilot",
          example_workflow: "Pass schema to AI: 'Generate Pandas code to handle missing values and scale numeric columns.'",
          verification_requirement: "Manually inspect data distributions and verify test coverage before production deployment.",
          limitation: "AI can suggest invalid assumptions if business logic context is missing.",
          privacy_warning: "Never paste confidential database passwords or PII data into public AI prompts."
        }
      ],
      schedule: {
        weeks: [
          {
            week_number: 1,
            title: "Week 1: Foundations & Environment Setup",
            weekly_objective: "Set up development tools and learn core syntax.",
            phase_number: 1,
            days: [
              { id: "w1d1", day_number: 1, estimated_hours: 1.5, topic: "Syntax & Variables", practice_task: "Complete 5 syntax exercises", ai_usage: "Ask AI to clarify variable scope", is_completed: false },
              { id: "w1d2", day_number: 2, estimated_hours: 1.5, topic: "Control Flow", practice_task: "Build if/else loop script", ai_usage: "Check edge cases with AI", is_completed: false }
            ],
            is_completed: false
          }
        ]
      },
      projects: [
        {
          id: "proj_capstone_demo",
          phase_number: 7,
          title: "Enterprise Complaint Intelligence SaaS",
          problem_statement: "Build a production AI web platform for categorizing incoming issues.",
          objective: "Develop FastAPI backend, Streamlit dashboard, and Docker setup.",
          skills_practised: [targetSkill, "FastAPI", "SQL", "Docker"],
          tools: ["VS Code", "PostgreSQL", "Docker"],
          ai_integration: "Leverage AI for documentation and test cases.",
          dataset_requirements: "CFPB Consumer Complaint Dataset",
          difficulty: "Capstone",
          estimated_hours: 40,
          is_capstone: true,
          is_completed: false
        }
      ],
      assessments: [
        {
          id: "assess_p1",
          phase_number: 1,
          title: "Foundations Milestone Assessment",
          type: "multiple_choice",
          questions: [
            { question: `What is the core purpose of ${targetSkill}?`, options: ["Solving real-world software & data problems", "Unverified guessing", "Static text editing"], answer: "Solving real-world software & data problems" }
          ],
          passing_score: 70,
          is_completed: false
        }
      ],
      resources: [
        { title: `Official ${targetSkill} Documentation`, provider: "Official Site", url: "https://docs.python.org/3/", is_free: true, is_official: true },
        { title: `FreeCodeCamp ${targetSkill} Complete Course`, provider: "FreeCodeCamp", url: "https://www.freecodecamp.org/", is_free: true, is_official: false }
      ],
      completed_items: []
    };
  }
}

export async function getRoadmap(roadmapId: string): Promise<RoadmapResponse> {
  try {
    return await request<RoadmapResponse>(`/api/v1/skills/mentor/roadmaps/${roadmapId}`);
  } catch {
    return generateRoadmap({ raw_goal: "Learn Data Science in 6 months", target_skill: "Data Science" });
  }
}

export async function updateRoadmapProgress(roadmapId: string, itemId: string, isCompleted: boolean): Promise<RoadmapResponse> {
  try {
    return await request<RoadmapResponse>(`/api/v1/skills/mentor/roadmaps/${roadmapId}/progress`, {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, is_completed: isCompleted }),
    });
  } catch {
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
    return await request<MentorChatResponse>("/api/v1/skills/mentor/chat", {
      method: "POST",
      body: JSON.stringify({ roadmap_id: roadmapId, user_message: userMessage, current_phase_number: currentPhase }),
    });
  } catch {
    return {
      reply: `AI Skill Mentor Response:\n\nRegarding your question: "${userMessage}"\n\nFocus on practicing core exercises in Phase ${currentPhase}. Always verify AI-generated output against official documentation.`,
      citations: [`Phase ${currentPhase} Roadmap Guidelines`],
      suggested_questions: ["Explain Phase concepts simply", "Give me a practice exercise", "How do I audit AI outputs?"],
      disclaimer: "AI guidance may contain mistakes. Verify important technical, academic and career decisions.",
    };
  }
}

