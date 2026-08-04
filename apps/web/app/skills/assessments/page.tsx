"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function SkillsAssessmentsPage() {
  return (
    <AppShell>
      <div className="lb-skills-subpage">
        <div className="subpage-header">
          <Icon name="academic" size={24} />
          <div>
            <h1>Skill Checkpoints & Internal Badges</h1>
            <p>Validate your knowledge at each phase and earn LifeBridge learning milestone badges.</p>
          </div>
        </div>

        <div className="subpage-card">
          <h2>Earned Learning Badges</h2>
          <div className="badges-showcase-grid">
            <div className="badge-item">
              <Icon name="academic" size={32} />
              <h3>Foundations Mastery</h3>
              <span>LifeBridge Learning Milestone</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
