"""Performance & Latency Benchmark Test for OpsPulse AI."""
import time
import logging
from backend.app.db.session import db_manager
from backend.app.analytics.kpi_service import kpi_service
from backend.app.analytics.root_cause import root_cause_engine
from backend.app.ml.sla_risk_model import sla_risk_model
from backend.app.ml.simulation import simulation_engine, SimulationRequest
from backend.app.ai_analyst.agent import ai_analyst

logger = logging.getLogger("opspulse.perf")


def test_performance_benchmarks():
    """Measure and verify sub-second execution thresholds."""
    
    # 1. Benchmark KPI Aggregation
    t0 = time.perf_counter()
    kpi_service.get_executive_summary()
    kpi_latency = (time.perf_counter() - t0) * 1000.0

    # 2. Benchmark Root Cause Decomposition
    t0 = time.perf_counter()
    root_cause_engine.decompose_sla_drop()
    rca_latency = (time.perf_counter() - t0) * 1000.0

    # 3. Benchmark ML Risk Inference (with warm-up)
    sample_feat = {
        "warehouse_utilization": 0.88,
        "warehouse_packing_hours": 6.5,
        "carrier_pickup_delay_hours": 4.5,
        "is_cross_zone": 1,
        "order_value": 2500.0,
        "items_count": 2,
        "day_of_week": 5,
        "order_hour": 16,
        "is_weekend": 0,
        "carrier_base_sla_hours": 36
    }
    sla_risk_model.predict_risk(sample_feat) # Warm-up

    t0 = time.perf_counter()
    sla_risk_model.predict_risk(sample_feat)
    ml_latency = (time.perf_counter() - t0) * 1000.0

    # 4. Benchmark What-If Simulation
    t0 = time.perf_counter()
    simulation_engine.run_simulation(SimulationRequest(volume_shift_pct=15.0))
    sim_latency = (time.perf_counter() - t0) * 1000.0

    # 5. Benchmark AI Analyst Execution
    t0 = time.perf_counter()
    ai_analyst.process_query("Why did on-time delivery fall?")
    ai_latency = (time.perf_counter() - t0) * 1000.0

    print("\n" + "="*50)
    print("OPSPULSE AI PERFORMANCE BENCHMARKS (MEASURED)")
    print("="*50)
    print(f"Executive KPI Aggregation:    {kpi_latency:.2f} ms (Target: < 50ms)")
    print(f"Root Cause Decomposition:     {rca_latency:.2f} ms (Target: < 50ms)")
    print(f"ML SLA Risk Inference:        {ml_latency:.2f} ms (Target: < 20ms)")
    print(f"What-If Simulation Engine:    {sim_latency:.2f} ms (Target: < 25ms)")
    print(f"AI Analyst Query Response:    {ai_latency:.2f} ms (Target: < 50ms)")
    print("="*50)

    assert kpi_latency < 50.0, f"KPI query too slow: {kpi_latency}ms"
    assert rca_latency < 50.0, f"RCA decomposition too slow: {rca_latency}ms"
    assert ml_latency < 20.0, f"ML inference too slow: {ml_latency}ms"
    assert sim_latency < 25.0, f"Simulation too slow: {sim_latency}ms"
    assert ai_latency < 50.0, f"AI Agent too slow: {ai_latency}ms"
