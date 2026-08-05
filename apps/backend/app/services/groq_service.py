import logging
from typing import Any, Dict, List, Optional
from app.core.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are LifeBridge AI Assistant, an empathetic, expert, and professional advisor on the LifeBridge AI platform.
Your objective is to provide actionable, encouraging, and clear guidance on skill learning, career development, disaster safety, job applications, scholarships, and personal development.
Always maintain a helpful, structured, and professional tone.
If the request concerns urgent emergency situations, prioritize safety instructions first."""


def call_groq_chat(
    messages: List[Dict[str, str]],
    temperature: float = 0.7,
    max_tokens: int = 1024,
    roadmap_context: Optional[str] = None,
) -> Dict[str, Any]:
    """Executes a multi-turn chat completion using Groq AI (llama-3.1-8b-instant) with graceful fallback."""
    settings = get_settings()
    api_key = settings.groq_api_key.strip()
    model = settings.groq_model or "llama-3.1-8b-instant"

    # Prepend default system prompt if no system message is provided
    formatted_messages = []
    has_system = any(m.get("role") == "system" for m in messages)
    if not has_system:
        sys_content = SYSTEM_PROMPT
        if roadmap_context:
            sys_content += f"\n\nCurrent Learning Context: {roadmap_context}"
        formatted_messages.append({"role": "system", "content": sys_content})

    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ["system", "user", "assistant"] and content:
            formatted_messages.append({"role": role, "content": content})

    # Check if a real Groq API key is configured
    if api_key and api_key != "PASTE_KEY_HERE" and not api_key.startswith("your_"):
        try:
            from groq import Groq

            client = Groq(api_key=api_key)
            completion = client.chat.completions.create(
                model=model,
                messages=formatted_messages,
                temperature=max_tokens and min(temperature, 1.0) or 0.7,
                max_tokens=max_tokens,
            )
            reply = completion.choices[0].message.content or ""
            return {
                "reply": reply,
                "model_used": model,
                "provider": "Groq AI",
                "citations": ["LifeBridge AI Skill Engine", "Groq Llama-3.1 Inference Engine"],
                "disclaimer": "AI guidance is for informational purposes. Verify important decisions.",
                "status": "success",
            }
        except Exception as err:
            logger.warning(f"Groq API call failed, falling back to local intelligence: {err}")

    # Fallback contextual intelligence when key is placeholder, missing, or API unreachable
    last_user_msg = next((m["content"] for m in reversed(messages) if m.get("role") == "user"), "")
    fallback_reply = generate_fallback_response(last_user_msg, roadmap_context)
    return {
        "reply": fallback_reply,
        "model_used": f"{model} (Offline Fallback Mode)",
        "provider": "LifeBridge Local Intelligence",
        "citations": ["LifeBridge Knowledge Base"],
        "disclaimer": "Using demo/offline intelligence engine. Configure GROQ_API_KEY for live Llama-3.1 inference.",
        "status": "fallback",
    }


def generate_fallback_response(user_query: str, context: Optional[str] = None) -> str:
    query_lower = user_query.lower()

    if "python" in query_lower:
        return (
            "Python is an ideal language for AI, data science, and web development. "
            "I recommend starting with core syntax, data structures (lists, dicts), object-oriented design, "
            "and moving directly to pandas & scikit-learn or FastAPI for practical projects."
        )
    elif "data science" in query_lower or "data engineer" in query_lower:
        return (
            "For Data Science and Analytics, build strong fundamentals in SQL, Python, pandas, and statistical model evaluation. "
            "Create end-to-end projects featuring automated data cleaning, exploratory data analysis, and model performance metrics."
        )
    elif "job" in query_lower or "cv" in query_lower or "career" in query_lower:
        return (
            "To enhance your career readiness on LifeBridge AI:\n"
            "1. Tailor your CV to match targeted skill keywords.\n"
            "2. Publish real-world capstone projects on GitHub.\n"
            "3. Complete skill milestone assessments to showcase verified badges."
        )
    elif "disaster" in query_lower or "safety" in query_lower or "alert" in query_lower:
        return (
            "LifeBridge Emergency & Disaster Protocol:\n"
            "• Monitor real-time alert updates on the For You feed.\n"
            "• Keep emergency contacts and essential medical kits accessible.\n"
            "• Follow instructions issued by local disaster management authorities."
        )

    return (
        f"Thank you for reaching out to LifeBridge AI Assistant. Regarding '{user_query}':\n\n"
        "I am ready to help you structure your learning roadmap, break down complex topics into actionable steps, "
        "and review your practical exercise code. Feel free to ask specific questions about your current skill milestone!"
    )
