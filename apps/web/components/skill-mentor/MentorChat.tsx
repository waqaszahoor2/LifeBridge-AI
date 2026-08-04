"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { sendMentorChatMessage } from "@/lib/api";

interface MentorChatProps {
  roadmapId: string;
  currentPhase: number;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: "user" | "mentor";
  text: string;
  citations?: string[];
  disclaimer?: string;
}

export function MentorChat({ roadmapId, currentPhase, isOpen, onClose }: MentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "mentor",
      text: `Hello! I am your AI Skill Mentor. Ask me any technical question, code review request, or exercise topic for Phase ${currentPhase}.`,
      citations: [`Phase ${currentPhase} Roadmap Focus`],
      disclaimer: "AI guidance may contain mistakes. Verify important technical, academic and career decisions."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await sendMentorChatMessage(roadmapId, userText, currentPhase);
      setMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: res.reply,
          citations: res.citations,
          disclaimer: res.disclaimer
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: "I am currently in local offline mode. Remember to practice core topics and audit code output locally."
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
    <div className="lb-mentor-chat-drawer-overlay">
      <div className="lb-mentor-chat-drawer">
        {/* Chat Drawer Header */}
        <div className="drawer-header">
          <div className="header-title-row">
            <Icon name="sparkles" size={20} />
            <h2>AI Skill Mentor Assistant</h2>
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
          <button type="button" onClick={() => useQuickQuestion(`How do I audit AI outputs?`)}>
            Audit AI output
          </button>
        </div>

        {/* Messages Stream */}
        <div className="messages-stream">
          {messages.map((m, idx) => (
            <div key={idx} className={`message-bubble ${m.sender}`}>
              <div className="bubble-content">
                <p>{m.text}</p>
                {m.citations && m.citations.length > 0 && (
                  <div className="citations-block">
                    <span>Source Citations: {m.citations.join(" • ")}</span>
                  </div>
                )}
                {m.disclaimer && <p className="disclaimer-text">{m.disclaimer}</p>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message-bubble mentor loading">
              <div className="bubble-content">Thinking…</div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            required
            placeholder="Ask AI Mentor a question…"
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
