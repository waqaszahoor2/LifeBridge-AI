"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { ThemeMode } from "@/lib/types";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Load persisted theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("lifebridge-theme") as ThemeMode | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        setThemeState(stored);
      }
    }
  }, []);

  // Apply theme to document and persist
  useEffect(() => {
    if (typeof window === "undefined") return;

    let effective: "light" | "dark";
    if (theme === "system") {
      effective = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      effective = theme;
    }

    document.documentElement.dataset.theme = effective;
    setResolvedTheme(effective);
    localStorage.setItem("lifebridge-theme", theme);

    // Listen for system preference changes when in system mode
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        document.documentElement.dataset.theme = newTheme;
        setResolvedTheme(newTheme);
      };
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
