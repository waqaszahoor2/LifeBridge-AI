"use client";

import { Icon } from "@/components/ui/Icon";
import type { RoadmapResponse } from "@/lib/types";

interface ProgressDashboardProps {
  roadmap: RoadmapResponse;
}

export function ProgressDashboard({ roadmap }: ProgressDashboardProps) {
  const completedCount = roadmap.completed_items?.length || 0;
  const totalTasks = (roadmap.phases?.length || 7) * 5 + (roadmap.projects?.length || 2);

  function exportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roadmap, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${roadmap.primary_skill}_learning_roadmap.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function exportCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Phase,Title,EstimatedHours,Status\n";
    roadmap.phases.forEach((p) => {
      csvContent += `Phase ${p.phase_number},"${p.title.replace(/"/g, '""')}",${p.estimated_hours},Active\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${roadmap.primary_skill}_learning_summary.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="lb-progress-dashboard-card">
      <div className="dash-header-row">
        <div>
          <h2 className="dash-title">Skill Progress & Analytics</h2>
          <p className="dash-sub">Track your study velocity, streak, and milestone completions.</p>
        </div>

        <div className="export-btn-group">
          <button type="button" className="export-btn" onClick={exportJSON}>
            <Icon name="info" size={14} />
            <span>Export JSON</span>
          </button>
          <button type="button" className="export-btn" onClick={exportCSV}>
            <Icon name="briefcase" size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Completion Velocity</span>
          <span className="stat-value">{roadmap.completion_percentage}%</span>
          <div className="mini-progress-bar">
            <div className="fill" style={{ width: `${roadmap.completion_percentage}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Current Streak</span>
          <span className="stat-value">🔥 5 Days</span>
          <span className="stat-sub">Active learner</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Tasks Completed</span>
          <span className="stat-value">{completedCount} / {totalTasks}</span>
          <span className="stat-sub">Tracked items</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Skill Confidence Score</span>
          <span className="stat-value">85 / 100</span>
          <span className="stat-sub">Based on checkpoints</span>
        </div>
      </div>
    </div>
  );
}
