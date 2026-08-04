"use client";

import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/ui/Icon";

export default function SkillsResourcesPage() {
  const resources = [
    { title: "Python Official Documentation", provider: "Python Software Foundation", type: "Official", cost: "Free", url: "https://docs.python.org/3/" },
    { title: "FreeCodeCamp Data Science Curriculum", provider: "FreeCodeCamp", type: "Community", cost: "Free", url: "https://www.freecodecamp.org/" },
    { title: "Kaggle Datasets & Interactive Tutorials", provider: "Kaggle", type: "Community", cost: "Free", url: "https://www.kaggle.com/datasets" },
    { title: "FastAPI Official Interactive Guide", provider: "FastAPI", type: "Official", cost: "Free", url: "https://fastapi.tiangolo.com/" }
  ];

  return (
    <AppShell>
      <div className="lb-skills-subpage">
        <div className="subpage-header">
          <Icon name="book" size={24} />
          <div>
            <h1>Verified Learning Resource Library</h1>
            <p>Curated documentation, courses, practice platforms, and open datasets.</p>
          </div>
        </div>

        <div className="resources-grid">
          {resources.map((res) => (
            <article key={res.title} className="resource-card">
              <div className="res-type-tag">{res.type}</div>
              <h3>{res.title}</h3>
              <p>Provider: <strong>{res.provider}</strong></p>
              <div className="res-footer">
                <span className="cost-tag">{res.cost}</span>
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="visit-btn">
                  <span>Visit Link</span>
                  <Icon name="arrowRight" size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
