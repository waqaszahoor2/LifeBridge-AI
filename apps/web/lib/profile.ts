export interface LocalRecommendationProfile {
  name?: string;
  country?: string;
  city?: string;
  study_level?: string;
  field_of_study?: string;
  skills?: string[];
  interests?: string[];
  preferred_categories?: string[];
  target_goal?: string;
  opportunity_type?: string;
  notification_pref?: string;
}

const key = "lifebridge-recommendation-profile";

export function readLocalProfile(): LocalRecommendationProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocalRecommendationProfile;
    if (
      parsed &&
      ((parsed.skills && parsed.skills.length > 0) ||
        (parsed.interests && parsed.interests.length > 0) ||
        parsed.country ||
        parsed.field_of_study)
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export const getStoredProfile = readLocalProfile;

export function saveLocalProfile(profile: LocalRecommendationProfile): void {
  window.localStorage.setItem(key, JSON.stringify(profile));
}

export const saveStoredProfile = saveLocalProfile;

export const defaultProfile: LocalRecommendationProfile = {
  name: "Local Demo Profile",
  country: "Pakistan",
  city: "Islamabad",
  study_level: "Bachelor's Degree",
  field_of_study: "Computer Science",
  skills: ["Python", "SQL", "Data Analysis"],
  interests: ["Data Science", "AI", "Scholarships"],
  preferred_categories: ["job", "scholarship", "disaster", "weather", "service", "safety", "learning"],
  target_goal: "Entry-level Data Science & Software Engineering Roles",
  opportunity_type: "Full-time / Remote / Scholarships",
  notification_pref: "daily_email",
};
