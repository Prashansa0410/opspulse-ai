import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import db_manager
from backend.app.auth.security import create_access_token
from backend.app.auth.service import auth_service

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    db_manager.init_schema()
    auth_service.ensure_schema_and_seed()
    yield

def get_token(role: str, user_id: str):
    return create_access_token(data={"sub": user_id, "email": f"{role}@test.com", "role": role, "full_name": "Test User"})

def test_hitl_workflow():
    # 1. User generates recommendation via AI Query
    user_token = get_token("DATA_ANALYST", "USR_ANALYST_01")
    resp = client.post("/api/v1/ai/query", json={"query": "simulate moving 10% from BLR-01 to BLR-02"}, headers={"Authorization": f"Bearer {user_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "recommendation_id" in data
    rec_id = data["recommendation_id"]
    assert rec_id is not None
    assert rec_id.startswith("REC_")

    # 2. Check recommendation status is PENDING
    resp_list = client.get("/api/v1/hitl/recommendations", headers={"Authorization": f"Bearer {user_token}"})
    assert resp_list.status_code == 200
    recs = resp_list.json()
    assert len(recs) >= 1
    rec = next(r for r in recs if r["recommendation_id"] == rec_id)
    assert rec["status"] == "PENDING"
    assert rec["created_by"] == "USR_ANALYST_01"

    # 3. Data analyst tries to approve (should fail, unauthorized)
    resp_unauth = client.post(f"/api/v1/hitl/recommendations/{rec_id}/review", json={"status": "APPROVED"}, headers={"Authorization": f"Bearer {user_token}"})
    assert resp_unauth.status_code == 403

    # 4. Operations Manager approves
    ops_token = get_token("OPS_MANAGER", "USR_OPS_01")
    resp_auth = client.post(
        f"/api/v1/hitl/recommendations/{rec_id}/review",
        json={"status": "APPROVED", "comments": "Looks good, proceed."},
        headers={"Authorization": f"Bearer {ops_token}"}
    )
    assert resp_auth.status_code == 200
    approved_rec = resp_auth.json()
    assert approved_rec["status"] == "APPROVED"
    assert approved_rec["reviewer_id"] == "USR_OPS_01"
    assert approved_rec["reviewer_comments"] == "Looks good, proceed."
    assert approved_rec["reviewed_at"] is not None

    # 5. Executive Rejects another recommendation
    resp2 = client.post("/api/v1/ai/query", json={"query": "recommend what we should do"}, headers={"Authorization": f"Bearer {user_token}"})
    rec_id2 = resp2.json()["recommendation_id"]
    
    exec_token = get_token("EXECUTIVE", "USR_EXEC_01")
    resp_reject = client.post(
        f"/api/v1/hitl/recommendations/{rec_id2}/review",
        json={"status": "REJECTED", "comments": "Too risky."},
        headers={"Authorization": f"Bearer {exec_token}"}
    )
    assert resp_reject.status_code == 200
    assert resp_reject.json()["status"] == "REJECTED"
