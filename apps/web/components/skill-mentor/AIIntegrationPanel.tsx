"use client";

import { Icon } from "@/components/ui/Icon";
import type { AIWorkflow } from "@/lib/types";

interface AIIntegrationPanelProps {
  workflows: AIWorkflow[];
  primarySkill: string;
}

export function AIIntegrationPanel({ workflows, primarySkill }: AIIntegrationPanelProps) {
  return (
    <div className="lb-ai-integration-panel">
      <div className="panel-header">
        <div className="icon-wrap">
          <Icon name="sparkles" size={20} />
        </div>
        <div>
          <h2 className="panel-title">How to Use AI with {primarySkill}</h2>
          <p className="panel-subtitle">
            Accelerate your workflow with AI while adhering to strict verification and privacy standards.
          </p>
        </div>
      </div>

      <div className="workflows-grid">
        {workflows.map((wf, idx) => (
          <article key={idx} className="workflow-card">
            <div className="wf-title-row">
              <span className="wf-task-badge">Task {idx + 1}</span>
              <h3 className="wf-task">{wf.task}</h3>
            </div>

            <div className="wf-tool-recommendation">
              <strong>Recommended AI Tool:</strong> <span className="highlight-tool">{wf.recommended_ai_tool}</span>
            </div>

            <div className="wf-block example-block">
              <span className="block-label">Example Workflow & Prompt:</span>
              <code className="prompt-code">{wf.example_workflow}</code>
            </div>

            <div className="wf-block verification-block">
              <Icon name="check" size={16} />
              <div>
                <strong>Verification Requirement:</strong> {wf.verification_requirement}
              </div>
            </div>

            <div className="wf-block warning-block">
              <Icon name="alert" size={16} />
              <div>
                <strong>Privacy Notice & Limitation:</strong> {wf.privacy_warning} {wf.limitation}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
