"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";
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
      <div className="lb-skills-hub-page">
        {/* Featured Hero Banner for AI Skill Mentor */}
        <div className="hero-mentor-banner">
          <div className="banner-badge">
            <Icon name="sparkles" size={16} />
            <span>AI Skill Mentor Module</span>
          </div>

          <h1 className="banner-title">Personalised AI Learning Roadmaps</h1>
          <p className="banner-sub">
            Tell us which skill you want to learn in natural language. LifeBridge AI will generate a 7-phase roadmap with prerequisite analysis, weekly & daily schedules, tool recommendations, and real-world projects.
          </p>

          <div className="banner-actions">
            <Link href="/skills/mentor" className="cta-primary-btn">
              <Icon name="sparkles" size={18} />
              <span>Launch AI Skill Mentor</span>
            </Link>

            <Link href="/skills/progress" className="cta-secondary-btn">
              <Icon name="academic" size={16} />
              <span>View Progress & Badges</span>
            </Link>
          </div>
        </div>

        {/* Quick Nav Module Cards */}
        <div className="modules-quick-grid">
          <Link href="/skills/mentor" className="module-card">
            <div className="icon-wrap"><Icon name="sparkles" size={20} /></div>
            <h3>AI Skill Mentor</h3>
            <p>Generate 7-phase custom roadmaps for any skill goal.</p>
          </Link>

          <Link href="/skills/projects" className="module-card">
            <div className="icon-wrap"><Icon name="briefcase" size={20} /></div>
            <h3>Real-World Projects</h3>
            <p>Practical portfolio assignments with dataset guidance.</p>
          </Link>

          <Link href="/skills/assessments" className="module-card">
            <div className="icon-wrap"><Icon name="academic" size={20} /></div>
            <h3>Checkpoints & Badges</h3>
            <p>Phase quizzes and LifeBridge milestone badges.</p>
          </Link>

          <Link href="/skills/resources" className="module-card">
            <div className="icon-wrap"><Icon name="book" size={20} /></div>
            <h3>Verified Resources</h3>
            <p>Curated documentation, courses, and open datasets.</p>
          </Link>
        </div>

        {/* CV SkillBridge Matcher Tool */}
        <div className="cv-matcher-section">
          <div className="section-header-block">
            <h2 className="section-title">CV Skill & Role Matcher</h2>
            <p className="section-sub">Paste redacted CV text to extract skills and match with target roles.</p>
          </div>

          <div className="tool-grid">
            <form className="tool-card" onSubmit={submit}>
              <label>
                CV text
                <textarea
                  required
                  minLength={20}
                  maxLength={50000}
                  rows={8}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Data analyst with experience using Python, SQL, Power BI..."
                />
              </label>
              <button className="primary" disabled={loading}>
                {loading ? "Analysing…" : "Analyse CV Skills"}
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
              </section>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
