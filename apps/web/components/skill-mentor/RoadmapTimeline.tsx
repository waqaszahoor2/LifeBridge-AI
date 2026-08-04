"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { RoadmapPhase } from "@/lib/types";

interface RoadmapTimelineProps {
  phases: RoadmapPhase[];
  completedItems: string[];
  onToggleTask: (itemId: string, isCompleted: boolean) => void;
}

export function RoadmapTimeline({ phases, completedItems, onToggleTask }: RoadmapTimelineProps) {
  const [expandedPhase, setExpandedPhase] = useState<number>(1);

  return (
    <div className="lb-roadmap-timeline-section">
      <h2 className="section-title">7-Phase Learning Roadmap</h2>
      <div className="timeline-container">
        {phases.map((phase) => {
          const isExpanded = expandedPhase === phase.phase_number;
          const phaseTaskId = `phase_${phase.phase_number}_done`;
          const isPhaseDone = completedItems.includes(phaseTaskId);

          return (
            <article key={phase.phase_number} className={`timeline-phase-card ${isExpanded ? "expanded" : ""} ${isPhaseDone ? "completed" : ""}`}>
              <div
                className="phase-header-bar"
                onClick={() => setExpandedPhase(isExpanded ? 0 : phase.phase_number)}
              >
                <div className="phase-badge-num">
                  {isPhaseDone ? <Icon name="check" size={16} /> : phase.phase_number}
                </div>

                <div className="phase-title-group">
                  <span className="phase-tag">PHASE {phase.phase_number}</span>
                  <h3 className="phase-heading">{phase.title}</h3>
                  <span className="phase-duration">{phase.estimated_hours} Hours</span>
                </div>

                <button type="button" className="phase-toggle-btn" aria-label="Toggle Phase Details">
                  <Icon name={isExpanded ? "chevronUp" : "chevronDown"} size={20} />
                </button>
              </div>

              {isExpanded && (
                <div className="phase-body-content">
                  <p className="phase-objective"><strong>Objective:</strong> {phase.objective}</p>

                  {/* Topics List */}
                  <div className="phase-section-block">
                    <h4>Core Topics</h4>
                    <ul className="topics-pill-list">
                      {phase.topics.map((topic, idx) => {
                        const topicId = `phase_${phase.phase_number}_topic_${idx}`;
                        const isDone = completedItems.includes(topicId);
                        return (
                          <li key={topic} className={`topic-item ${isDone ? "done" : ""}`}>
                            <button
                              type="button"
                              className="topic-check-btn"
                              onClick={() => onToggleTask(topicId, !isDone)}
                            >
                              <Icon name={isDone ? "check" : "circle"} size={14} />
                              <span>{topic}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Tools & AI Tools */}
                  <div className="phase-tools-grid">
                    <div>
                      <h4>Tools & Software</h4>
                      <div className="tag-row">
                        {phase.tools.map((t) => <span key={t} className="tool-chip">{t}</span>)}
                      </div>
                    </div>

                    <div>
                      <h4>Recommended AI Tools</h4>
                      <div className="tag-row">
                        {phase.ai_tools.map((a) => <span key={a} className="ai-tool-chip"><Icon name="sparkles" size={12} />{a}</span>)}
                      </div>
                    </div>
                  </div>

                  {/* Project & Assessment */}
                  <div className="phase-footer-block">
                    <div className="project-highlight-box">
                      <Icon name="briefcase" size={18} />
                      <div>
                        <strong>Phase Project:</strong> {phase.project}
                      </div>
                    </div>

                    <div className="checkpoint-box">
                      <Icon name="academic" size={18} />
                      <div>
                        <strong>Checkpoint:</strong> {phase.checkpoint}
                      </div>
                    </div>
                  </div>

                  {/* Complete Phase Button */}
                  <div className="phase-action-footer">
                    <button
                      type="button"
                      className={`mark-phase-btn ${isPhaseDone ? "done" : ""}`}
                      onClick={() => onToggleTask(phaseTaskId, !isPhaseDone)}
                    >
                      <Icon name={isPhaseDone ? "check" : "circle"} size={16} />
                      <span>{isPhaseDone ? "Phase Completed!" : "Mark Phase Completed"}</span>
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
