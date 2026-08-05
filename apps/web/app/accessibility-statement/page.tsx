"use client";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function AccessibilityStatementPage() {
  return (
    <AppShell pageTitle="Accessibility Statement" pageSubtitle="Our commitment to WCAG 2.2 AA standards and inclusive web design for all users.">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="user" size={22} className="text-primary-500" />
            Accessibility (WCAG 2.2 AA) Commitment
          </h1>

          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
            <p>
              LifeBridge AI is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards.
            </p>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Measures Taken to Support Accessibility:</h3>
            <ul className="list-disc list-inside space-y-1.5 text-slate-500 dark:text-slate-400">
              <li><strong>Semantic HTML Landmarks</strong>: Header, Nav, Main, Article, Aside, and Footer elements on all pages.</li>
              <li><strong>Keyboard Navigation</strong>: Visible focus rings on all interactive buttons, links, and text inputs.</li>
              <li><strong>Minimum Touch Targets</strong>: All buttons and interactive elements meet or exceed 44x44 pixel touch target standards.</li>
              <li><strong>Color Contrast</strong>: High-contrast text palettes complying with minimum WCAG contrast ratios.</li>
              <li><strong>Screen Reader Live Regions</strong>: Dynamic notifications and assistant streaming use <code>aria-live</code> regions.</li>
              <li><strong>Reduced Motion Support</strong>: Respects system <code>prefers-reduced-motion</code> settings.</li>
            </ul>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white pt-2">Feedback & Support</h3>
            <p>
              We welcome your feedback on the accessibility of LifeBridge AI. If you encounter accessibility barriers, please contact our team via our <a href="/help" className="text-primary-600 font-semibold underline">Help & Support Center</a>.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
