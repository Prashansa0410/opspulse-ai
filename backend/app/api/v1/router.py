"""FastAPI REST API Router for OpsPulse AI."""
import os
import time
import resource
from typing import Any, Optional
from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel, Field
from backend.app.config import settings
from backend.app.db.session import db_manager
from backend.app.analytics.kpi_service import kpi_service
from backend.app.analytics.root_cause import root_cause_engine
from backend.app.ml.sla_risk_model import sla_risk_model
from backend.app.ml.anomaly_detector import anomaly_detector
from backend.app.ml.simulation import simulation_engine, SimulationRequest, SimulationResult
from backend.app.ai_analyst.agent import ai_analyst
from backend.app.data_pipeline.data_quality import dq_framework
from backend.app.data_pipeline.kafka_stream import stream_broker
from backend.app.auth.models import UserRole, UserProfile
from backend.app.auth.dependencies import get_current_user, get_optional_user, require_role
from backend.app.api.v1.auth import auth_router
from backend.app.api.v1.hitl import hitl_router

api_router = APIRouter(prefix="/v1")

# Mount auth router (unprotected routes like login)
api_router.include_router(auth_router)
api_router.include_router(hitl_router)


# -------------------------------------------------------------
# Request / Response Pydantic Models
# -------------------------------------------------------------
class AIQueryRequest(BaseModel):
    query: str = Field(..., json_schema_extra={"example": "Why did on-time delivery drop yesterday?"})


class AIQueryResponse(BaseModel):
    query: str
    response: str
    tool_calls: list[dict[str, Any]]
    citations: list[str]
    latency_ms: float
    timestamp: str
    recommendation_id: Optional[str] = None


class OrderFilterParams(BaseModel):
    status: Optional[str] = None
    warehouse_id: Optional[str] = None
    carrier_id: Optional[str] = None
    is_breached: Optional[bool] = None
    page: int = 1
    page_size: int = 50


# -------------------------------------------------------------
# 1. KPIs & Executive Overview Endpoints
# -------------------------------------------------------------
@api_router.get("/kpis", summary="Get Executive KPI Summary and Timeseries")
def get_kpis(days: int = Query(default=30, ge=1, le=90)):
    """Retrieve headline operational KPIs, period deltas, top alerts, and historical trend timeseries."""
    summary = kpi_service.get_executive_summary()
    timeseries = kpi_service.get_kpi_timeseries(days=days)
    return {
        "status": "success",
        "summary": summary,
        "timeseries": timeseries
    }


# -------------------------------------------------------------
# 2. Warehouses Scorecard Endpoint
# -------------------------------------------------------------
@api_router.get("/warehouses", summary="Get Fulfillment Centers and Utilization Scorecards")
def get_warehouses():
    """Retrieve warehouse utilization, throughput, backlog, and SLA breach rate scorecards."""
    warehouses = kpi_service.get_warehouse_scorecards()
    return {
        "status": "success",
        "total_warehouses": len(warehouses),
        "data": warehouses
    }


# -------------------------------------------------------------
# 3. Carriers Performance Endpoint
# -------------------------------------------------------------
@api_router.get("/carriers", summary="Get 3PL Carrier Performance Scorecards")
def get_carriers():
    """Retrieve carrier on-time delivery percentages, average dock pickup delays, and transit durations."""
    carriers = kpi_service.get_carrier_scorecards()
    return {
        "status": "success",
        "total_carriers": len(carriers),
        "data": carriers
    }


# -------------------------------------------------------------
# 4. Orders Operational Explorer Endpoint
# -------------------------------------------------------------
@api_router.get("/orders", summary="Explore Operational Orders with Filtering & Pagination")
def get_orders(
    status: Optional[str] = None,
    warehouse_id: Optional[str] = None,
    carrier_id: Optional[str] = None,
    is_breached: Optional[bool] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200)
):
    """Query operational orders with multi-dimensional filtering, SLA status, and pagination."""
    conn = db_manager.get_connection()
    conditions = ["1=1"]
    params = []

    if status:
        conditions.append("o.order_status = ?")
        params.append(status)
    if warehouse_id:
        conditions.append("o.warehouse_id = ?")
        params.append(warehouse_id)
    if carrier_id:
        conditions.append("o.carrier_id = ?")
        params.append(carrier_id)
    if is_breached is not None:
        conditions.append("o.is_sla_breached = ?")
        params.append(is_breached)

    where_clause = " AND ".join(conditions)
    offset = (page - 1) * page_size

    count_query = f"SELECT COUNT(*) FROM orders o WHERE {where_clause};"
    total_count = conn.execute(count_query, params).fetchone()[0]

    data_query = f"""
        SELECT
            o.order_id,
            o.order_number,
            c.name AS customer_name,
            c.tier AS customer_tier,
            w.code AS warehouse_code,
            w.name AS warehouse_name,
            car.name AS carrier_name,
            r.name AS region_name,
            o.order_status,
            o.order_date,
            o.promised_delivery_date,
            o.actual_delivery_date,
            o.total_amount,
            o.items_count,
            o.is_sla_breached,
            o.sla_breach_reason
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        JOIN warehouses w ON o.warehouse_id = w.warehouse_id
        JOIN carriers car ON o.carrier_id = car.carrier_id
        JOIN regions r ON o.region_id = r.region_id
        WHERE {where_clause}
        ORDER BY o.order_date DESC
        LIMIT ? OFFSET ?;
    """
    exec_params = params + [page_size, offset]
    rows = conn.execute(data_query, exec_params).fetchall()
    cols = [desc[0] for desc in conn.description]
    records = [dict(zip(cols, r)) for r in rows]

    return {
        "status": "success",
        "pagination": {
            "total_records": total_count,
            "page": page,
            "page_size": page_size,
            "total_pages": (total_count + page_size - 1) // page_size
        },
        "data": records
    }


