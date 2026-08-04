"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function SkillsProjectsPage() {
  return (
    <AppShell>
      <div className="lb-skills-subpage">
        <div className="subpage-header">
          <Icon name="briefcase" size={24} />
          <div>
            <h1>Real-World Portfolio Projects</h1>
            <p>Build hands-on industry applications to prove your skills to tech employers.</p>
          </div>
        </div>

        <div className="subpage-card">
          <h2>Featured Capstone Projects</h2>
          <div className="projects-mini-list">
            <div className="project-mini-item">
              <div>
                <span className="badge">Capstone</span>
                <h3>Customer Complaint Intelligence Platform</h3>
                <p>Build an ML classifier with FastAPI serving and Streamlit dashboard.</p>
              </div>
              <Link href="/skills/roadmap/rm_demo_datascience" className="continue-btn">
                <span>View in Roadmap</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
