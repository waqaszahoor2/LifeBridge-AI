"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { sendAssistantChat } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

interface MentorChatProps {
  roadmapId: string;
  currentPhase: number;
  isOpen: boolean;
  onClose: () => void;
}

interface MessageUI {
  sender: "user" | "mentor";
  text: string;
  citations?: string[];
  disclaimer?: string;
  modelUsed?: string;
  provider?: string;
}

export function MentorChat({ roadmapId, currentPhase, isOpen, onClose }: MentorChatProps) {
  const [messages, setMessages] = useState<MessageUI[]>([
    {
      sender: "mentor",
      text: `Hello! I am your LifeBridge AI Mentor powered by Groq (Llama-3.1-8b-instant). Ask me any technical question, code review request, or practical exercise for Phase ${currentPhase}.`,
      citations: [`Phase ${currentPhase} Roadmap Focus`],
      modelUsed: "llama-3.1-8b-instant",
      provider: "Groq AI",
      disclaimer: "AI guidance may contain mistakes. Verify important technical, academic and career decisions."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setErrorMsg(null);

    const updatedUI = [...messages, { sender: "user" as const, text: userText }];
    setMessages(updatedUI);
    setLoading(true);

    // Convert UI message history to API ChatMessage format
    const apiMessages: ChatMessage[] = updatedUI.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      const res = await sendAssistantChat({
        messages: apiMessages,
        roadmap_id: roadmapId,
        temperature: 0.7,
        max_tokens: 1024,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: res.reply,
          citations: res.citations,
          disclaimer: res.disclaimer,
          modelUsed: res.model_used,
          provider: res.provider,
        }
      ]);
    } catch (err: any) {
      const msg = err?.message || "Failed to reach AI Assistant backend.";
      setErrorMsg(msg);
      setMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: "Offline Mode: Unable to contact live Groq AI server. Please check network connection or wait if rate limited.",
          modelUsed: "Offline Fallback",
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function useQuickQuestion(q: string) {
    setInput(q);
  }

  return (
    <div className="lb-mentor-chat-drawer-overlay" onClick={onClose}>
      <div className="lb-mentor-chat-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Chat Drawer Header */}
        <div className="drawer-header">
          <div className="header-title-row">
            <Icon name="sparkles" size={22} className="text-primary-500" />
            <div>
              <h2>AI Skill Mentor Assistant</h2>
              <p className="text-xs text-slate-400">Powered by Groq AI • llama-3.1-8b-instant</p>
            </div>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close Chat Drawer">
            ✕
          </button>
        </div>

        {/* Suggested Prompts */}
        <div className="suggested-prompts-bar">
          <button type="button" onClick={() => useQuickQuestion(`Explain Phase ${currentPhase} concepts simply`)}>
            Explain topic simply
          </button>
          <button type="button" onClick={() => useQuickQuestion(`Give me a coding exercise for Phase ${currentPhase}`)}>
            Give me exercise
          </button>
          <button type="button" onClick={() => useQuickQuestion(`How do I audit AI code outputs?`)}>
            Audit AI output
          </button>
        </div>

        {errorMsg && (
          <div className="mx-4 my-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center gap-2">
            <Icon name="alert" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Messages Stream */}
        <div className="messages-stream">
          {messages.map((m, idx) => (
            <div key={idx} className={`message-bubble ${m.sender}`}>
              <div className="bubble-content">
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.provider && (
                  <div className="mt-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                    Engine: {m.provider} ({m.modelUsed || "llama-3.1-8b-instant"})
                  </div>
                )}
                {m.citations && m.citations.length > 0 && (
                  <div className="citations-block mt-1">
                    <span>Citations: {m.citations.join(" • ")}</span>
                  </div>
                )}
                {m.disclaimer && <p className="disclaimer-text mt-1 text-[11px] opacity-75">{m.disclaimer}</p>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-bubble mentor loading">
              <div className="bubble-content flex items-center gap-2">
                <Icon name="refresh" size={14} className="animate-spin text-primary-400" />
                <span>Thinking with Groq AI…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            required
            placeholder="Ask Groq AI Mentor a question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="send-btn" disabled={loading}>
            <Icon name="sparkles" size={16} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
