from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.schemas import (
    CvAnalyzeRequest,
    CvAnalyzeResponse,
    DisasterRiskRequest,
    DisasterRiskResponse,
    DecisionGraphRequest,
    DecisionGraphResponse,
    ScamCheckRequest,
    ScamCheckResponse,
)
from app.services.cv_analysis import analyze_cv
from app.services.disaster_risk import predict
from app.services.decision_graph import build_decision_graph
from app.services.scam_detection import analyze

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/trust-check", response_model=ScamCheckResponse)
def trust_check(payload: ScamCheckRequest):
    return analyze(payload.text, payload.url)


@router.post("/cv/analyze", response_model=CvAnalyzeResponse)
def cv_analyze(payload: CvAnalyzeRequest):
    return analyze_cv(payload.text)


@router.post("/disaster-risk", response_model=DisasterRiskResponse)
def disaster_risk(payload: DisasterRiskRequest):
    return predict(payload.model_dump())


@router.post("/decision-graph", response_model=DecisionGraphResponse)
def decision_graph(payload: DecisionGraphRequest, db: Session = Depends(get_db)):
    return build_decision_graph(db, payload)
