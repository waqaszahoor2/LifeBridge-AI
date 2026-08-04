# Research and source-selection strategy

The phrase “every website” is not technically or legally achievable. LifeBridge AI therefore uses a reproducible source-selection process focused on official APIs, government/institutional pages, authorised feeds and documented open datasets.

## Inclusion criteria

1. The source is the original publisher, a government/international body, or a documented data provider.
2. Its API/feed terms permit the intended academic use.
3. Records expose a stable source URL and publication/update time.
4. The content maps to a supported category: job, scholarship, disaster, weather, service, safety or learning.
5. The project can label verification status and source reliability without claiming certainty.

## Exclusion criteria

- Google result-page scraping.
- Unauthorised LinkedIn, Facebook, Instagram, TikTok or private-channel scraping.
- Sources without stable attribution or terms.
- Personal data gathered without a lawful basis and user consent.
- Reposted opportunities whose original source cannot be verified.

## Review procedure

For each source, record its official URL, authentication method, rate/usage constraints, licence/attribution, timestamps, update frequency, geographical scope, duplicate identifiers and failure behaviour. Add it to `research/source_registry.csv` and `config/api_sources.yaml` before implementing a collector.

## Claim labels

- **Direct:** explicitly supported by the original source record.
- **Derived:** calculated by LifeBridge AI, such as distance or recommendation score.
- **Unverified:** community/admin input awaiting verification.
- **Demo:** synthetic record included only for testing.
