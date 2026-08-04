"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { RoadmapAssessment } from "@/lib/types";

interface AssessmentCardProps {
  assessments: RoadmapAssessment[];
  completedItems: string[];
  onToggleTask: (itemId: string, isCompleted: boolean) => void;
}

export function AssessmentCard({ assessments, completedItems, onToggleTask }: AssessmentCardProps) {
  const [answersMap, setAnswersMap] = useState<Record<string, Record<number, string>>>({});

  function handleOptionSelect(assessmentId: string, qIdx: number, selectedOpt: string) {
    setAnswersMap((prev) => ({
      ...prev,
      [assessmentId]: {
        ...(prev[assessmentId] || {}),
        [qIdx]: selectedOpt,
      },
    }));
  }

  return (
    <div className="lb-assessments-section">
      <h2 className="section-title">Phase Checkpoint Assessments</h2>
      <p className="section-sub">Validate your understanding and earn internal LifeBridge learning milestone badges.</p>

      <div className="assessments-grid">
        {assessments.map((assess) => {
          const isDone = completedItems.includes(assess.id);

          return (
            <article key={assess.id} className={`assessment-card ${isDone ? "completed" : ""}`}>
              <div className="assess-card-header">
                <span className="phase-num-badge">Phase {assess.phase_number} Checkpoint</span>
                <h3 className="assess-title">{assess.title}</h3>
              </div>

              {/* Questions List */}
              <div className="questions-block">
                {assess.questions.map((q, qIdx) => (
                  <div key={qIdx} className="q-item">
                    <p className="q-text"><strong>Q{qIdx + 1}:</strong> {q.question}</p>
                    <div className="options-list">
                      {q.options.map((opt) => {
                        const isSelected = answersMap[assess.id]?.[qIdx] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={`option-btn ${isSelected ? "selected" : ""}`}
                            onClick={() => handleOptionSelect(assess.id, qIdx, opt)}
                          >
                            <span className="opt-indicator">{isSelected ? "●" : "○"}</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Milestone Badge Footer */}
              <div className="assess-footer">
                {isDone && (
                  <div className="milestone-badge-display">
                    <Icon name="academic" size={18} />
                    <span>LifeBridge Learning Milestone Badge Earned!</span>
                  </div>
                )}

                <button
                  type="button"
                  className={`submit-assess-btn ${isDone ? "done" : ""}`}
                  onClick={() => onToggleTask(assess.id, !isDone)}
                >
                  <Icon name={isDone ? "check" : "academic"} size={16} />
                  <span>{isDone ? "Checkpoint Passed" : "Submit Assessment"}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
