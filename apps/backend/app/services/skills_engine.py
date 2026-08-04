import hashlib
import json
import logging
from typing import Any, Dict, List
from app.schemas import (
    AIWorkflowOut,
    MentorChatResponse,
    RoadmapAssessmentOut,
    RoadmapPhaseOut,
    RoadmapProjectOut,
    RoadmapResponse,
    SkillGoalRequest,
    ToolRecommendationOut,
)

logger = logging.getLogger(__name__)

# Pre-defined Skill Domain Knowledge Base
SKILL_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "data science": {
        "title": "Data Science & AI Analytics Mastery",
        "target_role": "Data Scientist / AI Analyst",
        "primary_skill": "Data Science",
        "prerequisites": ["Basic Mathematics", "Logic", "Computer Fundamentals"],
        "phases": [
            {
                "phase_number": 1,
                "title": "PHASE 1 — Foundations",
                "objective": "Master basic statistics, Python fundamentals, and environment setup.",
                "estimated_hours": 20,
                "topics": ["Python Syntax & Data Types", "Descriptive Statistics & Probability", "Jupyter Notebooks", "Git & GitHub Setup"],
                "tools": ["Python 3.12", "JupyterLab", "VS Code", "Git"],
                "ai_tools": ["ChatGPT", "GitHub Copilot"],
                "exercises": ["Write 10 Python data functions", "Calculate Mean/Median/Variance on sample data"],
                "project": "Personal Study Hours Tracker script in Python",
                "checkpoint": "Foundations Quiz & Code Exercise"
            },
            {
                "phase_number": 2,
                "title": "PHASE 2 — Core Skills",
                "objective": "Gain practical fluency in NumPy, Pandas, SQL, and data cleaning.",
                "estimated_hours": 30,
                "topics": ["Data Wrangling with Pandas", "NumPy Array Vectorisation", "Relational SQL Queries", "Handling Missing Values & Outliers"],
                "tools": ["Pandas", "NumPy", "PostgreSQL / SQLite", "DBeaver"],
                "ai_tools": ["Claude", "ChatGPT for SQL"],
                "exercises": ["Clean a messy 10,000-row CSV file", "Write complex SQL joins and GROUP BY queries"],
                "project": "E-Commerce Sales Data Wrangling & SQL Analysis",
                "checkpoint": "Pandas & SQL Practical Assessment"
            },
            {
                "phase_number": 3,
                "title": "PHASE 3 — Applied Practice",
                "objective": "Perform Exploratory Data Analysis (EDA) and data visualisations.",
                "estimated_hours": 30,
                "topics": ["Exploratory Data Analysis", "Seaborn & Matplotlib", "Feature Selection", "Correlation & Hypothesis Testing"],
                "tools": ["Seaborn", "Matplotlib", "Plotly"],
                "ai_tools": ["Julius AI", "Code Interpreter"],
                "exercises": ["Build 5 interactive charts", "Write hypothesis test report for A/B test dataset"],
                "project": "Global Climate Trends EDA & Insight Report",
                "checkpoint": "EDA Case Study Review"
            },
            {
                "phase_number": 4,
                "title": "PHASE 4 — AI Integration",
                "objective": "Accelerate data science workflows responsibly with generative AI.",
                "estimated_hours": 20,
                "topics": ["AI-Assisted EDA & Plotting", "Automated SQL Query Generation", "Prompt Engineering for Data Analysis", "AI Output Verification & Hallucination Checks"],
                "tools": ["ChatGPT Plus", "GitHub Copilot Workspace", "Perplexity AI"],
                "ai_tools": ["OpenAI API", "Cursor Code Editor"],
                "exercises": ["Generate Seaborn code via prompts and verify logic", "Audit AI-generated SQL for Cartesian joins"],
                "project": "AI-Driven Customer Feedback Sentiment Classification Pipeline",
                "checkpoint": "Responsible AI Validation Assessment"
            },
            {
                "phase_number": 5,
                "title": "PHASE 5 — Advanced Work",
                "objective": "Implement Machine Learning models using Scikit-Learn and MLflow.",
                "estimated_hours": 35,
                "topics": ["Supervised Learning (Regression & Classification)", "Model Evaluation Metrics (F1, ROC-AUC)", "Hyperparameter Tuning", "Model Lifecycle with MLflow"],
                "tools": ["Scikit-Learn", "XGBoost", "MLflow"],
                "ai_tools": ["Copilot", "Google Gemini Advanced"],
                "exercises": ["Train Random Forest model and plot confusion matrix", "Tune XGBoost hyperparameters"],
                "project": "Customer Churn Prediction Engine with Model Evaluation",
                "checkpoint": "Machine Learning Model Evaluation Checkpoint"
            },
            {
                "phase_number": 6,
                "title": "PHASE 6 — Portfolio and Career",
                "objective": "Package real-world projects into a professional GitHub portfolio and resume.",
                "estimated_hours": 15,
                "topics": ["GitHub Repository Structuring", "Interactive Streamlit Dashboards", "Resume & LinkedIn Optimization", "Data Science Technical Interviews"],
                "tools": ["Streamlit", "GitHub Pages", "LinkedIn"],
                "ai_tools": ["Resume AI", "Mock Interviewer AI"],
                "exercises": ["Deploy Streamlit app to Streamlit Community Cloud", "Complete mock technical interview"],
                "project": "Interactive Portfolio Website showcasing 3 Data Science Case Studies",
                "checkpoint": "Portfolio Review Milestone"
            },
            {
                "phase_number": 7,
                "title": "PHASE 7 — Capstone Project",
                "objective": "Build and deploy an End-to-End Enterprise Data Science Application.",
                "estimated_hours": 40,
                "topics": ["Full-Stack Data Application", "FastAPI Serving Engine", "Docker Containerization", "Cloud Deployment"],
                "tools": ["FastAPI", "Docker", "Streamlit", "PostgreSQL"],
                "ai_tools": ["Cursor AI", "Copilot"],
                "exercises": ["Containerise FastAPI backend with Docker", "Connect frontend UI to live prediction API"],
                "project": "Customer Complaint Intelligence Platform with Real-Time Risk Scoring",
                "checkpoint": "Final Capstone Evaluation & Badge Award"
            }
        ],
        "ai_workflows": [
            {
                "task": "Automated Data Cleaning & Outlier Detection",
                "recommended_ai_tool": "ChatGPT / Claude 3.5 Sonnet",
                "example_workflow": "Provide DataFrame column schema to AI prompt: 'Generate Pandas code to impute missing values using median grouped by region, and flag z-score > 3 outliers.'",
                "verification_requirement": "Inspect distribution before and after imputation; verify no unexpected data leakage occurred.",
                "limitation": "AI can suggest inaccurate statistical assumptions if domain context is missing.",
                "privacy_warning": "Never upload confidential company database dumps or personally identifiable customer records."
            },
            {
                "task": "Complex SQL Query Generation",
                "recommended_ai_tool": "GitHub Copilot / Cursor",
                "example_workflow": "Type in SQL file comment: '-- Join user_orders with user_profiles, calculate 30-day rolling spend per customer, filter spend > $500.'",
                "verification_requirement": "Run EXPLAIN ANALYZE on query output; verify join condition logic manually.",
                "limitation": "Generated SQL may use non-standard vendor syntax or inefficient subqueries.",
                "privacy_warning": "Ensure table names and schema definitions sent to AI do not contain sensitive access credentials."
            }
        ],
        "tools": [
            {
                "name": "Python 3.12",
                "category": "Core",
                "purpose": "Primary programming language for data analysis and machine learning.",
                "skill_level": "Beginner to Advanced",
                "is_free": True,
                "platform": "Windows, macOS, Linux",
                "why_recommended": "Industry-standard data science ecosystem.",
                "alternative": "R Language"
            },
            {
                "name": "ChatGPT / Claude",
                "category": "AI",
                "purpose": "General AI reasoning, code generation, and concept explanation.",
                "skill_level": "All Levels",
                "is_free": True,
                "platform": "Web, Mobile",
                "why_recommended": "Speeds up syntax lookup and EDA code drafting.",
                "alternative": "Google Gemini"
            },
            {
                "name": "JupyterLab / VS Code",
                "category": "Free",
                "purpose": "Interactive development environment.",
                "skill_level": "Beginner to Advanced",
                "is_free": True,
                "platform": "Windows, macOS, Linux",
                "why_recommended": "Open-source and widely supported.",
                "alternative": "Google Colab"
            },
            {
                "name": "MLflow & Streamlit",
                "category": "Advanced",
                "purpose": "ML experiment tracking and rapid dashboard deployment.",
                "skill_level": "Intermediate",
                "is_free": True,
                "platform": "Cross-platform",
                "why_recommended": "Bridges research code with production dashboards.",
                "alternative": "Dash / Gradio"
            }
        ],
        "projects": [
            {
                "id": "proj_ds_1",
                "phase_number": 3,
                "title": "Global Climate & Disaster Severity Analysis",
                "problem_statement": "Analyse 10+ years of weather anomaly datasets to identify regional risk drivers.",
                "objective": "Perform full EDA, generate interactive visualisations, and publish insights.",
                "skills_practised": ["Python", "Pandas", "Seaborn", "Plotly"],
                "tools": ["JupyterLab", "Pandas", "Matplotlib"],
                "ai_integration": "Use AI to suggest Seaborn aesthetic improvements and draft report summaries.",
                "dataset_requirements": "NOAA Open Climate & Weather Dataset (CSV)",
                "difficulty": "Intermediate",
                "estimated_hours": 15,
                "is_capstone": False
            },
            {
                "id": "proj_ds_2",
                "phase_number": 7,
                "title": "Customer Complaint Intelligence Platform",
                "problem_statement": "Build an automated ML classifier that categorises incoming customer complaints and flags urgent escalation risks.",
                "objective": "Develop model, expose via FastAPI, and deploy interactive Streamlit user dashboard.",
                "skills_practised": ["Python", "Scikit-Learn", "FastAPI", "Streamlit", "Docker"],
                "tools": ["VS Code", "Docker", "PostgreSQL"],
                "ai_integration": "Integrate LLM API to extract key sentiment keywords and generate automated executive summary drafts.",
                "dataset_requirements": "CFPB Consumer Complaint Open Dataset",
                "difficulty": "Capstone",
                "estimated_hours": 40,
                "is_capstone": True
            }
        ]
    },
    "python": {
        "title": "Modern Python Development & Automation",
        "target_role": "Python Developer / Backend Software Engineer",
        "primary_skill": "Python",
        "prerequisites": ["Basic Computer Usage", "Problem Solving"],
        "phases": [
            {
                "phase_number": 1,
                "title": "PHASE 1 — Foundations",
                "objective": "Learn Python basics, data structures, and control flow.",
                "estimated_hours": 15,
                "topics": ["Variables & Data Types", "Conditionals & Loops", "Functions & Scope", "List/Dict Comprehensions"],
                "tools": ["Python 3.12", "VS Code"],
                "ai_tools": ["ChatGPT", "GitHub Copilot"],
                "exercises": ["Create CLI calculator", "Build text file word counter"],
                "project": "Interactive Task Manager Command-Line App",
                "checkpoint": "Python Basics Quiz"
            },
            {
                "phase_number": 2,
                "title": "PHASE 2 — Core Skills",
                "objective": "Master Object-Oriented Programming (OOP) and Modules.",
                "estimated_hours": 25,
                "topics": ["Classes & Inheritance", "Exception Handling", "Virtual Environments (venv)", "File I/O & JSON parsing"],
                "tools": ["VS Code", "Git"],
                "ai_tools": ["Cursor AI"],
                "exercises": ["Refactor script into OOP structure", "Create custom exception handler"],
                "project": "Library Management System with Persistence",
                "checkpoint": "OOP Coding Challenge"
            },
            {
                "phase_number": 3,
                "title": "PHASE 3 — Applied Practice",
                "objective": "Build RESTful APIs with FastAPI and Pydantic.",
                "estimated_hours": 30,
                "topics": ["FastAPI Routing", "Pydantic Schemas", "Async/Await", "HTTP Status Codes"],
                "tools": ["FastAPI", "Uvicorn", "Postman"],
                "ai_tools": ["Copilot"],
                "exercises": ["Build CRUD endpoints for items database", "Implement Pydantic custom validators"],
                "project": "RESTful Task Management API with OpenAPI docs",
                "checkpoint": "API Development Review"
            },
            {
                "phase_number": 4,
                "title": "PHASE 4 — AI Integration",
                "objective": "Integrate LLMs, AI APIs, and automated code reviews into Python.",
                "estimated_hours": 20,
                "topics": ["OpenAI / Gemini SDKs", "Structured Output Parsing", "Prompt Engineering in Python", "Unit Test Generation with AI"],
                "tools": ["Python SDKs", "Pytest"],
                "ai_tools": ["ChatGPT", "Copilot"],
                "exercises": ["Generate Pydantic model from raw API response using AI", "Automate pytest generation"],
                "project": "AI-Powered Smart Content Summariser Tool",
                "checkpoint": "AI Integration Assessment"
            },
            {
                "phase_number": 5,
                "title": "PHASE 5 — Advanced Work",
                "objective": "Database ORMs, Authentication, and Testing.",
                "estimated_hours": 35,
                "topics": ["SQLAlchemy 2.0", "JWT Authentication", "Pytest Unit & Integration Tests", "Database Migrations with Alembic"],
                "tools": ["SQLAlchemy", "Alembic", "Pytest"],
                "ai_tools": ["Cursor"],
                "exercises": ["Write 15 unit tests covering API edge cases", "Create database migration script"],
                "project": "Multi-Tenant E-Commerce Backend Service",
                "checkpoint": "Advanced Backend Test Suite Checkpoint"
            },
            {
                "phase_number": 6,
                "title": "PHASE 6 — Portfolio and Career",
                "objective": "Dockerize applications and publish GitHub portfolio.",
                "estimated_hours": 15,
                "topics": ["Docker Containerization", "GitHub Actions CI/CD", "Technical Resume Prep", "Coding Interview Patterns"],
                "tools": ["Docker", "GitHub Actions"],
                "ai_tools": ["Resume AI"],
                "exercises": ["Build multi-stage Dockerfile for FastAPI app", "Configure automated test pipeline on GitHub"],
                "project": "Production-Ready Open Source Python Library on PyPI",
                "checkpoint": "Portfolio Verification"
            },
            {
                "phase_number": 7,
                "title": "PHASE 7 — Capstone Project",
                "objective": "Deploy a Cloud-Native SaaS Backend.",
                "estimated_hours": 40,
                "topics": ["Production Deployment", "PostgreSQL Integration", "Rate Limiting & Security", "Monitoring & Logging"],
                "tools": ["Docker", "PostgreSQL", "FastAPI", "Render / Vercel"],
                "ai_tools": ["Cursor AI"],
                "exercises": ["Deploy live application to cloud server", "Setup automated rate-limiting middleware"],
                "project": "Enterprise Microservice API for Real-Time Notification Processing",
                "checkpoint": "Capstone Defense & Badge Award"
            }
        ],
        "ai_workflows": [
            {
                "task": "Automated Unit Test Generation",
                "recommended_ai_tool": "GitHub Copilot / Pytest",
                "example_workflow": "Highlight Python function in VS Code -> run Copilot command '/tests generate unit test using pytest for edge cases and bad inputs.'",
                "verification_requirement": "Run pytest locally to ensure generated tests pass and achieve meaningful coverage.",
                "limitation": "AI tests might assert incorrect requirements if edge case behavior is ambiguous.",
                "privacy_warning": "Do not pass proprietary encryption keys or private customer records to LLMs."
            }
        ],
        "tools": [
            {
                "name": "Python 3.12",
                "category": "Core",
                "purpose": "Main language engine.",
                "skill_level": "All Levels",
                "is_free": True,
                "platform": "Windows, macOS, Linux",
                "why_recommended": "Fast, modern, and huge library ecosystem.",
                "alternative": "Go / Node.js"
            },
            {
                "name": "FastAPI & Pydantic",
                "category": "Core",
                "purpose": "High performance REST API framework.",
                "skill_level": "Intermediate",
                "is_free": True,
                "platform": "Cross-platform",
                "why_recommended": "Built-in validation and automatic OpenAPI docs.",
                "alternative": "Flask / Django"
            }
        ],
        "projects": [
            {
                "id": "proj_py_capstone",
                "phase_number": 7,
                "title": "Enterprise Microservice API",
                "problem_statement": "Build a secure high-throughput event notification service.",
                "objective": "Design FastAPI backend, PostgreSQL database, Docker container, and GitHub CI/CD pipeline.",
                "skills_practised": ["Python", "FastAPI", "SQLAlchemy", "Docker", "Pytest"],
                "tools": ["VS Code", "PostgreSQL", "Docker"],
                "ai_integration": "Use Copilot for boilerplate schema generation and automated test cases.",
                "dataset_requirements": "Synthetic Event Log JSON datasets",
                "difficulty": "Capstone",
                "estimated_hours": 40,
                "is_capstone": True
            }
        ]
    }
}

