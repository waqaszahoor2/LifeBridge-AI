# Project Plan

## Product objective

Deliver one responsive platform that ranks opportunities and safety information using relevance, accessibility, trust, location and freshness.

## Core modules

1. **LifeBridge Feed:** LinkedIn-style combined feed.
2. **SkillBridge:** CV/skill matching and explainable job/scholarship recommendations.
3. **DisasterLink:** disaster and weather feeds with location-aware priority.
4. **AccessLink:** accessible places and route-ready GIS structure.
5. **VerifyLink:** trust and scam-warning structure.
6. **ServiceLink:** hospitals, shelters and support services.

## Delivery phases

| Phase | Weeks | Deliverables |
|---|---:|---|
| Research and requirements | 1–2 | problem definition, ethics, data licences, metrics |
| Data engineering | 3–5 | ingestion, cleaning, standard schema, synthetic tests |
| Baseline recommendation | 6–8 | rule/weighted model and offline evaluation |
| Backend and security | 9–11 | FastAPI, database, auth, collectors and tests |
| Web interface | 12–14 | responsive feed, filters, themes and Vercel build |
| Mobile interface | 15–17 | Flutter application, API integration and Android testing |
| Advanced models | 18–20 | NLP/CV/GIS components and model comparison |
| Evaluation and hardening | 21–22 | usability, fairness, load/security tests |
| Deployment and thesis | 23–24 | online demo, APK, documentation, poster and presentation |

## Acceptance criteria

- Web layout works on mobile, tablet and desktop.
- Default theme follows the operating system; user can override light/dark/system.
- Feed clearly shows source publication, collection and verification times.
- No private API key is stored in browser or Flutter source.
- Application remains usable with synthetic data when external sources are disabled.
- Automated tests cover health, feed retrieval and recommendation behaviour.
