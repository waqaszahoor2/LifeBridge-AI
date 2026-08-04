# Dataset plan

## Included test datasets

| File | Purpose | Status |
|---|---|---|
| `datasets/seed/feed_items.csv` | Unified front-page demo feed | Synthetic/demo |
| `datasets/synthetic/scam_messages.csv` | Text-classification pipeline | Synthetic |
| `datasets/synthetic/disaster_risk.csv` | Environmental risk pipeline | Synthetic |
| `datasets/synthetic/skill_roles.csv` | Role/skill matching | Synthetic taxonomy |
| `datasets/samples/*.csv` | UI/API examples | Sample |
| `datasets/templates/*.csv` | Admin imports from reviewed official sources | Template only |

## Required real-world research data

- time-stamped phishing/smishing corpora with campaign grouping;
- official job feeds or employer records with stable vacancy identifiers;
- official scholarship metadata with deadlines and eligibility;
- historical disaster/weather observations aligned with verified outcomes;
- accessibility/service data with geographic and collection provenance;
- ethically collected multilingual evaluation data.

## Evaluation design

Use temporal and entity-separated splits, PR-AUC for rare-event detection, calibration metrics, category/language subgroup reporting and error analysis. For safety modules, report false negatives and abstention behaviour rather than accuracy alone.

## Data rights

Do not bundle provider databases in this ZIP unless redistribution is permitted. Store download instructions, checksums, licences and attribution instead.
