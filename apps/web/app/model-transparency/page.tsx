"use client";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function ModelTransparencyPage() {
  return (
    <AppShell pageTitle="AI Model Transparency & Safety" pageSubtitle="Technical details on Groq llama-3.1-8b-instant integration, system prompts, and safety guardrails.">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="sparkles" size={22} className="text-primary-500" />
            Groq Llama-3.1 Integration Architecture
          </h1>

          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Core Engine</h3>
              <p className="mt-1">
                LifeBridge AI utilizes Meta&apos;s Llama 3.1 8B Instant model deployed via Groq LPUs for ultra-fast response times and high inference throughput.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Multi-Turn Context Retention</h3>
              <p className="mt-1">
                Our backend endpoint (`POST /api/v1/assistant/chat`) receives complete conversation history arrays (`messages`), maintaining context awareness across natural multi-turn interactions.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. System Safety Guardrails</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500 dark:text-slate-400">
                <li>Immediate escalation to local emergency dispatch for disaster safety queries</li>
                <li>Strict prohibition on requesting passwords, national IDs, or credit card info</li>
                <li>Zero guarantee of unverified employment or fake university degrees</li>
                <li>Automatic offline fallback engine when API keys are unconfigured</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Honest Citation Policy</h3>
              <p className="mt-1">
                Unless real retrieval augmented generation (RAG) returns verified HTTP sources, responses display:
                <br />
                <code className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-primary-600 font-mono text-[11px] mt-1 inline-block">
                  AI-generated guidance. Verify important information independently.
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
