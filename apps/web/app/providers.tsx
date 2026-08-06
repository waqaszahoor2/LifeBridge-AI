"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SavedItemsProvider } from "@/context/SavedItemsContext";
import { DataModeProvider } from "@/context/DataModeContext";

/**
 * Shared application providers wrapper.
 * Order matters: outer providers are available to inner ones.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <SavedItemsProvider>
            <DataModeProvider>
              {children}
            </DataModeProvider>
          </SavedItemsProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
