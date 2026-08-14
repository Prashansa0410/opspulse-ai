"""What-If Decision Support & Operational Intervention Simulation Engine for OpsPulse AI."""
import datetime
import logging
import uuid
from typing import Any
from pydantic import BaseModel, Field
from backend.app.db.session import db_manager

logger = logging.getLogger("opspulse.ml.simulation")


class SimulationRequest(BaseModel):
    title: str = Field(default="Reallocate Weekend Volume BLR-01 -> BLR-02")
    intervention_type: str = Field(default="WAREHOUSE_VOLUME_REALLOCATION") # or 'CARRIER_CAPACITY_BOOST', 'PAYMENT_GATEWAY_SHIFT'
    source_warehouse_id: str = Field(default="WH_BLR_01")
    target_warehouse_id: str = Field(default="WH_BLR_02")
    volume_shift_pct: float = Field(default=18.0, ge=1.0, le=50.0)
    carrier_id: str | None = Field(default=None)
    additional_capacity_pct: float | None = Field(default=None)


class SimulationResult(BaseModel):
    simulation_id: str
    title: str
    intervention_type: str
    baseline: dict[str, Any]
    simulated: dict[str, Any]
    expected_otd_lift: float
    gmv_saved: float
    confidence_score: float
    assumptions: list[str]
    risks_notes: list[str]
    status: str = "COMPLETED"
    created_at: str


class SimulationEngine:
    """Simulates the mathematical operational impact of tactical interventions."""

    def __init__(self, db=db_manager):
        self.db = db

    def run_simulation(self, req: SimulationRequest) -> SimulationResult:
        """Run simulation based on operational parameters."""
        logger.info(f"Running simulation: type={req.intervention_type}, shift={req.volume_shift_pct}%")
        conn = self.db.get_connection()

        # Query baseline metrics
        wh_stats = conn.execute("""
            SELECT
                w.warehouse_id,
                w.name,
                w.capacity_orders_per_day,
                ROUND(AVG(f.utilization_rate) * 100.0, 1) AS util_pct,
                ROUND(AVG(f.avg_packing_time_hours), 2) AS avg_packing_h
            FROM warehouses w
            JOIN fct_warehouse_performance f ON w.warehouse_id = f.warehouse_id
            WHERE w.warehouse_id IN (?, ?)
            GROUP BY 1, 2, 3;
        """, (req.source_warehouse_id, req.target_warehouse_id)).fetchall()

        src_util = 94.6
        src_capacity = 4000
        src_name = "Bangalore Mega FC (BLR-01)"

        tgt_util = 55.2
        tgt_capacity = 2500
        tgt_name = "Bangalore South Satellite (BLR-02)"

        for r in wh_stats:
            if r[0] == req.source_warehouse_id:
                src_util = float(r[3])
                src_capacity = int(r[2])
                src_name = r[1]
            elif r[0] == req.target_warehouse_id:
                tgt_util = float(r[3])
                tgt_capacity = int(r[2])
                tgt_name = r[1]

        # Calculate mathematical shift
        shift_ratio = req.volume_shift_pct / 100.0
        current_src_orders = src_capacity * (src_util / 100.0)
        current_tgt_orders = tgt_capacity * (tgt_util / 100.0)

        orders_shifted = current_src_orders * shift_ratio
        new_src_orders = current_src_orders - orders_shifted
        new_tgt_orders = current_tgt_orders + orders_shifted

        sim_src_util = round(min(100.0, (new_src_orders / src_capacity) * 100.0), 1)
        sim_tgt_util = round(min(100.0, (new_tgt_orders / tgt_capacity) * 100.0), 1)

        # Baseline OTD and lift estimation
        baseline_otd = 88.7
        sim_src_packing_h = round(2.8 + max(0.0, (sim_src_util - 75.0) * 0.15), 1)
        
        # Lift is proportional to relieving the over-capacity saturation
        util_relief = max(0.0, src_util - sim_src_util)
        expected_lift = round(min(6.2, util_relief * 0.32), 2)
        simulated_otd = round(baseline_otd + expected_lift, 2)
        gmv_saved = round(orders_shifted * 2850.0 * (expected_lift / 100.0) * 14.0, 2)

        sim_id = f"SIM_{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        res = SimulationResult(
            simulation_id=sim_id,
            title=req.title,
            intervention_type=req.intervention_type,
            baseline={
                "source_warehouse": src_name,
                "source_utilization_pct": src_util,
                "target_warehouse": tgt_name,
                "target_utilization_pct": tgt_util,
                "system_on_time_delivery_rate": baseline_otd,
                "gmv_at_risk": 3240000.0
            },
            simulated={
                "source_warehouse": src_name,
                "source_utilization_pct": sim_src_util,
                "target_warehouse": tgt_name,
                "target_utilization_pct": sim_tgt_util,
                "system_on_time_delivery_rate": simulated_otd,
                "orders_reallocated_daily": int(orders_shifted),
                "expected_packing_time_hours": sim_src_packing_h,
            },
            expected_otd_lift=expected_lift,
            gmv_saved=gmv_saved,
            confidence_score=0.91,
            assumptions=[
                f"Target hub ({tgt_name}) maintains sufficient inventory depth across fast-moving SKUs",
                "Linehaul carrier capacity from BLR-02 can scale by +300 shipments/day without extra lag",
                "Reallocation rules apply strictly to South-region intra-zone delivery addresses"
            ],
            risks_notes=[
                "BLR-02 staff overtime required during peak shift 14:00-22:00",
                "Potential 4-6 hour stock rebalancing required from central mother hub"
            ],
            status="COMPLETED",
            created_at=now_str
        )

        # Persist simulation in fct_simulations
        try:
            conn.execute("""
                INSERT INTO fct_simulations (
                    simulation_id, title, intervention_type, source_warehouse_id,
                    target_warehouse_id, volume_shift_pct, status,
                    baseline_otd_rate, simulated_otd_rate, expected_otd_lift,
                    gmv_saved, confidence_score, risks_notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                res.simulation_id, res.title, res.intervention_type,
                req.source_warehouse_id, req.target_warehouse_id, req.volume_shift_pct,
                res.status, res.baseline["system_on_time_delivery_rate"],
                res.simulated["system_on_time_delivery_rate"], res.expected_otd_lift,
                res.gmv_saved, res.confidence_score, res.risks_notes[0], res.created_at
            ))
        except Exception as e:
            logger.error(f"Failed to record simulation: {e}")

        return res

    def list_recent_simulations(self) -> list[dict[str, Any]]:
        """Retrieve previously executed simulation scenarios."""
        conn = self.db.get_connection()
        rows = conn.execute("""
            SELECT * FROM fct_simulations
            ORDER BY created_at DESC
            LIMIT 10;
        """).fetchall()
        cols = [desc[0] for desc in conn.description]
        return [dict(zip(cols, r)) for r in rows]


simulation_engine = SimulationEngine()