# Generic fallback template generator for unmapped skills
def get_generic_template(skill_name: str) -> Dict[str, Any]:
    skill_clean = skill_name.title()
    return {
        "title": f"Professional {skill_clean} Mastery & AI Integration",
        "target_role": f"{skill_clean} Specialist / Developer",
        "primary_skill": skill_clean,
        "prerequisites": ["General Literacy", "Computer Fundamentals"],
        "phases": [
            {
                "phase_number": 1,
                "title": "PHASE 1 — Foundations",
                "objective": f"Learn key principles, terminology, and setup tools for {skill_clean}.",
                "estimated_hours": 15,
                "topics": [f"Introduction to {skill_clean}", "Core Concepts & Vocabulary", "Environment & Workspace Setup", "First Guided Exercises"],
                "tools": ["Industry Standard Tools", "Documentation"],
                "ai_tools": ["ChatGPT", "Claude"],
                "exercises": [f"Setup workspace for {skill_clean}", "Complete 5 beginner exercise tasks"],
                "project": f"Beginner {skill_clean} Project Manual",
                "checkpoint": "Foundations Assessment"
            },
            {
                "phase_number": 2,
                "title": "PHASE 2 — Core Skills",
                "objective": f"Master essential techniques and primary workflows in {skill_clean}.",
                "estimated_hours": 25,
                "topics": [f"Intermediate {skill_clean} Methods", "Tool Workflows", "Best Practices", "Error Reduction"],
                "tools": ["Primary Software Tools"],
                "ai_tools": ["Domain AI Assistants"],
                "exercises": ["Complete 3 practical assignments", "Review peer workflows"],
                "project": f"Standard {skill_clean} Implementation Case Study",
                "checkpoint": "Core Skills Milestone"
            },
            {
                "phase_number": 3,
                "title": "PHASE 3 — Applied Practice",
                "objective": f"Apply {skill_clean} to realistic scenarios and solve real-world problems.",
                "estimated_hours": 30,
                "topics": ["Real-World Scenarios", "Case Studies", "Performance Optimization", "Quality Assurance"],
                "tools": ["Professional Tooling"],
                "ai_tools": ["Specialized AI Tooling"],
                "exercises": ["Solve 2 real-world problem sets", "Document solution steps"],
                "project": f"Comprehensive {skill_clean} Industry Case Project",
                "checkpoint": "Applied Practice Review"
            },
            {
                "phase_number": 4,
                "title": "PHASE 4 — AI Integration",
                "objective": f"Leverage generative AI to accelerate {skill_clean} tasks responsibly.",
                "estimated_hours": 20,
                "topics": [f"AI Tools for {skill_clean}", "Prompt Engineering", "Workflow Automation", "Verification & Quality Control"],
                "tools": ["AI Assistants", "Prompt Repositories"],
                "ai_tools": ["ChatGPT", "Copilot", "Claude"],
                "exercises": [f"Automate routine {skill_clean} task using AI", "Perform error audit on AI outputs"],
                "project": f"AI-Augmented {skill_clean} Workflow Pipeline",
                "checkpoint": "AI Integration Validation Checkpoint"
            },
            {
                "phase_number": 5,
                "title": "PHASE 5 — Advanced Work",
                "objective": f"Deep-dive into advanced techniques, production standards, and security for {skill_clean}.",
                "estimated_hours": 35,
                "topics": ["Advanced Strategies", "Industry Standards", "Security & Compliance", "Scalability"],
                "tools": ["Enterprise Tools"],
                "ai_tools": ["AI Code & Design Auditors"],
                "exercises": ["Audit complex project for performance", "Implement advanced patterns"],
                "project": f"Advanced {skill_clean} Enterprise Solution",
                "checkpoint": "Advanced Competency Evaluation"
            },
            {
                "phase_number": 6,
                "title": "PHASE 6 — Portfolio and Career",
                "objective": f"Build a public portfolio showcasing {skill_clean} projects for job market readiness.",
                "estimated_hours": 15,
                "topics": ["Portfolio Development", "Resume Optimization", "Interview Preparation", "Job Market Strategy"],
                "tools": ["GitHub / Web Portfolio", "LinkedIn"],
                "ai_tools": ["Resume AI", "Interview Prep AI"],
                "exercises": ["Publish 2 projects with documentation", "Conduct mock interview session"],
                "project": f"Personal {skill_clean} Showcase Portfolio",
                "checkpoint": "Portfolio Review Milestone"
            },
            {
                "phase_number": 7,
                "title": "PHASE 7 — Capstone Project",
                "objective": f"Execute a comprehensive end-to-end Capstone project in {skill_clean}.",
                "estimated_hours": 40,
                "topics": ["End-to-End Execution", "Deployment / Final Output", "Presentation & Documentation", "Peer Review"],
                "tools": ["Full Toolstack"],
                "ai_tools": ["Cursor", "Copilot", "ChatGPT"],
                "exercises": ["Complete end-to-end solution", "Deploy and present final output"],
                "project": f"Production-Ready {skill_clean} Capstone Platform",
                "checkpoint": "Capstone Defense & Milestone Badge Award"
            }
        ],
        "ai_workflows": [
            {
                "task": f"AI-Assisted {skill_clean} Workflows",
                "recommended_ai_tool": "ChatGPT / Claude",
                "example_workflow": f"Use structured prompts to generate drafts, ideas, or code for {skill_clean} tasks.",
                "verification_requirement": "Always manually audit AI suggestions against official documentation.",
                "limitation": "AI outputs may lack specific context or contain outdated practices.",
                "privacy_warning": "Never share confidential data or internal passwords with public AI tools."
            }
        ],
        "tools": [
            {
                "name": f"Core {skill_clean} Toolset",
                "category": "Core",
                "purpose": f"Standard software suite for {skill_clean}.",
                "skill_level": "All Levels",
                "is_free": True,
                "platform": "Windows, macOS, Linux",
                "why_recommended": "Industry baseline.",
                "alternative": "Open source alternatives"
            },
            {
                "name": "ChatGPT / Claude",
                "category": "AI",
                "purpose": "AI assistant for research and execution.",
                "skill_level": "All Levels",
                "is_free": True,
                "platform": "Web, Mobile",
                "why_recommended": "Speeds up learning and problem solving.",
                "alternative": "Gemini"
            }
        ],
        "projects": [
            {
                "id": f"proj_{skill_clean.lower().replace(' ', '_')}_capstone",
                "phase_number": 7,
                "title": f"{skill_clean} Production Capstone Project",
                "problem_statement": f"Solve a realistic industry problem using advanced {skill_clean} methods.",
                "objective": "Build and document complete end-to-end solution.",
                "skills_practised": [skill_clean, "Problem Solving", "Documentation"],
                "tools": ["Primary Software Tools"],
                "ai_integration": "Leverage AI for documentation drafting and code/content optimization.",
                "dataset_requirements": "Public Datasets or Case Study Materials",
                "difficulty": "Capstone",
                "estimated_hours": 40,
                "is_capstone": True
            }
        ]
    }


