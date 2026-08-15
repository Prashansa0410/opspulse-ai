"""HITL Recommendations API Router."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.auth.models import UserRole, UserProfile
from backend.app.auth.dependencies import get_current_user, require_role
from backend.app.hitl.models import RecommendationItem, ReviewRequest
from backend.app.hitl.service import hitl_service

hitl_router = APIRouter(prefix="/hitl", tags=["Human-In-The-Loop"])


@hitl_router.get("/recommendations", response_model=List[RecommendationItem], summary="List AI Recommendations")
def get_recommendations(current_user: UserProfile = Depends(get_current_user)):
    """Retrieve all AI recommendations for review/audit. Accessible to all authenticated users."""
    return hitl_service.list_recommendations()


@hitl_router.post(
    "/recommendations/{rec_id}/review",
    response_model=RecommendationItem,
    summary="Review AI Recommendation (Requires OPS_MANAGER or EXECUTIVE)"
)
def review_recommendation(
    rec_id: str,
    review: ReviewRequest,
    current_user: UserProfile = Depends(require_role([UserRole.OPS_MANAGER, UserRole.EXECUTIVE]))
):
    """Approve, reject, or request changes on an AI recommendation. Records reviewer and timestamp."""
    try:
        return hitl_service.review_recommendation(
            rec_id=rec_id,
            reviewer_id=current_user.user_id,
            status=review.status,
            comments=review.comments
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
