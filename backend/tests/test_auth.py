"""Automated Test Suite for JWT Authentication, Password Hashing & RBAC Authorization."""
import pytest
from datetime import timedelta
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.auth.security import hash_password, verify_password, create_access_token, decode_access_token
from backend.app.auth.service import auth_service
from backend.app.auth.models import UserRole

client = TestClient(app)


def test_password_hashing():
    """Verify bcrypt salt hashing and constant-time password verification."""
    password = "SuperSecretPassword123!"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$2b$")
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_lifecycle():
    """Verify JWT token creation, signature verification, and payload extraction."""
    payload = {
        "sub": "USR_TEST_01",
        "email": "tester@opspulse.ai",
        "role": UserRole.OPS_MANAGER.value,
        "full_name": "Test Engineer"
    }
    token = create_access_token(payload, expires_delta=timedelta(minutes=15))
    decoded = decode_access_token(token)

    assert decoded["sub"] == "USR_TEST_01"
    assert decoded["email"] == "tester@opspulse.ai"
    assert decoded["role"] == "OPS_MANAGER"
    assert "exp" in decoded


def test_jwt_expired_token_rejected():
    """Verify that expired JWT tokens are rejected with appropriate exception."""
    payload = {"sub": "USR_EXPIRED", "email": "expired@opspulse.ai"}
    # Create token expired 10 minutes ago
    expired_token = create_access_token(payload, expires_delta=timedelta(minutes=-10))

    with pytest.raises(ValueError, match="Token has expired"):
        decode_access_token(expired_token)


def test_jwt_tampered_token_rejected():
    """Verify that tampered JWT signatures fail verification."""
    payload = {"sub": "USR_TAMPER"}
    valid_token = create_access_token(payload)
    # Modify signature
    tampered_token = valid_token[:-5] + "XXXXX"

    with pytest.raises(ValueError, match="Invalid authentication token"):
        decode_access_token(tampered_token)


def test_auth_service_seeding_and_auth():
    """Verify default demo users are seeded and can authenticate."""
    auth_service.ensure_schema_and_seed()
    
    # Test Executive
    exec_user = auth_service.authenticate_user("exec@opspulse.ai", "Executive123!")
    assert exec_user is not None
    assert exec_user.role == UserRole.EXECUTIVE

    # Test Ops Manager
    ops_user = auth_service.authenticate_user("ops@opspulse.ai", "OpsManager123!")
    assert ops_user is not None
    assert ops_user.role == UserRole.OPS_MANAGER

    # Test Data Analyst
    analyst_user = auth_service.authenticate_user("analyst@opspulse.ai", "DataAnalyst123!")
    assert analyst_user is not None
    assert analyst_user.role == UserRole.DATA_ANALYST

    # Test Invalid Password
    failed_auth = auth_service.authenticate_user("ops@opspulse.ai", "WrongPassword!")
    assert failed_auth is None


def test_api_login_success():
    """Verify POST /api/v1/auth/login returns valid JWT token and profile."""
    response = client.post("/api/v1/auth/login", json={
        "email": "ops@opspulse.ai",
        "password": "OpsManager123!"
    })
    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "ops@opspulse.ai"
    assert data["user"]["role"] == "OPS_MANAGER"


def test_api_login_invalid_credentials():
    """Verify POST /api/v1/auth/login rejects invalid password with 401."""
    response = client.post("/api/v1/auth/login", json={
        "email": "ops@opspulse.ai",
        "password": "InvalidPassword123"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_api_get_me_authorized():
    """Verify GET /api/v1/auth/me with Bearer token returns current user profile."""
    # Login first
    login_res = client.post("/api/v1/auth/login", json={
        "email": "exec@opspulse.ai",
        "password": "Executive123!"
    })
    token = login_res.json()["access_token"]

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "exec@opspulse.ai"
    assert data["role"] == "EXECUTIVE"


def test_api_get_me_unauthorized():
    """Verify GET /api/v1/auth/me without Bearer token returns 401."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_rbac_simulation_allowed_for_ops_manager():
    """Verify POST /api/v1/simulations succeeds for OPS_MANAGER."""
    login_res = client.post("/api/v1/auth/login", json={
        "email": "ops@opspulse.ai",
        "password": "OpsManager123!"
    })
    token = login_res.json()["access_token"]

    sim_payload = {
        "title": "Auth Test Volume Shift",
        "source_warehouse_id": "WH_BLR_01",
        "target_warehouse_id": "WH_BLR_02",
        "volume_shift_pct": 15.0
    }
    response = client.post(
        "/api/v1/simulations",
        json=sim_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "COMPLETED"


def test_rbac_simulation_forbidden_for_data_analyst():
    """Verify POST /api/v1/simulations returns 403 Forbidden for DATA_ANALYST role."""
    login_res = client.post("/api/v1/auth/login", json={
        "email": "analyst@opspulse.ai",
        "password": "DataAnalyst123!"
    })
    token = login_res.json()["access_token"]

    sim_payload = {
        "title": "Forbidden Simulation Attempt",
        "source_warehouse_id": "WH_BLR_01",
        "target_warehouse_id": "WH_BLR_02",
        "volume_shift_pct": 15.0
    }
    response = client.post(
        "/api/v1/simulations",
        json=sim_payload,
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
    assert "Access Denied" in response.json()["detail"]


def test_rbac_ai_query_allowed_for_data_analyst():
    """Verify POST /api/v1/ai/query succeeds for DATA_ANALYST."""
    login_res = client.post("/api/v1/auth/login", json={
        "email": "analyst@opspulse.ai",
        "password": "DataAnalyst123!"
    })
    token = login_res.json()["access_token"]

    response = client.post(
        "/api/v1/ai/query",
        json={"query": "Which carrier is performing worst?"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "Carrier Performance" in response.json()["response"]
