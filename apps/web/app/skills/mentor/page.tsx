"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { SkillGoalForm } from "@/components/skill-mentor/SkillGoalForm";
import { generateRoadmap } from "@/lib/api";
import type { SkillGoalRequest } from "@/lib/types";

export default function AISkillMentorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");

  async function handleGenerateRoadmap(goalReq: SkillGoalRequest) {
    setLoading(true);
    setGenerationStep("1. Understanding your goal & extracting skill profile…");

    try {
      setTimeout(() => setGenerationStep("2. Checking prerequisites & target role requirements…"), 600);
      setTimeout(() => setGenerationStep("3. Building 7-Phase learning progression…"), 1200);
      setTimeout(() => setGenerationStep("4. Selecting core tools & AI workflow integrations…"), 1800);
      setTimeout(() => setGenerationStep("5. Finalising daily schedule & real-world projects…"), 2400);

      const res = await generateRoadmap(goalReq);
      router.push(`/skills/roadmap/${res.roadmap_id}`);
    } catch {
      alert("Unable to generate roadmap right now. Redirecting to demo roadmap.");
      router.push("/skills/roadmap/rm_demo_datascience");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="lb-skills-mentor-page">
        <SkillGoalForm onSubmit={handleGenerateRoadmap} loading={loading} />

        {loading && (
          <div className="generation-progress-overlay">
            <div className="generation-progress-card">
              <div className="spinner-large" />
              <h3>LifeBridge AI Skill Mentor</h3>
              <p className="step-text">{generationStep}</p>
              <div className="step-indicators">
                <span className="dot active" />
                <span className="dot active" />
                <span className="dot active" />
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
