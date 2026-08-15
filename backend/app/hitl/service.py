"""Service for managing HITL recommendations and approvals."""
import uuid
import json
from datetime import datetime, timezone
from typing import Optional, List
from backend.app.db.session import db_manager
from backend.app.hitl.models import RecommendationItem, RecommendationStatus


class HitlService:
    def create_recommendation(
        self,
        query: str,
        recommendation_text: str,
        created_by: str,
        supporting_evidence: Optional[dict] = None
    ) -> str:
        """Create a new pending AI recommendation requiring human review."""
        rec_id = f"REC_{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc)
        evidence_str = json.dumps(supporting_evidence) if supporting_evidence else None
        
        conn = db_manager.get_connection()
        conn.execute("""
            INSERT INTO ai_recommendations 
            (recommendation_id, query, recommendation_text, supporting_evidence_json, status, created_by, created_at)
            VALUES (?, ?, ?, ?, 'PENDING', ?, ?);
        """, [rec_id, query, recommendation_text, evidence_str, created_by, now])
        
        return rec_id

    def list_recommendations(self) -> List[RecommendationItem]:
        """Fetch all recommendations ordered by creation date."""
        conn = db_manager.get_connection()
        rows = conn.execute("""
            SELECT recommendation_id, query, recommendation_text, supporting_evidence_json,
                   status, created_by, created_at, reviewer_id, reviewed_at, reviewer_comments
            FROM ai_recommendations
            ORDER BY created_at DESC;
        """).fetchall()
        
        results = []
        for row in rows:
            results.append(RecommendationItem(
                recommendation_id=row[0],
                query=row[1],
                recommendation_text=row[2],
                supporting_evidence_json=row[3],
                status=RecommendationStatus(row[4]),
                created_by=row[5],
                created_at=str(row[6]),
                reviewer_id=row[7],
                reviewed_at=str(row[8]) if row[8] else None,
                reviewer_comments=row[9]
            ))
        return results

    def review_recommendation(
        self,
        rec_id: str,
        reviewer_id: str,
        status: RecommendationStatus,
        comments: Optional[str] = None
    ) -> RecommendationItem:
        """Approve, reject, or request revision for a pending recommendation."""
        conn = db_manager.get_connection()
        
        # Verify it exists
        existing = conn.execute("SELECT status FROM ai_recommendations WHERE recommendation_id = ?", [rec_id]).fetchone()
        if not existing:
            raise ValueError(f"Recommendation {rec_id} not found")

        if existing[0] != RecommendationStatus.PENDING.value:
            raise ValueError(f"Recommendation is already {existing[0]} and cannot be reviewed again.")

        now = datetime.now(timezone.utc)
        conn.execute("""
            UPDATE ai_recommendations
            SET status = ?, reviewer_id = ?, reviewed_at = ?, reviewer_comments = ?
            WHERE recommendation_id = ?
        """, [status.value, reviewer_id, now, comments, rec_id])

        # Fetch updated row to return
        updated = conn.execute("""
            SELECT recommendation_id, query, recommendation_text, supporting_evidence_json,
                   status, created_by, created_at, reviewer_id, reviewed_at, reviewer_comments
            FROM ai_recommendations
            WHERE recommendation_id = ?
        """, [rec_id]).fetchone()

        return RecommendationItem(
            recommendation_id=updated[0],
            query=updated[1],
            recommendation_text=updated[2],
            supporting_evidence_json=updated[3],
            status=RecommendationStatus(updated[4]),
            created_by=updated[5],
            created_at=str(updated[6]),
            reviewer_id=updated[7],
            reviewed_at=str(updated[8]) if updated[8] else None,
            reviewer_comments=updated[9]
        )

hitl_service = HitlService()
