"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function PrivacyPage() {
  const [cleared, setCleared] = useState(false);
  const [exported, setExported] = useState(false);

  const handleClearData = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
      setCleared(true);
    }
  };

  const handleExportData = () => {
    if (typeof window !== "undefined") {
      const data = {
        theme: localStorage.getItem("lifebridge-theme"),
        savedItems: localStorage.getItem("lifebridge_saved_items"),
        assistantHistory: localStorage.getItem("lifebridge_assistant_history"),
        timestamp: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "lifebridge-user-data.json";
      a.click();
      setExported(true);
    }
  };

  return (
    <AppShell pageTitle="Privacy Policy & Data Controls" pageSubtitle="Learn how your data is protected and exercise full control over your local data.">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="shield" size={22} className="text-primary-500" />
            Data Protection Principles
          </h1>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
            <p>
              At LifeBridge AI, we prioritize user privacy, data security, and transparency. This policy outlines how your data is collected, stored, and protected when accessing our platform.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">1. Local Storage First Architecture</h3>
            <p>
              Your personal preferences, saved opportunity bookmarks, and conversation history are stored primarily inside your browser&apos;s local storage. You maintain control over your data at all times.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">2. AI Assistant & Backend Processing</h3>
            <p>
              Messages sent to the LifeBridge AI Assistant are securely transmitted to our backend endpoint (`/api/v1/assistant/chat`) and processed via Groq AI. We do not store permanent logs of private chat messages, nor do we sell user data to advertising third parties.
            </p>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">3. Location Data Handling</h3>
            <p>
              Browser geolocation is used exclusively on demand to filter nearby emergency shelters and disaster alerts. Coordinates are never tracked continuously or shared with third parties.
            </p>
          </div>
        </div>

        {/* User Data Management Tools */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="settings" size={18} className="text-primary-500" />
            Your Data Controls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export your saved items and preferences or wipe all local storage data immediately.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Icon name="share" size={14} />
              <span>Export My Data (.JSON)</span>
            </button>
            <button
              type="button"
              onClick={handleClearData}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Icon name="alert" size={14} />
              <span>Clear All Local Data</span>
            </button>
          </div>

          {cleared && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              All browser local storage and session data have been cleared successfully.
            </p>
          )}
          {exported && (
            <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
              Data exported to lifebridge-user-data.json.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
