from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "datasets" / "synthetic" / "scam_messages.csv"
MODEL = ROOT / "ml" / "models" / "scam_classifier.joblib"
REPORT = ROOT / "ml" / "models" / "scam_classifier_metrics.json"


def main() -> None:
    frame = pd.read_csv(DATA)
    train_x, test_x, train_y, test_y = train_test_split(
        frame["text"], frame["label"], test_size=0.25, random_state=42, stratify=frame["label"]
    )
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1, max_features=8000, strip_accents="unicode")),
        ("model", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ])
    pipeline.fit(train_x, train_y)
    predictions = pipeline.predict(test_x)
    probabilities = pipeline.predict_proba(test_x)[:, 1]
    metrics = {
        "roc_auc": roc_auc_score(test_y, probabilities),
        "confusion_matrix": confusion_matrix(test_y, predictions).tolist(),
        "classification_report": classification_report(test_y, predictions, output_dict=True),
        "warning": "Metrics are based on synthetic test data and do not establish real-world performance.",
    }
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, MODEL)
    REPORT.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(f"Saved {MODEL}")


if __name__ == "__main__":
    main()
