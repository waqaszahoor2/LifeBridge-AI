"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { requestNotificationPermission } from "@/lib/firebase";

export default function SettingsPage() {
  const [notifStatus, setNotifStatus] = useState<string>("Not requested");

  const enableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotifStatus(`Active (Token: ${token.slice(0, 18)}...)`);
    } else {
      setNotifStatus("Permission denied or not supported in this browser");
    }
  };

  return (
    <AppShell>
      <TopBar title="Application Settings" />
      <PageIntro
        title="Preferences & Push Notifications"
        description="Configure notification preferences, privacy rules, and API endpoints."
      />
      <section className="profile-form">
        <label className="full">
          Push Notifications
          <button type="button" className="primary" onClick={enableNotifications}>
            Enable Push Notifications
          </button>
          <span className="muted">Status: {notifStatus}</span>
        </label>

        <label className="full">
          Data Storage Preference
          <select defaultValue="local">
            <option value="local">Browser-Local Storage (Demo Mode)</option>
            <option value="authenticated">Cloud Backend Sync (FastAPI)</option>
          </select>
        </label>
      </section>
    </AppShell>
  );
}
