"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { sendAssistantChat } from "@/lib/api";
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
  provider?: string;
  timestamp: string;
}

const STARTER_QUESTIONS = [
  "Help me choose a skill to learn",
  "Create a data-science roadmap",
  "Find my skill gaps",
  "Which AI tools should I learn?",
  "Explain how LifeBridge AI works",
  "Help me prepare for a scholarship",
  "Suggest a portfolio project",
];

export default function AssistantPage() {
  const [mode, setMode] = useState<AssistantMode>("lifebridge_assistant");
  const [messages, setMessages] = useState<MessageUI[]>([
    {
      id: "init_1",
      sender: "assistant",
      text: "Hello! I am LifeBridge AI Assistant powered by Groq (llama-3.1-8b-instant).\n\nAsk me about exploring opportunities, generating practical skill roadmaps, verifying suspicious content, or navigating platform tools.",
      citations: ["LifeBridge AI Knowledge Base"],
      modelUsed: "llama-3.1-8b-instant",
      provider: "Groq AI",
      disclaimer: "AI guidance is for informational purposes. Verify important decisions.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<boolean>(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function handleNewChat() {
    setMessages([
      {
        id: `init_${Date.now()}`,
        sender: "assistant",
        text: mode === "skill_coach" 
          ? "Welcome to AI Skill Coach! Tell me what skill or career role you want to learn, and I will build a step-by-step practical roadmap."
          : "Hello! How can I assist you on LifeBridge AI today?",
        citations: ["LifeBridge Knowledge Base"],
        modelUsed: "llama-3.1-8b-instant",
        provider: "Groq AI",
        disclaimer: "AI guidance is for informational purposes. Verify important decisions.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMsg(null);
  }

  async function handleSend(promptText?: string) {
    const textToSend = (promptText || input).trim();
    if (!textToSend || loading) return;

    setInput("");
    setErrorMsg(null);
    abortControllerRef.current = false;

    const userMsgId = `user_${Date.now()}`;
    const userMsg: MessageUI = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedUI = [...messages, userMsg];
    setMessages(updatedUI);
    setLoading(true);

    const apiMessages: ChatMessage[] = updatedUI.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await sendAssistantChat({
        messages: apiMessages,
        mode: mode,
        temperature: 0.7,
        max_tokens: 1024,
      });

      if (abortControllerRef.current) return;

      const fullReply = res.reply || res.message?.content || "";
      const assistantMsgId = `asst_${Date.now()}`;

      // Simulate streaming typewriter effect
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          sender: "assistant",
          text: "",
          isStreaming: true,
          citations: res.citations,
          disclaimer: res.disclaimer,
          modelUsed: res.model_used || res.model,
          provider: res.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

      let charIdx = 0;
      const speed = fullReply.length > 500 ? 5 : 12;
      const interval = setInterval(() => {
        if (abortControllerRef.current) {
          clearInterval(interval);
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
          );
          setLoading(false);
          return;
        }

        charIdx += 3;
        const currentSlice = fullReply.slice(0, charIdx);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, text: currentSlice } : m
          )
        );

        if (charIdx >= fullReply.length) {
          clearInterval(interval);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: fullReply, isStreaming: false } : m
            )
          );
          setLoading(false);
        }
      }, speed);
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || "Failed to connect to the assistant.";
      setErrorMsg(msg);
    }
  }

  function handleStopGenerating() {
    abortControllerRef.current = true;
    setLoading(false);
  }

  function handleRetry() {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === "user");
    if (lastUserMsg) {
      handleSend(lastUserMsg.text);
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
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-6rem)]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Icon name="sparkles" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              LifeBridge AI Assistant
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold border border-primary-500/20">
                Groq Llama-3.1
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conversational guide for skills, opportunities, safety alerts, and decision support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Icon name="refresh" size={14} />
            <span>New Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setMessages([])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-800 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-300 transition-colors"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2 my-4 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode("lifebridge_assistant")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
            mode === "lifebridge_assistant"
              ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          🌐 LifeBridge Assistant
        </button>
        <button
          type="button"
          onClick={() => setMode("skill_coach")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
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
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="alert" size={16} />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={handleRetry} className="underline font-semibold hover:opacity-80">
            Retry Request
          </button>
        </div>
      )}

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 my-2">
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
                      {m.provider || "Groq AI"}
                    </>
                  )}
                </span>
                <span className="text-[10px] opacity-60">{m.timestamp}</span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.text}</p>

              {m.sender === "assistant" && (
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    {m.modelUsed && (
                      <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {m.modelUsed}
                      </span>
                    )}
                    {m.citations && m.citations.length > 0 && (
                      <span>Citations: {m.citations.join(" • ")}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(m.text, m.id)}
                    className="inline-flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Icon name="share" size={12} />
                    <span>{copiedId === m.id ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              )}
            </div>
            {m.disclaimer && (
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.disclaimer}</span>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
            <Icon name="refresh" size={16} className="animate-spin text-primary-500" />
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Generating response with Groq Llama-3.1…
            </span>
            <button
              type="button"
              onClick={handleStopGenerating}
              className="ml-4 text-xs text-rose-500 hover:underline font-semibold"
            >
              Stop
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts Bar */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Suggestions:</span>
        {STARTER_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="px-3 py-1 text-xs whitespace-nowrap rounded-full bg-slate-100 hover:bg-primary-500/10 dark:bg-slate-800 dark:hover:bg-primary-500/20 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-300 border border-slate-200 dark:border-slate-700 transition-colors"
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
                ? "Tell AI Skill Coach what skill or career you want to learn (e.g. 'I want to learn Data Science with Python')..."
                : "Ask LifeBridge AI Assistant anything (Enter to send, Shift+Enter for newline)..."
            }
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none px-2 py-1"
          />

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 px-2">
            <div className="text-[11px] text-slate-400">
              Shift+Enter for newline
            </div>

            <div className="flex items-center gap-2">
              {loading ? (
                <button
                  type="button"
                  onClick={handleStopGenerating}
                  className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors"
                >
                  Stop Generating
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white shadow-md transition-all"
                >
                  <Icon name="sparkles" size={14} />
                  <span>Send</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
