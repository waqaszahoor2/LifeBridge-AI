export interface LocalRecommendationProfile {
  country: string;
  city: string;
  study_level: string;
  field_of_study: string;
  skills: string[];
  interests: string[];
  preferred_categories: string[];
}

export const defaultProfile: LocalRecommendationProfile = {
  country: "Pakistan",
  city: "Lahore",
  study_level: "Masters",
  field_of_study: "Data Science",
  skills: ["python", "sql", "power bi"],
  interests: ["fully funded", "remote job", "disaster safety"],
  preferred_categories: ["job", "scholarship", "disaster", "weather"],
};

const key = "lifebridge-recommendation-profile";

export function readLocalProfile(): LocalRecommendationProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "null") as LocalRecommendationProfile | null;
    return parsed ? { ...defaultProfile, ...parsed } : defaultProfile;
  } catch {
    return defaultProfile;
  }
}

export const getStoredProfile = readLocalProfile;

export function saveLocalProfile(profile: LocalRecommendationProfile): void {
  window.localStorage.setItem(key, JSON.stringify(profile));
}

export const saveStoredProfile = saveLocalProfile;

