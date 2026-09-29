import os

from groq import Groq, RateLimitError
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def analyze_incident(
    title: str,
    description: str,
    severity: str,
    memory_context: str = ""
):
    # Keep historical memory reasonably small
    memory_context = memory_context[:6000]

    prompt = f"""
You are an AI incident management assistant with access to
historical incident memory.

CURRENT INCIDENT

Title: {title}
Description: {description}
Severity: {severity}

HISTORICAL INCIDENT MEMORY

{memory_context if memory_context else "No relevant previous incidents were found."}

Use the historical incident memory when it is relevant.
Do not blindly copy previous incidents.
Adapt previous lessons to the current incident.

IMPORTANT:
Make the "Relevant Lessons From Previous Incidents" section
short and specific. Mention only lessons that are actually
supported by the historical memory.

Provide the following sections in exactly this order:

1. Incident Summary

2. Possible Root Causes

3. Relevant Lessons From Previous Incidents
- Mention 2-4 concise lessons from the historical incidents.
- If no relevant memory exists, say so.

4. Impact

5. Recommended Immediate Actions

6. Recommended Preventive Actions

7. Priority Level

Keep the response practical, clear, and concise.
Do not invent previous incidents or previous solutions.
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert incident management assistant "
                        "with access to historical incident memory."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=1600,
        )

        return response.choices[0].message.content

    except RateLimitError as error:
        print(f"Groq rate limit reached: {error}")

        return (
            "AI analysis is temporarily unavailable because the "
            "Groq API rate limit has been reached.\n\n"
            f"Incident: {title}\n"
            f"Severity: {severity}\n"
            f"Description: {description}\n\n"
            "Recommended immediate action: investigate the affected "
            "service, check logs and metrics, review recent changes, "
            "and restore service as quickly as possible."
        )

    except Exception as error:
        print(f"Groq analysis error: {error}")

        return (
            "AI analysis could not be generated at this time.\n\n"
            f"Incident: {title}\n"
            f"Severity: {severity}\n"
            f"Description: {description}"
        )