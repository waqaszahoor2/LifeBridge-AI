# Datasets

All bundled records are synthetic, sample or schema/template data created for testing the LifeBridge AI pipeline. They must not be described as evidence of real-world model performance.

## Folders

- `seed/`: demo records loaded into an empty local database.
- `synthetic/`: generated training data for baseline models.
- `samples/`: small examples for UI/data-flow testing.
- `schemas/`: JSON schemas for feed and profile records.
- `templates/`: administrator CSV templates for verified official records.

## Replacing synthetic data

1. Obtain data from an official or legally reusable source.
2. Record the source and terms in `research/source_registry.csv`.
3. Remove direct identifiers unless necessary and lawful.
4. Split train/validation/test data by time, campaign or entity to prevent leakage.
5. Create a dataset card documenting collection, labels, missingness, bias and permitted uses.
6. Retrain with `python ml/scripts/train_all.py` and preserve model metrics/version metadata.

Do not merge synthetic and real evaluation records without a clear provenance field.
