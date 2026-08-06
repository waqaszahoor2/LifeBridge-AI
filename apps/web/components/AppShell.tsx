"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { AppFooter } from "./layout/AppFooter";
import { FloatingAssistantButton } from "./ui/FloatingAssistantButton";

export function AppShell({
  children,
  pageTitle,
  pageSubtitle,
  onRefresh,
  isRefreshing,
}: {
  children: ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-sans antialiased">
      <Header
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
      <main id="main-content" className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-6">
        {children}
      </main>
      <AppFooter />
      <FloatingAssistantButton />
      <MobileNav />
    </div>
  );
}
