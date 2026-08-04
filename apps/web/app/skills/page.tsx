"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { analyzeCv } from "@/lib/api";
import type { CvAnalysis } from "@/lib/types";

export default function SkillsPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CvAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setResult(await analyzeCv(text));
    } catch {
      setError("Unable to analyse the CV. Check the backend and API URL.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <TopBar title="SkillBridge" />
      <PageIntro
        title="CV skills and role matching"
        description="Paste redacted CV text to extract skills and compare it with the bundled role index. Do not include identity documents or sensitive data."
      />
      <div className="tool-grid">
        <form className="tool-card" onSubmit={submit}>
          <label>
            CV text
            <textarea
              required
              minLength={20}
              maxLength={50000}
              rows={16}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Data analyst with experience using Python, SQL, Power BI..."
            />
          </label>
          <button className="primary" disabled={loading}>
            {loading ? "Analysing…" : "Analyse skills"}
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>
        {result && (
          <section className="result-card">
            <h2>Extracted skills</h2>
            <div className="tag-row">
              {result.extracted_skills.map((skill) => <span className="tag" key={skill}>{skill}</span>)}
            </div>
            <h2>Recommended roles</h2>
            <div className="role-list">
              {result.recommended_roles.map((role) => (
                <article key={role.role}>
                  <strong>{role.role}</strong>
                  <span>{Math.round(role.score * 100)}% similarity</span>
                  <small>Matched: {role.matched_skills.join(", ") || "semantic profile"}</small>
                </article>
              ))}
            </div>
            <p className="muted">This is a derived relevance score, not a hiring probability.</p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
