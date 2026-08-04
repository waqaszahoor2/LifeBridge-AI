# Adding a new feed source

1. Confirm the official provider and permitted machine-readable access.
2. Complete `research/SOURCE_EVALUATION_TEMPLATE.csv`.
3. Add non-secret metadata to `config/api_sources.yaml`.
4. Add secrets only to `config/apis.env`.
5. Implement a collector in `apps/backend/app/services/collectors/`.
6. Use a stable `external_id` so records are updated instead of duplicated.
7. Preserve `source_url`, `published_at`, `collected_at` and `last_checked_at` separately.
8. Assign conservative source reliability and verification labels.
9. Add unit tests with stored synthetic fixtures, not live network requests.
10. Review rate limits, attribution, privacy and error handling before enabling it.

Never add a collector that bypasses access controls, robots restrictions, private sessions or platform terms.
