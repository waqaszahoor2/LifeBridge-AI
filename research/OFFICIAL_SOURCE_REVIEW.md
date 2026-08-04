# Official Source Review

**Project:** LifeBridge AI  
**Research date:** 4 August 2026  
**Method:** Review of official provider documentation and authoritative programme pages. This is not a claim that every website on the internet was reviewed. The project deliberately avoids unauthorised scraping of Google, LinkedIn, Facebook, Instagram and other restricted platforms.

## Implemented machine-readable sources

| Source | Purpose | Authentication | Project component | Important constraint |
|---|---|---|---|---|
| NASA EONET v3 | Open natural-event metadata | No key | `collectors/eonet.py` | Event metadata is not a substitute for local emergency instructions. |
| GDACS RSS | Global disaster alerts | No key | `collectors/gdacs.py` | Alerts are indicative and should be cross-checked. |
| Open-Meteo | Forecast/current weather | No key for non-commercial/open access | `collectors/open_meteo.py` | Review current usage terms before commercial scale. |
| OpenStreetMap Overpass | Nearby hospitals, clinics, shelters and services | No key | `nearby_services.py` | Public instances require fair use; cache results and avoid parallel heavy queries. |
| ReliefWeb API v2 | Humanitarian reports | Pre-approved `appname` | `collectors/reliefweb.py` | The `appname` requirement is mandatory. |
| USAJOBS Search API | Current US federal vacancies | Free API key and user-agent email | `collectors/usajobs.py` | Protect the key and follow rate limits. |
| Adzuna | Optional international jobs | App ID and key | `collectors/adzuna.py` | Optional; current quota/plan must be checked by the project owner. |
| RSS/Atom | Authorised scholarship, university and employer feeds | Usually none | `collectors/rss.py` | Add only feeds that publishers permit to be reused. |
| Firebase Cloud Messaging | Android/web notifications | Firebase project/service account | `notifications.py` | Keep the service-account file on the backend only. |
| O*NET database | Occupations and skill information | Downloaded data | Skill index pipeline | Include required O*NET attribution and comply with its data licence. |

## Official scholarship discovery sources

These are valuable official sources but are **not assumed to expose unrestricted public APIs**. The safe project design is an admin-verified scholarship database plus permitted RSS/Atom feeds.

- Erasmus Mundus Joint Masters: https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters
- DAAD scholarship database: https://www.daad.de/stipdb-redirect/
- Chevening: https://www.chevening.org/scholarships/
- Commonwealth Scholarship Commission: https://cscuk.fcdo.gov.uk/about-us/scholarships/
- Fulbright Foreign Student Program: https://exchanges.state.gov/non-us/program/fulbright-foreign-student-program

## Technical and deployment references

- Flutter Android release: https://docs.flutter.dev/deployment/android
- Flutter web release: https://docs.flutter.dev/deployment/web
- Vercel monorepos: https://vercel.com/docs/monorepos
- FastAPI containers: https://fastapi.tiangolo.com/deployment/docker/
- Firebase Cloud Messaging for Flutter: https://firebase.google.com/docs/cloud-messaging/flutter/get-started
- OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/

## Data-collection decision

1. Use official APIs and permitted feeds first.
2. Store source publication time, collection time and last-check time separately.
3. Do not scrape restricted social-media search results.
4. Allow manual admin verification for scholarships and local opportunities.
5. Label every synthetic record as `demo`.
6. Preserve the original source URL and never present LifeBridge as the publisher.
