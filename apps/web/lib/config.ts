/**
 * Central application configuration.
 * Single source of truth for API base URL, demo mode, and feature flags.
 */

const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Whether the frontend is explicitly in demonstration mode. */
export function isDemoModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

/** Whether we are running in production environment. */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Validated API base URL. */
export function getApiBaseUrl(): string {
  if (isProduction()) {
    if (!configuredApiUrl) {
      throw new Error(
        "[Configuration Error] NEXT_PUBLIC_API_BASE_URL is required in the production environment."
      );
    }
    if (!configuredApiUrl.startsWith("https://")) {
      throw new Error(
        "[Configuration Error] NEXT_PUBLIC_API_BASE_URL must begin with https:// in production."
      );
    }
  }
  return configuredApiUrl ? configuredApiUrl.replace(/\/$/, "") : "http://localhost:8000";
}

export const API_BASE_URL = getApiBaseUrl();
export const IS_DEMO_MODE = isDemoModeEnabled();

/** Default request timeout in milliseconds. */
export const REQUEST_TIMEOUT_MS = 30_000;

/** Maximum conversation messages to send to the assistant. */
export const MAX_HISTORY_MESSAGES = 20;

/** Maximum characters per user message. */
export const MAX_MESSAGE_CHARACTERS = 6_000;

/** Chat history expiration in days. */
export const HISTORY_EXPIRY_DAYS = 7;

/** Maximum saved conversations. */
export const MAX_SAVED_CONVERSATIONS = 50;

/** Profile completeness fields list. */
export const PROFILE_COMPLETENESS_FIELDS = [
  "name",
  "country",
  "study_level",
  "field_of_study",
  "skills",
  "target_goal",
  "opportunity_type",
  "notification_pref",
] as const;
