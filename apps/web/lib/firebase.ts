import { getWebEnv } from "./env";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function isFirebaseConfigured(): boolean {
  const env = getWebEnv();
  return Boolean(
    env.firebaseApiKey &&
      env.firebaseAuthDomain &&
      env.firebaseProjectId &&
      env.firebaseMessagingSenderId &&
      env.firebaseAppId,
  );
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.log("Web Notifications not supported in this environment.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      // If service worker is registered, return demo FCM token format
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Service Worker registered:", registration.scope);
        return `fcm_demo_token_${Date.now()}`;
      }
    }
  } catch (err) {
    console.warn("Failed to request notification permission:", err);
  }

  return null;
}
