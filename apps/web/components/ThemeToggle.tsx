"use client";

import type { ThemeMode } from "@/lib/types";

export function ThemeToggle({ mode, onChange }: { mode: ThemeMode; onChange: (mode: ThemeMode) => void }) {
  return (
    <label className="theme-control">
      <span className="sr-only">Theme</span>
      <select value={mode} onChange={(event) => onChange(event.target.value as ThemeMode)} aria-label="Theme">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
