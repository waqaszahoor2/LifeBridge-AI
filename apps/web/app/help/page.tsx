"use client";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function HelpPage() {
  const SUPPORT_EMAIL = "support@lifebridgeai.example.org";
  const EMAIL_SUBJECT = encodeURIComponent("LifeBridge AI Support Request");
  const EMAIL_BODY = encodeURIComponent(
    "Please describe your issue, question, or feedback below:\n\n\n\n---\nSupport category: [General / Bug Report / Accessibility / Privacy]\nYour platform: [Browser / OS version]\n"
  );

  return (
    <AppShell
      pageTitle="Help & Support Centre"
      pageSubtitle="Get assistance, report bugs, ask questions, or learn about platform limitations."
    >
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Help & Support Centre</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get assistance, report bugs, ask questions, or learn about platform limitations.</p>
        </div>

        {/* Emergency Notice */}
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 flex items-start gap-3"
        >
          <Icon name="alert" size={20} className="mt-0.5 text-rose-600 flex-shrink-0" />
          <div className="text-xs">
            <strong className="block font-bold mb-1">Life-Threatening Emergency Advisory</strong>
            LifeBridge AI is an informational platform. In the event of an active disaster or
            life-threatening emergency, please contact official local emergency services or national
            response hotlines immediately. Do not rely on AI responses for emergency decisions.
          </div>
        </div>

        {/* FAQs Section */}
        <section
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4"
          aria-labelledby="faq-heading"
        >
          <h2 id="faq-heading" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="help" size={20} className="text-primary-500" />
            Frequently Asked Questions
          </h2>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-700/60">
            <details className="pt-3 group" open>
              <summary className="cursor-pointer font-semibold text-xs text-slate-800 dark:text-slate-200 hover:text-primary-600">
                How does LifeBridge AI recommend jobs and scholarships?
              </summary>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                The recommendation engine matches your skill profile, study preferences, and regional
                location against opportunity information gathered from configured sources. All
                information should be verified on the original source before taking any action, as
                content is not independently validated for accuracy or availability.
              </p>
            </details>

            <details className="pt-3 group">
              <summary className="cursor-pointer font-semibold text-xs text-slate-800 dark:text-slate-200 hover:text-primary-600">
                Is my conversation history with the AI Assistant private?
              </summary>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                When you use the AI Assistant, your messages are sent to our backend server and
                forwarded to a third-party AI provider (Groq) to generate a response. We do not
                permanently store conversation bodies in our database, but processed prompts pass
                through the AI provider&#39;s infrastructure subject to their terms and data handling
                policies. You can clear your local device&#39;s saved history at any time on the
                Assistant page. Do not share sensitive personal information through the chat.
              </p>
            </details>

            <details className="pt-3 group">
              <summary className="cursor-pointer font-semibold text-xs text-slate-800 dark:text-slate-200 hover:text-primary-600">
                How do I report a suspicious opportunity or scam?
              </summary>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Use the Trust Scanner tool to paste suspicious message text or links for an
                AI-assisted analysis. You can also use the Report flag on any Feed Card to mark an
                item for review. Reported items are logged for moderation purposes. For serious legal
                matters, contact the relevant authorities directly.
              </p>
            </details>

            <details className="pt-3 group">
              <summary className="cursor-pointer font-semibold text-xs text-slate-800 dark:text-slate-200 hover:text-primary-600">
                Are the AI responses guaranteed to be accurate?
              </summary>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                No. AI-generated responses can contain errors, outdated information, or
                misinterpretations. Always verify important employment, scholarship, legal, or safety
                information directly from official sources before taking action.
              </p>
            </details>
          </div>
        </section>

        {/* Contact / Bug Report — Honest Email Redirect */}
        <section
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm"
          aria-labelledby="contact-heading"
        >
          <h2 id="contact-heading" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <Icon name="help" size={20} className="text-primary-500" />
            Contact Support & Feedback
          </h2>

          <div className="rounded-2xl bg-sky-500/10 border border-sky-500/20 p-4 text-xs text-sky-700 dark:text-sky-300 mb-5">
            <strong className="block font-bold mb-1">How to reach us</strong>
            The button below opens your email application with a pre-filled support message. There is
            currently no in-app submission system — your message is sent directly from your own email
            account. Response times depend on support availability.
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">General Support</p>
                <p className="text-slate-500 dark:text-slate-400">Questions about features, accounts, or usage.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Bug Reports</p>
                <p className="text-slate-500 dark:text-slate-400">Describe the issue, steps to reproduce, and your browser.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Accessibility</p>
                <p className="text-slate-500 dark:text-slate-400">Feedback on accessibility barriers or assistive-technology issues.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Privacy & Data</p>
                <p className="text-slate-500 dark:text-slate-400">Requests related to your personal data or privacy concerns.</p>
              </div>
            </div>

            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-all"
              aria-label="Open email client to contact support"
            >
              <Icon name="help" size={14} />
              Open Email to Contact Support
            </a>

            <p className="text-[11px] text-slate-400 mt-2">
              This opens your email application. No message is sent through this website.
              Support email: {SUPPORT_EMAIL}
            </p>
          </div>
        </section>

        {/* Platform Limitations Notice */}
        <section
          className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-3xl text-xs space-y-2"
          aria-labelledby="limitations-heading"
        >
          <h2 id="limitations-heading" className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Icon name="alert" size={16} className="text-amber-500" />
            Platform Limitations
          </h2>
          <ul className="text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
            <li>LifeBridge AI does not guarantee employment, scholarship awards, or safety outcomes.</li>
            <li>Opportunity information is gathered from external sources and may be outdated or inaccurate.</li>
            <li>AI responses may contain errors. Always verify critical information independently.</li>
            <li>The Trust Scanner provides AI-assisted risk assessment, not a definitive scam verdict.</li>
            <li>The platform does not provide emergency response services.</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
