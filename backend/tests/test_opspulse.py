"""End-to-End and Unit Test Suite for OpsPulse AI Backend."""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.db.session import db_manager
from backend.app.data_pipeline.generator import OperationalDataGenerator
from backend.app.data_pipeline.ingestion import ingestion_engine
from backend.app.data_pipeline.dbt_transforms import transformation_engine
from backend.app.data_pipeline.data_quality import dq_framework
from backend.app.analytics.kpi_service import kpi_service
from backend.app.analytics.root_cause import root_cause_engine
from backend.app.ml.sla_risk_model import sla_risk_model
from backend.app.ml.anomaly_detector import anomaly_detector
from backend.app.ml.simulation import simulation_engine, SimulationRequest
from backend.app.ai_analyst.guardrails import sql_guardrails, SQLSecurityException
from backend.app.ai_analyst.agent import ai_analyst


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Ensure schema and small seed data are populated for testing."""
    ingestion_engine.populate_seed_data(volume="small", seed=42)
    transformation_engine.run_all_transforms()
    sla_risk_model.train()
    anomaly_detector.detect_all_anomalies()


# -----------------------------------------------------------------
# 1. Data Generator & Ingestion Tests
# -----------------------------------------------------------------
def test_data_generator_deterministic_incident():
    gen = OperationalDataGenerator(seed=42, days=30)
    orders, items, shipments, events, payments, tickets = gen.generate_orders_and_lifecycle(orders_target=500)
    
    assert len(orders) > 400
    assert len(shipments) > 0
    assert len(events) > len(shipments) * 3
    assert len(payments) == len(orders)
    
    # Check that causal incident produced some breached orders
    breached = [o for o in orders if o.is_sla_breached]
    assert len(breached) > 0, "Causal incident generator must generate breached orders during flash sale"
    
    # Check payment failures exist from PayFast incident
    pay_failed = [p for p in payments if p.status == "FAILED"]
    assert len(pay_failed) > 0, "Causal incident generator must generate payment provider failures"


# -----------------------------------------------------------------
# 2. Data Quality Tests
# -----------------------------------------------------------------
def test_data_quality_framework():
    report = dq_framework.run_all_checks()
    assert report.total_checks == 8
    assert report.passed_checks >= 7
    assert report.dq_score_pct >= 90.0, f"DQ score should be high, got {report.dq_score_pct}%"


# -----------------------------------------------------------------
# 3. SQL Analytics & KPI Tests
# -----------------------------------------------------------------
def test_kpi_service_executive_summary():
    summary = kpi_service.get_executive_summary()
    assert "on_time_delivery_rate" in summary
    assert "orders_today" in summary
    assert "gmv_at_risk" in summary
    assert summary["on_time_delivery_rate"] > 0
    assert len(summary["top_issues"]) == 3
    assert len(summary["recommended_actions"]) == 3


def test_warehouse_and_carrier_scorecards():
    whs = kpi_service.get_warehouse_scorecards()
    assert len(whs) == 6
    assert any(w["code"] == "BLR-01" for w in whs)

    carriers = kpi_service.get_carrier_scorecards()
    assert len(carriers) == 5
    assert any(c["carrier_name"] == "SwiftExpress Direct" for c in carriers)


# -----------------------------------------------------------------
# 4. Root Cause Analysis Tests
# -----------------------------------------------------------------
def test_root_cause_decomposition():
    rca = root_cause_engine.decompose_sla_drop()
    assert rca["net_drop_pct"] < 0, "Should detect negative net drop during incident"
    assert len(rca["stage_breakdown"]) > 0
    assert len(rca["top_affected_warehouses"]) > 0
    assert len(rca["top_affected_carriers"]) > 0


# -----------------------------------------------------------------
# 5. ML Models: SLA Risk & Anomaly Detection
# -----------------------------------------------------------------
def test_sla_risk_prediction():
    high_risk_features = {
        "warehouse_utilization": 0.94,
        "warehouse_packing_hours": 9.5,
        "carrier_pickup_delay_hours": 8.0,
        "is_cross_zone": 1,
        "order_value": 4500.0,
        "items_count": 3,
        "day_of_week": 6,
        "order_hour": 14,
        "is_weekend": 1,
        "carrier_base_sla_hours": 36
    }
    pred_high = sla_risk_model.predict_risk(high_risk_features)
    assert pred_high["risk_score"] >= 0.50
    assert pred_high["risk_level"] in ["HIGH", "CRITICAL"]

    low_risk_features = {
        "warehouse_utilization": 0.52,
        "warehouse_packing_hours": 1.2,
        "carrier_pickup_delay_hours": 0.8,
        "is_cross_zone": 0,
        "order_value": 850.0,
        "items_count": 1,
        "day_of_week": 2,
        "order_hour": 10,
        "is_weekend": 0,
        "carrier_base_sla_hours": 24
    }
    pred_low = sla_risk_model.predict_risk(low_risk_features)
    assert pred_low["risk_score"] < 0.40


def test_anomaly_detection_engine():
    anomalies = anomaly_detector.detect_all_anomalies()
    assert len(anomalies) > 0
    metric_names = [a["metric_name"] for a in anomalies]
    assert any("Payment" in m or "Warehouse" in m or "Carrier" in m for m in metric_names)


# -----------------------------------------------------------------
# 6. Decision Support / Simulation Tests
# -----------------------------------------------------------------
def test_what_if_simulation():
    req = SimulationRequest(
        source_warehouse_id="WH_BLR_01",
        target_warehouse_id="WH_BLR_02",
        volume_shift_pct=18.0
    )
    result = simulation_engine.run_simulation(req)
    assert result.status == "COMPLETED"
    assert result.expected_otd_lift > 0
    assert result.simulated["source_utilization_pct"] < result.baseline["source_utilization_pct"]
    assert result.simulated["target_utilization_pct"] > result.baseline["target_utilization_pct"]


# -----------------------------------------------------------------
# 7. SQL Guardrails Tests
# -----------------------------------------------------------------
def test_sql_guardrails_safety():
    # Valid SELECT query
    valid_query = "SELECT order_id, total_amount FROM orders WHERE is_sla_breached = TRUE"
    sanitized = sql_guardrails.validate_and_sanitize(valid_query)
    assert "LIMIT" in sanitized

    # Reject destructive DROP
    with pytest.raises(SQLSecurityException):
        sql_guardrails.validate_and_sanitize("DROP TABLE orders;")

    # Reject DELETE
    with pytest.raises(SQLSecurityException):
        sql_guardrails.validate_and_sanitize("DELETE FROM customers WHERE customer_id = '123';")

    # Reject UPDATE
    with pytest.raises(SQLSecurityException):
        sql_guardrails.validate_and_sanitize("UPDATE warehouses SET current_utilization = 0;")

    # Reject Multi-statement injection
    with pytest.raises(SQLSecurityException):
        sql_guardrails.validate_and_sanitize("SELECT * FROM orders; DROP TABLE payments;")


# -----------------------------------------------------------------
# 8. AI Operations Analyst Agent Tests
# -----------------------------------------------------------------
def test_ai_operations_analyst():
    # Root cause query
    res = ai_analyst.process_query("Why did on-time delivery fall yesterday?")
    assert "Root Cause Analysis" in res["response"]
    assert len(res["tool_calls"]) > 0
    assert len(res["citations"]) > 0
    assert res["latency_ms"] < 2000

    # Carrier query
    res_car = ai_analyst.process_query("Which carrier is performing worst?")
    assert "Carrier Performance" in res_car["response"]

    # Recommendation / Simulation query
    res_sim = ai_analyst.process_query("What should we do to fix SLA breaches?")
    assert "Action Plan" in res_sim["response"] or "Recommendation" in res_sim["response"]


# -----------------------------------------------------------------
# 9. FastAPI REST API Endpoint Integration Tests
# -----------------------------------------------------------------
def test_api_endpoints():
    with TestClient(app) as client:
        # Health
        res = client.get("/api/v1/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"

        # KPIs
        res = client.get("/api/v1/kpis?days=14")
        assert res.status_code == 200
        assert "summary" in res.json()
        assert "timeseries" in res.json()

        # Warehouses
        res = client.get("/api/v1/warehouses")
        assert res.status_code == 200
        assert res.json()["total_warehouses"] == 6

        # Carriers
        res = client.get("/api/v1/carriers")
        assert res.status_code == 200
        assert res.json()["total_carriers"] == 5

        # Orders pagination
        res = client.get("/api/v1/orders?page=1&page_size=10&is_breached=true")
        assert res.status_code == 200
        assert len(res.json()["data"]) <= 10

        # SLA Risk
        res = client.get("/api/v1/sla-risk?limit=10")
        assert res.status_code == 200
        assert "shipments" in res.json()

        # Anomalies
        res = client.get("/api/v1/anomalies")
        assert res.status_code == 200
        assert "data" in res.json()

        # Root Causes
        res = client.get("/api/v1/root-causes")
        assert res.status_code == 200
        assert "data" in res.json()

        # Authenticate for protected endpoints
        login_res = client.post("/api/v1/auth/login", json={
            "email": "ops@opspulse.ai",
            "password": "OpsManager123!"
        })
        auth_header = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

        # Simulation POST (Protected: OPS_MANAGER)
        sim_payload = {
            "title": "Test Simulation Reallocation",
            "intervention_type": "WAREHOUSE_VOLUME_REALLOCATION",
            "source_warehouse_id": "WH_BLR_01",
            "target_warehouse_id": "WH_BLR_02",
            "volume_shift_pct": 15.0
        }
        res = client.post("/api/v1/simulations", json=sim_payload, headers=auth_header)
        assert res.status_code == 200
        assert res.json()["status"] == "COMPLETED"

        # AI Query POST (Protected)
        ai_payload = {"query": "Why did SLA breach rate increase?"}
        res = client.post("/api/v1/ai/query", json=ai_payload, headers=auth_header)
        assert res.status_code == 200
        assert "response" in res.json()

        # Data Quality
        res = client.get("/api/v1/data-quality")
        assert res.status_code == 200
        assert res.json()["data"]["dq_score_pct"] >= 90.0

        # Prometheus Metrics
        res = client.get("/metrics")
        assert res.status_code == 200
        assert "opspulse_http_requests_total" in res.text