def parse_user_goal(req: SkillGoalRequest) -> Dict[str, Any]:
    raw = req.raw_goal.lower()
    
    # Identify target skill
    target_skill = req.target_skill
    if not target_skill:
        if "data science" in raw or "data scientist" in raw:
            target_skill = "Data Science"
        elif "python" in raw:
            target_skill = "Python"
        elif "power bi" in raw or "powerbi" in raw:
            target_skill = "Power BI"
        elif "machine learning" in raw or "ml" in raw:
            target_skill = "Machine Learning"
        elif "web dev" in raw or "frontend" in raw or "full stack" in raw:
            target_skill = "Web Development"
        elif "ui/ux" in raw or "ui" in raw or "ux" in raw:
            target_skill = "UI/UX"
        elif "cloud" in raw or "aws" in raw:
            target_skill = "Cloud Computing"
        elif "cybersecurity" in raw or "security" in raw:
            target_skill = "Cybersecurity"
        elif "digital marketing" in raw or "marketing" in raw:
            target_skill = "Digital Marketing"
        elif "video editing" in raw or "editing" in raw:
            target_skill = "Video Editing"
        elif "data engineering" in raw or "data engineer" in raw:
            target_skill = "Data Engineering"
        elif "sql" in raw:
            target_skill = "SQL"
        else:
            target_skill = "Data Science" # default fallback
            
    hours_per_week = req.hours_per_day * req.days_per_week
    
    return {
        "primary_skill": target_skill,
        "current_level": req.current_level,
        "target_level": "Job Ready" if "job" in raw or "career" in raw else "Intermediate",
        "known_skills": req.known_skills,
        "missing_prerequisites": [],
        "hours_per_week": hours_per_week,
        "target_months": req.target_months,
        "career_goal": req.career_goal or f"Professional {target_skill} Role",
        "learning_style": req.learning_style,
        "free_resources_only": req.budget_preference == "Free Only"
    }


