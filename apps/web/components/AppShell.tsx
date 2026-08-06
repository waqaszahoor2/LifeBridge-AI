"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

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
    <div className="lb-app-shell-root">
      <Sidebar />
      <div className="lb-app-main-column">
        <Header
          pageTitle={pageTitle}
          pageSubtitle={pageSubtitle}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <main id="main-content" className="lb-app-content-body flex-1">{children}</main>
        <AppFooter />
      </div>
      <FloatingAssistantButton />
      <MobileNav />
    </div>
  );
}



