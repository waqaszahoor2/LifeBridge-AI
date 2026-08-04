"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { RoadmapResponse } from "@/lib/types";

interface DailyPlanProps {
  schedule: RoadmapResponse["schedule"];
  completedItems: string[];
  onToggleTask: (itemId: string, isCompleted: boolean) => void;
}

export function DailyPlan({ schedule, completedItems, onToggleTask }: DailyPlanProps) {
  const weeks = schedule?.weeks || [];
  const [activeWeekNum, setActiveWeekNum] = useState<number>(1);

  const activeWeek = weeks.find((w) => w.week_number === activeWeekNum) || weeks[0];

  return (
    <div className="lb-daily-plan-section">
      <div className="schedule-header-row">
        <div>
          <h2 className="section-title">Personalised Schedule</h2>
          <p className="section-sub">Daily & weekly practice tasks structured for your target pace.</p>
        </div>

        {/* Week Selector Tabs */}
        <div className="week-tabs-scroll">
          {weeks.map((w) => (
            <button
              key={w.week_number}
              type="button"
              className={`week-tab-btn ${activeWeekNum === w.week_number ? "active" : ""}`}
              onClick={() => setActiveWeekNum(w.week_number)}
            >
              Week {w.week_number}
            </button>
          ))}
        </div>
      </div>

      {activeWeek && (
        <div className="week-schedule-card">
          <div className="week-card-banner">
            <h3>{activeWeek.title}</h3>
            <p>{activeWeek.weekly_objective}</p>
          </div>

          <div className="days-list-grid">
            {activeWeek.days.map((day) => {
              const isDone = completedItems.includes(day.id);

              return (
                <div key={day.id} className={`day-item-row ${isDone ? "completed" : ""}`}>
                  <button
                    type="button"
                    className="day-checkbox"
                    onClick={() => onToggleTask(day.id, !isDone)}
                    aria-label={`Toggle Day ${day.day_number} completion`}
                  >
                    <Icon name={isDone ? "check" : "circle"} size={18} />
                  </button>

                  <div className="day-info-block">
                    <div className="day-meta">
                      <span className="day-number">Day {day.day_number}</span>
                      <span className="day-time">{day.estimated_hours} hrs</span>
                    </div>

                    <h4 className="day-topic">{day.topic}</h4>
                    <p className="day-task"><strong>Practice Task:</strong> {day.practice_task}</p>
                    <p className="day-ai"><strong>AI Workflow:</strong> {day.ai_usage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
