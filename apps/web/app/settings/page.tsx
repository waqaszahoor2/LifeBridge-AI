"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { requestNotificationPermission } from "@/lib/firebase";

export default function SettingsPage() {
  const [notifStatus, setNotifStatus] = useState<string>("Not requested");
  const [language, setLanguage] = useState<string>("en");
  const [personalization, setPersonalization] = useState<boolean>(true);

  const enableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      setNotifStatus(`Active (Alerts enabled)`);
    } else {
      setNotifStatus("Permission denied or not supported in browser");
    }
  };

  return (
    <AppShell pageTitle="Settings & Preferences" pageSubtitle="Manage your language, notifications, privacy and data preferences.">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6 p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <Icon name="settings" size={22} className="text-primary-500" />
            Account & Application Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize your notification alerts, language options, and privacy controls.
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Icon name="bell" size={18} className="text-primary-500" />
              Urgent Push & Safety Alerts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Receive instant browser alerts for high-severity disaster warnings and job application updates.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Status: {notifStatus}</span>
              <button
                type="button"
                onClick={enableNotifications}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white transition-colors"
              >
                Enable Safety Notifications
              </button>
            </div>
          </div>

          {/* Regional & Language Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Icon name="help" size={18} className="text-primary-500" />
              Language & Regional Settings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Choose your preferred display language for opportunity cards and AI guidance.
            </p>
            <div className="max-w-xs">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="en">English (Default)</option>
                <option value="ur">Urdu (اردو)</option>
                <option value="hi">Hindi (हिंदी)</option>
                <option value="es">Spanish (Español)</option>
              </select>
            </div>
          </div>

          {/* Privacy Controls Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Icon name="shield" size={18} className="text-primary-500" />
              Privacy & Personalization
            </h2>
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">AI Content Recommendations</span>
                <span className="text-[11px] text-slate-500">Allow AI to prioritize jobs and courses based on your skill profile</span>
              </div>
              <input
                type="checkbox"
                checked={personalization}
                onChange={(e) => setPersonalization(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
