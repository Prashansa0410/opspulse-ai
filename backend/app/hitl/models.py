"""Pydantic models for HITL AI recommendation workflow."""
from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field


class RecommendationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REVISION_REQUESTED = "REVISION_REQUESTED"


class RecommendationItem(BaseModel):
    recommendation_id: str
    query: str
    recommendation_text: str
    supporting_evidence_json: Optional[str] = None
    status: RecommendationStatus
    created_by: str
    created_at: str
    reviewer_id: Optional[str] = None
    reviewed_at: Optional[str] = None
    reviewer_comments: Optional[str] = None


class ReviewRequest(BaseModel):
    status: RecommendationStatus
    comments: Optional[str] = Field(None, description="Reason for rejection or requested changes")
