"""Operational Tool Registry for AI Operations Analyst."""
import logging
from typing import Any
from backend.app.db.session import db_manager
from backend.app.ai_analyst.guardrails import sql_guardrails
from backend.app.analytics.kpi_service import kpi_service
from backend.app.analytics.root_cause import root_cause_engine
from backend.app.ml.sla_risk_model import sla_risk_model
from backend.app.ml.anomaly_detector import anomaly_detector
from backend.app.ml.simulation import simulation_engine, SimulationRequest

logger = logging.getLogger("opspulse.ai.tools")


class ToolRegistry:
    """Tool execution harness for AI Operations Analyst."""

    @classmethod
    def get_kpi(cls, metric_name: str | None = None, days: int = 7) -> dict[str, Any]:
        """Fetch current headline KPIs or specific metric timeseries."""
        summary = kpi_service.get_executive_summary()
        timeseries = kpi_service.get_kpi_timeseries(days=days)
        return {
            "summary": summary,
            "timeseries_recent": timeseries[-days:] if timeseries else []
        }

    @classmethod
    def run_sql(cls, query: str) -> dict[str, Any]:
        """Run a safe, read-only SQL query against the operational warehouse."""
        sanitized_sql = sql_guardrails.validate_and_sanitize(query)
        conn = db_manager.get_connection()
        rows = conn.execute(sanitized_sql).fetchall()
        cols = [desc[0] for desc in conn.description]
        results = [dict(zip(cols, r)) for r in rows]
        return {
            "query_executed": sanitized_sql,
            "rows_returned": len(results),
            "data": results
        }

    @classmethod
    def get_warehouse_performance(cls, warehouse_id: str | None = None) -> list[dict[str, Any]]:
        """Get scorecards, utilization, and bottleneck diagnostics for warehouses."""
        scorecards = kpi_service.get_warehouse_scorecards()
        if warehouse_id:
            scorecards = [w for w in scorecards if w["warehouse_id"] == warehouse_id or w["code"] == warehouse_id]
        return scorecards

    @classmethod
    def get_carrier_performance(cls, carrier_id: str | None = None) -> list[dict[str, Any]]:
        """Get on-time rates, pickup delays, and transit performance for 3PL carriers."""
        scorecards = kpi_service.get_carrier_scorecards()
        if carrier_id:
            scorecards = [c for c in scorecards if c["carrier_id"] == carrier_id or carrier_id.lower() in c["carrier_name"].lower()]
        return scorecards

    @classmethod
    def get_sla_risk(cls, limit: int = 15) -> list[dict[str, Any]]:
        """Predict breach risk scores and contributing factors for active in-flight shipments."""
        return sla_risk_model.get_in_flight_high_risk_shipments(limit=limit)

    @classmethod
    def detect_anomalies(cls) -> list[dict[str, Any]]:
        """Run anomaly detection across payments, warehouses, and carriers."""
        return anomaly_detector.detect_all_anomalies()

    @classmethod
    def get_root_causes(cls, metric: str = "on_time_delivery_rate") -> dict[str, Any]:
        """Decompose an SLA drop into contributing stages, nodes, and transit corridors."""
        return root_cause_engine.decompose_sla_drop(metric=metric)

    @classmethod
    def simulate_intervention(
        cls,
        source_warehouse_id: str = "WH_BLR_01",
        target_warehouse_id: str = "WH_BLR_02",
        volume_shift_pct: float = 18.0
    ) -> dict[str, Any]:
        """Simulate tactical volume reallocation between fulfillment nodes."""
        req = SimulationRequest(
            source_warehouse_id=source_warehouse_id,
            target_warehouse_id=target_warehouse_id,
            volume_shift_pct=volume_shift_pct
        )
        res = simulation_engine.run_simulation(req)
        return res.model_dump()

    @classmethod
    def generate_recommendation(cls) -> dict[str, Any]:
        """Generate structured operational action plan for leadership."""
        summary = kpi_service.get_executive_summary()
        return {
            "top_issues": summary.get("top_issues", []),
            "recommended_actions": summary.get("recommended_actions", []),
            "simulation_available": True
        }


tool_registry = ToolRegistry()