# -------------------------------------------------------------
# 5. SLA Risk & Predictions Endpoint
# -------------------------------------------------------------
@api_router.get("/sla-risk", summary="Get Predictive SLA Risk Scores and In-Flight Shipments")
def get_sla_risk(limit: int = Query(default=30, ge=1, le=100)):
    """Retrieve predictive SLA breach probabilities, feature importance attributions, and high-risk shipments."""
    high_risk_shipments = sla_risk_model.get_in_flight_high_risk_shipments(limit=limit)
    if not sla_risk_model.feature_importances:
        sla_risk_model.train()

    return {
        "status": "success",
        "model_evaluation": sla_risk_model.evaluation_metrics,
        "feature_importances": sla_risk_model.feature_importances,
        "high_risk_in_flight_count": len([s for s in high_risk_shipments if s["risk_score"] >= 0.50]),
        "shipments": high_risk_shipments
    }


# -------------------------------------------------------------
# 6. Anomaly Center Endpoint
# -------------------------------------------------------------
@api_router.get("/anomalies", summary="Get Detected Operational Anomalies")
def get_anomalies():
    """Retrieve active and historical operational anomalies detected via rolling Z-score & Isolation Forest."""
    active_anomalies = anomaly_detector.detect_all_anomalies()
    return {
        "status": "success",
        "active_anomalies_count": len(active_anomalies),
        "critical_count": sum(1 for a in active_anomalies if a["severity"] == "CRITICAL"),
        "warning_count": sum(1 for a in active_anomalies if a["severity"] == "WARNING"),
        "data": active_anomalies
    }


# -------------------------------------------------------------
# 7. Root Cause Analysis Endpoint
# -------------------------------------------------------------
@api_router.get("/root-causes", summary="Get Multi-Dimensional RCA Attribution Decomposition")
def get_root_causes(metric: str = Query(default="on_time_delivery_rate")):
    """Perform mathematical root-cause decomposition of SLA breach increase across stages, nodes, and carriers."""
    rca = root_cause_engine.decompose_sla_drop(metric=metric)
    return {
        "status": "success",
        "data": rca
    }


# -------------------------------------------------------------
# 8. Decision Support / What-If Simulations Endpoint (RBAC Protected)
# -------------------------------------------------------------
@api_router.post(
    "/simulations",
    response_model=SimulationResult,
    summary="Execute What-If Operational Intervention Simulation (Requires OPS_MANAGER or EXECUTIVE)"
)
def create_simulation(
    request: SimulationRequest,
    current_user: UserProfile = Depends(require_role([UserRole.OPS_MANAGER, UserRole.EXECUTIVE]))
):
    """Simulate the quantitative impact of shifting volume between fulfillment hubs.
    RBAC: Requires Operations Manager or Executive role."""
    return simulation_engine.run_simulation(request)


@api_router.get("/simulations", summary="List Recent What-If Simulations")
def get_recent_simulations():
    """Retrieve historical simulations and their before/after impact scores."""
    sims = simulation_engine.list_recent_simulations()
    return {
        "status": "success",
        "data": sims
    }


# -------------------------------------------------------------
# 9. AI Operations Analyst Natural Language Endpoint (RBAC Protected)
# -------------------------------------------------------------
@api_router.post(
    "/ai/query",
    response_model=AIQueryResponse,
    summary="Ask AI Operations Analyst (Requires Authenticated User)"
)
def query_ai_analyst(
    request: AIQueryRequest,
    current_user: UserProfile = Depends(require_role([UserRole.EXECUTIVE, UserRole.OPS_MANAGER, UserRole.DATA_ANALYST]))
):
    """Natural-language question answering backed by real tool executions, AST SQL safety guardrails, and zero hallucination.
    RBAC: Requires any valid authenticated role."""
    result = ai_analyst.process_query(request.query, created_by=current_user.user_id)
    return AIQueryResponse(**result)


# -------------------------------------------------------------
# 10. Data Quality Hub Endpoint
# -------------------------------------------------------------
@api_router.get("/data-quality", summary="Get Data Quality Health Report & Rule Audits")
def get_data_quality(current_user: Optional[UserProfile] = Depends(get_optional_user)):
    """Execute validation rules and return composite DQ Score %, passed/failed tests, and rule details."""
    report = dq_framework.run_all_checks()
    return {
        "status": "success",
        "data": report
    }


# -------------------------------------------------------------
# 11. System Health & Telemetry Endpoint
# -------------------------------------------------------------
@api_router.get("/health", summary="Get System Health, Latency, and Pipeline Telemetry")
def get_system_health():
    """Check database connectivity, streaming queue size, memory usage, and component statuses."""
    conn = db_manager.get_connection()
    db_ok = bool(conn.execute("SELECT 1").fetchone())

    return {
        "status": "healthy" if db_ok else "unhealthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": "connected" if db_ok else "disconnected",
            "engine": "DuckDB Columnar Analytical Warehouse",
            "path": str(settings.DB_PATH)
        },
        "streaming_broker": {
            "status": "active",
            "events_queue_buffer": stream_broker.get_queue_size(settings.KAFKA_TOPIC_EVENTS),
            "total_published": stream_broker.total_published
        },
        "models": {
            "sla_risk_model": "LOADED" if sla_risk_model.model is not None else "READY",
            "anomaly_detector": "ACTIVE"
        },
        "system_metrics": {
            "server_time": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "cpu_count": os.cpu_count(),
            "memory_usage_mb": round(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024), 2)
        }
    }
