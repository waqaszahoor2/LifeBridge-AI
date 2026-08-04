"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { SkillGoalRequest } from "@/lib/types";

interface SkillGoalFormProps {
  onSubmit: (goal: SkillGoalRequest) => void;
  loading: boolean;
}

const SAMPLE_GOALS = [
  "I know basic Python and SQL. I want to become a data scientist in six months. I can study one hour daily and want to use AI tools during learning.",
  "I want to learn Power BI for business analytics from scratch. I can study 45 minutes daily.",
  "I want to learn machine learning with my current Python knowledge. My goal is to build real-world AI applications.",
  "I want to learn UI/UX design and combine it with AI wireframing tools.",
  "I want to learn cloud computing and AWS from beginner level in 4 months."
];

const SUGGESTED_CHIPS = [
  "Data Science",
  "Python",
  "Power BI",
  "Machine Learning",
  "Web Development",
  "UI/UX",
  "Cloud Computing",
  "Cybersecurity",
  "Digital Marketing",
  "Video Editing",
  "Data Engineering",
  "SQL"
];

export function SkillGoalForm({ onSubmit, loading }: SkillGoalFormProps) {
  const [rawGoal, setRawGoal] = useState("");
  const [targetSkill, setTargetSkill] = useState("");
  const [currentLevel, setCurrentLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [targetMonths, setTargetMonths] = useState(6);
  const [learningStyle, setLearningStyle] = useState<"Videos" | "Reading" | "Practical Projects" | "Exercises" | "Mixed">("Mixed");
  const [budgetPreference, setBudgetPreference] = useState<"Free Only" | "Mostly Free" | "Paid Allowed">("Mostly Free");
  const [showOptions, setShowOptions] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rawGoal.trim() || rawGoal.trim().length < 10) {
      setError("Please describe your learning goal in at least 10 characters.");
      return;
    }
    setError("");
    onSubmit({
      raw_goal: rawGoal,
      target_skill: targetSkill || undefined,
      current_level: currentLevel,
      hours_per_day: hoursPerDay,
      days_per_week: daysPerWeek,
      target_months: targetMonths,
      learning_style: learningStyle,
      budget_preference: budgetPreference,
    });
  }

  function useSample(sampleText: string) {
    setRawGoal(sampleText);
    setError("");
  }

  function handleChipClick(chip: string) {
    setTargetSkill(chip);
    if (!rawGoal.includes(chip)) {
      setRawGoal((prev) => (prev ? `${prev} I want to learn ${chip}.` : `I want to learn ${chip}.`));
    }
  }

  return (
    <form className="lb-goal-form-card" onSubmit={handleSubmit}>
      <div className="form-header-group">
        <div className="header-icon-badge">
          <Icon name="sparkles" size={24} />
        </div>
        <div>
          <h1 className="goal-heading">What skill do you want to learn?</h1>
          <p className="goal-subheading">
            Describe your goal, experience and available time. LifeBridge AI will create a personalised roadmap.
          </p>
        </div>
      </div>

      {/* Suggested Chips Toolbar */}
      <div className="suggestion-chips-toolbar" aria-label="Popular Skill Suggestions">
        <span className="chips-label">Popular Skills:</span>
        <div className="chips-row">
          {SUGGESTED_CHIPS.map((chip) => (
            <button
              type="button"
              key={chip}
              className={`skill-chip ${targetSkill === chip ? "active" : ""}`}
              onClick={() => handleChipClick(chip)}
            >
              <Icon name="academic" size={14} />
              <span>{chip}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Natural Language Input */}
      <div className="form-field-block">
        <label htmlFor="goal-input" className="field-label">
          Your Goal Description
        </label>
        <textarea
          id="goal-input"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="lb-goal-textarea"
          value={rawGoal}
          onChange={(e) => setRawGoal(e.target.value)}
          placeholder="e.g. I know basic Python and SQL. I want to become a data scientist in six months. I can study one hour daily and want to use AI tools during learning."
        />
        {error && <p className="form-error-msg">{error}</p>}
      </div>

      {/* Structured Fields Modal Toggle */}
      <div className="options-toggle-row">
        <button
          type="button"
          className="text-btn toggle-options-btn"
          onClick={() => setShowOptions(!showOptions)}
        >
          <Icon name="settings" size={16} />
          <span>{showOptions ? "Hide Structured Preferences" : "Show Optional Preferences (Hours, Level, Budget)"}</span>
        </button>
      </div>

      {/* Structured Preference Fields */}
      {showOptions && (
        <div className="structured-fields-grid">
          <div className="field-cell">
            <label>Current Experience Level</label>
            <select value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value as any)}>
              <option value="Beginner">Beginner (Starting from scratch)</option>
              <option value="Intermediate">Intermediate (Know basics)</option>
              <option value="Advanced">Advanced (Looking to specialize)</option>
            </select>
          </div>

          <div className="field-cell">
            <label>Available Hours / Day</label>
            <input
              type="number"
              min={0.5}
              max={12}
              step={0.5}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseFloat(e.target.value) || 1)}
            />
          </div>

          <div className="field-cell">
            <label>Study Days / Week</label>
            <input
              type="number"
              min={1}
              max={7}
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(parseInt(e.target.value) || 5)}
            />
          </div>

          <div className="field-cell">
            <label>Target Duration (Months)</label>
            <select value={targetMonths} onChange={(e) => setTargetMonths(parseInt(e.target.value))}>
              <option value={1}>1 Month (Crash Course)</option>
              <option value={3}>3 Months (Fast Track)</option>
              <option value={6}>6 Months (Comprehensive)</option>
              <option value={12}>12 Months (Deep Mastery)</option>
            </select>
          </div>

          <div className="field-cell">
            <label>Preferred Learning Style</label>
            <select value={learningStyle} onChange={(e) => setLearningStyle(e.target.value as any)}>
              <option value="Mixed">Mixed (Videos, Reading & Hands-on)</option>
              <option value="Practical Projects">Practical Projects First</option>
              <option value="Videos">Video Tutorials</option>
              <option value="Reading">Documentation & Books</option>
              <option value="Exercises">Interactive Exercises</option>
            </select>
          </div>

          <div className="field-cell">
            <label>Resource Budget</label>
            <select value={budgetPreference} onChange={(e) => setBudgetPreference(e.target.value as any)}>
              <option value="Free Only">Free Resources Only</option>
              <option value="Mostly Free">Mostly Free (Free with optional paid)</option>
              <option value="Paid Allowed">Paid Resources Allowed</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="form-actions-bar">
        <button type="submit" className="primary-action-btn" disabled={loading}>
          <Icon name="sparkles" size={18} />
          <span>{loading ? "Generating Roadmap…" : "Generate My Personalised Roadmap"}</span>
        </button>

        <button
          type="button"
          className="secondary-action-btn"
          onClick={() => useSample(SAMPLE_GOALS[0])}
        >
          <span>Use Sample Goal</span>
        </button>

        <button
          type="button"
          className="ghost-action-btn"
          onClick={() => {
            setRawGoal("");
            setTargetSkill("");
            setError("");
          }}
        >
          <span>Clear</span>
        </button>
      </div>
    </form>
  );
}
