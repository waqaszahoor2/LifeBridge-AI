import json
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import SkillRoadmap, UserSkillGoal
from app.schemas import (
    MentorChatRequest,
    MentorChatResponse,
    ProgressUpdateRequest,
    RoadmapResponse,
    SkillGoalRequest,
    SkillProfileOut,
)
from app.services.skills_engine import (
    generate_roadmap_from_goal,
    handle_mentor_chat,
    parse_user_goal,
)

router = APIRouter(prefix="/skills/mentor", tags=["AI Skill Mentor"])

# In-memory storage fallback for quick non-authenticated session persistence
IN_MEMORY_ROADMAPS: Dict[str, RoadmapResponse] = {}


@router.post("/analyze-goal", response_model=SkillProfileOut)
def analyze_skill_goal(req: SkillGoalRequest):
    """
    Parses a natural language learning goal and extracts a structured skill profile.
    """
    parsed = parse_user_goal(req)
    return SkillProfileOut(**parsed)


@router.post("/generate-roadmap", response_model=RoadmapResponse)
def generate_roadmap(req: SkillGoalRequest, db: Session = Depends(get_db)):
    """
    Generates a personalized 7-phase learning roadmap with tools, AI workflows, schedule, and projects.
    Falls back gracefully to Structured LifeBridge Template Engine when AI provider is disabled/unavailable.
    """
    try:
        roadmap = generate_roadmap_from_goal(req)
        
        # Save to database
        db_goal = UserSkillGoal(
            raw_goal=req.raw_goal,
            primary_skill=roadmap.primary_skill,
            current_level=req.current_level,
            career_goal=req.career_goal or roadmap.target_role,
            hours_per_week=int(req.hours_per_day * req.days_per_week),
            target_months=req.target_months,
            learning_style=req.learning_style,
            free_resources_only=(req.budget_preference == "Free Only"),
            known_skills_json=json.dumps(req.known_skills)
        )
        db.add(db_goal)
        db.commit()
        db.refresh(db_goal)
        
        db_roadmap = SkillRoadmap(
            roadmap_id=roadmap.roadmap_id,
            goal_id=db_goal.id,
            title=roadmap.title,
            primary_skill=roadmap.primary_skill,
            target_role=roadmap.target_role,
            current_level=roadmap.current_level,
            target_level=roadmap.target_level,
            estimated_hours=roadmap.estimated_hours,
            completion_percentage=roadmap.completion_percentage,
            current_phase_number=roadmap.current_phase_number,
            mode_used=roadmap.mode_used,
            personalization_reason=roadmap.personalization_reason,
            phases_json=json.dumps([p.model_dump() for p in roadmap.phases]),
            tools_json=json.dumps([t.model_dump() for t in roadmap.tools]),
            ai_workflows_json=json.dumps([w.model_dump() for w in roadmap.ai_workflows]),
            schedule_json=json.dumps(roadmap.schedule),
            projects_json=json.dumps([pr.model_dump() for pr in roadmap.projects]),
            assessments_json=json.dumps([a.model_dump() for a in roadmap.assessments]),
            resources_json=json.dumps(roadmap.resources),
            completed_items_json=json.dumps([])
        )
        db.add(db_roadmap)
        db.commit()
        
        # Cache in memory
        IN_MEMORY_ROADMAPS[roadmap.roadmap_id] = roadmap
        return roadmap
    except Exception as err:
        # Fallback to pure in-memory generation if DB fails
        roadmap = generate_roadmap_from_goal(req)
        IN_MEMORY_ROADMAPS[roadmap.roadmap_id] = roadmap
        return roadmap


@router.get("/roadmaps/{roadmap_id}", response_model=RoadmapResponse)
def get_roadmap(roadmap_id: str, db: Session = Depends(get_db)):
    """
    Fetches a saved roadmap by its unique ID.
    """
    if roadmap_id in IN_MEMORY_ROADMAPS:
        return IN_MEMORY_ROADMAPS[roadmap_id]
        
    db_rm = db.query(SkillRoadmap).filter(SkillRoadmap.roadmap_id == roadmap_id).first()
    if not db_rm:
        # Generate default demo roadmap if ID not found
        default_req = SkillGoalRequest(raw_goal="Learn Data Science in 6 months", target_skill="Data Science")
        demo_rm = generate_roadmap_from_goal(default_req)
        demo_rm.roadmap_id = roadmap_id
        IN_MEMORY_ROADMAPS[roadmap_id] = demo_rm
        return demo_rm

    completed_items = json.loads(db_rm.completed_items_json) if db_rm.completed_items_json else []
    
    return RoadmapResponse(
        roadmap_id=db_rm.roadmap_id,
        title=db_rm.title,
        primary_skill=db_rm.primary_skill,
        target_role=db_rm.target_role,
        current_level=db_rm.current_level,
        target_level=db_rm.target_level,
        estimated_hours=db_rm.estimated_hours,
        completion_percentage=db_rm.completion_percentage,
        current_phase_number=db_rm.current_phase_number,
        mode_used=db_rm.mode_used,
        personalization_reason=db_rm.personalization_reason,
        phases=json.loads(db_rm.phases_json),
        tools=json.loads(db_rm.tools_json),
        ai_workflows=json.loads(db_rm.ai_workflows_json),
        schedule=json.loads(db_rm.schedule_json),
        projects=json.loads(db_rm.projects_json),
        assessments=json.loads(db_rm.assessments_json),
        resources=json.loads(db_rm.resources_json),
        completed_items=completed_items
    )


@router.post("/roadmaps/{roadmap_id}/progress", response_model=RoadmapResponse)
def update_roadmap_progress(
    roadmap_id: str,
    req: ProgressUpdateRequest,
    db: Session = Depends(get_db)
):
    """
    Updates completion status of lessons, schedule tasks, or projects.
    Recalculates completion percentage.
    """
    roadmap = get_roadmap(roadmap_id, db)
    
    completed = set(roadmap.completed_items)
    if req.is_completed:
        completed.add(req.item_id)
    else:
        completed.discard(req.item_id)
        
    roadmap.completed_items = list(completed)
    
    # Calculate percentage
    total_tasks = max(1, len(roadmap.phases) * 5 + len(roadmap.projects))
    roadmap.completion_percentage = min(100.0, round((len(completed) / total_tasks) * 100, 1))
    
    # Update memory
    IN_MEMORY_ROADMAPS[roadmap_id] = roadmap
    
    # Update DB
    db_rm = db.query(SkillRoadmap).filter(SkillRoadmap.roadmap_id == roadmap_id).first()
    if db_rm:
        db_rm.completed_items_json = json.dumps(roadmap.completed_items)
        db_rm.completion_percentage = roadmap.completion_percentage
        db.commit()
        
    return roadmap


@router.post("/chat", response_model=MentorChatResponse)
def chat_with_mentor(req: MentorChatRequest, db: Session = Depends(get_db)):
    """
    AI Mentor chat endpoint providing context-aware guidance for the active roadmap.
    """
    roadmap = get_roadmap(req.roadmap_id, db)
    return handle_mentor_chat(
        roadmap_title=roadmap.title,
        primary_skill=roadmap.primary_skill,
        current_phase=req.current_phase_number,
        user_msg=req.user_message
    )
