# Contributing

1. Open an issue describing the component, source and intended impact.
2. Do not add secrets, restricted scraping or real personal data.
3. Add tests and documentation for every collector/model/API change.
4. Record new external sources in `research/source_registry.csv`.
5. Run `python scripts/validate_project.py`, backend tests, web lint/build and Flutter analysis/tests.
6. Keep direct source facts separate from derived model outputs.
