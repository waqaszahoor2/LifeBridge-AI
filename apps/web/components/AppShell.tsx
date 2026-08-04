"use client";

import type { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell-wrapper">
      <Header />
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">{children}</div>
      </div>
      <MobileNav />
    </div>
  );
}

