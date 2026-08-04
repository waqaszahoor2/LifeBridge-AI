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
