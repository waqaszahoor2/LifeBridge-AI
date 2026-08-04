from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.model_selection import train_test_split

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "datasets" / "synthetic" / "disaster_risk.csv"
MODEL = ROOT / "ml" / "models" / "disaster_risk.joblib"
REPORT = ROOT / "ml" / "models" / "disaster_risk_metrics.json"
FEATURES = ["rainfall_mm", "river_level_m", "soil_moisture", "slope_degrees", "temperature_c", "wind_kph"]


def main() -> None:
    frame = pd.read_csv(DATA)
    train_x, test_x, train_y, test_y = train_test_split(
        frame[FEATURES], frame["high_risk"], test_size=0.25, random_state=42, stratify=frame["high_risk"]
    )
    model = RandomForestClassifier(
        n_estimators=220, max_depth=8, min_samples_leaf=3, class_weight="balanced", random_state=42
    )
    model.fit(train_x, train_y)
    predictions = model.predict(test_x)
    probabilities = model.predict_proba(test_x)[:, 1]
    metrics = {
        "roc_auc": roc_auc_score(test_y, probabilities),
        "confusion_matrix": confusion_matrix(test_y, predictions).tolist(),
        "classification_report": classification_report(test_y, predictions, output_dict=True),
        "feature_importance": dict(zip(FEATURES, model.feature_importances_.tolist())),
        "warning": "This artifact is trained on synthetic data and is for software testing, not public safety decisions.",
    }
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL)
    REPORT.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    print(f"Saved {MODEL}")


if __name__ == "__main__":
    main()
