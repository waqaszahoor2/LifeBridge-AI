"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function SkillsProgressPage() {
  return (
    <AppShell>
      <div className="lb-skills-subpage">
        <div className="subpage-header">
          <Icon name="academic" size={24} />
          <div>
            <h1>Learning Progress & Skill Achievements</h1>
            <p>Track your active learning roadmaps, completed milestones, and confidence trends.</p>
          </div>
        </div>

        <div className="subpage-card">
          <h2>Active Learning Roadmaps</h2>
          <div className="active-roadmaps-list">
            <div className="roadmap-mini-item">
              <div>
                <h3>Data Science & AI Analytics Mastery</h3>
                <p>Target Role: Data Scientist • 120 Hours Total</p>
              </div>
              <Link href="/skills/roadmap/rm_demo_datascience" className="continue-btn">
                <span>Continue Learning</span>
                <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
