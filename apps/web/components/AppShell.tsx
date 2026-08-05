"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

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
        <main className="lb-app-content-body">{children}</main>
      </div>
      <FloatingAssistantButton />
      <MobileNav />
    </div>
  );
}



