from pathlib import Path
import json

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "datasets" / "synthetic" / "skill_roles.csv"
MODEL = ROOT / "ml" / "models" / "skill_index.joblib"
REPORT = ROOT / "ml" / "models" / "skill_index_metadata.json"


def main() -> None:
    frame = pd.read_csv(DATA).fillna("")
    vectorizer = TfidfVectorizer(token_pattern=r"(?u)\b[\w+#. -]{2,}\b", ngram_range=(1, 2))
    matrix = vectorizer.fit_transform(frame["skills"].str.replace(";", " "))
    artifact = {"vectorizer": vectorizer, "matrix": matrix, "records": frame.to_dict(orient="records")}
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODEL)
    REPORT.write_text(json.dumps({"roles": len(frame), "features": len(vectorizer.get_feature_names_out())}, indent=2), encoding="utf-8")
    print(f"Saved {MODEL}")


if __name__ == "__main__":
    main()
