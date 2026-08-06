"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isDemoModeEnabled, API_BASE_URL } from "@/lib/config";

type BackendStatus = "checking" | "online" | "offline" | "error";
type AssistantHealth =
  | "checking"
  | "ready"
  | "demo"
  | "configuration_missing"
  | "verification_failed"
  | "verification_unknown"
  | "unavailable";

interface DataModeContextType {
  isDemoMode: boolean;
  backendStatus: BackendStatus;
  assistantHealth: AssistantHealth;
  assistantProvider: string;
  assistantModel: string;
  refreshHealth: () => void;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export function DataModeProvider({ children }: { children: ReactNode }) {
  const isDemoMode = isDemoModeEnabled();
  const [backendStatus, setBackendStatus] = useState<BackendStatus>("checking");
  const [assistantHealth, setAssistantHealth] = useState<AssistantHealth>("checking");
  const [assistantProvider, setAssistantProvider] = useState<string>("checking");
  const [assistantModel, setAssistantModel] = useState<string>("");

  const refreshHealth = () => {
    setBackendStatus("checking");
    setAssistantHealth("checking");

    // Check backend health
    fetch(`${API_BASE_URL}/api/v1/health`, { signal: AbortSignal.timeout(10000) })
      .then((res) => {
        if (res.ok) setBackendStatus("online");
        else setBackendStatus("error");
      })
      .catch(() => setBackendStatus("offline"));

    // Check assistant health
    fetch(`${API_BASE_URL}/api/v1/assistant/health`, { signal: AbortSignal.timeout(10000) })
      .then((res) => {
        if (!res.ok) throw new Error("Health response not OK");
        return res.json();
      })
      .then((data) => {
        const status = data.status as string;
        const model = data.model || "";
        setAssistantModel(model);

        if (status === "ready" && data.configured && data.provider_verified) {
          setAssistantHealth("ready");
          setAssistantProvider(`Groq Live (${model})`);
        } else if (status === "demo" || data.provider === "local_demo") {
          setAssistantHealth("demo");
          setAssistantProvider("Offline Demo");
        } else if (status === "configuration_missing") {
          setAssistantHealth("configuration_missing");
          setAssistantProvider("Configuration Missing");
        } else if (status === "verification_failed") {
          setAssistantHealth("verification_failed");
          setAssistantProvider("Provider Verification Failed");
        } else if (status === "verification_unknown") {
          setAssistantHealth("verification_unknown");
          setAssistantProvider("Verification Unavailable");
        } else {
          setAssistantHealth("unavailable");
          setAssistantProvider("Service Unavailable");
        }
      })
      .catch(() => {
        setAssistantHealth("unavailable");
        setAssistantProvider("Service Unavailable");
      });
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  return (
    <DataModeContext.Provider
      value={{
        isDemoMode,
        backendStatus,
        assistantHealth,
        assistantProvider,
        assistantModel,
        refreshHealth,
      }}
    >
      {children}
    </DataModeContext.Provider>
  );
}

export function useDataMode() {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error("useDataMode must be used within a DataModeProvider");
  }
  return context;
}
