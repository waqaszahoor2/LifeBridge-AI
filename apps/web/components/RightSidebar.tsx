"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RelativeTime } from "./RelativeTime";

export function RightSidebar({
  lastSyncTime,
  onRefreshTrigger,
}: {
  lastSyncTime?: string;
  onRefreshTrigger?: () => void;
}) {
  const [syncTime, setSyncTime] = useState<string>(
    lastSyncTime || new Date().toISOString()
  );

  useEffect(() => {
    if (lastSyncTime) setSyncTime(lastSyncTime);
  }, [lastSyncTime]);

  return (
    <aside className="linkedin-right-sidebar" aria-label="Urgent Updates & Insights">
      {/* Sync Status Banner */}
      <div className="sidebar-card sync-status-card">
        <div className="sync-status-header">
          <span className="live-pulse-dot" aria-hidden="true" />
          <span className="sync-title">Live Intelligence Sync</span>
        </div>
        <p className="sync-timestamp-line">
          Last verified: <RelativeTime value={syncTime} />
        </p>
        <button
          type="button"
          className="sync-refresh-btn"
          onClick={onRefreshTrigger}
        >
          🔄 Refresh Sources Now
        </button>
      </div>

      {/* Urgent Emergency Alert Widget */}
      <div className="sidebar-card urgent-widget-card border-urgent">
        <div className="widget-header">
          <span className="widget-icon">🚨</span>
          <h3>Urgent Safety Warnings</h3>
        </div>
        <div className="widget-body">
          <div className="alert-item critical">
            <span className="alert-badge">CRITICAL</span>
            <h4>Flash Flood Emergency — Indus River Basin</h4>
            <p className="alert-meta">Issued by Met Department · Sindh & Punjab</p>
          </div>
        </div>
        <Link href="/disasters" className="widget-footer-link">
          View all 3 active alerts →
        </Link>
      </div>

      {/* Approaching Scholarship Deadlines Widget */}
      <div className="sidebar-card widget-card">
        <div className="widget-header">
          <span className="widget-icon">⏳</span>
          <h3>Upcoming Deadlines</h3>
        </div>
        <ul className="deadline-list">
          <li className="deadline-item">
            <div className="deadline-dates">
              <span className="month">AUG</span>
              <span className="day">15</span>
            </div>
            <div className="deadline-info">
              <h4>HEC Overseas PhD Scholarship 2026</h4>
              <p>Fully Funded · 11 days remaining</p>
            </div>
          </li>
          <li className="deadline-item">
            <div className="deadline-dates">
              <span className="month">SEP</span>
              <span className="day">01</span>
            </div>
            <div className="deadline-info">
              <h4>Fulbright Master&apos;s Fellowship</h4>
              <p>Full Tuition + Stipend · 28 days remaining</p>
            </div>
          </li>
        </ul>
        <Link href="/scholarships" className="widget-footer-link">
          Explore scholarships →
        </Link>
      </div>

      {/* Trending Skills Widget */}
      <div className="sidebar-card widget-card">
        <div className="widget-header">
          <span className="widget-icon">📈</span>
          <h3>Trending Skills in Demand</h3>
        </div>
        <div className="tag-cloud">
          <span className="trending-tag">#Python (High)</span>
          <span className="trending-tag">#DataScience</span>
          <span className="trending-tag">#MachineLearning</span>
          <span className="trending-tag">#CloudComputing</span>
          <span className="trending-tag">#DisasterResponse</span>
          <span className="trending-tag">#GISMapping</span>
        </div>
        <Link href="/skills" className="widget-footer-link">
          Check your skill match index →
        </Link>
      </div>

      {/* Verified Data Sources Widget */}
      <div className="sidebar-card widget-card">
        <div className="widget-header">
          <span className="widget-icon">🛡️</span>
          <h3>Verified Source Registry</h3>
        </div>
        <ul className="source-mini-list">
          <li>✔ UNHCR Global Relief Network</li>
          <li>✔ NASA EONET Climate Observatory</li>
          <li>✔ HEC Pakistan Portal</li>
          <li>✔ ReliefWeb International</li>
        </ul>
      </div>
    </aside>
  );
}