def generate_schedule(phases: List[Dict[str, Any]], hours_per_week: float, target_months: int) -> Dict[str, Any]:
    weeks: List[Dict[str, Any]] = []
    total_weeks = min(24, max(4, target_months * 4))
    
    lesson_idx = 1
    for week_num in range(1, total_weeks + 1):
        phase_idx = min(len(phases) - 1, (week_num - 1) // max(1, total_weeks // len(phases)))
        current_phase = phases[phase_idx]
        
        days = []
        days_count = 5
        hours_per_day = round(hours_per_week / days_count, 1)
        
        for d in range(1, days_count + 1):
            topic_idx = (lesson_idx + d) % max(1, len(current_phase["topics"]))
            topic_name = current_phase["topics"][topic_idx]
            days.append({
                "id": f"w{week_num}_d{d}",
                "day_number": d,
                "estimated_hours": hours_per_day,
                "topic": topic_name,
                "practice_task": f"Practice {topic_name} exercises ({int(hours_per_day * 60)} mins)",
                "ai_usage": f"Use AI to explain edge cases in {topic_name}",
                "is_completed": False
            })
            
        weeks.append({
            "week_number": week_num,
            "title": f"Week {week_num}: {current_phase['title']} Focus",
            "weekly_objective": current_phase["objective"],
            "phase_number": current_phase["phase_number"],
            "days": days,
            "is_completed": False
        })
        lesson_idx += 5
        
    return {"weeks": weeks}


def generate_roadmap_from_goal(req: SkillGoalRequest) -> RoadmapResponse:
    profile = parse_user_goal(req)
    skill_key = profile["primary_skill"].lower()
    
    template = SKILL_TEMPLATES.get(skill_key, get_generic_template(profile["primary_skill"]))
    
    # Unique ID generation
    hash_seed = f"{req.raw_goal}_{profile['primary_skill']}_{profile['hours_per_week']}"
    roadmap_id = "rm_" + hashlib.md5(hash_seed.encode()).hexdigest()[:12]
    
    # Calculate personalized hours
    total_hours = sum(p["estimated_hours"] for p in template["phases"])
    if profile["current_level"] == "Intermediate":
        total_hours = int(total_hours * 0.75)
    elif profile["current_level"] == "Advanced":
        total_hours = int(total_hours * 0.5)

    # Filter resources if free requested
    tools_list = []
    for t in template["tools"]:
        if profile["free_resources_only"] and not t["is_free"]:
            continue
        tools_list.append(ToolRecommendationOut(**t))
        
    ai_workflows_list = [AIWorkflowOut(**w) for w in template["ai_workflows"]]
    phases_list = [RoadmapPhaseOut(**p) for p in template["phases"]]
    
    # Generate schedule
    schedule_data = generate_schedule(template["phases"], profile["hours_per_week"], profile["target_months"])
    
    # Generate Projects
    projects_list = [
        RoadmapProjectOut(
            id=p["id"],
            phase_number=p["phase_number"],
            title=p["title"],
            problem_statement=p["problem_statement"],
            objective=p["objective"],
            skills_practised=p["skills_practised"],
            tools=p["tools"],
            ai_integration=p["ai_integration"],
            dataset_requirements=p["dataset_requirements"],
            difficulty=p["difficulty"],
            estimated_hours=p["estimated_hours"],
            is_capstone=p["is_capstone"],
            is_completed=False
        )
        for p in template["projects"]
    ]
    
    # Generate Assessments
    assessments_list = [
        RoadmapAssessmentOut(
            id=f"assess_p{p['phase_number']}",
            phase_number=p["phase_number"],
            title=f"{p['title']} Checkpoint Assessment",
            type="practical_task" if p["phase_number"] > 3 else "multiple_choice",
            questions=[
                {"question": f"What is the main objective of {p['title']}?", "options": [p["objective"], "To write unverified code", "To skip testing", "None of the above"], "answer": p["objective"]},
                {"question": f"Which tool is essential in {p['title']}?", "options": [p["tools"][0] if p["tools"] else "Git", "Excel 2003", "Calculator", "Notepad"], "answer": p["tools"][0] if p["tools"] else "Git"}
            ],
            passing_score=70,
            is_completed=False
        )
        for p in template["phases"]
    ]
    
    resources_list = [
        {"title": f"Official {profile['primary_skill']} Documentation", "provider": "Official Docs", "url": "https://docs.python.org/3/", "is_free": True, "is_official": True},
        {"title": f"Free {profile['primary_skill']} Interactive Course", "provider": "FreeCodeCamp / Kaggle", "url": "https://www.freecodecamp.org/", "is_free": True, "is_official": False},
        {"title": f"Community Practice Datasets & Challenges", "provider": "Kaggle / GitHub", "url": "https://www.kaggle.com/datasets", "is_free": True, "is_official": False}
    ]

    personalization_reason = (
        f"Generated for your '{profile['current_level']}' level in {profile['primary_skill']}, "
        f"tailored to {profile['hours_per_week']} hours/week study time aiming for {profile['career_goal']}."
    )

    return RoadmapResponse(
        roadmap_id=roadmap_id,
        title=template["title"],
        primary_skill=profile["primary_skill"],
        target_role=template["target_role"],
        current_level=profile["current_level"],
        target_level=profile["target_level"],
        estimated_hours=total_hours,
        completion_percentage=0.0,
        current_phase_number=1,
        mode_used="structured_template",
        personalization_reason=personalization_reason,
        phases=phases_list,
        tools=tools_list,
        ai_workflows=ai_workflows_list,
        schedule=schedule_data,
        projects=projects_list,
        assessments=assessments_list,
        resources=resources_list,
        completed_items=[]
    )


def handle_mentor_chat(roadmap_title: str, primary_skill: str, current_phase: int, user_msg: str) -> MentorChatResponse:
    msg_lower = user_msg.lower()
    
    if "exercise" in msg_lower or "practice" in msg_lower:
        reply = (
            f"Here is a practical exercise for **Phase {current_phase} in {primary_skill}**:\n\n"
            f"**Task**: Write a clean function/script that accepts a sample dataset, cleans missing values, and prints summary metrics.\n"
            f"**AI Tip**: Ask an AI tool: 'How can I optimize this code for readability and edge cases?'"
        )
    elif "debug" in msg_lower or "error" in msg_lower:
        reply = (
            f"When debugging errors in **{primary_skill}**:\n\n"
            f"1. Copy the exact stack trace.\n"
            f"2. Isolate the failing function.\n"
            f"3. Verify input data types before passing them to methods.\n\n"
            f"*Disclaimer*: AI tools can assist in parsing tracebacks, but always verify variable states locally."
        )
    else:
        reply = (
            f"Welcome! As your **AI Skill Mentor for {primary_skill}**, I am tracking your progress in **Phase {current_phase}**.\n\n"
            f"In this phase, focus on understanding core principles, auditing AI-generated output for accuracy, and building project evidence.\n"
            f"What specific topic or code challenge can I assist you with today?"
        )
        
    return MentorChatResponse(
        reply=reply,
        citations=[f"Roadmap Section: Phase {current_phase}", f"Skill Focus: {primary_skill}"],
        suggested_questions=[
            f"Explain Phase {current_phase} concepts simply",
            f"Give me a coding exercise for {primary_skill}",
            f"How do I audit AI outputs in {primary_skill}?"
        ]
    )
