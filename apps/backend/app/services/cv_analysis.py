import re

from app.core.config import get_settings
from app.services.model_loader import load_joblib

settings = get_settings()
EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
PHONE_RE = re.compile(r"(?:\+?\d[\d\s().-]{7,}\d)")
YEAR_RE = re.compile(r"(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)", re.I)
DEFAULT_SKILLS = {
    "python", "sql", "mysql", "postgresql", "power bi", "tableau", "excel", "pandas", "numpy",
    "scikit-learn", "machine learning", "deep learning", "tensorflow", "pytorch", "statistics",
    "data analysis", "data visualization", "etl", "airflow", "spark", "hadoop", "aws", "azure",
    "docker", "git", "fastapi", "flutter", "next.js", "javascript", "typescript", "communication",
    "project management", "research", "nlp", "computer vision", "gis", "postgis",
}


def extract_skills(text: str) -> list[str]:
    lower = text.lower()
    return sorted(skill for skill in DEFAULT_SKILLS if re.search(rf"\b{re.escape(skill)}\b", lower))


def analyze_cv(text: str) -> dict:
    skills = extract_skills(text)
    email = EMAIL_RE.search(text)
    phone = PHONE_RE.search(text)
    years = [float(match) for match in YEAR_RE.findall(text)]
    experience = max(years) if years else None

    roles: list[dict] = []
    artifact = load_joblib(settings.skill_index_path)
    if artifact and skills:
        vectorizer = artifact.get("vectorizer")
        matrix = artifact.get("matrix")
        records = artifact.get("records", [])
        if vectorizer is not None and matrix is not None:
            from sklearn.metrics.pairwise import cosine_similarity
            query = vectorizer.transform([" ".join(skills)])
            similarities = cosine_similarity(query, matrix)[0]
            for index in similarities.argsort()[::-1][:5]:
                record = records[int(index)]
                required = [s.strip() for s in record.get("skills", "").split(";") if s.strip()]
                missing = [s for s in required if s.lower() not in {x.lower() for x in skills}]
                roles.append({
                    "role": record.get("role", "Career option"),
                    "match_score": round(float(similarities[index]), 3),
                    "missing_skills": missing[:5],
                })
    if not roles:
        fallback = [
            ("Data Analyst", {"python", "sql", "power bi", "excel", "statistics"}),
            ("Junior Data Scientist", {"python", "machine learning", "pandas", "statistics"}),
            ("Data Engineer", {"python", "sql", "etl", "airflow", "spark"}),
        ]
        present = set(skills)
        for role, required in fallback:
            roles.append({
                "role": role,
                "match_score": round(len(present & required) / len(required), 3),
                "missing_skills": sorted(required - present),
            })
        roles.sort(key=lambda item: item["match_score"], reverse=True)
    return {
        "extracted_skills": skills,
        "detected_email": email.group(0) if email else None,
        "detected_phone": phone.group(0) if phone else None,
        "experience_years": experience,
        "recommended_roles": roles,
    }
