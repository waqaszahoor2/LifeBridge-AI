"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function HelpPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formType, setFormType] = useState("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <AppShell pageTitle="Help & Support Center" pageSubtitle="Get assistance, report bugs, ask questions, or learn about emergency limitations.">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Emergency Notice */}
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3">
          <Icon name="alert" size={20} className="mt-0.5 text-rose-600 flex-shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold mb-1">Life-Threatening Emergency Advisory</strong>
            LifeBridge AI is an informational platform. In the event of an active disaster or life-threatening emergency, please contact official local emergency services or national response hotlines immediately.
          </div>
        </div>

        {/* FAQs Section */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="help" size={20} className="text-primary-500" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-700/60">
            <details className="pt-3 group" open>
              <summary className="cursor-pointer font-semibold text-xs text-slate-800 dark:text-slate-200 hover:text-primary-600">
                How does LifeBridge AI recommend jobs and scholarships?
              </summary>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Our recommendation engine analyzes your skill profile, study preferences, and regional location to match against verified opportunity feeds. You can customize your recommendations under Profile Settings.
              </p>
            </details>

            <details className="pt-3 group">
              <summary className="cursor-pointer font-semibold text-xs text-slate-800 dark:text-slate-200 hover:text-primary-600">
                Is my conversation history with the AI Assistant private?
              </summary>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Yes. Conversations are processed securely through our Groq AI API endpoint. We do not store or sell private chat logs to third-party advertisers. You can clear your local history at any time on the Assistant page.
              </p>
            </details>

            <details className="pt-3 group">
              <summary className="cursor-pointer font-semibold text-xs text-slate-800 dark:text-slate-200 hover:text-primary-600">
                How do I report a suspicious opportunity or scam?
              </summary>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Use the Trust Scanner tool to paste suspicious message text or links. You can also click the Report flag on any Feed Card to alert our Trust & Safety team.
              </p>
            </details>
          </div>
        </section>

        {/* Contact / Bug Report Form */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Icon name="help" size={20} className="text-primary-500" />
            Contact Support & Feedback
          </h2>


          {submitted ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              Thank you! Your ticket has been submitted. Our team will review your message within 24 hours.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Support Category
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <option value="general">General Support</option>
                    <option value="bug">Report a Technical Bug</option>
                    <option value="accessibility">Accessibility Assistance</option>
                    <option value="privacy">Privacy & Data Request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.org"
                    className="w-full bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Description
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your issue, feature request, or feedback..."
                  className="w-full bg-slate-100 dark:bg-slate-900 text-xs text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 resize-none"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
              >
                Submit Ticket
              </button>
            </form>
          )}
        </section>
      </div>
    </AppShell>
  );
}
