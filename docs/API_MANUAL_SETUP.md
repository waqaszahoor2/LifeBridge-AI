# Manual API Setup

All real secrets belong in `config/apis.env` or the deployment platform's secret manager.

## Works without a paid key

- NASA EONET
- GDACS
- Open-Meteo for permitted non-commercial/open usage
- OpenStreetMap/Overpass under fair-use limits
- local ML models
- authorised RSS/Atom feeds

## Requires free registration or approval

- ReliefWeb: request a pre-approved `appname` and set `RELIEFWEB_APP_NAME`.
- USAJOBS: request a key and set `USAJOBS_API_KEY` plus `USAJOBS_USER_AGENT_EMAIL`.
- Firebase: download a backend service-account file and configure the mobile application.

## Optional provider

- Adzuna: set `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`. Review its current account quota and usage terms.

## Scholarships

There is no assumed universal scholarship API. Add verified records through the admin API or add publisher-approved RSS/Atom feeds to `config/rss_sources.yaml`.
