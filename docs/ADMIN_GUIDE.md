# Administrator guide

## Configure sources

1. Run `python scripts/generate_secrets.py`.
2. Edit `config/apis.env`.
3. Enable only providers whose credentials/terms you have reviewed.
4. Add authorised RSS/Atom feeds to `config/rss_sources.yaml`.
5. Record each approved source in `research/source_registry.csv`.

## Add official scholarships and local jobs

For providers without an API, use the admin form/API or `POST /api/v1/admin/feed-items/import-csv` with `datasets/templates/feed_import_template.csv`.

Required quality checks:

- original official URL;
- clear provider name;
- source publication date;
- deadline/expiry where available;
- eligibility summary copied only as a concise paraphrase;
- `verification_status=verified` only after human review;
- no sensitive personal information.

## Refresh sources

Manual one-time refresh:

```bash
python scripts/refresh_sources.py
```

Production uses `python -m app.worker` as a separate worker process.

## Expired and inaccurate records

Deactivate expired records, retain audit information, and avoid silently changing historical publication dates. `last_checked_at` records the latest source verification.
