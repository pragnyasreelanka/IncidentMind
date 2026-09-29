from database import (
    create_incident,
    get_incident,
    get_all_incidents,
    update_ai_analysis
)

from groq_service import analyze_incident
from hindsight_memory import HindsightMemory


memory = HindsightMemory()


def create_and_analyze_incident(
    title: str,
    description: str,
    severity: str,
    category: str | None = None
):
    # 1. Save incident in SQLite
    incident_id = create_incident(
        title=title,
        description=description,
        severity=severity,
        category=category
    )

    # 2. Recall similar previous incidents from Hindsight
    memory_query = f"""
Title: {title}
Description: {description}
Severity: {severity}
Category: {category}
"""

    previous_memories = memory.recall(memory_query)

    # Convert Hindsight results into readable text
    memory_context = ""

    if previous_memories:
        memory_context = "\n\n".join(
            result.text
            for result in previous_memories
            if hasattr(result, "text")
        )

    # 3. Generate AI analysis using incident + previous memories
    analysis = analyze_incident(
        title=title,
        description=description,
        severity=severity,
        memory_context=memory_context
    )

    # 4. Save AI analysis in SQLite
    update_ai_analysis(
        incident_id,
        analysis
    )

    # 5. Store the new incident and its analysis in Hindsight
    memory.remember(
        f"""
Incident ID: {incident_id}
Title: {title}
Description: {description}
Severity: {severity}
Category: {category}

AI Analysis:
{analysis}
"""
    )

    # 6. Return complete incident
    return get_incident(incident_id)


def list_incidents():
    return get_all_incidents()


def get_single_incident(incident_id: int):
    return get_incident(incident_id)