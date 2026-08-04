"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AIIntegrationPanel } from "@/components/skill-mentor/AIIntegrationPanel";
import { AssessmentCard } from "@/components/skill-mentor/AssessmentCard";
import { DailyPlan } from "@/components/skill-mentor/DailyPlan";
import { MentorChat } from "@/components/skill-mentor/MentorChat";
import { ProgressDashboard } from "@/components/skill-mentor/ProgressDashboard";
import { ProjectCard } from "@/components/skill-mentor/ProjectCard";
import { RoadmapOverview } from "@/components/skill-mentor/RoadmapOverview";
import { RoadmapTimeline } from "@/components/skill-mentor/RoadmapTimeline";
import { ToolRecommendationCard } from "@/components/skill-mentor/ToolRecommendationCard";
import { Icon } from "@/components/ui/Icon";
import { getRoadmap, updateRoadmapProgress } from "@/lib/api";
import type { RoadmapResponse } from "@/lib/types";

interface PageProps {
  params: Promise<{ roadmapId: string }>;
}

export default function RoadmapDashboardPage({ params }: PageProps) {
  const { roadmapId } = use(params);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "ai_workflows" | "tools" | "schedule" | "projects" | "assessments" | "analytics">("timeline");
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getRoadmap(roadmapId);
        setRoadmap(data);
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [roadmapId]);

  async function handleToggleTask(itemId: string, isCompleted: boolean) {
    if (!roadmap) return;
    try {
      const updated = await updateRoadmapProgress(roadmap.roadmap_id, itemId, isCompleted);
      setRoadmap(updated);
    } catch {
      // Offline fallback
      const set = new Set(roadmap.completed_items);
      if (isCompleted) set.add(itemId);
      else set.delete(itemId);
      setRoadmap({ ...roadmap, completed_items: Array.from(set) });
    }
  }

  if (loading || !roadmap) {
    return (
      <AppShell>
        <div className="roadmap-loading-container">
          <div className="spinner-large" />
          <p>Loading your personalised learning roadmap…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="lb-roadmap-dashboard-page">
        {/* Header Overview Card */}
        <RoadmapOverview roadmap={roadmap} onOpenChat={() => setIsChatOpen(true)} />

        {/* Dashboard Navigation Tabs */}
        <div className="roadmap-nav-tabs" role="tablist">
          <button
            type="button"
            className={`tab-btn ${activeTab === "timeline" ? "active" : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <Icon name="book" size={16} />
            <span>7-Phase Roadmap</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "ai_workflows" ? "active" : ""}`}
            onClick={() => setActiveTab("ai_workflows")}
          >
            <Icon name="sparkles" size={16} />
            <span>AI Workflows</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "tools" ? "active" : ""}`}
            onClick={() => setActiveTab("tools")}
          >
            <Icon name="settings" size={16} />
            <span>Toolstack</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            <Icon name="clock" size={16} />
            <span>Daily Schedule</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            <Icon name="briefcase" size={16} />
            <span>Projects</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "assessments" ? "active" : ""}`}
            onClick={() => setActiveTab("assessments")}
          >
            <Icon name="academic" size={16} />
            <span>Checkpoints</span>
          </button>

          <button
            type="button"
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <Icon name="info" size={16} />
            <span>Analytics</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="roadmap-tab-content-area">
          {activeTab === "timeline" && (
            <RoadmapTimeline
              phases={roadmap.phases}
              completedItems={roadmap.completed_items}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === "ai_workflows" && (
            <AIIntegrationPanel
              workflows={roadmap.ai_workflows}
              primarySkill={roadmap.primary_skill}
            />
          )}

          {activeTab === "tools" && (
            <ToolRecommendationCard tools={roadmap.tools} />
          )}

          {activeTab === "schedule" && (
            <DailyPlan
              schedule={roadmap.schedule}
              completedItems={roadmap.completed_items}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === "projects" && (
            <ProjectCard
              projects={roadmap.projects}
              completedItems={roadmap.completed_items}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === "assessments" && (
            <AssessmentCard
              assessments={roadmap.assessments}
              completedItems={roadmap.completed_items}
              onToggleTask={handleToggleTask}
            />
          )}

          {activeTab === "analytics" && (
            <ProgressDashboard roadmap={roadmap} />
          )}
        </div>

        {/* Contextual AI Mentor Drawer */}
        <MentorChat
          roadmapId={roadmap.roadmap_id}
          currentPhase={roadmap.current_phase_number}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>
    </AppShell>
  );
}
