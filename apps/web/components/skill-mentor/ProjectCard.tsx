"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { RoadmapProject } from "@/lib/types";

interface ProjectCardProps {
  projects: RoadmapProject[];
  completedItems: string[];
  onToggleTask: (itemId: string, isCompleted: boolean) => void;
}

export function ProjectCard({ projects, completedItems, onToggleTask }: ProjectCardProps) {
  const [githubUrlMap, setGithubUrlMap] = useState<Record<string, string>>({});

  return (
    <div className="lb-projects-section">
      <h2 className="section-title">Real-World Portfolio Projects</h2>
      <div className="projects-grid">
        {projects.map((proj) => {
          const isDone = completedItems.includes(proj.id);

          return (
            <article key={proj.id} className={`project-card ${proj.is_capstone ? "capstone" : ""} ${isDone ? "completed" : ""}`}>
              <div className="project-card-header">
                <div className="project-badges">
                  {proj.is_capstone && <span className="capstone-badge">🏆 Final Capstone Project</span>}
                  <span className={`diff-badge ${proj.difficulty.toLowerCase()}`}>{proj.difficulty}</span>
                  <span className="hours-badge">{proj.estimated_hours} Hours</span>
                </div>
                <h3 className="project-title">{proj.title}</h3>
              </div>

              <p className="project-problem"><strong>Real-World Problem:</strong> {proj.problem_statement}</p>
              <p className="project-objective"><strong>Objective:</strong> {proj.objective}</p>

              <div className="project-details-block">
                <div><strong>Practised Skills:</strong> {proj.skills_practised.join(", ")}</div>
                <div><strong>AI Integration:</strong> {proj.ai_integration}</div>
                <div><strong>Dataset / Case Requirements:</strong> {proj.dataset_requirements}</div>
              </div>

              {/* GitHub Link Input */}
              <div className="project-submission-box">
                <label htmlFor={`gh-${proj.id}`} className="sub-label">
                  Portfolio Link (GitHub / Demo URL):
                </label>
                <div className="input-btn-row">
                  <input
                    id={`gh-${proj.id}`}
                    type="url"
                    className="gh-url-input"
                    placeholder="https://github.com/username/project-repo"
                    value={githubUrlMap[proj.id] || ""}
                    onChange={(e) => setGithubUrlMap({ ...githubUrlMap, [proj.id]: e.target.value })}
                  />
                  <button
                    type="button"
                    className={`mark-project-btn ${isDone ? "done" : ""}`}
                    onClick={() => onToggleTask(proj.id, !isDone)}
                  >
                    <Icon name={isDone ? "check" : "circle"} size={16} />
                    <span>{isDone ? "Completed" : "Submit Project"}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
