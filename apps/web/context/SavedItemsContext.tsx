"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "lifebridge_saved_items";

interface SavedItemsContextType {
  savedIds: Set<number>;
  savedCount: number;
  isSaved: (id: number) => boolean;
  toggleSave: (id: number) => void;
  removeSaved: (id: number) => void;
  clearAll: () => void;
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedIds(new Set(parsed));
        }
      }
    } catch {
      // Ignore corrupt data
    }
  }, []);

  // Persist to localStorage on change
  const persist = useCallback((ids: Set<number>) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
    }
  }, []);

  const isSaved = useCallback((id: number) => savedIds.has(id), [savedIds]);

  const toggleSave = useCallback(
    (id: number) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const removeSaved = useCallback(
    (id: number) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearAll = useCallback(() => {
    setSavedIds(new Set());
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return (
    <SavedItemsContext.Provider
      value={{
        savedIds,
        savedCount: savedIds.size,
        isSaved,
        toggleSave,
        removeSaved,
        clearAll,
      }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const context = useContext(SavedItemsContext);
  if (!context) {
    throw new Error("useSavedItems must be used within a SavedItemsProvider");
  }
  return context;
}
