# LifeBridge AI model layer

This folder contains small, reproducible baseline models for the end-to-end prototype.

- `scam_classifier.joblib`: TF-IDF + logistic regression for message risk.
- `disaster_risk.joblib`: random forest trained on synthetic environmental indicators.
- `skill_index.joblib`: TF-IDF role/skill index for CV recommendations.

Run:

```bash
python ml/scripts/train_all.py
```

The included metrics are **software-validation metrics on synthetic data**, not claims of field performance. Replace synthetic data with licensed, representative datasets and repeat temporal, language, fairness, calibration and external validation before real-world use.
