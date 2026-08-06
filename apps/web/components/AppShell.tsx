"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
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
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-sans antialiased">
      {/* Permanent Left Navigation Sidebar on Desktop */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <main id="main-content" className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-12">
          {children}
        </main>
        <AppFooter />
      </div>

      {/* Floating Controls & Mobile Navigation */}
      <FloatingAssistantButton />
      <MobileNav />
    </div>
  );
}
