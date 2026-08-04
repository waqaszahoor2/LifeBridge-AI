"use client";

import { Icon } from "@/components/ui/Icon";
import type { RoadmapResponse } from "@/lib/types";

interface RoadmapOverviewProps {
  roadmap: RoadmapResponse;
  onOpenChat: () => void;
}

export function RoadmapOverview({ roadmap, onOpenChat }: RoadmapOverviewProps) {
  const isTemplateMode = roadmap.mode_used === "structured_template";

  return (
    <div className="lb-roadmap-overview-card">
      <div className="overview-header-row">
        <div>
          <div className="badge-row">
            <span className="skill-category-badge">{roadmap.primary_skill}</span>
            <span className={`engine-badge ${isTemplateMode ? "template" : "ai"}`}>
              <Icon name={isTemplateMode ? "book" : "sparkles"} size={13} />
              <span>{isTemplateMode ? "LifeBridge Structured Roadmap Engine" : "AI-Assisted Personalised Roadmap"}</span>
            </span>
          </div>
          <h1 className="overview-title">{roadmap.title}</h1>
          <p className="overview-role">Target Role: <strong>{roadmap.target_role}</strong></p>
        </div>

        <button className="open-mentor-btn" onClick={onOpenChat}>
          <Icon name="sparkles" size={16} />
          <span>Ask AI Mentor</span>
        </button>
      </div>

      <div className="personalization-note">
        <Icon name="info" size={16} />
        <span>{roadmap.personalization_reason}</span>
      </div>

      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-val">{roadmap.completion_percentage}%</span>
          <span className="metric-lbl">Overall Progress</span>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${roadmap.completion_percentage}%` }} />
          </div>
        </div>

        <div className="metric-box">
          <span className="metric-val">{roadmap.estimated_hours} hrs</span>
          <span className="metric-lbl">Estimated Duration</span>
        </div>

        <div className="metric-box">
          <span className="metric-val">Phase {roadmap.current_phase_number} / 7</span>
          <span className="metric-lbl">Current Milestone</span>
        </div>

        <div className="metric-box">
          <span className="metric-val">{roadmap.completed_items?.length || 0}</span>
          <span className="metric-lbl">Tasks Completed</span>
        </div>
      </div>
    </div>
  );
}
