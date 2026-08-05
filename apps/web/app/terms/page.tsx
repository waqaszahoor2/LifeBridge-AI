"use client";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function TermsPage() {
  return (
    <AppShell pageTitle="Terms of Service" pageSubtitle="Platform usage terms, AI disclaimers, and emergency service limitations.">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="bookmark" size={22} className="text-primary-500" />
            Terms of Service & Usage Agreement
          </h1>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Informational Purpose Only</h3>
              <p className="mt-1">
                LifeBridge AI provides opportunity recommendations, skill roadmaps, safety warnings, and automated AI guidance. All information is provided for educational and decision-support purposes only.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. AI Guidance Limitations</h3>
              <p className="mt-1">
                AI Assistant answers are generated using artificial intelligence (Groq Llama-3.1). While we enforce strict guardrails, users should independently verify critical financial, educational, or safety decisions with official sources.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Emergency Disclaimer</h3>
              <p className="mt-1">
                LifeBridge AI is NOT a substitute for official 911/emergency dispatch systems. During active natural disasters, always follow instructions from local government and emergency authorities.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. User Conduct</h3>
              <p className="mt-1">
                Users agree not to submit malicious scripts, attempt unauthorized API scraping, or submit false report flags on verified feed cards.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
