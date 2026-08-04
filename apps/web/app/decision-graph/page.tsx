"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageIntro } from "@/components/PageIntro";
import { TopBar } from "@/components/TopBar";
import { buildDecisionGraph } from "@/lib/api";
import type { DecisionGraph } from "@/lib/types";

export default function DecisionGraphPage() {
  const [skills, setSkills] = useState("python, sql, power bi");
  const [country, setCountry] = useState("Pakistan");
  const [graph, setGraph] = useState<DecisionGraph | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      setGraph(await buildDecisionGraph({
        skills: skills.split(",").map((value) => value.trim()).filter(Boolean),
        interests: ["scholarship", "remote work", "disaster safety"],
        preferred_categories: ["job", "scholarship", "disaster"],
        country,
        max_items: 10,
      }));
    } catch {
      setError("Unable to build the graph. Start the FastAPI backend first.");
    }
  }

  return (
    <AppShell>
      <TopBar title="Personal Decision Graph" />
      <PageIntro
        title="Connect relevance, trust, location and source evidence"
        description="This graph is the integration layer that turns separate modules into one explainable decision system."
      />
      <form className="inline-form graph-form" onSubmit={submit}>
        <label>Skills<input value={skills} onChange={(event) => setSkills(event.target.value)} /></label>
        <label>Country<input value={country} onChange={(event) => setCountry(event.target.value)} /></label>
        <button className="primary">Build graph</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      {graph && (
        <div className="graph-dashboard">
          <section className="side-card">
            <h2>Graph summary</h2>
            <p>{graph.explanation}</p>
            <strong>{graph.nodes.length} nodes · {graph.edges.length} relationships</strong>
          </section>
          <section className="side-card">
            <h2>Top relationships</h2>
            <div className="edge-list">
              {graph.edges.slice(0, 20).map((edge, index) => (
                <code key={`${edge.source}-${edge.target}-${index}`}>
                  {edge.source} —{edge.relation}→ {edge.target} ({Math.round(edge.weight * 100)}%)
                </code>
              ))}
            </div>
          </section>
          <section className="side-card">
            <h2>Top items</h2>
            <ol>
              {graph.top_items.map((result) => (
                <li key={result.item.external_id}>
                  <strong>{result.item.title}</strong> — {Math.round(result.score * 100)}%
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </AppShell>
  );
}
