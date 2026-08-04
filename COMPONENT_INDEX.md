# Component index

This file summarizes the complete package. `COMPONENT_INDEX.csv` lists every included project file with its area, purpose and size.

## Component counts

| Area | Files |
|---|---:|
| API tooling | 2 |
| Automation | 14 |
| CI/Security | 5 |
| Configuration | 4 |
| Datasets | 20 |
| Documentation | 35 |
| FastAPI backend | 63 |
| Flutter mobile | 44 |
| Infrastructure | 4 |
| Machine learning | 14 |
| Repository | 13 |
| Research | 4 |
| Web frontend | 39 |

**Indexed files:** 261

## Required entry points

- Web: `apps/web/app/page.tsx`
- Mobile: `apps/mobile/lib/main.dart`
- API: `apps/backend/app/main.py`
- Worker: `apps/backend/app/worker.py`
- API configuration: `config/apis.env.example` → private `config/apis.env`
- Local orchestration: `docker-compose.yml`
- Vercel root: `apps/web`
- Android release helper: `scripts/build_apk.ps1` / `scripts/build_apk.sh`
- Official-source registry: `research/source_registry.csv`
- OpenAPI: `docs/openapi.json`
- Postman: `postman/LifeBridge_AI.postman_collection.json`
- Validation: `docs/VALIDATION_REPORT.md`
