"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
import { sendAssistantChat, streamAssistantChat, API_BASE_URL } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

type AssistantMode = "lifebridge_assistant" | "skill_coach";

interface MessageUI {
  id: string;
  sender: "user" | "assistant";
  text: string;
  isStreaming?: boolean;
  citations?: string[];
  disclaimer?: string;
  modelUsed?: string;
  provider?: string; // "groq" | "local_demo" | "failed" | "stopped" | "pending" | "system"
  status?: string;  // "success" | "fallback" | "error" | "stopped" | "streaming" | "information"
  timestamp: string;
  requestId?: string; // Backend request reference for failure support
}

const STARTER_QUESTIONS = [
  "Hello, what can you help me with?",
  "I want to learn data science.",
  "I know basic Python and can study one hour daily.",
  "Create a five-step learning plan for Apache Airflow and explain one DAG scheduling mistake.",
  "Which AI tools should I learn?",
  "Explain how LifeBridge AI works",
  "Help me prepare for a scholarship",
];

export default function AssistantPage() {
  const [mode, setMode] = useState<AssistantMode>("lifebridge_assistant");
  const [messages, setMessages] = useState<MessageUI[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorRequestId, setErrorRequestId] = useState<string | null>(null);
  const [optInSaveHistory, setOptInSaveHistory] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ isReady: boolean; provider: string }>({
    isReady: false,
    provider: "Connecting…",
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeAbortController = useRef<AbortController | null>(null);

  // ── Health check + consent on mount ─────────────────────────────────────
  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);

    fetch(`${API_BASE_URL}/api/v1/assistant/health`, { signal: ctrl.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Health response not OK");
        return res.json();
      })
      .then((data) => {
        const isLive =
          data.status === "ready" && data.configured === true && data.provider_verified === true;
        const modelName = data.model || "llama-3.1-8b-instant";
        if (isLive) {
          setHealthStatus({ isReady: true, provider: `Groq Live (${modelName})` });
        } else if (data.status === "demo" || data.provider === "local_demo") {
          setHealthStatus({ isReady: false, provider: "Offline Demo" });
        } else if (data.status === "configuration_missing" || data.provider === "unavailable") {
          setHealthStatus({ isReady: false, provider: "Configuration Missing" });
        } else if (data.status === "verification_failed") {
          setHealthStatus({ isReady: false, provider: "Provider Verification Failed" });
        } else if (data.status === "verification_unknown") {
          setHealthStatus({ isReady: false, provider: "Provider Verification Unavailable" });
        } else {
          setHealthStatus({ isReady: false, provider: "Service Unavailable" });
        }
      })
      .catch(() => {
        setHealthStatus({ isReady: false, provider: "Offline / Service Error" });
      })
      .finally(() => clearTimeout(timer));

    if (typeof window !== "undefined") {
      const consentValue = localStorage.getItem("lifebridge_opt_in_history") === "true";
      setOptInSaveHistory(consentValue);

      if (consentValue) {
        try {
          const stored = localStorage.getItem("lifebridge_assistant_history");
          const storedExpiry = localStorage.getItem("lifebridge_assistant_history_expiry");
          const now = Date.now();

          if (storedExpiry && parseInt(storedExpiry, 10) < now) {
            localStorage.removeItem("lifebridge_assistant_history");
            localStorage.removeItem("lifebridge_assistant_history_expiry");
          } else if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
              return;
            }
          }
        } catch {
          // Fallback to initial message
        }
      } else {
        localStorage.removeItem("lifebridge_assistant_history");
        localStorage.removeItem("lifebridge_assistant_history_expiry");
      }
    }

    setMessages([
      {
        id: "init_1",
        sender: "assistant",
        text: "Hello! I am LifeBridge AI Assistant. Ask me about exploring opportunities, generating practical skill roadmaps, verifying suspicious content, or navigating platform tools.",
        provider: "system",
        status: "information",
        disclaimer: "AI-generated guidance. Verify important information independently.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  // ── Persist history when opt-in enabled ──────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (optInSaveHistory && messages.length > 0) {
        try {
          localStorage.setItem("lifebridge_assistant_history", JSON.stringify(messages));
          localStorage.setItem(
            "lifebridge_assistant_history_expiry",
            String(Date.now() + 7 * 86400 * 1000)
          );
        } catch {
          // Storage may be full
        }
      } else if (!optInSaveHistory) {
        localStorage.removeItem("lifebridge_assistant_history");
        localStorage.removeItem("lifebridge_assistant_history_expiry");
      }
    }
  }, [messages, optInSaveHistory]);

  const handleConsentToggle = (enabled: boolean) => {
    setOptInSaveHistory(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("lifebridge_opt_in_history", String(enabled));
      if (!enabled) {
        localStorage.removeItem("lifebridge_assistant_history");
        localStorage.removeItem("lifebridge_assistant_history_expiry");
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleNewChat() {
    const initial: MessageUI[] = [
      {
        id: `init_${Date.now()}`,
        sender: "assistant",
        text:
          mode === "skill_coach"
            ? "Welcome to AI Skill Coach! Tell me what skill or career role you want to learn, and I will build a step-by-step practical roadmap."
            : "Hello! How can I assist you on LifeBridge AI today?",
        provider: "system",
        status: "information",
        disclaimer: "AI-generated guidance. Verify important information independently.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(initial);
    if (typeof window !== "undefined" && optInSaveHistory) {
      localStorage.setItem("lifebridge_assistant_history", JSON.stringify(initial));
    }
    setErrorMsg(null);
    setErrorRequestId(null);
  }

  function handleClearHistory() {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lifebridge_assistant_history");
      localStorage.removeItem("lifebridge_assistant_history_expiry");
    }
    setErrorMsg(null);
    setErrorRequestId(null);
  }

  async function executeSend(textToSend: string, baseMessages: MessageUI[]) {
    if (!textToSend || loading) return;

    if (textToSend.length > 10000) {
      setErrorMsg("Message is too long. Please restrict input to under 10,000 characters.");
      return;
    }

    setInput("");
    setErrorMsg(null);
    setErrorRequestId(null);

    const controller = new AbortController();
    activeAbortController.current = controller;

    const lastMsg = baseMessages[baseMessages.length - 1];
    let currentMessages = baseMessages;
    if (!lastMsg || lastMsg.sender !== "user" || lastMsg.text !== textToSend) {
      const userMsg: MessageUI = {
        id: `user_${Date.now()}`,
        sender: "user",
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      currentMessages = [...baseMessages, userMsg];
    }

    setMessages(currentMessages);
    setLoading(true);

    const apiMessages: ChatMessage[] = currentMessages
      .filter(
        (m) =>
          m.text.trim() &&
          m.provider !== "system" &&
          m.provider !== "pending" &&
          m.provider !== "failed" &&
          m.status !== "error"
      )
      .map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

    const assistantMsgId = `asst_${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        sender: "assistant",
        text: "",
        isStreaming: true,
        provider: "pending",
        status: "streaming",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);

    try {
      let accumulatedText = "";

      await streamAssistantChat(
        {
          messages: apiMessages,
          mode: mode,
          temperature: 0.7,
          max_tokens: 1024,
        },
        (token) => {
          accumulatedText += token;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, text: accumulatedText } : m))
          );
        },
        (meta) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    provider: meta.provider,
                    status: meta.status,
                    modelUsed: meta.model,
                    citations: meta.citations,
                    requestId: meta.request_id,
                  }
                : m
            )
          );
        },
        controller.signal
      );

      setMessages((prev) =>
        prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
      );
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, status: "stopped", isStreaming: false } : m
          )
        );
        return;
      }

      const requestId: string | undefined = (err as { requestId?: string })?.requestId;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                status: "error",
                provider: "failed",
                text: "The live AI assistant is temporarily unavailable.",
                isStreaming: false,
                requestId: requestId,
              }
            : m
        )
      );

      setErrorMsg("The live AI assistant is temporarily unavailable.");
      if (requestId) setErrorRequestId(requestId);
    } finally {
      // Always clear active controller and loading state
      if (activeAbortController.current === controller) {
        activeAbortController.current = null;
      }
      setLoading(false);
    }
  }

  async function handleSend(promptText?: string) {
    const textToSend = (promptText || input).trim();
    if (!textToSend || loading) return;
    await executeSend(textToSend, messages);
  }

  function handleStopGenerating() {
    if (activeAbortController.current) {
      activeAbortController.current.abort();
      activeAbortController.current = null;
    }
    setLoading(false);
  }

  function handleRetry() {
    if (loading) return;
    const last = messages[messages.length - 1];
    let cleaned = messages;
    if (last && last.sender === "assistant" && (last.status === "error" || last.provider === "failed")) {
      cleaned = messages.slice(0, -1);
    }
    const lastUser = [...cleaned].reverse().find((m) => m.sender === "user");
    if (lastUser) {
      executeSend(lastUser.text, cleaned);
    }
  }

  // handleRegenerate intentionally kept for future use
  function handleRegenerate() {
    if (loading) return;
    let cleaned = messages;
    const last = messages[messages.length - 1];
    if (last && last.sender === "assistant") {
      cleaned = messages.slice(0, -1);
    }
    const lastUser = [...cleaned].reverse().find((m) => m.sender === "user");
    if (lastUser) {
      executeSend(lastUser.text, cleaned);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <AppShell pageTitle="AI Assistant" pageSubtitle="Interactive ChatGPT-style guidance with real-time Groq stream completion.">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col h-[calc(100vh-7rem)]">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              href="/for-you"
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              ← Back to Dashboard
            </Link>

            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Icon name="sparkles" size={18} />
            </div>

            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                LifeBridge AI Assistant
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    healthStatus.isReady
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  }`}
                >
                  {healthStatus.provider}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg cursor-pointer select-none">
              <input
                type="checkbox"
                checked={optInSaveHistory}
                onChange={(e) => handleConsentToggle(e.target.checked)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                aria-label="Save chat history on this device"
              />
              <span>Save chat history on this device</span>
            </label>

            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              aria-label="Start new chat"
            >
              <Icon name="refresh" size={14} />
              <span>New Chat</span>
            </button>
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Clear chat history"
            >
              Clear History
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 my-3 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit" role="tablist" aria-label="Assistant mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "lifebridge_assistant"}
            onClick={() => setMode("lifebridge_assistant")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === "lifebridge_assistant"
                ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            🌐 LifeBridge Assistant
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "skill_coach"}
            onClick={() => setMode("skill_coach")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === "skill_coach"
                ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            🎓 AI Skill Coach
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex flex-col gap-1"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon name="alert" size={16} />
                <span>{errorMsg}</span>
              </div>
              <button type="button" onClick={handleRetry} className="underline font-semibold hover:opacity-80">
                Retry Request
              </button>
            </div>
            {errorRequestId && (
              <p className="text-[10px] text-rose-500/80 font-mono mt-0.5">
                Request reference: {errorRequestId}
              </p>
            )}
          </div>
        )}

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 my-2" aria-label="Chat messages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  m.sender === "user"
                    ? "bg-primary-600 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5 pb-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[11px] font-semibold opacity-75 flex items-center gap-1.5">
                    {m.sender === "user" ? (
                      <>
                        <Icon name="user" size={12} /> You
                      </>
                    ) : (
                      <>
                        <Icon name="sparkles" size={12} className="text-primary-400" />
                        {/* Provider Badge Priority */}
                        {m.status === "stopped" ? (
                          <span className="text-slate-400 font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Stopped</span>
                        ) : m.status === "error" || m.provider === "failed" ? (
                          <span className="text-rose-500 font-semibold px-1.5 py-0.5 rounded bg-rose-500/10">Failed</span>
                        ) : m.provider === "pending" || m.isStreaming ? (
                          <span
                            aria-live="polite"
                            aria-label="Connecting to the live assistant"
                            className="text-sky-600 dark:text-sky-400 font-bold px-1.5 py-0.5 rounded bg-sky-500/10 animate-pulse"
                          >
                            {m.provider === "pending" ? "Connecting…" : "Streaming…"}
                          </span>
                        ) : m.provider === "groq" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">Groq Live</span>
                        ) : m.provider === "local_demo" ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold px-1.5 py-0.5 rounded bg-amber-500/10">Offline Demo</span>
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10">System Message</span>
                        )}
                      </>
                    )}
                  </span>
                  <span className="text-[10px] opacity-60">{m.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>

                {m.sender === "assistant" && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {m.modelUsed && (
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            {m.modelUsed}
                          </span>
                        )}
                        {m.citations && m.citations.some((c) => c.startsWith("http")) ? (
                          <span>Sources: {m.citations.join(" • ")}</span>
                        ) : (
                          <span className="italic text-slate-400">AI-generated guidance. Verify important information independently.</span>
                        )}
                      </div>
                      {m.requestId && (m.status === "error" || m.provider === "failed") && (
                        <p className="font-mono text-[10px] text-slate-400">
                          Request reference: {m.requestId}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(m.text, m.id)}
                      className="inline-flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      aria-label="Copy message to clipboard"
                    >
                      <Icon name="share" size={12} />
                      <span>{copiedId === m.id ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit shadow-sm"
            >
              <Icon name="refresh" size={16} className="animate-spin text-primary-500" />
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Streaming response from {healthStatus.provider || "assistant"}…
              </span>
              <button
                type="button"
                onClick={handleStopGenerating}
                className="ml-4 px-3 py-1 text-xs text-rose-500 bg-rose-500/10 rounded-lg hover:bg-rose-500/20 font-semibold transition-colors"
                aria-label="Stop generating response"
              >
                Stop Generating
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts Bar */}
        <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar" aria-label="Suggested prompts">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Suggestions:</span>
          {STARTER_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="px-3 py-1 text-xs whitespace-nowrap rounded-full bg-slate-100 hover:bg-primary-500/10 dark:bg-slate-800 dark:hover:bg-primary-500/20 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-300 border border-slate-200 dark:border-slate-700 transition-colors"
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Container */}
        <div className="pt-2">
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-sm focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all p-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "skill_coach"
                  ? "Tell AI Skill Coach what skill or career you want to learn (e.g. 'I want to learn Apache Airflow')..."
                  : "Ask LifeBridge AI Assistant anything (Enter to send, Shift+Enter for newline)..."
              }
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none px-2 py-1"
              aria-label="Message input"
              disabled={loading}
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 px-2">
              <div className="text-[11px] text-slate-400">Shift+Enter for newline</div>

              <div className="flex items-center gap-2">
                {loading ? (
                  <button
                    type="button"
                    onClick={handleStopGenerating}
                    className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                    aria-label="Stop generating response"
                  >
                    Stop Generating
                  </button>
                ) : (
                  <>
                    {messages.length > 0 && !loading && (
                      <button
                        type="button"
                      onClick={handleRegenerate}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        aria-label="Regenerate last response"
                      >
                        Regenerate
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSend()}
                      disabled={!input.trim() || loading}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white shadow-md transition-all"
                      aria-label="Send message"
                    >
                      <Icon name="sparkles" size={14} />
                      <span>Send</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
