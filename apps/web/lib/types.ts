export type FeedCategory = "job" | "scholarship" | "disaster" | "weather" | "service" | "safety" | "learning";
export type ThemeMode = "system" | "light" | "dark";

export interface FeedItem {
  id: number;
  external_id: string;
  source_external_id?: string;
  canonical_url?: string | null;
  content_hash?: string | null;
  category: FeedCategory;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  image_url?: string | null;
  published_at: string;
  collected_at: string;
  last_checked_at: string;
  updated_at: string;
  expires_at?: string | null;
  location: string;
  country_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  tags: string;
  severity: "low" | "medium" | "high" | "critical";
  verification_status: "verified" | "unverified" | "demo" | "community";
  source_reliability: number;
  funding_type?: string;
  study_level?: string;
  employment_type?: string;
  salary_text?: string;
  eligibility?: string;
  recommendation_reason?: string | null;
  match_score?: number | null;
}

export interface CursorPaginatedResponse {
  items: FeedItem[];
  next_cursor: string | null;
  has_more: boolean;
  generated_at: string;
  latest_item_at?: string | null;
}

export interface Recommendation {
  item: FeedItem;
  score: number;
  reasons: string[];
}

export interface ScamCheckResult {
  risk_score: number;
  risk_level: "low" | "medium" | "high";
  label: "likely_legitimate" | "suspicious" | "likely_scam";
  evidence: string[];
  safe_actions: string[];
  model_version: string;
}

export interface NearbyService {
  external_id: string;
  name: string;
  service_type: string;
  latitude: number;
  longitude: number;
  distance_km?: number | null;
  accessibility: string;
  address: string;
  source_url: string;
}

export interface CvAnalysis {
  extracted_skills: string[];
  detected_email?: string | null;
  detected_phone?: string | null;
  experience_years?: number | null;
  recommended_roles: Array<{ role: string; score: number; matched_skills: string[] }>;
}

export interface DecisionGraph {
  nodes: Array<{ id: string; type: string; label: string; attributes: Record<string, string | number | boolean | null> }>;
  edges: Array<{ source: string; target: string; relation: string; weight: number }>;
  top_items: Recommendation[];
  explanation: string;
}

// AI Skill Mentor Interfaces
export interface SkillGoalRequest {
  raw_goal: string;
  target_skill?: string;
  current_level?: "Beginner" | "Intermediate" | "Advanced";
  known_skills?: string[];
  career_goal?: string;
  hours_per_day?: number;
  days_per_week?: number;
  target_months?: number;
  learning_style?: "Videos" | "Reading" | "Practical Projects" | "Exercises" | "Mixed";
  budget_preference?: "Free Only" | "Mostly Free" | "Paid Allowed";
  country?: string;
}

export interface RoadmapPhase {
  phase_number: number;
  title: string;
  objective: string;
  estimated_hours: number;
  topics: string[];
  tools: string[];
  ai_tools: string[];
  exercises: string[];
  project: string;
  checkpoint: string;
}

export interface ToolRecommendation {
  name: string;
  category: "Core" | "AI" | "Free" | "Advanced";
  purpose: string;
  skill_level: string;
  is_free: boolean;
  platform: string;
  why_recommended: string;
  alternative: string;
}

export interface AIWorkflow {
  task: string;
  recommended_ai_tool: string;
  example_workflow: string;
  verification_requirement: string;
  limitation: string;
  privacy_warning: string;
}

export interface RoadmapProject {
  id: string;
  phase_number: number;
  title: string;
  problem_statement: string;
  objective: string;
  skills_practised: string[];
  tools: string[];
  ai_integration: string;
  dataset_requirements: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Capstone";
  estimated_hours: number;
  is_capstone: boolean;
  is_completed?: boolean;
  github_url?: string;
  demo_url?: string;
}

export interface RoadmapAssessment {
  id: string;
  phase_number: number;
  title: string;
  type: "multiple_choice" | "practical_task" | "debugging_task" | "mini_project";
  questions: Array<{ question: string; options: string[]; answer: string }>;
  passing_score: number;
  is_completed?: boolean;
  score?: number;
}

export interface SkillResource {
  title: string;
  provider: string;
  url: string;
  is_free: boolean;
  is_official: boolean;
}

export interface RoadmapResponse {
  roadmap_id: string;
  title: string;
  primary_skill: string;
  target_role: string;
  current_level: string;
  target_level: string;
  estimated_hours: number;
  completion_percentage: number;
  current_phase_number: number;
  mode_used: "ai_generated" | "structured_template";
  personalization_reason: string;
  phases: RoadmapPhase[];
  tools: ToolRecommendation[];
  ai_workflows: AIWorkflow[];
  schedule: {
    weeks: Array<{
      week_number: number;
      title: string;
      weekly_objective: string;
      phase_number: number;
      days: Array<{
        id: string;
        day_number: number;
        estimated_hours: number;
        topic: string;
        practice_task: string;
        ai_usage: string;
        is_completed: boolean;
      }>;
      is_completed: boolean;
    }>;
  };
  projects: RoadmapProject[];
  assessments: RoadmapAssessment[];
  resources: SkillResource[];
  completed_items: string[];
}

export interface MentorChatResponse {
  reply: string;
  citations: string[];
  suggested_questions: string[];
  disclaimer: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AssistantChatRequest {
  messages: ChatMessage[];
  mode?: "lifebridge_assistant" | "skill_coach";
  roadmap_id?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface AssistantChatResponse {
  message?: ChatMessage;
  reply: string;
  model?: string;
  model_used: string;
  conversation_id?: string;
  provider: string;
  citations: string[];
  disclaimer: string;
  status: string;
}



