"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ToolRecommendation } from "@/lib/types";

interface ToolRecommendationCardProps {
  tools: ToolRecommendation[];
}

export function ToolRecommendationCard({ tools }: ToolRecommendationCardProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "Core", "AI", "Free", "Advanced"];

  const filteredTools = filterCategory === "All"
    ? tools
    : tools.filter((t) => t.category.toLowerCase() === filterCategory.toLowerCase() || (filterCategory === "Free" && t.is_free));

  return (
    <div className="lb-tool-recommendations-section">
      <div className="tools-header-row">
        <h2 className="section-title">Recommended Toolstack</h2>

        {/* Filter bar */}
        <div className="tools-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-btn ${filterCategory === cat ? "active" : ""}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="tools-cards-grid">
        {filteredTools.map((tool) => (
          <article key={tool.name} className="tool-recommend-card">
            <div className="tool-card-top">
              <span className={`cat-pill ${tool.category.toLowerCase()}`}>{tool.category}</span>
              <span className={`free-badge ${tool.is_free ? "free" : "paid"}`}>
                {tool.is_free ? "Free / Open Source" : "Paid Available"}
              </span>
            </div>

            <h3 className="tool-name">{tool.name}</h3>
            <p className="tool-purpose">{tool.purpose}</p>

            <div className="tool-meta-list">
              <div><strong>Skill Level:</strong> {tool.skill_level}</div>
              <div><strong>Platform:</strong> {tool.platform}</div>
              <div><strong>Why Recommended:</strong> {tool.why_recommended}</div>
              {tool.alternative && <div><strong>Alternative:</strong> {tool.alternative}</div>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
