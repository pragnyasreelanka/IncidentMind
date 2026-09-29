from pydantic import BaseModel
from typing import Optional


class IncidentCreate(BaseModel):
    title: str
    description: str
    severity: str = "medium"
    category: Optional[str] = None


class IncidentResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    category: Optional[str] = None
    ai_analysis: Optional[str] = None
    created_at: Optional[str] = None